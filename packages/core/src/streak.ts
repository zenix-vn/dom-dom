import type { DayNumber } from "./types.js";

export interface Streak {
  current: number;
  longest: number;
  lastActiveDay: DayNumber | null;
}

export const emptyStreak: Streak = {
  current: 0,
  longest: 0,
  lastActiveDay: null,
};

/**
 * Cập nhật streak khi học vào ngày `today`.
 * - Cùng ngày: không đổi.
 * - Ngày kế tiếp: +1.
 * - Cách quãng: reset về 1.
 */
export function recordActivity(streak: Streak, today: DayNumber): Streak {
  if (streak.lastActiveDay === today) return streak;

  const current =
    streak.lastActiveDay !== null && today - streak.lastActiveDay === 1
      ? streak.current + 1
      : 1;

  return {
    current,
    longest: Math.max(streak.longest, current),
    lastActiveDay: today,
  };
}
