/**
 * XP & cấp độ. Đường cong tăng dần: mỗi cấp cần nhiều XP hơn cấp trước.
 * Tổng XP để đạt cấp L = BASE * (L-1) * L / 2.
 */
const BASE_XP = 100;

/** Tổng XP tích luỹ cần để bắt đầu cấp `level` (level >= 1). */
export function xpForLevel(level: number): number {
  const l = Math.max(1, Math.floor(level));
  return (BASE_XP * (l - 1) * l) / 2;
}

/** Cấp hiện tại từ tổng XP. */
export function levelFromXp(totalXp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXp) level++;
  return level;
}

/** Tiến độ (0..1) trong cấp hiện tại. */
export function levelProgress(totalXp: number): number {
  const level = levelFromXp(totalXp);
  const start = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return (totalXp - start) / (next - start);
}
