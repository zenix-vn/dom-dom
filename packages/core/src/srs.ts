import type { DayNumber } from "./types.js";

/** Lịch Leitner: khoảng cách ôn (ngày) theo từng hộp. Box 0 = mới/sai gần đây. */
export const LEITNER_INTERVALS = [1, 2, 4, 8, 16] as const;
export const MAX_BOX = LEITNER_INTERVALS.length - 1;

export interface ReviewItem {
  itemId: string;
  box: number;
  dueDay: DayNumber;
}

/** Tạo thẻ ôn mới, đến hạn ngay trong ngày tạo. */
export function newReviewItem(itemId: string, today: DayNumber): ReviewItem {
  return { itemId, box: 0, dueDay: today };
}

/**
 * Cập nhật thẻ sau khi trả lời.
 * - Đúng: lên hộp cao hơn (ôn thưa dần).
 * - Sai: về hộp 0 (ôn lại sớm).
 */
export function review(
  item: ReviewItem,
  correct: boolean,
  today: DayNumber
): ReviewItem {
  const box = correct ? Math.min(MAX_BOX, item.box + 1) : 0;
  return { ...item, box, dueDay: today + LEITNER_INTERVALS[box]! };
}

/** Thẻ đến hạn ôn chưa? */
export function isDue(item: ReviewItem, today: DayNumber): boolean {
  return item.dueDay <= today;
}

/** Lọc & sắp các thẻ đến hạn (đến hạn sớm hơn xếp trước). */
export function dueItems(items: ReviewItem[], today: DayNumber): ReviewItem[] {
  return items.filter((i) => isDue(i, today)).sort((a, b) => a.dueDay - b.dueDay);
}
