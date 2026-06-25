import type { GradeBand } from "@domdom/core";

export type GameCategory = "typing" | "brain" | "quiz";
export type Platform = "web" | "mobile";

/** Game tự khai báo qua manifest. Đây là nội dung lưu trong bảng `games`. */
export interface GameManifest {
  id: string; // 'typing-basic', 'quiz', 'memory-match'
  name: string;
  version: string; // semver
  category: GameCategory;
  grades: GradeBand[];
  subjects?: string[]; // chỉ quiz cần
  platforms: Platform[]; // typing => ['web']
  entry: string; // URL bundle (Supabase Storage / CDN)
  icon?: string;
  minAppVersion?: string;
}
