# ✨ Đom Đóm

Nền tảng game học tập cho học sinh **tiểu học & THCS**. Web + App + Supabase,
game thêm dần theo dạng **plugin** (bundle web chạy được cả web lẫn mobile).

> Thiết kế chi tiết: [docs/KIEN-TRUC.md](docs/KIEN-TRUC.md)

## Cấu trúc (monorepo — pnpm + Turborepo)

```
apps/
  web/      Next.js — web app chính + game host (iframe)
  admin/    Next.js — quản trị nội dung & registry game
  ios/      SwiftUI — shell native, nạp game qua WKWebView
packages/
  core/            logic dùng chung: XP, streak, Đom, SRS (nguồn chân lý TS)
  game-sdk/        hợp đồng plugin: manifest + giao thức + host + client
  supabase-client/ client Supabase typed
  games/
    typing/        game "Luyện gõ phím" (ví dụ plugin, web-only)
supabase/
  migrations/  schema SQL + RLS
  functions/   Edge Functions (submit-score: chấm điểm chống gian lận)
  seed.sql     dữ liệu mẫu (Lớp 4)
```

## Bắt đầu

```bash
# 1. Cài deps
pnpm install

# 2. Supabase cục bộ (cần Docker + Supabase CLI)
supabase start
pnpm db:reset          # áp migrations + seed
pnpm db:types          # sinh kiểu DB cho TS

# 3. Cấu hình env (copy .env.example → .env.local trong apps/web, apps/admin)

# 4. Build bundle game vào apps/web/public/games (để host phục vụ same-origin)
pnpm build:games

# 5. Chạy web + admin
pnpm dev               # web :3000, admin :3001
```

## Thêm một game mới (plugin)

1. Tạo package trong `packages/games/<ten>` implement `connectToHost()` từ
   `@domdom/game-sdk/client`.
2. Viết `manifest.json` (khai báo `category`, `grades`, `platforms`, `entry`).
3. Build bundle, upload lên Supabase Storage / CDN.
4. Thêm dòng vào bảng `games` (qua admin) → game tự xuất hiện trên web/app.

Game chỉ giao tiếp với shell qua Game SDK — không chạm trực tiếp Supabase.
