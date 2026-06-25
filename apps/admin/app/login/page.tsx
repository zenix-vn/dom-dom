"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const denied = useSearchParams().get("denied");
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main style={{ maxWidth: 360, margin: "12vh auto", padding: 24 }}>
      <h1>Đom Đóm — Quản trị</h1>
      {denied && (
        <p style={{ color: "#b91c1c", fontSize: 13 }}>
          Tài khoản này không có quyền quản trị (cần vai trò giáo viên/admin).
        </p>
      )}
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          style={field}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
          style={field}
        />
        {error && <p style={{ color: "#b91c1c", fontSize: 13 }}>{error}</p>}
        <button type="submit" disabled={busy} style={button}>
          {busy ? "Đang đăng nhập…" : "Đăng nhập"}
        </button>
      </form>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

const field: React.CSSProperties = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ccc",
};
const button: React.CSSProperties = {
  padding: 12,
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  background: "#4f46e5",
  color: "#fff",
  fontWeight: 600,
};
