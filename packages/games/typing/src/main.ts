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
  lang: "en" | "vi"; // en: tắt bộ gõ; vi: bật bộ gõ
}

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
  { id: 1, name: "Phím F & J", desc: "Đặt 2 ngón trỏ vào gờ nổi", icon: "☝️", tag: "Cấp 1", bank: FJ_DRILL, lang: "en" },
  { id: 2, name: "Hàng cơ sở", desc: "8 phím: a s d f · j k l ;", icon: "⌨️", tag: "Cấp 2", bank: HOME_LETTERS, lang: "en" },
  { id: 3, name: "Từ cơ bản", desc: "Ghép chữ ở hàng cơ sở", icon: "🧩", tag: "Cấp 3", bank: BASIC_WORDS, lang: "en" },
  { id: 4, name: "Từ tiếng Anh", desc: "Mở rộng cả bàn phím", icon: "🅰️", tag: "Cấp 4", bank: EN_WORDS, lang: "en" },
  { id: 5, name: "Câu tiếng Anh", desc: "Cụm từ & câu ngắn", icon: "💬", tag: "Cấp 5", bank: EN_PHRASES, lang: "en" },
  { id: 6, name: "Từ tiếng Việt", desc: "Có dấu — bật bộ gõ", icon: "🇻🇳", tag: "Cấp 6", bank: VI_WORDS, lang: "vi" },
  { id: 7, name: "Câu & tục ngữ", desc: "Tiếng Việt nâng cao", icon: "📜", tag: "Cấp 7", bank: VI_PHRASES, lang: "vi" },
];

const SEEN_GUIDE_KEY = "domdom_typing_seen_guide";
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
const screens = ["start", "game", "over", "lb", "guide"] as const;
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

// Vẽ hai bàn tay "thật" bằng SVG. Da màu thịt; mỗi ngón thon có móng tô màu
// theo nhóm ngón. Ngón cần gõ (id fg-<l|r><finger>) sẽ sáng lên đúng màu.
function buildHands() {
  // Thứ tự trái→phải của bàn tay trái: út, áp út, giữa, trỏ (ngón cái ở mép phải).
  const F: { f: Finger; cx: number; top: number; w: number; rot: number }[] = [
    { f: "p", cx: 78, top: 86, w: 30, rot: -10 },
    { f: "r", cx: 116, top: 46, w: 34, rot: -3 },
    { f: "m", cx: 156, top: 30, w: 36, rot: 3 },
    { f: "i", cx: 194, top: 52, w: 34, rot: 10 },
  ];
  const BASE = 250;
  const finger = (side: "l" | "r", fg: { f: Finger; cx: number; top: number; w: number; rot: number }) => {
    const x = fg.cx - fg.w / 2, h = BASE - fg.top;
    return `<g transform="rotate(${fg.rot} ${fg.cx} ${BASE})">
      <rect id="fg-${side}${fg.f}" class="finger" style="--fc:${FCOLOR[fg.f]}" x="${x}" y="${fg.top}" width="${fg.w}" height="${h}" rx="${fg.w / 2}"/>
      <ellipse class="nail" cx="${fg.cx}" cy="${fg.top + 16}" rx="${fg.w * 0.3}" ry="11" fill="${FCOLOR[fg.f]}"/>
      <rect class="sheen" x="${x + 4}" y="${fg.top + 8}" width="${fg.w * 0.3}" height="${h - 30}" rx="${fg.w * 0.15}"/>
      <rect class="crease" x="${x + 4}" y="${fg.top + h * 0.52}" width="${fg.w - 8}" height="3.5" rx="1.8"/>
      <rect class="crease" x="${x + 5}" y="${fg.top + h * 0.74}" width="${fg.w - 10}" height="3" rx="1.5"/>
    </g>`;
  };
  const hand = (side: "l" | "r") => {
    let s = `<ellipse cx="140" cy="316" rx="118" ry="18" fill="rgba(0,0,0,.20)"/>`; // bóng đổ
    s += `<ellipse class="cuff" cx="143" cy="322" rx="112" ry="26"/>`;               // cổ tay găng
    s += `<ellipse class="thenar" cx="206" cy="262" rx="34" ry="42"/>`;              // gò ngón cái
    s += `<path class="palm" d="M58,252 Q50,322 116,324 L188,322 Q244,314 228,254 Q212,228 150,228 Q84,228 58,252 Z"/>`;
    for (const fg of F) s += finger(side, fg);
    // Ngón cái: nghiêng xuống-phải (phía trong), thu ngắn để không chéo sang tay kia
    s += `<g transform="rotate(48 200 254)">
      <rect id="fg-${side}t" class="finger" style="--fc:${FCOLOR.t}" x="184" y="240" width="36" height="80" rx="18"/>
      <ellipse class="nail" cx="202" cy="255" rx="11" ry="9" fill="${FCOLOR.t}"/>
      <rect class="sheen" x="188" y="250" width="11" height="52" rx="6"/>
    </g>`;
    return s;
  };
  $("hands").innerHTML =
    `<g transform="translate(4,2)">${hand("l")}</g>` +
    `<g transform="translate(556,2) scale(-1,1)">${hand("r")}</g>`;
}

