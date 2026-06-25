# Đom Đóm — Tài liệu Kiến trúc Nền tảng

> Nền tảng game học tập cho học sinh tiểu học & trung học cơ sở.
> Web + App + Supabase, game thêm dần theo dạng plugin.

**Phiên bản tài liệu:** 1.0 · **Cập nhật:** 2026-06-25 · **Trạng thái:** Đề xuất, chờ chốt để vào Phase 0

---

## Mục lục

1. [Tầm nhìn & Phạm vi](#1-tầm-nhìn--phạm-vi)
2. [Các quyết định đã chốt](#2-các-quyết-định-đã-chốt)
3. [Tư tưởng kiến trúc](#3-tư-tưởng-kiến-trúc)
4. [Hệ thống Plugin (Game SDK)](#4-hệ-thống-plugin-game-sdk)
5. [Cấu trúc Monorepo](#5-cấu-trúc-monorepo)
6. [Backend: Supabase](#6-backend-supabase)
7. [Mô hình dữ liệu](#7-mô-hình-dữ-liệu)
8. [Mô hình tài khoản & phân quyền](#8-mô-hình-tài-khoản--phân-quyền)
9. [Logic cốt lõi dùng chung](#9-logic-cốt-lõi-dùng-chung)
10. [Mobile (SwiftUI) & cầu nối WebView](#10-mobile-swiftui--cầu-nối-webview)
11. [Bảo mật, chống gian lận & quyền riêng tư trẻ em](#11-bảo-mật-chống-gian-lận--quyền-riêng-tư-trẻ-em)
12. [Lộ trình triển khai](#12-lộ-trình-triển-khai)
13. [Hiện trạng repo & việc cần dọn](#13-hiện-trạng-repo--việc-cần-dọn)
14. [Câu hỏi mở](#14-câu-hỏi-mở)

---

## 1. Tầm nhìn & Phạm vi

**Đom Đóm** là nền tảng game học tập cho học sinh **tiểu học** và **THCS** tại Việt Nam, với nhân vật trung tâm là chú đom đóm "Đom" — phát sáng theo hoạt động học (vòng lặp kiểu Tamagotchi, gắn với tên app để tạo thói quen học mỗi ngày).

### Loại game
- **Tập gõ phím** — *chỉ web* (cần bàn phím vật lý).
- **Luyện trí não** — memory match, tìm quy luật, tính nhẩm nhanh…
- **Quiz kiến thức** — theo môn & lớp (đã có dữ liệu Lớp 4, sách "Kết nối tri thức").
- Các game khác **thêm dần theo dạng plugin**.

### Nguyên tắc nền tảng
- **Game = plugin**: thêm game mới không phải sửa "vỏ" app.
- **Viết một lần, chạy nhiều nơi**: game là bundle web, web nạp trực tiếp, mobile nạp qua WebView.
- **Một nguồn nội dung & điểm số**: Supabase là trung tâm; game không tự ý ghi DB.
- **Đo lường gắn kết hằng ngày**: XP, streak, năng lượng của Đom, ôn tập spaced-repetition.

---

## 2. Các quyết định đã chốt

| Hạng mục | Quyết định | Hệ quả |
|---|---|---|
| **Backend** | Supabase (Postgres + Auth + RLS + Storage + Edge Functions + Realtime) | Bỏ Go backend hiện có |
| **Thứ tự nền tảng** | **Web-first**, mobile sau | Dồn lực web cho MVP |
| **Shell mobile** | **Giữ SwiftUI iOS** hiện tại, sau này nhúng game web qua WebView | iOS-only cho tới khi làm Android; logic core tồn tại 2 nơi (TS + Swift) |
| **Runtime game** | Bundle **web** (Canvas/React), nạp qua iframe (web) / WebView (mobile) | Không viết lại game cho từng OS |
| **Tài khoản** | **Cả hai**: phụ huynh quản lý *và* nhà trường/lớp học | Dùng mô hình "group" tổng quát |
| **Monorepo** | pnpm + Turborepo | Chia sẻ `core`, `game-sdk`, `ui` giữa web/admin/games |

---

## 3. Tư tưởng kiến trúc

Vấn đề khó nhất: *"game thêm dần, chạy cả web lẫn mobile"*. Viết riêng cho web (JS) + iOS (Swift) + Android (Kotlin) → mỗi game tốn 3 lần công, không scale.

**Giải pháp: tách "vỏ" và "game".**

```
┌─────────────────────────────────────────────┐
│  SHELL (cố định — ít đổi khi thêm game)       │
│  Auth · Hồ sơ · Đom mascot · Điều hướng       │
│  XP/Streak · Bảng xếp hạng · Báo cáo          │
│                                               │
│   ┌──────────── GAME HOST ───────────────┐    │
│   │  Nạp & chạy plugin qua Game SDK       │    │
│   │  ┌────────┐ ┌────────┐ ┌────────┐     │    │
│   │  │ Gõ phím│ │ Quiz   │ │ Memory │ ... │    │
│   │  └────────┘ └────────┘ └────────┘     │    │
│   └───────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
        Web: iframe sandbox  │  Mobile: WebView + JS bridge
```

- **Shell** lo: đăng nhập, hồ sơ, Đom, điều hướng, XP, leaderboard, báo cáo. **Không đổi** khi thêm game.
- **Game host** nạp plugin và cấp cho nó các dịch vụ qua **Game SDK**.
- Mỗi **game** là bundle web độc lập. Khai báo nền tảng hỗ trợ → "gõ phím" để `platforms: ['web']`, mobile tự ẩn.

---

## 4. Hệ thống Plugin (Game SDK)

Package `@domdom/game-sdk` định nghĩa **hợp đồng** giữa host và game.

### 4.1 Manifest — game tự khai báo

```ts
interface GameManifest {
  id: string;                    // 'typing-basic', 'quiz', 'memory-match'
  name: string;
  version: string;               // semver
  category: 'typing' | 'brain' | 'quiz';
  grades: GradeBand[];           // ['tieu-hoc'] | ['thcs'] | cả hai
  subjects?: SubjectId[];        // chỉ quiz cần
  platforms: ('web' | 'mobile')[];   // typing => ['web']
  entry: string;                 // URL bundle (Supabase Storage / CDN)
  icon: string;
  minAppVersion?: string;        // tương thích shell
}
```

### 4.2 Host API — dịch vụ host cấp cho game

Game **không** tự gọi Supabase. Mọi thứ đi qua host để host kiểm soát điểm số, chống gian lận, nuôi Đom.

```ts
interface GameHost {
  // dữ liệu vào
  user: UserProfileLite;                       // id, tên hiển thị, lớp, avatar
  locale: 'vi';
  getContent(q: ContentQuery): Promise<ContentItem[]>;  // câu hỏi quiz từ DB

  // sự kiện ra
  reportProgress(p: GameProgress): void;       // % hoàn thành, mốc giữa chừng
  reportResult(r: GameResult): void;           // điểm cuối, đúng/sai từng câu
  fireflyEvent(e: FireflyEvent): void;         // "cho Đom ăn" khi học tốt

  // tiện ích
  haptic(type): void;
  playSound(id): void;
  close(): void;
}

interface GameResult {
  gameId: string;
  score: number;
  maxScore: number;
  durationMs: number;
  // cho quiz: để host cập nhật lịch ôn tập Leitner
  answers?: { itemId: string; correct: boolean; latencyMs: number }[];
  // bằng chứng để Edge Function chấm lại chống gian lận
  proof?: unknown;
}
```

### 4.3 Vòng đời & giao tiếp

- **Web**: game nạp trong `<iframe sandbox>`; host ↔ game qua `postMessage` (chung một giao thức).
- **Mobile (sau)**: game nạp trong `WKWebView`; cùng `postMessage`, JS bridge ánh xạ sang native (Đom, haptic, lưu offline).

→ **Cùng một giao thức message** cho cả web và mobile ⇒ game không cần biết đang chạy ở đâu.

### 4.4 Đăng ký & phân phối game

- Bảng `games` trong Supabase là **registry**: mỗi dòng = một manifest + cờ bật/tắt + đối tượng lớp.
- Admin thêm game = thêm dòng registry + upload bundle lên Storage.
- Shell đọc registry, lọc theo `platforms` + `grades` của user → render danh sách.
- **Thêm game mới không cần phát hành lại app** (chỉ cần shell tương thích `minAppVersion`).

---

## 5. Cấu trúc Monorepo

Công cụ: **pnpm workspaces + Turborepo**.

```
domdom/
├── apps/
│   ├── web/             # Next.js — web app chính + game host
│   ├── admin/           # Next.js — quản trị (đã có; chuyển sang Supabase)
│   └── mobile/          # SwiftUI iOS (giữ nguyên; nhúng WebView sau)
├── packages/
│   ├── game-sdk/        # hợp đồng plugin (manifest, host API, loader)
│   ├── core/            # logic dùng chung: XP, streak, Đom, Leitner/SRS
│   ├── ui/              # design system + FireflyMascot + component
│   ├── supabase-client/ # client typed + truy vấn dùng chung
│   └── games/
│       ├── typing/      # game gõ phím (web only)
│       ├── quiz/        # game quiz
│       └── memory-match/# game trí não
├── supabase/
│   ├── migrations/      # schema SQL (nguồn chân lý DB)
│   ├── functions/       # Edge Functions (chấm điểm, leaderboard, daily)
│   └── seed/            # dữ liệu mẫu (Lớp 4)
├── docs/
│   └── KIEN-TRUC.md     # tài liệu này
├── turbo.json
└── pnpm-workspace.yaml
```

> `apps/mobile` (SwiftUI) nằm trong monorepo về mặt thư mục nhưng có toolchain riêng (Xcode); nó **không** build qua pnpm/turbo. `packages/core` là TypeScript — Swift đồng bộ logic thủ công (xem §9, §10).

---

## 6. Backend: Supabase

Thay thế hoàn toàn Go backend + docker-compose.

| Thành phần | Dùng để |
|---|---|
| **Postgres + RLS** | Lưu toàn bộ dữ liệu; cách ly theo user/nhóm bằng Row Level Security |
| **Auth** | Email/OTP + social; tài khoản trẻ do phụ huynh/giáo viên tạo |
| **Storage** | Bundle game, asset, avatar |
| **Edge Functions** (Deno/TS) | Chấm điểm lại phía server (chống gian lận), tính leaderboard, sinh daily challenge |
| **Realtime** | Bảng xếp hạng trực tiếp, thách đấu bạn bè |

**Vì sao chọn Supabase:** Postgres "thật" + RLS mạnh cho mô hình phụ huynh–con–lớp; Auth/Storage/Realtime sẵn có; Edge Functions đủ cho logic server; giảm hạ tầng tự vận hành so với Go.

---

## 7. Mô hình dữ liệu

Phác thảo bảng chính (chi tiết cột chốt ở Phase 0):

### Người dùng & nhóm
```
profiles(id PK→auth.users, role, display_name, grade_band, avatar, created_at)
groups(id, type: family|class, name, join_code, owner_id, created_at)
group_members(group_id, profile_id, member_role: guardian|teacher|student, joined_at)
```

### Nội dung học
```
subjects(id, name, grade_band)
grades(id, name)                          # Lớp 1..9
lessons(id, subject_id, grade_id, title, order)
questions(id, lesson_id, stem, choices, answer, explanation, difficulty)
```

### Game registry
```
games(id, manifest jsonb, enabled, min_app_version, created_at)
game_assignments(game_id, group_id?, grade_band?)   # giao game cho lớp/cấp
```

### Tiến độ & gắn kết
```
game_sessions(id, profile_id, game_id, started_at, ended_at, score, max_score, raw jsonb)
xp_events(id, profile_id, source, amount, created_at)
streaks(profile_id, current, longest, last_active_day)
firefly_state(profile_id, energy, updated_at)
review_items(profile_id, item_id, box, due_day, last_result)   # Leitner/SRS
mastery(profile_id, subject_id, score)
```

### Xã hội
```
friendships(a_profile_id, b_profile_id, status)
challenges(id, from_id, to_id, game_id, status, scores jsonb)
leaderboard_entries(scope, period, profile_id, score)         # hoặc tính qua view/Realtime
```

> SRS `review_items` đã được thiết kế trong app SwiftUI (Leitner box + due_day) — schema này phản chiếu lại để web và iOS dùng chung công thức.

---

## 8. Mô hình tài khoản & phân quyền

Yêu cầu **"cả hai"** (phụ huynh + nhà trường) được giải bằng **một khái niệm `group` tổng quát**, tránh dựng 2 hệ thống.

- **Gia đình** = `group(type=family)`; phụ huynh là `guardian`, con là `student`.
- **Lớp học** = `group(type=class)`; giáo viên là `teacher`, học sinh nhập `join_code` để vào.
- Một học sinh có thể đồng thời thuộc gia đình **và** một/nhiều lớp.

### Vai trò
| Vai trò | Quyền chính |
|---|---|
| `student` | Chơi game, xem tiến độ của chính mình |
| `guardian` (phụ huynh) | Tạo & quản lý con, xem báo cáo của con trong family group |
| `teacher` | Tạo lớp, giao game, xem báo cáo cả lớp |
| `admin` | Quản lý nội dung, registry game, hệ thống |

### RLS (nguyên tắc)
- `student` đọc/ghi dữ liệu của **chính mình**.
- `guardian`/`teacher` **đọc** dữ liệu của student **cùng group**.
- Ghi điểm số đi qua Edge Function (service role) sau khi chấm lại → student không tự nâng điểm.
- Parent report & báo cáo lớp **dùng chung** một query (chỉ khác scope group).

---

## 9. Logic cốt lõi dùng chung

`packages/core` (TypeScript) là **nguồn chân lý** cho:
- **XP & level**: đường cong điểm → cấp.
- **Streak**: chuỗi ngày học liên tiếp.
- **Đom energy**: 0…1, giảm dần khi nghỉ (~0.34/ngày nghỉ — theo app hiện tại), nạp lại khi học.
- **Leitner/SRS**: box + lịch `due_day`, chọn thẻ cần ôn.

> ⚠️ **Trùng lặp có chủ đích:** vì giữ shell SwiftUI, các công thức trên hiện tồn tại trong `AppModel.swift`. Quy ước: **TS là chuẩn**, Swift đồng bộ theo. Cần một bộ test/vector chung (cùng input → cùng output) để parent report 2 nền tảng không lệch nhau. (Cân nhắc dài hạn: dời chấm điểm lên Edge Function để cả 2 client chỉ hiển thị.)

---

## 10. Mobile (SwiftUI) & cầu nối WebView

Giai đoạn này **không động vào nhiều** — chỉ chuẩn bị đường đi:

- App iOS hiện có (firefly, SRS, parent report, persistence `UserDefaults` key `domdom.state.v2`) **giữ nguyên** trong Phase web-first.
- Khi tới lượt mobile:
  1. Chuyển nguồn dữ liệu từ local → Supabase (giữ cache offline).
  2. Nhúng game web trong `WKWebView`, cài **cùng giao thức `postMessage`** như web host.
  3. JS bridge ánh xạ: `fireflyEvent` → animation Đom native; `reportResult` → Supabase; `haptic`/`playSound` → native.
- Logic core: đồng bộ thủ công với `packages/core` (xem §9).

---

## 11. Bảo mật, chống gian lận & quyền riêng tư trẻ em

- **Chống gian lận**: điểm cuối được Edge Function **chấm lại** từ `proof`/`answers` trước khi ghi; client không ghi trực tiếp `score`.
- **Sandbox game**: iframe `sandbox` (web) / WebView cô lập (mobile); game chỉ chạm dữ liệu qua Host API.
- **Quyền riêng tư trẻ em**: tài khoản trẻ do phụ huynh/giáo viên tạo; hạn chế thu thập PII; cân nhắc quy định bảo vệ trẻ em (COPPA/GDPR-K và quy định VN). Mặc định **không** dữ liệu công khai của trẻ.
- **RLS chặt**: bật RLS mọi bảng, từ chối mặc định, mở quyền theo group membership.

---

## 12. Lộ trình triển khai

### Phase 0 — Nền móng
- Dựng monorepo (pnpm + Turborepo), đưa `apps/admin` vào.
- Khởi tạo Supabase: `migrations` schema §7, bật RLS, Auth.
- `packages/game-sdk` (interface) + `packages/core` (port XP/streak/Đom/Leitner sang TS + test vector).
- Seed nội dung Lớp 4 đã có.

### Phase 1 — Web MVP
- `apps/web`: đăng nhập, hồ sơ, Đom mascot, trang chọn game, báo cáo (parent + teacher dùng chung).
- Game **Gõ phím** (`platforms:['web']`).
- Game **Quiz** (tái dùng câu hỏi từ Supabase).
- Game host + iframe loader chạy 2 game qua đúng Game SDK.

### Phase 2 — Admin & nội dung
- Chuyển `apps/admin` từ Go API → Supabase.
- Trang quản lý registry game + giao game cho lớp/cấp.
- Thêm nội dung môn/lớp mới.

### Phase 3 — Game thứ 3+ & gắn kết
- Game trí não (memory-match…) để kiểm chứng tính plugin.
- Bảng xếp hạng + thách đấu bạn bè (Realtime) — mục còn dang dở của roadmap.

### Phase 4 — Mobile
- Đưa app SwiftUI lên Supabase (cache offline).
- WebView host + JS bridge → game web chạy trong app iOS.
- (Tùy chọn) Android.

---

## 13. Hiện trạng repo & việc cần dọn

- **Working tree đang trống**: mọi file hiển thị `D` (đã xoá khỏi thư mục, còn trong git). Khôi phục: `git restore .`.
- **Trong git**: `domdom/` (SwiftUI iOS — *giữ*), `admin/` (Next.js — *giữ, chuyển sang Supabase*), `backend/` (Go — *ngừng dùng*), `docker-compose.yml` (*ngừng dùng*), một số asset/icon.
- **Remote**: `origin` đã trỏ `git@github.com:zenix-vn/dom-dom.git` (SSH); repo hiện rỗng, cần push lần đầu.
- **Việc dọn khi vào Phase 0**: chuyển `admin/` → `apps/admin/`, `domdom/` → `apps/mobile/`; archive `backend/` + `docker-compose.yml` (không xoá khỏi lịch sử git).

---

## 14. Câu hỏi mở

1. **Đăng nhập của học sinh nhỏ tuổi**: dùng mã lớp + tên, hay tài khoản đầy đủ? (ảnh hưởng Auth & quyền riêng tư)
2. **Phạm vi lớp/môn ban đầu**: chỉ Lớp 4 (đã có dữ liệu) hay mở rộng ngay nhiều lớp?
3. **Engine game**: dùng Canvas thuần, hay thư viện (Phaser/PixiJS) cho game trí não?
4. **Hạ tầng phân phối bundle game**: Supabase Storage hay CDN riêng?
5. **Kiếm tiền/định hướng B2B (trường) vs B2C (gia đình)** — ưu tiên cái nào trước cho thiết kế tính năng?

---

*Tài liệu sẽ được cập nhật khi chốt các câu hỏi mở và bắt đầu Phase 0.*
