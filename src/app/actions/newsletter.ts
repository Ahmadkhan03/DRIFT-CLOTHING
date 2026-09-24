"use server";

import { z } from "zod";
import { getDb } from "@/lib/supabase/server";

const schema = z.object({
  email: z.email().max(200),
  source: z.enum(["popup", "footer", "drop-waitlist", "checkout"]),
});

export async function subscribe(email: string, source: z.infer<typeof schema>["source"]) {
  const parsed = schema.safeParse({ email: email.trim().toLowerCase(), source });
  if (!parsed.success) return { ok: false as const, message: "Enter a valid email address." };

  const db = getDb();
  if (!db) {
    console.info("[newsletter] Supabase not configured, subscription not stored");
    return { ok: true as const };
  }

  const { error } = await db
    .from("newsletter_subscribers")
    .upsert(parsed.data, { onConflict: "email", ignoreDuplicates: true });
  if (error) {
    console.error("[newsletter] insert failed", error);
    return { ok: false as const, message: "Couldn't subscribe right now. Please try again." };
  }
  return { ok: true as const };
}
