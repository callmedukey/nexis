import type { Metadata } from "next";
import { Noto_Sans_KR as NotoSans } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

import { auth } from "@/auth";
import Header from "@/components/layout/Header";
import { SearchBar } from "@/components/layout/SearchBar";
import { Toaster } from "@/components/ui/sonner";
import Footer from "../components/layout/Footer";

const notoSans = NotoSans({
  variable: "--font-noto",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "넥시스 버스",
  description:
    "버스의 프리미엄 용품과 인테리어 소품의 모든 것! 버스 인테리어 전문 컨설팅 기업, 넥시스",
  metadataBase: new URL("https://nexisbus.com"),
  keywords: [
    "버스 인테리어",
    "버스 용품",
    "프리미엄 버스",
    "넥시스",
    "버스 컨설팅",
  ],
  authors: [{ name: "Nexis" }],
  creator: "Nexis",
  publisher: "Nexis",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "넥시스 버스 - 프리미엄 버스 인테리어 전문",
    description:
      "버스의 프리미엄 용품과 인테리어 소품의 모든 것! 버스 인테리어 전문 컨설팅 기업, 넥시스",
    url: "https://nexisbus.com",
    siteName: "넥시스 버스",
    locale: "ko_KR",
    type: "website",
    // images: [
    //   {
    //     url: "/og-image.jpg",
    //     width: 1200,
    //     height: 630,
    //     alt: "넥시스 버스 - 프리미엄 버스 인테리어",
    //   },
    // ],
  },
  twitter: {
    card: "summary_large_image",
    title: "넥시스 버스 - 프리미엄 버스 인테리어 전문",
    description:
      "버스의 프리미엄 용품과 인테리어 소품의 모든 것! 버스 인테리어 전문 컨설팅 기업, 넥시스",
    // images: ["/og-image.jpg"],
  },
  verification: {
    // google: "your-google-site-verification", // You'll need to add this
    // naver: "your-naver-site-verification", // You'll need to add this
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="ko" suppressHydrationWarning>
      <SessionProvider session={session}>
        <body
          className={`${notoSans.variable} antialiased`}
          suppressHydrationWarning
        >
          <Header />
          <div className="py-4"></div>
          <SearchBar />
          {children}
          <Footer />
          <Toaster position="bottom-center" />
        </body>
      </SessionProvider>
    </html>
  );
}
