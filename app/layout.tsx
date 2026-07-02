import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "lastcloud",
  description: "lastcloud — AI · Design · Creative Technology. 전호영의 창작 베이스캠프.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
