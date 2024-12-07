import type { Metadata } from "next";
import { Noto_Sans_KR as NotoSans } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

import { auth } from "@/auth";
import Header from "@/components/layout/Header";
import { Toaster } from "@/components/ui/sonner";

const notoSans = NotoSans({
  variable: "--font-noto",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nexis",
  description: "Nexis",
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
        <body className={`${notoSans.variable} antialiased`} suppressHydrationWarning>
          <Header />
          {children}
          <Toaster position="top-center" />
        </body>
      </SessionProvider>
    </html>
  );
}
