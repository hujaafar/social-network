"use client";

import Link from "next/link";
import { Asterisk, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditorialImage } from "@/components/design/editorial-image";

const chapters = [
  {
    id: "meet",
    number: "01",
    label: "Meet your people",
    image: "common-afterhours.webp",
    alt: "Friends sharing a blue-hour evening on a rooftop court",
    kicker: "YOUR PEOPLE ARE OUT THERE.",
    first: "GOOD",
    accent: "PEOPLE.",
    last: "GREAT STORIES.",
    copy: "For the moments worth sharing. And the people worth finding.",
    footer: "Come as you are.",
  },
  {
    id: "make",
    number: "02",
    label: "Make something",
    image: "common-studio.webp",
    alt: "A creative studio filled with afternoon light",
    kicker: "A LITTLE CURIOSITY GOES A LONG WAY.",
    first: "SMALL",
    accent: "IDEAS.",
    last: "BIG CONNECTIONS.",
    copy: "Share the work in progress. Find someone who gets it.",
    footer: "There’s room for your ideas.",
  },
  {
    id: "find",
    number: "03",
    label: "Find your thing",
    image: "common-objects.webp",
    alt: "A camera, headphones and art books gathered in warm light",
    kicker: "FOLLOW WHAT MAKES YOU, YOU.",
    first: "YOUR",
    accent: "WORLD.",
    last: "A LITTLE CLOSER.",
    copy: "Music. Art. Everyday obsessions. Find your common ground.",
    footer: "Stay a little curious.",
  },
];

export function AuthCampaign() {
  const reduced = useReducedMotion();
  return (
    <Tabs defaultValue="meet" className="auth-story campaign-chapters" aria-label="Discover Common">
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
      {chapters.map((chapter) => (
        <TabsContent key={chapter.id} value={chapter.id} className="campaign-chapter">
          <div className="auth-campaign-photo">
            <EditorialImage
              src={`/images/${chapter.image}`}
              alt={chapter.alt}
              priority={chapter.id === "meet"}
              reveal={false}
              sizes="(max-width: 800px) 100vw, 60vw"
            />
          </div>
          <div className="auth-photo-shade" />
          <motion.div
            className="auth-story-heading"
            initial={false}
            animate={reduced ? undefined : { y: [18, 0], opacity: [0.5, 1] }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="campaign-kicker">
              <span />
              {chapter.kicker}
            </span>
            <h2>
              {chapter.first}
              <br />
              <span>{chapter.accent}</span>
              <br />
              {chapter.last}
            </h2>
            <p>{chapter.copy}</p>
          </motion.div>
          <div className="chapter-caption">
            <span>COMMON GROUND / 0{chapter.number}</span>
            <strong>{chapter.footer}</strong>
            <ArrowUpRight size={27} aria-hidden="true" />
          </div>
        </TabsContent>
      ))}
      <TabsList className="campaign-chapter-controls" aria-label="Explore the Common campaign">
        {chapters.map((chapter) => (
          <TabsTrigger value={chapter.id} key={chapter.id}>
            <span>{chapter.number}</span>
            <strong>{chapter.label}</strong>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
