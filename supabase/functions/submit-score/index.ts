/**
 * Edge Function: submit-score
 *
 * Game KHÔNG ghi điểm trực tiếp vào DB. Client gửi GameResult tới đây; hàm này
 * (chạy bằng service role) chấm/kiểm lại rồi mới ghi session + cộng XP + nuôi Đom
 * + cập nhật lịch ôn (SRS). Đây là chốt chống gian lận.
 *
 * Chạy local: `supabase functions serve submit-score`
 */
import { createClient } from "jsr:@supabase/supabase-js@2";

interface AnswerLog {
  itemId: string;
  correct: boolean;
  latencyMs: number;
}
interface Payload {
  gameId: string;
  score: number;
  maxScore: number;
  durationMs: number;
  answers?: AnswerLog[];
}

Deno.serve(async (req) => {
  const authHeader = req.headers.get("Authorization") ?? "";
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Xác định người dùng từ JWT của client.
  const jwt = authHeader.replace("Bearer ", "");
  const { data: userData, error: userErr } = await supabase.auth.getUser(jwt);
  if (userErr || !userData.user) {
    return new Response("Unauthorized", { status: 401 });
  }
  const profileId = userData.user.id;
  const body = (await req.json()) as Payload;

  // TODO: chấm lại điểm từ answers thay vì tin `score` của client.
  const verifiedScore = Math.max(0, Math.min(body.score, body.maxScore));
  const xpEarned = Math.round((verifiedScore / Math.max(1, body.maxScore)) * 50);

  // Ghi session.
  await supabase.from("game_sessions").insert({
    profile_id: profileId,
    game_id: body.gameId,
    score: verifiedScore,
    max_score: body.maxScore,
    duration_ms: body.durationMs,
    raw: { answers: body.answers ?? [] },
    ended_at: new Date().toISOString(),
  });

  // Cộng XP.
  await supabase
    .from("xp_events")
    .insert({ profile_id: profileId, source: body.gameId, amount: xpEarned });

  // TODO: cập nhật streaks, firefly_state, review_items dùng @domdom/core.

  return Response.json({ ok: true, xpEarned, verifiedScore });
});
