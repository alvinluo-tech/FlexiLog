import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar, BottomNav } from "@/components/navigation";
import { PWARegister } from "@/components/pwa-register";

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "FlexiLog",
    template: "%s | FlexiLog",
  },
  description: "AI-powered fitness tracking. Log workouts, get personalized plans.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FlexiLog",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-full flex bg-[var(--surface-0)] text-[var(--text-primary)] font-sans antialiased">
        <PWARegister />
        <Sidebar />
        <main className="flex-1 md:ml-60 pb-20 md:pb-0">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
