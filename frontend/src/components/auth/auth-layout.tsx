"use client";

import { ArrowUpRight, Asterisk } from "lucide-react";
import { AuthCampaign } from "./auth-campaign";

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="auth-page">
      <AuthCampaign />
      <main id="main-content" className="auth-form-side">
        <div className="auth-form-top">
          <span>LESS NOISE. MORE CONNECTION.</span>
          <ArrowUpRight size={23} aria-hidden="true" />
        </div>
        <div className="auth-form-content">
          <div className="auth-section-marker">
            <Asterisk size={30} aria-hidden="true" />
            <span>YOUR SPACE STARTS HERE</span>
          </div>
          <h1>{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
          {children}
        </div>
        <footer className="auth-footer">
          <span>COMMON © {new Date().getFullYear()}</span>
          <span>A little more human.</span>
        </footer>
      </main>
    </div>
  );
}
