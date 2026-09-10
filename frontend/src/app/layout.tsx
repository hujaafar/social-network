import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/design/app-shell";
const sans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });
export const metadata: Metadata = {
  title: { default: "Common — A place for your people", template: "%s · Common" },
  description: "Share your moments, find your community and keep the conversation going. A social network built around real connection.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className={`${sans.variable} ${mono.variable} antialiased`}>
    <a href="#main-content" className="skip-link">Skip to content</a><AppShell>{children}</AppShell>
  </body></html>;
}
