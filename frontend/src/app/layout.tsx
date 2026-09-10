import type { Metadata } from "next";
import { Manrope, Barlow_Condensed, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./auth.css";
import { AppShell } from "@/components/design/app-shell";
const sans = Manrope({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const display = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });
export const metadata: Metadata = {
  title: { default: "Common — Good people. Great stories.", template: "%s · Common" },
  description:
    "Share your moments, find your community and keep the conversation going. A social network built around real connection.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${display.variable} ${mono.variable} antialiased`}>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
