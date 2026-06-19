"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getToken, clearToken } from "@/lib/api";

const nav = [{ href: "/subjects", label: "Môn học", icon: "📚" }];

export default function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) router.replace("/login");
    else setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-inksoft">
        Đang tải…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 flex-col border-r border-black/10 bg-white/70 p-5">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-goldbright to-gold text-xl">
            🪲
          </div>
          <div>
            <div className="font-serif text-lg leading-none text-ink">Đom Đóm</div>
            <div className="text-xs text-inksoft">Quản trị</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  active ? "bg-lacquer text-white" : "text-ink hover:bg-black/5"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => {
            clearToken();
            router.replace("/login");
          }}
          className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-lacquer hover:bg-lacquer/10"
        >
          ⎋ Đăng xuất
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
