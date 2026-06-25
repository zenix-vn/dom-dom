/**
 * Kiểu dữ liệu DB sinh tự động từ schema Supabase.
 * Tạo lại bằng: `pnpm db:types` (cần Supabase local đang chạy).
 *
 * Đây là placeholder "lỏng" cho tới lần generate đầu tiên: mọi bảng trả về
 * `Record<string, any>` để không chặn việc viết query. SAU khi có Supabase
 * local, chạy `pnpm db:types` để thay file này bằng kiểu chặt chẽ.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyTable = {
  Row: Record<string, any>;
  Insert: Record<string, any>;
  Update: Record<string, any>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: { [name: string]: AnyTable };
    Views: { [name: string]: AnyTable };
    Functions: { [name: string]: { Args: Record<string, any>; Returns: any } };
    Enums: { [name: string]: string };
    CompositeTypes: Record<string, never>;
  };
};
