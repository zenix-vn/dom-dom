import { clamp01, type DayNumber } from "./types.js";

/** Năng lượng Đom giảm ~0.34 mỗi ngày không học (kế thừa từ app SwiftUI). */
export const FIREFLY_DECAY_PER_DAY = 0.34;

export interface FireflyState {
  energy: number; // 0..1
  lastUpdatedDay: DayNumber;
}

/** Năng lượng hiện tại sau khi trừ phần đã suy giảm tới `today`. */
export function currentEnergy(state: FireflyState, today: DayNumber): number {
  const idleDays = Math.max(0, today - state.lastUpdatedDay);
  return clamp01(state.energy - FIREFLY_DECAY_PER_DAY * idleDays);
}

/** Cho Đom "ăn" — nạp năng lượng khi học (amount 0..1). */
export function feed(
  state: FireflyState,
  amount: number,
  today: DayNumber
): FireflyState {
  const base = currentEnergy(state, today);
  return { energy: clamp01(base + amount), lastUpdatedDay: today };
}

/** Mức sáng hiển thị (0..1) — dùng cho hiệu ứng nhấp nháy. */
export function glowIntensity(state: FireflyState, today: DayNumber): number {
  return currentEnergy(state, today);
}
