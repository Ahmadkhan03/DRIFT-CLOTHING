"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const MESSAGES = [
  "Free delivery across Pakistan on orders over Rs. 10,000",
  "Cash on Delivery available nationwide",
  "Drop 02 — Coming soon. Join the list for early access",
];

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative z-50 flex h-9 items-center justify-center overflow-hidden bg-maroon text-bone">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -16, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="label px-4 text-center text-[10px] sm:text-[11px]"
        >
          {MESSAGES[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
