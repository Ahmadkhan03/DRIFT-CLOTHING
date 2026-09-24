"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const KEY = "drift-preloaded";

/** Brand intro shown once per browser session. */
export function Preloader() {
  const [visible, setVisible] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
      sessionStorage.setItem(KEY, "1");
    } catch {}
    let frame = 0;
    if (seen) {
      frame = requestAnimationFrame(() => setVisible(false));
      return () => cancelAnimationFrame(frame);
    }

    const start = performance.now();
    const duration = 1600;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setCount(Math.round((1 - Math.pow(1 - t, 3)) * 100));
      if (t < 1) frame = requestAnimationFrame(tick);
      else setTimeout(() => setVisible(false), 350);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[200] flex flex-col justify-between bg-maroon-deep p-6 text-bone md:p-10"
        >
          <p className="label text-bone/60">Collection 01 — Men / Unisex</p>
          <div className="flex items-end justify-between">
            <div className="overflow-hidden">
              <motion.p
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-[26vw] font-black uppercase leading-[0.8] md:text-[18vw]"
              >
                Drift
              </motion.p>
            </div>
            <p className="font-mono text-sm tabular-nums">{String(count).padStart(3, "0")}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
