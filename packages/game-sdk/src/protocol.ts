/**
 * Giao thức postMessage giữa HOST (shell web/mobile) và GAME (iframe/WebView).
 * Cùng một giao thức cho cả 2 nền tảng ⇒ game không cần biết đang chạy ở đâu.
 */

export interface UserProfileLite {
  id: string;
  displayName: string;
  gradeBand: "tieu-hoc" | "thcs";
  avatar?: string;
}

export interface ContentQuery {
  subject?: string;
  lessonId?: string;
  limit?: number;
}

export interface ContentItem {
  id: string;
  stem: string;
  choices: string[];
  answer: number; // index đáp án đúng (game không nên tin tuyệt đối — host chấm lại)
  explanation?: string;
}

export interface GameProgress {
  percent: number; // 0..1
  detail?: Record<string, unknown>;
}

export interface AnswerLog {
  itemId: string;
  correct: boolean;
  latencyMs: number;
}

export interface GameResult {
  gameId: string;
  score: number;
  maxScore: number;
  durationMs: number;
  answers?: AnswerLog[];
  proof?: unknown; // bằng chứng để Edge Function chấm lại chống gian lận
}

export interface FireflyEvent {
  kind: "study" | "win" | "perfect";
  amount?: number; // năng lượng nạp cho Đom (0..1)
}

/** GAME → HOST */
export type GameToHost =
  | { type: "ready"; gameId: string }
  | { type: "requestContent"; requestId: string; query: ContentQuery }
  | { type: "progress"; payload: GameProgress }
  | { type: "result"; payload: GameResult }
  | { type: "firefly"; payload: FireflyEvent }
  | { type: "haptic"; style: "light" | "medium" | "success" }
  | { type: "close" };

/** HOST → GAME */
export type HostToGame =
  | { type: "init"; user: UserProfileLite; locale: "vi" }
  | { type: "content"; requestId: string; items: ContentItem[] };

export const PROTOCOL_VERSION = 1;
