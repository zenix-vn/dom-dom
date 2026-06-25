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
        border: "1px solid #ccc",
        background: "transparent",
        cursor: "pointer",
      }}
    >
      Đăng xuất
    </button>
  );
}
