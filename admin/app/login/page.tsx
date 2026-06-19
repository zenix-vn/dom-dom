"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@domdom.vn");
  const [password, setPassword] = useState("domdom123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api<{ token: string }>("/admin/login", {
        method: "POST",
        body: { email, password },
        auth: false,
      });
      setToken(res.token);
      router.replace("/subjects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl bg-white/80 p-8 shadow-xl backdrop-blur"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-goldbright to-gold text-3xl">
            🪲
          </div>
          <h1 className="font-serif text-2xl text-ink">Đom Đóm</h1>
          <p className="text-sm text-inksoft">Trang quản trị nội dung</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-lacquer/10 px-4 py-2 text-sm text-lacquer">
            {error}
          </div>
        )}

        <label className="mb-1 block text-sm font-semibold text-ink">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-xl border border-black/10 px-4 py-2.5 outline-none focus:border-lacquer"
          required
        />

        <label className="mb-1 block text-sm font-semibold text-ink">Mật khẩu</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded-xl border border-black/10 px-4 py-2.5 outline-none focus:border-lacquer"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-lacquer py-3 font-bold text-white transition hover:bg-lacquer/90 disabled:opacity-60"
        >
          {loading ? "Đang đăng nhập…" : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
