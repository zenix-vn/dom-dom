/**
 * Game "Luyện gõ phím" — Đồi Đom Đóm.
 *
 * Chế độ: bấm giờ 60 giây, gõ càng nhiều càng tốt. Giữ chuỗi streak (combo)
 * để nhân điểm. Có WPM, độ chính xác, bảng xếp hạng (localStorage) và streak.
 *
 * Cấp 1–2: chữ cái / từ tiếng Anh.  Cấp 3: câu tiếng Anh.
 * Cấp 4: từ tiếng Việt.  Cấp 5: câu / tục ngữ tiếng Việt.
 *
 * Dùng <input> (an toàn với bộ gõ IME tiếng Việt). Chạy độc lập, đồng thời
 * báo kết quả về host qua @domdom/game-sdk khi được nhúng trong app.
 */
import { connectToHost, type HostConnection } from "@domdom/game-sdk/client";

// ---------- Dữ liệu cấp độ ----------
interface Level {
  id: number;
  name: string;
  desc: string;
  icon: string;
  tag: string;
  bank: string[];
}

const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");
const HOME_ROW = ["as", "df", "jk", "fj", "dk", "sl", "gh", "ad", "kl", "ja"];

const EN_WORDS = [
  "cat", "dog", "sun", "moon", "star", "book", "tree", "fish", "bird", "milk",
  "play", "jump", "run", "read", "blue", "red", "green", "happy", "smile", "light",
  "apple", "water", "house", "school", "friend", "music", "color", "dream", "cloud", "river",
];
const EN_PHRASES = [
  "good morning", "thank you", "how are you", "i love books", "have a nice day",
  "see you soon", "let us play", "practice every day", "never give up", "keep learning",
  "the quick brown fox", "a little light", "time to study", "well done", "you can do it",
];
const VI_WORDS = [
  "đom đóm", "ánh sáng", "bầu trời", "ngôi sao", "mặt trời", "buổi tối", "con mèo",
  "quả táo", "học tập", "vui vẻ", "chăm chỉ", "tiếng việt", "trường học", "bạn bè",
  "gia đình", "yêu thương", "núi rừng", "biển cả", "mùa xuân", "nắng vàng",
  "cây xanh", "dòng sông", "đường phố", "ước mơ", "siêng năng", "lễ phép",
];
const VI_PHRASES = [
  "Học, học nữa, học mãi.",
  "Có công mài sắt, có ngày nên kim.",
  "Đom đóm bay trong đêm tối.",
  "Mỗi ngày học một điều hay.",
  "Gõ phím nhanh, học thật giỏi.",
  "Ánh sáng nhỏ soi đường tương lai.",
  "Chăm chỉ hôm nay, giỏi giang mai sau.",
  "Bầu trời đêm đầy những vì sao.",
  "Đi một ngày đàng, học một sàng khôn.",
  "Tốt gỗ hơn tốt nước sơn.",
  "Yêu trường, yêu lớp, yêu thầy cô.",
  "Một con ngựa đau, cả tàu bỏ cỏ.",
];

const LEVELS: Level[] = [
  { id: 1, name: "Chữ cái & hàng phím", desc: "Làm quen từng phím", icon: "🔤", tag: "Cấp 1", bank: [...LETTERS, ...HOME_ROW] },
  { id: 2, name: "Từ tiếng Anh", desc: "Các từ ngắn quen thuộc", icon: "🅰️", tag: "Cấp 2", bank: EN_WORDS },
  { id: 3, name: "Câu tiếng Anh", desc: "Cụm từ & câu ngắn", icon: "💬", tag: "Cấp 3", bank: EN_PHRASES },
  { id: 4, name: "Từ tiếng Việt", desc: "Có dấu — dùng bộ gõ", icon: "🇻🇳", tag: "Cấp 4", bank: VI_WORDS },
  { id: 5, name: "Câu & tục ngữ", desc: "Tiếng Việt nâng cao", icon: "📜", tag: "Cấp 5", bank: VI_PHRASES },
];

const ROUND_SECONDS = 60;
const LB_KEY = "domdom_typing_lb_v1";
const NAME_KEY = "domdom_typing_name";

// ---------- Tiện ích DOM ----------
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const screens = ["start", "game", "over", "lb"] as const;
function show(name: (typeof screens)[number]) {
  for (const s of screens) $(`screen-${s}`).classList.toggle("hide", s !== name);
}
function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]!; }

