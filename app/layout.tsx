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
        <body
          className={`${notoSans.variable} antialiased`}
          suppressHydrationWarning
        >
          <Header />
          <div className="py-4">
          </div>
            <SearchBar />
          {children}
          <Footer />
          <Toaster position="top-center" />
        </body>
      </SessionProvider>
    </html>
  );
}
