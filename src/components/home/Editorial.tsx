"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { EDITORIAL } from "@/lib/products";
import { Reveal, SplitText } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";

/** Brand story block with two parallax images moving at different speeds. */
export function Editorial() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yLarge = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const ySmall = useTransform(scrollYProgress, [0, 1], ["30%", "-30%"]);

  return (
    <section ref={ref} className="relative grid gap-10 overflow-hidden px-4 py-20 md:grid-cols-12 md:px-8 md:py-32">
      <div className="relative md:col-span-6">
        <div className="relative aspect-[4/5] overflow-hidden">
          <motion.div style={{ y: yLarge }} className="absolute -inset-y-[10%] inset-x-0">
            <Image src={`${EDITORIAL.campaignA}?w=1400&q=80`} alt="DRIFT campaign" fill sizes="50vw" className="object-cover" />
          </motion.div>
        </div>
        <motion.div
          style={{ y: ySmall }}
          className="absolute -bottom-10 -right-6 hidden aspect-[3/4] w-[42%] overflow-hidden border-8 border-bone md:block"
        >
          <Image src={`${EDITORIAL.wall}?w=700&q=80`} alt="" fill sizes="20vw" className="object-cover" />
        </motion.div>
      </div>

      <div className="flex flex-col justify-center md:col-span-5 md:col-start-8">
        <Reveal>
          <p className="label text-maroon">The DRIFT standard</p>
        </Reveal>
        <SplitText
          text="Made in Pakistan. Worn everywhere."
          className="font-display mt-4 text-6xl font-black uppercase leading-[0.88] md:text-7xl"
        />
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft">
            Every DRIFT piece is cut, sewn and finished locally using heavyweight cotton and considered details. We make
            fewer things, better. Oversized silhouettes, muted tones and fabrics that feel as good on day 300 as on day one.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-line pt-6">
            {[
              ["480", "GSM fleece"],
              ["100%", "Cotton"],
              ["07", "Day exchange"],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="font-display text-5xl font-black text-maroon">{n}</dt>
                <dd className="label mt-1 text-muted">{l}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
        <Reveal delay={0.4}>
          <ButtonLink href="/about" variant="outline" className="mt-10 self-start">
            Our story
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
