"use client";

import Image from "next/image";
import { useEffect, useState, useTransition, type FormEvent } from "react";
import { subscribe } from "@/app/actions/newsletter";
import { motion } from "motion/react";
import { EDITORIAL } from "@/lib/products";
import { Button } from "@/components/ui/Button";
import { SplitText } from "@/components/motion/Reveal";

// Placeholder date for the next drop. This will come from the admin panel later.
const DROP_DATE = new Date("2026-11-14T20:00:00+05:00");

function remaining(target: Date) {
  const diff = Math.max(target.getTime() - Date.now(), 0);
  return {
    Days: Math.floor(diff / 86_400_000),
    Hours: Math.floor(diff / 3_600_000) % 24,
    Mins: Math.floor(diff / 60_000) % 60,
    Secs: Math.floor(diff / 1000) % 60,
  };
}

export function DropCountdown() {
  const [time, setTime] = useState<ReturnType<typeof remaining> | null>(null);
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const update = () => setTime(remaining(DROP_DATE));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await subscribe(email, "drop-waitlist");
      if (res.ok) setJoined(true);
      else setError(res.message);
    });
  };

  return (
    <section className="grid bg-maroon text-bone md:grid-cols-2">
      <div className="relative aspect-[4/5] overflow-hidden md:aspect-auto">
        <motion.div
          initial={{ scale: 1.2 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image src={`${EDITORIAL.night}?w=1400&q=80`} alt="DRIFT Drop 02 preview" fill sizes="50vw" className="object-cover grayscale" />
        </motion.div>
        <div className="absolute inset-0 bg-maroon/30 mix-blend-multiply" />
      </div>

      <div className="flex flex-col justify-center gap-8 px-6 py-16 md:px-14 md:py-24">
        <div>
          <p className="label text-bone/70">Drop 02 · Limited run</p>
          <SplitText
            text="Season of Drift"
            className="font-display mt-3 text-7xl font-black uppercase leading-[0.85] md:text-9xl"
          />
        </div>

        <div className="grid max-w-md grid-cols-4 gap-2">
          {(["Days", "Hours", "Mins", "Secs"] as const).map((unit) => (
            <div key={unit} className="border border-bone/25 px-2 py-4 text-center">
              <p className="font-mono text-3xl tabular-nums md:text-4xl">
                {time ? String(time[unit]).padStart(2, "0") : "--"}
              </p>
              <p className="label mt-1 text-[10px] text-bone/60">{unit}</p>
            </div>
          ))}
        </div>

        <p className="max-w-md text-sm text-bone/80">
          Twelve pieces. One release. Members get access 24 hours before everyone else. Once it&apos;s gone, it&apos;s gone.
        </p>

        {joined ? (
          <p className="label">You&apos;re on the early access list ✦</p>
        ) : (
          <form onSubmit={submit} className="flex max-w-md flex-col gap-2 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email for early access"
              className="h-12 flex-1 border border-bone/30 bg-transparent px-4 text-sm outline-none placeholder:text-bone/50 focus:border-bone"
            />
            <Button type="submit" variant="light" disabled={pending}>
              {pending ? "Joining…" : "Notify me"}
            </Button>
          </form>
        )}
        {error && <p className="text-xs text-blush">{error}</p>}
      </div>
    </section>
  );
}
