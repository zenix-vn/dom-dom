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
  tint: [string, string]; // gradient nền cho ô icon (kiểu app-icon iOS)
  tag: string;
  bank: string[];
  lang: "en" | "vi"; // en: tắt bộ gõ; vi: bật bộ gõ
}

// ---------- Bộ icon kiểu iOS 26 ----------
// Glyph nét trắng (kiểu SF Symbols) đặt trên ô gradient bóng kính.
const stroke = (p: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const ICONS = {
  // Ngón trỏ chỉ lên (đặt tay lên gờ F & J)
  finger: stroke(
    `<path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11"/><path d="M12 11.5V9a1.5 1.5 0 0 1 3 0v2.5"/><path d="M15 11.5v-.5a1.5 1.5 0 0 1 3 0V15a5 5 0 0 1-5 5h-1.5a5 5 0 0 1-3.9-1.9l-2.2-2.8a1.6 1.6 0 0 1 2.4-2.1L9 14"/>`
  ),
  // Bàn phím
  keyboard: stroke(
    `<rect x="2" y="4" width="20" height="16" rx="2.5"/><path d="M6 8h.01"/><path d="M10 8h.01"/><path d="M14 8h.01"/><path d="M18 8h.01"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/><path d="M7 16h10"/>`
  ),
  // Mảnh ghép (jigsaw)
  puzzle:
    `<svg viewBox="0 0 24 24" fill="#fff"><path d="M20.5 11H19V7a2 2 0 0 0-2-2h-4V3.5a2.5 2.5 0 0 0-5 0V5H4a2 2 0 0 0-2 2v3.8h1.5a2.2 2.2 0 1 1 0 4.4H2V19a2 2 0 0 0 2 2h3.8v-1.5a2.2 2.2 0 1 1 4.4 0V21H17a2 2 0 0 0 2-2v-4h1.5a2.5 2.5 0 0 0 0-5z"/></svg>`,
  // Chữ A (mở rộng bàn phím / chữ cái)
  letterA: stroke(`<path d="M5 19 12 4l7 15"/><path d="M7.6 14h8.8"/>`),
  // Bong bóng chat (cụm từ & câu)
  bubble: stroke(
    `<path d="M21 14.5a2.5 2.5 0 0 1-2.5 2.5H8l-4 4V6.5A2.5 2.5 0 0 1 6.5 4h12A2.5 2.5 0 0 1 21 6.5Z"/><path d="M8 9.5h8"/><path d="M8 13h5"/>`
  ),
  // Ngôi sao (cờ Việt Nam)
  star:
    `<svg viewBox="0 0 24 24" fill="#fff"><path d="M12 2.6l2.74 5.55 6.13.89-4.43 4.32 1.05 6.1L12 16.7l-5.49 2.88 1.05-6.1-4.43-4.32 6.13-.89z"/></svg>`,
  // Cuộn giấy (câu & tục ngữ)
  scroll: stroke(
    `<path d="M8 4h9a2 2 0 0 1 2 2v11"/><path d="M10 8h6"/><path d="M10 12h4"/><path d="M6 4a2 2 0 0 0-2 2v1a1 1 0 0 0 1 1h3"/><path d="M8 4v13a2.5 2.5 0 0 0 2.5 2.5H18a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1h-8.5"/>`
  ),
};

// Lộ trình kiểu Typing Master — đi từ rất cơ bản:
// Cấp 1: chỉ 2 phím trỏ F & J (tập đặt tay).
const FJ_DRILL = ["f", "j", "f", "j", "ff", "jj", "fj", "jf", "fjf", "jfj", "ffjj", "jjff", "fj fj", "jf jf", "fjfj", "jfjf"];
// Cấp 2: cả hàng phím cơ sở a s d f j k l ;
const HOME_LETTERS = ["a", "s", "d", "f", "j", "k", "l", ";", "as", "df", "jk", "l;", "sa", "fd", "kj", ";l", "asdf", "jkl;", "ad", "sf", "jl", "k;"];
// Cấp 3: từ ngắn chỉ dùng phím hàng cơ sở (a s d f g h j k l)
const BASIC_WORDS = ["dad", "sad", "ask", "add", "all", "fall", "gas", "lad", "hall", "lass", "salad", "glad", "flask", "dash", "hash", "shall", "alaska"];

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
  { id: 1, name: "Phím F & J", desc: "Đặt 2 ngón trỏ vào gờ nổi", icon: ICONS.finger, tint: ["#FFB23E", "#FF7A00"], tag: "Cấp 1", bank: FJ_DRILL, lang: "en" },
  { id: 2, name: "Hàng cơ sở", desc: "8 phím: a s d f · j k l ;", icon: ICONS.keyboard, tint: ["#5AC8FA", "#0A84FF"], tag: "Cấp 2", bank: HOME_LETTERS, lang: "en" },
  { id: 3, name: "Từ cơ bản", desc: "Ghép chữ ở hàng cơ sở", icon: ICONS.puzzle, tint: ["#6EE7A8", "#30D158"], tag: "Cấp 3", bank: BASIC_WORDS, lang: "en" },
  { id: 4, name: "Từ tiếng Anh", desc: "Mở rộng cả bàn phím", icon: ICONS.letterA, tint: ["#FF6B6B", "#FF3B30"], tag: "Cấp 4", bank: EN_WORDS, lang: "en" },
  { id: 5, name: "Câu tiếng Anh", desc: "Cụm từ & câu ngắn", icon: ICONS.bubble, tint: ["#BF7CFF", "#5E5CE6"], tag: "Cấp 5", bank: EN_PHRASES, lang: "en" },
  { id: 6, name: "Từ tiếng Việt", desc: "Có dấu — bật bộ gõ", icon: ICONS.star, tint: ["#FF453A", "#D70015"], tag: "Cấp 6", bank: VI_WORDS, lang: "vi" },
  { id: 7, name: "Câu & tục ngữ", desc: "Tiếng Việt nâng cao", icon: ICONS.scroll, tint: ["#E7C68A", "#C9962F"], tag: "Cấp 7", bank: VI_PHRASES, lang: "vi" },
];

