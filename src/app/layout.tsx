import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "房贷计算器 - 精确计算您的房贷还款计划",
  description: "专业的房贷计算器，支持商业贷款、公积金贷款和组合贷款，提供等额本息和等额本金两种还款方式，包含详细的还款计划和可视化图表。",
  keywords: ["房贷计算器", "贷款计算", "等额本息", "等额本金", "商业贷款", "公积金贷款", "组合贷款", "还款计划"],
  authors: [{ name: "Plantree", url: "https://plantree.me" }],
  creator: "Plantree",
  publisher: "Plantree",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.svg', sizes: '16x16', type: 'image/svg+xml' },
      { url: '/favicon-32x32.svg', sizes: '32x32', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' }
    ],
    apple: [
      { url: '/apple-icon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/favicon.ico'
  },
  manifest: '/manifest.json',
  openGraph: {
    title: "房贷计算器 - 精确计算您的房贷还款计划",
    description: "专业的房贷计算器，支持商业贷款、公积金贷款和组合贷款，提供等额本息和等额本金两种还款方式。",
    type: "website",
    locale: "zh_CN"
  },
  twitter: {
    card: "summary",
    title: "房贷计算器 - 精确计算您的房贷还款计划",
    description: "专业的房贷计算器，支持多种贷款类型和还款方式。"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
