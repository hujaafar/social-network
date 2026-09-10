"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="page-wrap route-state" role="alert">
      <span className="eyebrow">LET’S TRY THAT AGAIN</span>
      <RotateCcw size={46} aria-hidden="true" />
      <h1 className="page-title">
        A LITTLE
        <br />
        <em>INTERRUPTION.</em>
      </h1>
      <p>Something interrupted this page. Try loading it again.</p>
      <Button className="new-post-button" onClick={reset}>
        Try again <RotateCcw size={18} />
      </Button>
    </section>
  );
}