const SEEN_GUIDE_KEY = "domdom_typing_seen_guide";
const SEEN_TIPS_KEY = "domdom_typing_seen_tips"; // popup mẹo gõ chỉ hiện lần đầu
function imeText(lang: "en" | "vi") {
  return lang === "vi"
    ? "🇻🇳 BẬT bộ gõ tiếng Việt (Telex/VNI) để gõ dấu."
    : "⌨️ TẮT bộ gõ tiếng Việt — chỉ gõ chữ cái Latin.";
}

const ROUND_SECONDS = 60;
const LB_KEY = "domdom_typing_lb_v1";
const NAME_KEY = "domdom_typing_name";

// ---------- Tiện ích DOM ----------
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const screens = ["start", "game", "lb", "guide"] as const;
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

// ---------- Bảng xếp hạng (gộp theo người chơi) ----------
// Mỗi người chơi (định danh theo TÊN) là 1 dòng. Chơi nhiều lần thì cộng dồn
// tổng điểm, đồng thời lưu kỷ lục 1 lần (điểm cao nhất, WPM, độ chính xác).
type LbMode = "total" | "best" | "acc";
const LB2_KEY = "domdom_typing_lb_v2";
let lbMode: LbMode = "total";
interface Player {
  name: string; plays: number; total: number;
  best: number; bestWpm: number; bestAcc: number; bestStreak: number; date: number;
}
const nkey = (s: string) => s.trim().toLowerCase();

function loadPlayers(): Player[] {
  try {
    const raw = localStorage.getItem(LB2_KEY);
    if (raw) return JSON.parse(raw) as Player[];
  } catch { /* ignore */ }
  // Di trú dữ liệu cũ (v1: mỗi lượt 1 dòng) → gộp theo tên.
  try {
    const old = JSON.parse(localStorage.getItem(LB_KEY) || "[]") as Array<{ name?: string; score?: number; wpm?: number; acc?: number; date?: number }>;
    const map = new Map<string, Player>();
    for (const e of old) {
      const k = nkey(e.name || "Bé Đom");
      const p = map.get(k) || { name: e.name || "Bé Đom", plays: 0, total: 0, best: 0, bestWpm: 0, bestAcc: 0, bestStreak: 0, date: 0 };
      p.plays++; p.total += e.score || 0; p.best = Math.max(p.best, e.score || 0);
      p.bestWpm = Math.max(p.bestWpm, e.wpm || 0); p.bestAcc = Math.max(p.bestAcc, e.acc || 0);
      p.date = Math.max(p.date, e.date || 0);
      map.set(k, p);
    }
    const players = [...map.values()];
    if (players.length) savePlayers(players);
    return players;
  } catch { return []; }
}
function savePlayers(list: Player[]) { localStorage.setItem(LB2_KEY, JSON.stringify(list.slice(0, 100))); }