// ---------- Âm thanh (WebAudio nhỏ gọn) ----------
let muted = false;
let actx: AudioContext | null = null;
function beep(freq: number, dur = 0.06, type: OscillatorType = "sine", vol = 0.05) {
  if (muted) return;
  try {
    actx ??= new AudioContext();
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g).connect(actx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
    o.stop(actx.currentTime + dur);
  } catch { /* ignore */ }
}

// ---------- Bảng xếp hạng ----------
interface Entry { name: string; score: number; wpm: number; acc: number; level: number; date: number; }
function loadLb(): Entry[] {
  try { return JSON.parse(localStorage.getItem(LB_KEY) || "[]") as Entry[]; } catch { return []; }
}
function saveLb(list: Entry[]) {
  localStorage.setItem(LB_KEY, JSON.stringify(list.slice(0, 20)));
}
function renderLb(container: HTMLElement, highlight?: Entry) {
  const list = loadLb().sort((a, b) => b.score - a.score).slice(0, 10);
  if (!list.length) { container.innerHTML = `<div class="empty">Chưa có ai trên bảng. Hãy là người đầu tiên! ✨</div>`; return; }
  const rows = list.map((e, i) => {
    const me = highlight && e.date === highlight.date && e.name === highlight.name ? ` class="me"` : "";
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;
    return `<tr${me}><td class="rank">${medal}</td><td>${escapeHtml(e.name)}</td><td class="num">${e.score}</td><td class="num">${e.wpm}</td><td class="num">${e.acc}%</td><td>C${e.level}</td></tr>`;
  }).join("");
  container.innerHTML = `<table class="lb"><thead><tr><th class="rank">#</th><th>Tên</th><th class="num">Điểm</th><th class="num">WPM</th><th class="num">CX</th><th>Cấp</th></tr></thead><tbody>${rows}</tbody></table>`;
}
function escapeHtml(s: string) { return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)); }

// ---------- Hiệu ứng đom đóm nền + pháo giấy ----------
function startFireflies() {
  const cv = $("fireflies") as HTMLCanvasElement;
  const ctx = cv.getContext("2d")!;
  let w = 0, h = 0;
  const dots = Array.from({ length: 46 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 2 + 1, p: Math.random() * Math.PI * 2, s: Math.random() * 0.4 + 0.1 }));
  function resize() { w = cv.width = innerWidth; h = cv.height = innerHeight; }
  resize(); addEventListener("resize", resize);
  function frame(t: number) {
    ctx.clearRect(0, 0, w, h);
    for (const d of dots) {
      const a = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t / 600 + d.p));
      const x = (d.x + Math.sin(t / 3000 + d.p) * 0.02) * w;
      const y = ((d.y + (t / 1000) * d.s * 0.01) % 1) * h;
      ctx.beginPath(); ctx.arc(x, y, d.r, 0, 7);
      ctx.fillStyle = `rgba(255,224,120,${a})`;
      ctx.shadowColor = "rgba(255,210,90,.9)"; ctx.shadowBlur = 8;
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
function confetti() {
  const cv = $("fireflies") as HTMLCanvasElement;
  const ctx = cv.getContext("2d")!;
  const colors = ["#ffd23d", "#34e07f", "#ff5d6c", "#6aa3ff", "#fff"];
  const parts = Array.from({ length: 80 }, () => ({ x: innerWidth / 2, y: innerHeight / 2, vx: (Math.random() - 0.5) * 12, vy: (Math.random() - 0.9) * 12, c: rand(colors), life: 60 }));
  let n = 90;
  (function runFx() {
    for (const p of parts) { p.x += p.vx; p.y += p.vy; p.vy += 0.35; p.life--; ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, 5, 5); }
    if (n-- > 0) requestAnimationFrame(runFx);
  })();
}

// ---------- Trạng thái ván chơi ----------
interface Run {
  level: Level;
  score: number;
  combo: number;
  bestCombo: number;
  correctChars: number;
  errorChars: number;
  target: string;
  hadError: boolean;
  prevMismatch: boolean;
  timeLeft: number;
  timer: number;
  active: boolean;
}
let run: Run | null = null;
let host: HostConnection | null = null;
let pendingResult: { score: number; wpm: number; acc: number; level: number } | null = null;

