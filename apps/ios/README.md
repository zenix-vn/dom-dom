# Đom Đóm — iOS (SwiftUI)

Vỏ (shell) native cho iOS: đăng nhập, hồ sơ, Đom mascot, điều hướng. Game học
tập được nạp dưới dạng **bundle web trong `WKWebView`**, dùng **đúng giao thức
postMessage** như web host (xem `packages/game-sdk/src/protocol.ts`).

## Cấu trúc nguồn

```
DomDom/
  DomDomApp.swift     # entry @main
  ContentView.swift   # màn hình chính + danh sách game
  GameWebView.swift    # WKWebView + bridge nối GameToHost/HostToGame
  FireflyView.swift   # mascot Đom
  Core/
    Firefly.swift     # đồng bộ công thức với packages/core (xem docs §9)
```

## Tạo Xcode project

Thư mục này chỉ chứa **mã nguồn Swift** (không kèm `.xcodeproj` để tránh xung
đột generate). Tạo project lần đầu:

1. Xcode → File → New → Project → iOS App → tên **DomDom**, Interface **SwiftUI**,
   bundle id `zenix.domdom`, tối thiểu iOS 17.
2. Thêm các file `.swift` trong `DomDom/` vào target.
3. Cấu hình `SUPABASE_URL` / `SUPABASE_ANON_KEY` qua Info.plist hoặc xcconfig.

> Logic XP/streak/Đom/SRS phải khớp `@domdom/core` (TypeScript là chuẩn). Khi
> đổi công thức bên TS, cập nhật `Core/*.swift` tương ứng.
