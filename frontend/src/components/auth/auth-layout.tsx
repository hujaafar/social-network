"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Asterisk } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { EditorialImage } from "@/components/design/editorial-image";

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <div className="auth-page">
      <section className="auth-story" aria-label="Welcome to Common">
        <div className="auth-campaign-photo">
          <EditorialImage
            src="/images/common-afterhours.webp"
            alt="Friends sharing a blue-hour evening on a rooftop court"
            priority
            reveal={false}
            sizes="(max-width: 800px) 100vw, 60vw"
          />
        </div>
        <div className="auth-photo-shade" />
        <header className="auth-brand-row">
          <Link href="/login" className="wordmark" aria-label="Common home">
            common
            <Asterisk aria-hidden="true" />
          </Link>
          <span className="edition-label">
            A SOCIAL SPACE
            <br />
            FOR REAL LIFE.
          </span>
        </header>
        <motion.div
          className="auth-story-heading"
          initial={false}
          animate={reducedMotion ? undefined : { y: [24, 0], opacity: [0.6, 1] }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="campaign-kicker">
            <span /> YOUR PEOPLE ARE OUT THERE.
          </span>
          <h2>
            GOOD
            <br />
            <span>PEOPLE.</span>
            <br />
            GREAT STORIES<span className="headline-period">.</span>
          </h2>
          <p>
            For the moments worth sharing.
            <br />
            And the people worth finding.
          </p>
        </motion.div>
        <div className="auth-campaign-bottom">
          <div className="campaign-coordinate">
            <span>COMMON GROUND / 001</span>
            <strong>Come as you are.</strong>
          </div>
          <div className="campaign-stamp" aria-hidden="true">
            <ArrowDownRight strokeWidth={1.2} />
            <span>
              MAKE YOURSELF
              <br />
              AT HOME
            </span>
          </div>
        </div>
      </section>
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
