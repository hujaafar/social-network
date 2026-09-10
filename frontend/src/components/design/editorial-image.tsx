"use client";
import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

export function EditorialImage({
  src,
  alt,
  priority = false,
  reveal = true,
  sizes = "(max-width: 760px) 100vw, 60vw",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  reveal?: boolean;
  sizes?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // Move only the photograph; controls retain their normal layout and hit areas.
  const y = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.12, 1.02]);
  const clipPath = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [
      "inset(5% 4% 0% 4% round 16px)",
      "inset(0% 0% 0% 0% round 0px)",
      "inset(0% 0% 0% 0% round 0px)",
    ],
  );
  return (
    <motion.div
      ref={ref}
      className="editorial-image"
      style={reduceMotion || !reveal ? undefined : { clipPath }}
    >
      <motion.div className="editorial-image-layer" style={reduceMotion ? undefined : { y, scale }}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} />
      </motion.div>
    </motion.div>
  );
}
