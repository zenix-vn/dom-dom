import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Đom Đóm — Học mà chơi",
  description: "Nền tảng game học tập cho học sinh tiểu học & THCS",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#0b1020",
          color: "#f5f7ff",
        }}
      >
        {children}
      </body>
    </html>
  );
}
