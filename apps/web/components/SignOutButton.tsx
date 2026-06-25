"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={signOut}
      style={{
        padding: "6px 12px",
        borderRadius: 8,
        border: "1px solid #334",
        background: "transparent",
        color: "#f5f7ff",
        cursor: "pointer",
      }}
    >
      Đăng xuất
    </button>
  );
}
