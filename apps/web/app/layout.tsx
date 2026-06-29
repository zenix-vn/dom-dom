import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Đồi Đom Đóm — Học mà chơi",
  description: "Nền tảng game học tập cho học sinh tiểu học & THCS",
  icons: {
    icon: [
      {
        url: "/games/typing/favicon-32x32.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "/games/typing/favicon-16x16.png",
        type: "image/png",
        sizes: "16x16",
      },
      {
        url: "/games/typing/favicon.ico",
        type: "image/x-icon",
      },
    ],
    apple: [
      {
        url: "/games/typing/apple-touch-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