function highlightFinger(key: string) {
  document.querySelectorAll("#hands .finger.lit").forEach((el) => el.classList.remove("lit"));
  if (key === "space") { document.getElementById("fg-lt")?.classList.add("lit"); document.getElementById("fg-rt")?.classList.add("lit"); return; }
  const info = KEY_INFO[key];
  if (!info) return;
  document.getElementById(`fg-${info[0]}${info[1]}`)?.classList.add("lit");
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
  box.disabled = false; box.value = ""; box.focus();

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
  $("overTitle").textContent = run.bestCombo >= 15 ? "Tuyệt vời! 🌟" : "Kết thúc!";
  ($("nameInput") as HTMLInputElement).value = localStorage.getItem(NAME_KEY) || host?.user.displayName || "";
  ($("saveScore") as HTMLButtonElement).disabled = false;
  ($("saveScore") as HTMLButtonElement).textContent = "Lưu điểm";
  renderLb($("overLb"), "total");
  show("over");
  confetti();

  host?.reportResult({ gameId: "typing-basic", score: run.score, maxScore: Math.max(run.score, 1), durationMs: ROUND_SECONDS * 1000 });
  host?.fireflyEvent({ kind: run.bestCombo >= 15 ? "perfect" : "study", amount: run.bestCombo >= 15 ? 0.4 : 0.2 });

  pendingResult = { score: run.score, wpm, acc, level: run.level.id, streak: run.bestCombo };
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
  $("toLeaderboard").addEventListener("click", () => { renderLb($("lbBody"), lbMode); show("lb"); });
  $("lbBack").addEventListener("click", () => show("start"));
  $("lbClear").addEventListener("click", () => { if (confirm("Xoá toàn bộ bảng xếp hạng?")) { localStorage.removeItem(LB2_KEY); localStorage.removeItem(LB_KEY); renderLb($("lbBody"), lbMode); } });
  $("againBtn").addEventListener("click", () => run && startRun(run.level));
  $("menuBtn").addEventListener("click", () => show("start"));

  // Tab đổi cách xếp hạng (Tổng điểm / Kỷ lục / Chính xác)
  $("lbTabs").querySelectorAll<HTMLElement>(".tab").forEach((tab) =>
    tab.addEventListener("click", () => {
      lbMode = (tab.dataset.m as LbMode) || "total";
      $("lbTabs").querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t === tab));
      renderLb($("lbBody"), lbMode);
    }));

  $("saveScore").addEventListener("click", () => {
    if (!pendingResult) return;
    const name = (($("nameInput") as HTMLInputElement).value.trim() || "Bé Đom").slice(0, 14);
    localStorage.setItem(NAME_KEY, name);
    recordPlay({ name, score: pendingResult.score, wpm: pendingResult.wpm, acc: pendingResult.acc, streak: pendingResult.streak });
    ($("saveScore") as HTMLButtonElement).disabled = true;
    ($("saveScore") as HTMLButtonElement).textContent = "Đã lưu ✓";
    renderLb($("overLb"), "total", name);
    confetti();
  });

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
  buildHands();
  wireEvents();

  // Cho phép vào thẳng một cấp qua ?lv=N (tiện chia sẻ / mở nhanh).
  const lv = Number(new URLSearchParams(location.search).get("lv"));
  const deep = LEVELS.find((l) => l.id === lv);
  const wantLb = new URLSearchParams(location.search).get("show") === "lb";
  if (deep) startRun(deep);
  else if (wantLb) { renderLb($("lbBody"), lbMode); show("lb"); }
  else if (!localStorage.getItem(SEEN_GUIDE_KEY)) show("guide"); // lần đầu → hướng dẫn
  else show("start");

  // Kết nối host nếu được nhúng; chạy độc lập thì bỏ qua sau 600ms.
  host = await Promise.race([
    connectToHost("typing-basic"),
    new Promise<null>((r) => setTimeout(() => r(null), 600)),
  ]);
}

void main();