function multiplier(combo: number) { return Math.min(1 + Math.floor(combo / 5) * 0.25, 4); }

function newTarget() {
  if (!run) return;
  run.target = rand(run.level.bank);
  run.hadError = false;
  run.prevMismatch = false;
  ($("typebox") as HTMLInputElement).value = "";
  renderPrompt();
}

function renderPrompt() {
  if (!run) return;
  const target = run.target;
  const typed = ($("typebox") as HTMLInputElement).value;
  let html = "";
  for (let i = 0; i < target.length; i++) {
    const ch = target[i] === " " ? "&nbsp;" : escapeHtml(target[i]!);
    let cls = "ch todo";
    if (i < typed.length) cls = typed[i] === target[i] ? "ch ok" : "ch bad";
    else if (i === typed.length) cls = "ch cur";
    html += `<span class="${cls}">${ch}</span>`;
  }
  $("prompt").innerHTML = html;
}

function onType() {
  if (!run || !run.active) return;
  const box = $("typebox") as HTMLInputElement;
  const typed = box.value;
  const target = run.target;

  let mismatch = false;
  for (let i = 0; i < typed.length && i < target.length; i++) {
    if (typed[i] !== target[i]) { mismatch = true; break; }
  }
  if (typed.length > target.length) mismatch = true;
  if (mismatch && !run.prevMismatch) {
    run.errorChars++;
    run.hadError = true;
    box.classList.remove("shake"); void box.offsetWidth; box.classList.add("shake");
    beep(180, 0.07, "square", 0.04);
    host?.haptic("light");
  }
  run.prevMismatch = mismatch;
  renderPrompt();

  if (typed === target) completeWord();
}

function completeWord() {
  if (!run) return;
  const target = run.target;
  run.correctChars += target.replace(/\s/g, "").length;

  if (run.hadError) run.combo = 0;
  else { run.combo++; run.bestCombo = Math.max(run.bestCombo, run.combo); }

  const mult = multiplier(run.combo);
  const base = Math.max(target.replace(/\s/g, "").length, 1) * 10 + (run.hadError ? 0 : 25);
  run.score += Math.round(base * mult);

  beep(run.hadError ? 420 : 660 + Math.min(run.combo, 12) * 30, 0.08, "triangle", 0.05);
  host?.haptic("success");
  flashCombo();
  newTarget();
  updateHud();
}

function flashCombo() {
  if (!run) return;
  const el = $("comboMsg");
  if (run.combo >= 3) {
    el.textContent = `🔥 Streak ${run.combo}!  ×${multiplier(run.combo).toFixed(2)}`;
    el.classList.toggle("big", run.combo >= 8);
    if (run.combo === 10 || run.combo === 20 || run.combo === 30) confetti();
  } else {
    el.textContent = "";
    el.classList.remove("big");
  }
}

function updateHud() {
  if (!run) return;
  $("hScore").textContent = String(run.score);
  $("hStreak").innerHTML = `${run.combo}<small>×<span>${multiplier(run.combo).toFixed(1)}</span></small>`;
  const mins = Math.max((ROUND_SECONDS - run.timeLeft) / 60, 1 / 60);
  $("hWpm").textContent = String(Math.round((run.correctChars / 5) / mins));
}

function startRun(level: Level) {
  run = {
    level, score: 0, combo: 0, bestCombo: 0, correctChars: 0, errorChars: 0,
    target: "", hadError: false, prevMismatch: false,
    timeLeft: ROUND_SECONDS, timer: 0, active: true,
  };
  show("game");
  $("comboMsg").textContent = "";
  updateHud();
  $("hTime").innerHTML = `${ROUND_SECONDS}<small>s</small>`;
  $("timeFill").style.width = "100%";
  newTarget();
  const box = $("typebox") as HTMLInputElement;
  box.disabled = false; box.value = ""; box.focus();

  run.timer = window.setInterval(() => {
    if (!run) return;
    run.timeLeft--;
    $("hTime").innerHTML = `${run.timeLeft}<small>s</small>`;
    $("timeFill").style.width = `${(run.timeLeft / ROUND_SECONDS) * 100}%`;
    updateHud();
    if (run.timeLeft <= 0) endRun();
  }, 1000);
}

