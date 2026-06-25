import Link from "next/link";
import type { GameManifest } from "@domdom/game-sdk";
import { supabase } from "@/lib/supabase";

async function loadGames(): Promise<GameManifest[]> {
  const { data } = await supabase.from("games").select("manifest").eq("enabled", true);
  return (data ?? []).map((r) => (r as { manifest: GameManifest }).manifest);
}

export default async function HomePage() {
  const games = await loadGames();

  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontSize: 32 }}>✨ Đom Đóm</h1>
      <p style={{ opacity: 0.7 }}>Chọn một trò chơi để bắt đầu học.</p>

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