function recordPlay(r: { name: string; score: number; wpm: number; acc: number; streak: number }): Player {
  const players = loadPlayers();
  const k = nkey(r.name);
  let p = players.find((x) => nkey(x.name) === k);
  if (!p) { p = { name: r.name, plays: 0, total: 0, best: 0, bestWpm: 0, bestAcc: 0, bestStreak: 0, date: 0 }; players.push(p); }
  p.name = r.name; // cập nhật cách viết mới nhất
  p.plays++; p.total += r.score;
  p.best = Math.max(p.best, r.score);
  p.bestWpm = Math.max(p.bestWpm, r.wpm);
  p.bestAcc = Math.max(p.bestAcc, r.acc);
  p.bestStreak = Math.max(p.bestStreak, r.streak);
  p.date = Date.now();
  savePlayers(players);
  return p;
}

function sortVal(p: Player, m: LbMode) { return m === "total" ? p.total : m === "best" ? p.best : p.bestAcc; }
function renderLb(container: HTMLElement, mode: LbMode, highlight?: string) {
  const list = loadPlayers().slice().sort((a, b) => sortVal(b, mode) - sortVal(a, mode) || b.total - a.total).slice(0, 10);
  if (!list.length) { container.innerHTML = `<div class="empty">Chưa có ai trên bảng. Hãy là người đầu tiên! ✨</div>`; return; }
  const hl = highlight ? nkey(highlight) : "";
  const hcol = (m: LbMode) => (mode === m ? " hi" : "");
  const rows = list.map((p, i) => {
    const me = hl && nkey(p.name) === hl ? ` class="me"` : "";
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;
    return `<tr${me}><td class="rank">${medal}</td><td>${escapeHtml(p.name)}</td>`
      + `<td class="num${hcol("total")}">${p.total}</td>`
      + `<td class="num${hcol("best")}">${p.best}</td>`
      + `<td class="num${hcol("acc")}">${p.bestAcc}%</td>`
      + `<td class="num">${p.bestWpm}</td><td class="num">${p.plays}</td></tr>`;
  }).join("");
  container.innerHTML = `<table class="lb"><thead><tr><th class="rank">#</th><th>Tên</th>`
    + `<th class="num${hcol("total")}">Tổng</th><th class="num${hcol("best")}">Kỷ lục</th>`
    + `<th class="num${hcol("acc")}">CX</th><th class="num">WPM</th><th class="num">Lượt</th></tr></thead><tbody>${rows}</tbody></table>`;
}
function escapeHtml(s: string) { return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)); }