function endRun() {
  if (!run) return;
  run.active = false;
  clearInterval(run.timer);
  const acc = run.correctChars + run.errorChars > 0
    ? Math.round((run.correctChars / (run.correctChars + run.errorChars)) * 100) : 100;
  const wpm = Math.round((run.correctChars / 5) / (ROUND_SECONDS / 60));

  $("overScore").textContent = String(run.score);
  $("rWpm").textContent = String(wpm);
  $("rAcc").innerHTML = `${acc}<small>%</small>`;
  $("rStreak").textContent = String(run.bestCombo);
  $("overTitle").textContent = run.bestCombo >= 15 ? "Tuyệt vời! 🌟" : "Kết thúc!";
  ($("nameInput") as HTMLInputElement).value = localStorage.getItem(NAME_KEY) || host?.user.displayName || "";
  ($("saveScore") as HTMLButtonElement).disabled = false;
  ($("saveScore") as HTMLButtonElement).textContent = "Lưu điểm";
  renderLb($("overLb"));
  show("over");
  confetti();

  host?.reportResult({ gameId: "typing-basic", score: run.score, maxScore: Math.max(run.score, 1), durationMs: ROUND_SECONDS * 1000 });
  host?.fireflyEvent({ kind: run.bestCombo >= 15 ? "perfect" : "study", amount: run.bestCombo >= 15 ? 0.4 : 0.2 });

  pendingResult = { score: run.score, wpm, acc, level: run.level.id };
}

// ---------- Sự kiện UI ----------
function buildLevelList() {
  $("levelList").innerHTML = LEVELS.map((l) =>
    `<button class="level" data-id="${l.id}"><span class="ic">${l.icon}</span><span><span class="t">${l.name}</span><br><span class="d">${l.desc}</span></span><span class="lv">${l.tag}</span></button>`
  ).join("");
  $("levelList").querySelectorAll<HTMLElement>(".level").forEach((el) =>
    el.addEventListener("click", () => {
      const lv = LEVELS.find((x) => x.id === Number(el.dataset.id))!;
      try { actx ??= new AudioContext(); } catch { /* ignore */ }
      startRun(lv);
    }));
}

function wireEvents() {
  $("typebox").addEventListener("input", onType);
  $("typebox").addEventListener("paste", (e) => e.preventDefault());

  $("quitBtn").addEventListener("click", endRun);
  $("toLeaderboard").addEventListener("click", () => { renderLb($("lbBody")); show("lb"); });
  $("lbBack").addEventListener("click", () => show("start"));
  $("lbClear").addEventListener("click", () => { if (confirm("Xoá toàn bộ bảng xếp hạng?")) { saveLb([]); renderLb($("lbBody")); } });
  $("againBtn").addEventListener("click", () => run && startRun(run.level));
  $("menuBtn").addEventListener("click", () => show("start"));

  $("saveScore").addEventListener("click", () => {
    if (!pendingResult) return;
    const name = (($("nameInput") as HTMLInputElement).value.trim() || "Bé Đom").slice(0, 14);
    localStorage.setItem(NAME_KEY, name);
    const entry: Entry = { name, ...pendingResult, date: Date.now() };
    const list = loadLb(); list.push(entry); saveLb(list.sort((a, b) => b.score - a.score));
    ($("saveScore") as HTMLButtonElement).disabled = true;
    ($("saveScore") as HTMLButtonElement).textContent = "Đã lưu ✓";
    renderLb($("overLb"), entry);
    confetti();
  });

  $("muteBtn").addEventListener("click", () => {
    muted = !muted;
    $("muteBtn").textContent = muted ? "🔇" : "🔊";
  });

  document.addEventListener("keydown", (e) => {
    if (!run?.active) return;
    if (document.activeElement !== $("typebox") && e.key.length === 1) $("typebox").focus();
  });
}

// ---------- Khởi động ----------
async function main() {
  startFireflies();
  buildLevelList();
  wireEvents();
  show("start");

  host = await Promise.race([
    connectToHost("typing-basic"),
    new Promise<null>((r) => setTimeout(() => r(null), 600)),
  ]);

  // Cho phép vào thẳng một cấp qua ?lv=N (tiện chia sẻ / mở nhanh).
  const lv = Number(new URLSearchParams(location.search).get("lv"));
  const deep = LEVELS.find((l) => l.id === lv);
  if (deep) startRun(deep);
}

void main();
