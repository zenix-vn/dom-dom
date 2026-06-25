/**
 * Kiểu dữ liệu DB sinh tự động từ schema Supabase.
 * Tạo lại bằng: `pnpm db:types` (cần Supabase local đang chạy).
 * File này là placeholder cho tới lần generate đầu tiên.
 */
export type Database = {
  public: {
    Tables: Record<string, unknown>;
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
  };
};
