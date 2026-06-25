import { notFound } from "next/navigation";
import type { GameManifest } from "@domdom/game-sdk";
import { createClient } from "@/lib/supabase/server";
import { GameFrame } from "@/components/GameFrame";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: game }, { data: profileRow }] = await Promise.all([
    supabase.from("games").select("manifest").eq("id", gameId).single(),
    supabase
      .from("profiles")
      .select("display_name, grade_band")
      .eq("id", user!.id)
      .single(),
  ]);
  const profile = profileRow as {
    display_name: string;
    grade_band: string | null;
  } | null;

  if (!game) notFound();
  const manifest = (game as { manifest: GameManifest }).manifest;

  return (
    <main style={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: 12, fontWeight: 600 }}>{manifest.name}</header>
      <div style={{ flex: 1 }}>
        <GameFrame
          entry={manifest.entry}
          user={{
            id: user!.id,
            displayName: profile?.display_name ?? "Bé Đom",
            gradeBand: (profile?.grade_band ?? "tieu-hoc") as
              | "tieu-hoc"
              | "thcs",
          }}
        />
      </div>
    </main>
  );
}
