import { notFound } from "next/navigation";
import type { GameManifest } from "@domdom/game-sdk";
import { supabase } from "@/lib/supabase";
import { GameFrame } from "@/components/GameFrame";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const { data } = await supabase
    .from("games")
    .select("manifest")
    .eq("id", gameId)
    .single();

  if (!data) notFound();
  const manifest = (data as { manifest: GameManifest }).manifest;

  // TODO: lấy user thật từ phiên Supabase Auth.
  const demoUser = {
    id: "demo",
    displayName: "Bé Đom",
    gradeBand: "tieu-hoc" as const,
  };

  return (
    <main style={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: 12, fontWeight: 600 }}>{manifest.name}</header>
      <div style={{ flex: 1 }}>
        <GameFrame entry={manifest.entry} user={demoUser} />
      </div>
    </main>
  );
}
