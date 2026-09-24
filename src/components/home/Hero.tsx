"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { EDITORIAL } from "@/lib/products";
import { SplitText } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.25]);
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className="relative h-[calc(100svh-36px)] min-h-[560px] overflow-hidden bg-ink text-bone">
      <motion.div style={{ scale, y }} className="absolute inset-0">
        <Image
          src={`${EDITORIAL.hero}?w=2400&q=80`}
          alt="DRIFT Collection 01 campaign"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_35%]"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-ink/30" />
      <div className="absolute inset-0 bg-maroon/15 mix-blend-multiply" />

      <motion.div style={{ opacity: fade }} className="relative flex h-full flex-col justify-end px-4 pb-10 md:px-8 md:pb-14">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.8 }}
          className="label mb-4 text-bone/80"
        >
          Collection 01 — Men / Unisex
        </motion.p>
        <SplitText
          as="h1"
          animateOnMount
          delay={2.1}
          text="Built for the drift"
          className="font-display max-w-5xl text-[18vw] font-black uppercase leading-[0.82] md:text-[11vw]"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <ButtonLink href="/shop" variant="light">
            Shop collection
          </ButtonLink>
          <ButtonLink href="/shop?filter=new" variant="outline-light">
            New arrivals
          </ButtonLink>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <div className="absolute bottom-10 right-8 hidden flex-col items-center gap-3 md:flex">
        <span className="label rotate-180 text-bone/70 [writing-mode:vertical-rl]">Scroll</span>
        <span className="relative h-16 w-px overflow-hidden bg-bone/25">
          <motion.span
            className="absolute inset-x-0 top-0 h-1/2 bg-bone"
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </div>
    </section>
  );
}
