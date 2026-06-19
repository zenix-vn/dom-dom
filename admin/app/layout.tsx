import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Đom Đóm · Quản trị",
  description: "Trang quản trị nội dung học tập Đom Đóm",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
