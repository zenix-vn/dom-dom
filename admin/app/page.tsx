"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace(getToken() ? "/subjects" : "/login");
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center text-inksoft">
      Đang tải…
    </div>
  );
}
