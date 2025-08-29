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
    description: "专业的房贷计算器，支持商业贷款、公积金贷款和组合贷款，提供等额本息和等额本金两种还款方式，包含详细的还款计划和可视化图表。",
    type: "website",
    locale: "zh_CN",
    url: "https://mortgage-calculator.plantree.me",
    siteName: "房贷计算器",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "房贷计算器 - 专业的房贷计算工具",
        type: "image/png"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "房贷计算器 - 精确计算您的房贷还款计划",
    description: "专业的房贷计算器，支持多种贷款类型和还款方式，包含详细的还款计划和可视化图表。",
    images: ["/og-image.png"],
    creator: "@plantree_me",
    site: "@plantree_me"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: undefined, // 如果有Google Search Console验证码，可以在这里添加
    yandex: undefined, // 如果有Yandex验证码，可以在这里添加
    yahoo: undefined, // 如果有Yahoo验证码，可以在这里添加
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="application-name" content="房贷计算器" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="房贷计算器" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* 额外的 Open Graph 标签 */}
        <meta property="og:site_name" content="房贷计算器" />
        <meta property="og:locale" content="zh_CN" />
        <meta property="og:type" content="website" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="房贷计算器 - 专业的房贷计算工具" />
        
        {/* Twitter Card 额外标签 */}
        <meta name="twitter:domain" content="mortgage-calculator.plantree.me" />
        <meta name="twitter:url" content="https://mortgage-calculator.plantree.me" />
        
        {/* 结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "房贷计算器",
              "description": "专业的房贷计算器，支持商业贷款、公积金贷款和组合贷款，提供等额本息和等额本金两种还款方式。",
              "url": "https://mortgage-calculator.plantree.me",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "CNY"
              },
              "creator": {
                "@type": "Person",
                "name": "Plantree",
                "url": "https://plantree.me"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
