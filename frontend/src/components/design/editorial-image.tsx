"use client";
import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

export function EditorialImage({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // Move only the photograph; controls retain their normal layout and hit areas.
  const y = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.12, 1.02]);
  return <div ref={ref} className="editorial-image">
    <motion.div className="editorial-image-layer" style={reduceMotion ? undefined : { y, scale }}>
      <Image src={src} alt={alt} fill sizes="(max-width: 760px) 100vw, 60vw" priority={priority} />
    </motion.div>
  </div>;
}

