import Link from "next/link";
import type { GameManifest } from "@domdom/game-sdk";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/SignOutButton";

export default async function HomePage() {
  const supabase = await createClient();

  // Middleware đã đảm bảo có user; vẫn lấy lại để hiển thị.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("display_name, role, grade_band")
    .eq("id", user!.id)
    .single();
  const profile = profileRow as {
    display_name: string;
    role: string;
    grade_band: string | null;
  } | null;

  const { data: rows } = await supabase
    .from("games")
    .select("manifest")
    .eq("enabled", true);
  const games = (rows ?? []).map((r) => (r as { manifest: GameManifest }).manifest);

  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: 24 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: 32, margin: 0 }}>✨ Đom Đóm</h1>
          <p style={{ opacity: 0.7, margin: "4px 0 0" }}>
            Chào {profile?.display_name ?? "bạn"}!
          </p>
        </div>
        <SignOutButton />
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
          marginTop: 24,
        }}
      >
        {games.map((g) => (
          <Link
            key={g.id}
            href={`/play/${g.id}`}
            style={{
              display: "block",
              padding: 20,
              borderRadius: 16,
              background: "#161d36",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <div style={{ fontSize: 28 }}>{g.icon ?? "🎮"}</div>
            <div style={{ fontWeight: 600, marginTop: 8 }}>{g.name}</div>
            <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
              {g.category} · {g.platforms.join(", ")}
            </div>
          </Link>
        ))}
        {games.length === 0 && (
          <p style={{ opacity: 0.5 }}>
            Chưa có game nào. Hãy chạy seed Supabase (`pnpm db:reset`).
          </p>
        )}
      </div>
    </main>
  );
}
