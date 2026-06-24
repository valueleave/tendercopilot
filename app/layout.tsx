import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TenderCopilot - AI招标文件解析助手",
  description:
    "上传招标文件PDF，自动提取资格要求、评分标准、时间节点和风险提示。3分钟看懂500页招标文件。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
