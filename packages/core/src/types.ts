/** Cấp học. */
export type GradeBand = "tieu-hoc" | "thcs";

/** Số thứ tự ngày (epoch day) — số ngày kể từ 1970-01-01, theo giờ địa phương. */
export type DayNumber = number;

/** Chuyển một Date về DayNumber (bỏ phần giờ). */
export function toDayNumber(date: Date): DayNumber {
  return Math.floor(
    (date.getTime() - date.getTimezoneOffset() * 60_000) / 86_400_000
  );
}

/** Kẹp giá trị về khoảng [0, 1]. */
export function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}
