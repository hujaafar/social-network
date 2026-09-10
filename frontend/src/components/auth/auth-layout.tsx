"use client";
import Link from "next/link";
import { ArrowUpRight, Asterisk } from "lucide-react";
import { EditorialImage } from "@/components/design/editorial-image";

export function AuthLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return <div className="auth-page">
    <section className="auth-story" aria-label="Welcome to Common">
      <Link href="/login" className="wordmark" aria-label="Common home">common<Asterisk aria-hidden="true" /></Link>
      <div className="auth-story-heading">
        <span className="eyebrow">A PLACE FOR YOUR PEOPLE</span>
        <h2>Life is better<br />in <em>common.</em></h2>
        <p>The ideas, the everyday moments, the people who get you. Bring it all together.</p>
      </div>
      <div className="auth-photo">
        <EditorialImage src="/images/common-studio.webp" alt="Creative friends sharing ideas around a sunlit studio table" priority />
        <span className="photo-caption">MORE CONNECTION. LESS NOISE. <ArrowUpRight size={18} aria-hidden="true" /></span>
      </div>
      <div className="auth-story-footer"><span>Made for real connection.</span><span>01 — COMMON GROUND</span></div>
    </section>
    <main id="main-content" className="auth-form-side">
      <div className="auth-form-top"><span>YOUR NEXT CONVERSATION STARTS HERE</span><Asterisk size={26} aria-hidden="true" /></div>
      <div className="auth-form-content">
        <span className="eyebrow">COME ON IN</span><h1>{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>{children}
      </div>
      <p className="auth-footer">Your people. Your pace. Your space.</p>
    </main>
  </div>;
}

