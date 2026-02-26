import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { StickyCallBar } from "@/components/layout/StickyCallBar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RapidPro Memphis | Commercial Kitchen Repair Experts",
  description: "Premier commercial kitchen equipment repair in Memphis. 24/7 Service for Ovens, Fryers, Walk-ins & more. Call (901) 257-9417.",
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased" suppressHydrationWarning>
        <Header />
        {children}
        <StickyCallBar />
      </body>
    </html>
  );
}
