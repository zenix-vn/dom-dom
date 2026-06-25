/**
 * Game "Luyện gõ phím" — ví dụ một plugin hoàn chỉnh.
 * Nó chỉ nói chuyện với shell qua @domdom/game-sdk/client, không chạm Supabase.
 */
import { connectToHost } from "@domdom/game-sdk/client";

const WORDS = ["con đom đóm", "bầu trời", "ngôi sao", "ánh sáng", "buổi tối"];
const ROUNDS = WORDS.length;

const promptEl = document.getElementById("prompt")!;
const inputEl = document.getElementById("entry") as HTMLInputElement;
const scoreEl = document.getElementById("score")!;

async function main() {
  const host = await connectToHost("typing-basic");
  const startedAt = performance.now();
  let round = 0;
  let correct = 0;

  function show() {
    if (round >= ROUNDS) return finish();
    promptEl.textContent = WORDS[round]!;
    inputEl.value = "";
    inputEl.focus();
  }

  function finish() {
    host.reportResult({
      gameId: "typing-basic",
      score: correct,
      maxScore: ROUNDS,
      durationMs: Math.round(performance.now() - startedAt),
    });
    if (correct === ROUNDS) host.fireflyEvent({ kind: "perfect", amount: 0.4 });
    else host.fireflyEvent({ kind: "study", amount: 0.2 });
    promptEl.textContent = `Xong! Đúng ${correct}/${ROUNDS} 🎉`;
    inputEl.disabled = true;
  }

  inputEl.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const isCorrect = inputEl.value.trim() === WORDS[round];
    if (isCorrect) correct++;
    host.haptic(isCorrect ? "success" : "light");
    round++;
    host.reportProgress({ percent: round / ROUNDS });
    scoreEl.textContent = `Điểm: ${correct}/${ROUNDS}`;
    show();
  });

  show();
}

void main();
