import Link from "next/link";
import { ArrowUpRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="page-wrap route-state">
      <span className="eyebrow">404 / A LITTLE OFF THE MAP</span>
      <Compass size={52} aria-hidden="true" />
      <h1 className="page-title">
        WRONG TURN.
        <br />
        <em>GOOD COMPANY.</em>
      </h1>
      <p>This page doesn’t exist. Your people are still back at Common.</p>
      <Button asChild className="new-post-button">
        <Link href="/">
          Back to your feed <ArrowUpRight size={18} />
        </Link>
      </Button>
    </section>
  );
}
