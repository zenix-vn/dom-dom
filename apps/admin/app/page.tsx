import type { GameManifest } from "@domdom/game-sdk";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/SignOutButton";

export default async function AdminHome() {
  const supabase = await createClient();
  const { data } = await supabase.from("games").select("id, enabled, manifest");
  const games = (data ?? []) as {
    id: string;
    enabled: boolean;
    manifest: GameManifest;
  }[];

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Đom Đóm — Quản trị</h1>
        <SignOutButton />
      </header>

      <h2>Registry game</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
            <th>ID</th>
            <th>Tên</th>
            <th>Loại</th>
            <th>Nền tảng</th>
            <th>Bật</th>
          </tr>
        </thead>
        <tbody>
          {games.map((g) => (
            <tr key={g.id} style={{ borderBottom: "1px solid #eee" }}>
              <td>{g.id}</td>
              <td>{g.manifest.name}</td>
              <td>{g.manifest.category}</td>
              <td>{g.manifest.platforms.join(", ")}</td>
              <td>{g.enabled ? "✅" : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* TODO: form thêm/sửa game, quản lý môn/bài/câu hỏi, giao game cho lớp. */}
    </main>
  );
}
