"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { EDITORIAL } from "@/lib/products";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "drift-newsletter";
const DELAY_MS = 9000;

function read() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return "blocked";
  }
}

function remember(value: "dismissed" | "subscribed") {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {}
}

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  // Show after a delay, or when the cursor leaves towards the browser chrome.
  useEffect(() => {
    if (read()) return;
    const show = () => setOpen(true);
    const timer = setTimeout(show, DELAY_MS);
    const onLeave = (e: MouseEvent) => e.clientY <= 0 && show();
    document.addEventListener("mouseleave", onLeave);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const dismiss = () => {
    setOpen(false);
    if (!done) remember("dismissed");
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    // TODO(phase 5): POST to /api/newsletter and issue a unique one-time code.
    setDone(true);
    remember("subscribed");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
          onClick={dismiss}
        >
          <motion.div
            role="dialog"
            aria-label="Join the DRIFT list"
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative grid w-full max-w-3xl overflow-hidden bg-bone md:grid-cols-2"
          >
            <button onClick={dismiss} aria-label="Close" className="absolute right-4 top-4 z-10 text-ink md:text-bone">
              <X size={20} strokeWidth={1.5} />
            </button>

            <div className="relative hidden aspect-[4/5] md:order-2 md:block">
              <Image src={`${EDITORIAL.campaignB}?w=900&q=80`} alt="" fill sizes="400px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-maroon/70 to-transparent" />
              <p className="font-display absolute bottom-6 left-6 text-7xl font-black uppercase leading-[0.85] text-bone">
                Drift
                <br />
                List
              </p>
            </div>

            <div className="flex flex-col justify-center p-8 md:p-10">
              <AnimatePresence mode="wait">
                {!done ? (
                  <motion.div key="form" exit={{ opacity: 0, y: -10 }}>
                    <p className="label text-maroon">Members get it first</p>
                    <h2 className="font-display mt-3 text-5xl font-black uppercase leading-[0.9]">
                      10% off your first order
                    </h2>
                    <p className="mt-4 text-sm text-muted">
                      Early access to drops, restocks and members-only pieces. No spam, just the good stuff.
                    </p>
                    <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        className="h-12 border border-line bg-paper px-4 text-sm outline-none transition-colors focus:border-maroon"
                      />
                      <Button type="submit" variant="maroon">
                        Unlock 10% off
                      </Button>
                    </form>
                    <button onClick={dismiss} className="mt-4 text-xs text-muted underline-offset-4 hover:underline">
                      No thanks, I&apos;ll pay full price
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="label text-maroon">You&apos;re in</p>
                    <h2 className="font-display mt-3 text-5xl font-black uppercase leading-[0.9]">Welcome to Drift</h2>
                    <p className="mt-4 text-sm text-muted">Use this code at checkout:</p>
                    <p className="mt-3 border border-dashed border-maroon py-3 text-center font-mono text-xl tracking-widest text-maroon">
                      DRIFT10
                    </p>
                    <Button onClick={() => setOpen(false)} className="mt-6 w-full">
                      Start shopping
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
