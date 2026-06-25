"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";
type Role = "student" | "guardian" | "teacher";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [gradeBand, setGradeBand] = useState<"tieu-hoc" | "thcs">("tieu-hoc");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const result =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: displayName,
                role,
                grade_band: role === "student" ? gradeBand : null,
              },
            },
          });

    setBusy(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main style={{ maxWidth: 380, margin: "8vh auto", padding: 24 }}>
      <h1 style={{ textAlign: "center" }}>✨ Đom Đóm</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Tab active={mode === "signin"} onClick={() => setMode("signin")}>
          Đăng nhập
        </Tab>
        <Tab active={mode === "signup"} onClick={() => setMode("signup")}>
          Đăng ký
        </Tab>
      </div>

      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        {mode === "signup" && (
          <Field
            label="Tên hiển thị"
            value={displayName}
            onChange={setDisplayName}
            required
          />
        )}
        <Field label="Email" type="email" value={email} onChange={setEmail} required />
        <Field
          label="Mật khẩu"
          type="password"
          value={password}
          onChange={setPassword}
          required
        />

        {mode === "signup" && (
          <>
            <label style={{ fontSize: 13, opacity: 0.8 }}>
              Vai trò
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                style={selectStyle}
              >
                <option value="student">Học sinh</option>
                <option value="guardian">Phụ huynh</option>
                <option value="teacher">Giáo viên</option>
              </select>
            </label>
            {role === "student" && (
              <label style={{ fontSize: 13, opacity: 0.8 }}>
                Cấp học
                <select
                  value={gradeBand}
                  onChange={(e) =>
                    setGradeBand(e.target.value as "tieu-hoc" | "thcs")
                  }
                  style={selectStyle}
                >
                  <option value="tieu-hoc">Tiểu học</option>
                  <option value="thcs">THCS</option>
                </select>
              </label>
            )}
          </>
        )}

        {error && <p style={{ color: "#f87171", fontSize: 13 }}>{error}</p>}

        <button type="submit" disabled={busy} style={buttonStyle}>
          {busy ? "Đang xử lý…" : mode === "signin" ? "Đăng nhập" : "Tạo tài khoản"}
        </button>
      </form>
    </main>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: 8,
        borderRadius: 10,
        border: "none",
        cursor: "pointer",
        background: active ? "#6366f1" : "#161d36",
        color: "#f5f7ff",
      }}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label style={{ fontSize: 13, opacity: 0.8 }}>
      {label}
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 4,
  padding: 10,
  borderRadius: 10,
  border: "1px solid #334",
  background: "#161d36",
  color: "#f5f7ff",
  boxSizing: "border-box",
};
const selectStyle: React.CSSProperties = { ...inputStyle };
const buttonStyle: React.CSSProperties = {
  marginTop: 8,
  padding: 12,
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  background: "#6366f1",
  color: "#fff",
  fontWeight: 600,
};