// ---------- Hiệu ứng đom đóm nền + pháo giấy ----------
function startFireflies() {
  const cv = $("fireflies") as HTMLCanvasElement;
  const ctx = cv.getContext("2d")!;
  let w = 0, h = 0;
  const dots = Array.from({ length: 95 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.6 + 0.6, p: Math.random() * Math.PI * 2, s: Math.random() * 0.4 + 0.1, white: Math.random() < 0.68 }));
  function resize() { w = cv.width = innerWidth; h = cv.height = innerHeight; }
  resize(); addEventListener("resize", resize);
  function frame(t: number) {
    ctx.clearRect(0, 0, w, h);
    for (const d of dots) {
      const a = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(t / 600 + d.p));
      const x = (d.x + Math.sin(t / 3000 + d.p) * 0.02) * w;
      const y = ((d.y + (t / 1000) * d.s * 0.006) % 1) * h;
      ctx.beginPath(); ctx.arc(x, y, d.r, 0, 7);
      if (d.white) { ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.shadowColor = "rgba(255,255,255,.75)"; ctx.shadowBlur = 4; }
      else { ctx.fillStyle = `rgba(255,224,120,${a})`; ctx.shadowColor = "rgba(255,210,90,.9)"; ctx.shadowBlur = 9; }
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

// ---------- Bàn phím ảo + hướng dẫn ngón tay ----------
// f = nhóm ngón (màu): p=út, r=áp út, m=giữa, i=trỏ, t=cái. Hai bàn tay dùng chung màu.
type Finger = "p" | "r" | "m" | "i" | "t";
const FCLASS: Record<Finger, string> = { p: "f-pink", r: "f-amber", m: "f-green", i: "f-blue", t: "f-grey" };
const FCOLOR: Record<Finger, string> = { p: "#f3a6c4", r: "#f6c66a", m: "#86d99a", i: "#8fbcff", t: "#b6c0dc" };

// Phím vật lý → (bàn tay, ngón) để làm sáng đúng ngón trên hình bàn tay.
const KEY_INFO: Record<string, [("l" | "r"), Finger]> = {
  "`": ["l", "p"], "1": ["l", "p"], "2": ["l", "r"], "3": ["l", "m"], "4": ["l", "i"], "5": ["l", "i"],
  "6": ["r", "i"], "7": ["r", "i"], "8": ["r", "m"], "9": ["r", "r"], "0": ["r", "p"], "-": ["r", "p"], "=": ["r", "p"],
  q: ["l", "p"], w: ["l", "r"], e: ["l", "m"], r: ["l", "i"], t: ["l", "i"],
  y: ["r", "i"], u: ["r", "i"], i: ["r", "m"], o: ["r", "r"], p: ["r", "p"], "[": ["r", "p"], "]": ["r", "p"],
  a: ["l", "p"], s: ["l", "r"], d: ["l", "m"], f: ["l", "i"], g: ["l", "i"],
  h: ["r", "i"], j: ["r", "i"], k: ["r", "m"], l: ["r", "r"], ";": ["r", "p"], "'": ["r", "p"],
  z: ["l", "p"], x: ["l", "r"], c: ["l", "m"], v: ["l", "i"], b: ["l", "i"],
  n: ["r", "i"], m: ["r", "i"], ",": ["r", "m"], ".": ["r", "r"], "/": ["r", "p"],
  space: ["l", "t"],
};

// Vị trí đầu mỗi ngón trên ảnh bàn tay (theo % của ảnh) — đo từ ban-tay.png.
const FINGER_POS: Record<string, [number, number]> = {
  lp: [5.0, 28.5], rp: [95.0, 28.3],
  lr: [14.5, 10.8], rr: [85.2, 11.0],
  lm: [26.7, 4.8], rm: [72.8, 5.1],
  li: [39.1, 14.3], ri: [60.4, 13.9],
  lt: [40.9, 46.3], rt: [59.0, 46.1],
};

// Đốm sáng lớn di chuyển tới đầu ngón tay cần gõ tiếp theo.
function highlightFinger(key: string) {
  const glow = document.getElementById("fingerGlow");
  if (!glow) return;
  let pos: [number, number] | undefined;
  if (key === "space") pos = [50, 46.2];               // ngón cái → giữa hai ngón cái
  else { const info = KEY_INFO[key]; if (info) pos = FINGER_POS[`${info[0]}${info[1]}`]; }
  if (!pos) { glow.classList.remove("on"); return; }
  glow.style.left = `${pos[0]}%`;
  glow.style.top = `${pos[1]}%`;
  glow.classList.add("on");
}
interface Key { k: string; label?: string; f: Finger; wide?: boolean; home?: boolean; }
const KB_ROWS: Key[][] = [
  [["`","p"],["1","p"],["2","r"],["3","m"],["4","i"],["5","i"],["6","i"],["7","i"],["8","m"],["9","r"],["0","p"],["-","p"],["=","p"]].map(([k, f]) => ({ k: k as string, f: f as Finger })),
  [["q","p"],["w","r"],["e","m"],["r","i"],["t","i"],["y","i"],["u","i"],["i","m"],["o","r"],["p","p"],["[","p"],["]","p"]].map(([k, f]) => ({ k: k as string, f: f as Finger })),
  [["a","p"],["s","r"],["d","m"],["f","i"],["g","i"],["h","i"],["j","i"],["k","m"],["l","r"],[";","p"],["'","p"]].map(([k, f]) => ({ k: k as string, f: f as Finger, home: k === "f" || k === "j" })),
  [["z","p"],["x","r"],["c","m"],["v","i"],["b","i"],["n","i"],["m","i"],[",","m"],[".","r"],["/","p"]].map(([k, f]) => ({ k: k as string, f: f as Finger })),
  [{ k: " ", label: "space", f: "t", wide: true }],
];

function buildKeyboard() {
  const root = $("keyboard");
  root.innerHTML = KB_ROWS.map((row) =>
    `<div class="krow">${row.map((key) => {
      const cls = ["key", FCLASS[key.f]];
      if (key.k === " ") cls.push("space");
      if (key.home) cls.push("home");
      return `<div class="${cls.join(" ")}" data-k="${key.k === " " ? "space" : escapeHtml(key.k)}">${key.label ?? escapeHtml(key.k)}</div>`;
    }).join("")}</div>`
  ).join("");
}

/** Quy về phím vật lý: thường hoá, bỏ dấu, đ→d (để gợi ý phím bắt đầu cho Telex). */
function baseKey(ch: string): string {
  if (ch === " ") return "space";
  let c = ch.toLowerCase();
  if (c === "đ") return "d";
  c = c.normalize("NFD").replace(/[̀-ͯ]/g, "");
  return c;
}

function highlightNextKey() {
  const root = $("keyboard");
  root.querySelectorAll(".key.next").forEach((el) => el.classList.remove("next"));
  if (!run) return;
  const typed = ($("typebox") as HTMLInputElement).value;
  const next = run.target[typed.length];
  if (next === undefined) return;
  const key = baseKey(next);
  root.querySelector(`.key[data-k="${key === '"' ? "" : key}"]`)?.classList.add("next");
  highlightFinger(key);
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
let pendingResult: { score: number; wpm: number; acc: number; level: number; streak: number } | null = null;

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
  highlightNextKey();
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
  $("imeHint").textContent = imeText(level.lang);
  updateHud();
  $("hTime").innerHTML = `${ROUND_SECONDS}<small>s</small>`;
  $("timeFill").style.width = "100%";
  $("timeStar").style.left = "100%";
  newTarget();
  const box = $("typebox") as HTMLInputElement;
  box.value = "";

  // Lần đầu vào chơi: hiện popup mẹo gõ, ĐỒNG HỒ DỪNG cho tới khi bấm "Bắt đầu chơi".
  if (!localStorage.getItem(SEEN_TIPS_KEY)) {
    box.disabled = true;
    $("startModal").classList.remove("hide");
  } else {
    box.disabled = false; box.focus();
    startTimer();
  }
}

// Bắt đầu đếm ngược (tách riêng để có thể chờ sau khi đóng popup mẹo gõ).
function startTimer() {
  if (!run || run.timer) return;
  run.timer = window.setInterval(() => {
    if (!run) return;
    run.timeLeft--;
    $("hTime").innerHTML = `${run.timeLeft}<small>s</small>`;
    const pct = (run.timeLeft / ROUND_SECONDS) * 100;
    $("timeFill").style.width = `${pct}%`;
    $("timeStar").style.left = `${pct}%`;
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
  $("endEmoji").textContent = run.bestCombo >= 15 ? "🌟" : "🎉";
  $("endTitle").textContent = run.bestCombo >= 15 ? `Tuyệt vời — ${run.level.tag}!` : `Hoàn thành ${run.level.tag}!`;
  ($("nameInput") as HTMLInputElement).value = localStorage.getItem(NAME_KEY) || host?.user.displayName || "";

  // Cấu hình nút "Lên cấp": có cấp cao hơn → mời lên cấp; hết cấp → chơi lại.
  const next = LEVELS.find((l) => l.id === run!.level.id + 1);
  const nextBtn = $("nextLevelBtn") as HTMLButtonElement;
  if (next) { nextBtn.textContent = `🚀 Lên ${next.tag}`; nextBtn.dataset.next = String(next.id); }
  else { nextBtn.textContent = "🔁 Chơi lại"; delete nextBtn.dataset.next; }

  endSaved = false;
  pendingResult = { score: run.score, wpm, acc, level: run.level.id, streak: run.bestCombo };
  $("endModal").classList.remove("hide");
  confetti();

  host?.reportResult({ gameId: "typing-basic", score: run.score, maxScore: Math.max(run.score, 1), durationMs: ROUND_SECONDS * 1000 });
  host?.fireflyEvent({ kind: run.bestCombo >= 15 ? "perfect" : "study", amount: run.bestCombo >= 15 ? 0.4 : 0.2 });
}

// Lưu điểm vào bảng xếp hạng (chỉ một lần cho mỗi lượt chơi).
let endSaved = false;
function saveEndScore(): string {
  const name = ((($("nameInput") as HTMLInputElement).value.trim()) || host?.user.displayName || "Bé Đom").slice(0, 14);
  if (!endSaved && pendingResult) {
    localStorage.setItem(NAME_KEY, name);
    recordPlay({ name, score: pendingResult.score, wpm: pendingResult.wpm, acc: pendingResult.acc, streak: pendingResult.streak });
    endSaved = true;
  }
  return name;
}

// ---------- Sự kiện UI ----------
function buildLevelList() {
  $("levelList").innerHTML = LEVELS.map((l) =>
    `<button class="level" data-id="${l.id}"><span class="ic" style="--g1:${l.tint[0]};--g2:${l.tint[1]}">${l.icon}</span><span><span class="t">${l.name}</span><br><span class="d">${l.desc}</span></span><span class="lv">${l.tag}</span></button>`
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
  $("toLeaderboard").addEventListener("click", () => { renderLb($("lbBody"), lbMode); show("lb"); });
  $("lbBack").addEventListener("click", () => show("start"));
  $("lbClear").addEventListener("click", () => { if (confirm("Xoá toàn bộ bảng xếp hạng?")) { localStorage.removeItem(LB2_KEY); localStorage.removeItem(LB_KEY); renderLb($("lbBody"), lbMode); } });

  // Popup kết thúc cấp: lên cấp cao hơn (hoặc chơi lại) / kết thúc → bảng xếp hạng.
  $("nextLevelBtn").addEventListener("click", () => {
    saveEndScore();
    $("endModal").classList.add("hide");
    const nextId = Number(($("nextLevelBtn") as HTMLButtonElement).dataset.next);
    const next = LEVELS.find((l) => l.id === nextId);
    startRun(next ?? run!.level);
  });
  $("finishBtn").addEventListener("click", () => {
    const name = saveEndScore();
    $("endModal").classList.add("hide");
    renderLb($("lbBody"), lbMode, name);
    show("lb");
  });

  // Popup mẹo gõ lúc bắt đầu.
  $("startPopBtn").addEventListener("click", () => {
    localStorage.setItem(SEEN_TIPS_KEY, "1");
    $("startModal").classList.add("hide");
    // Đóng popup → cho gõ và bắt đầu đếm giờ.
    if (run?.active) {
      const box = $("typebox") as HTMLInputElement;
      box.disabled = false; box.focus();
      startTimer();
    }
  });

  // Tab đổi cách xếp hạng (Tổng điểm / Kỷ lục / Chính xác)
  $("lbTabs").querySelectorAll<HTMLElement>(".tab").forEach((tab) =>
    tab.addEventListener("click", () => {
      lbMode = (tab.dataset.m as LbMode) || "total";
      $("lbTabs").querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t === tab));
      renderLb($("lbBody"), lbMode);
    }));

  $("muteBtn").addEventListener("click", () => {
    muted = !muted;
    $("muteBtn").textContent = muted ? "🔇" : "🔊";
  });

  $("guideBtn").addEventListener("click", () => show("guide"));
  $("guideBack").addEventListener("click", () => show("start"));
  $("guideDone").addEventListener("click", () => { localStorage.setItem(SEEN_GUIDE_KEY, "1"); show("start"); });

  document.addEventListener("keydown", (e) => {
    if (!run?.active) return;
    if (document.activeElement !== $("typebox") && e.key.length === 1) $("typebox").focus();
  });
}

// ---------- Khởi động ----------
async function main() {
  startFireflies();
  buildLevelList();
  buildKeyboard();
  wireEvents();

  // Cho phép vào thẳng một cấp qua ?lv=N (tiện chia sẻ / mở nhanh).
  const lv = Number(new URLSearchParams(location.search).get("lv"));
  const deep = LEVELS.find((l) => l.id === lv);
  const wantLb = new URLSearchParams(location.search).get("show") === "lb";
  if (deep) startRun(deep);
  else if (wantLb) { renderLb($("lbBody"), lbMode); show("lb"); }
  else show("start"); // popup mẹo gõ hiện ở lần đầu vào chơi (trong startRun), không ở menu

  // Kết nối host nếu được nhúng; chạy độc lập thì bỏ qua sau 600ms.
  host = await Promise.race([
    connectToHost("typing-basic"),
    new Promise<null>((r) => setTimeout(() => r(null), 600)),
  ]);
}

void main();
