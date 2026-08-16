import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "案件 01 · 第四十二幅肖像",
  description: "一款第一人称日式校园心理恐怖探索游戏。寻找身份，别相信镜子。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
