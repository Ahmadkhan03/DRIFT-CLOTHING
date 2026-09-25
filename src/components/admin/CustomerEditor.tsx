"use client";

import { useState, useTransition, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { saveCustomer } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";

const SUGGESTED = ["VIP", "Wholesale", "Influencer", "Fake order risk", "Returns often"];

export function CustomerEditor({ id, tags: initialTags, notes: initialNotes }: { id: string; tags: string[]; notes: string | null }) {
  const [tags, setTags] = useState(initialTags);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [input, setInput] = useState("");
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const addTag = (t: string) => {
    const tag = t.trim();
    if (tag && !tags.includes(tag)) setTags([...tags, tag]);
    setInput("");
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
  };

  const save = () =>
    start(async () => {
      const res = await saveCustomer({ id, tags, notes });
      setStatus(res.ok ? { ok: true, message: "Saved" } : { ok: false, message: res.message });
    });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs text-muted">Tags</p>
        <div className="flex flex-wrap items-center gap-1.5 border border-line bg-bone p-2">
          {tags.map((t) => (
            <span key={t} className="flex items-center gap-1 bg-ink px-2 py-1 text-xs text-bone">
              {t}
              <button onClick={() => setTags(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`}>
                <X size={11} />
              </button>
            </span>
          ))}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            onBlur={() => input && addTag(input)}
            placeholder="Add tag…"
            className="min-w-24 flex-1 bg-transparent px-1 text-sm outline-none"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {SUGGESTED.filter((s) => !tags.includes(s)).map((s) => (
            <button key={s} onClick={() => addTag(s)} className="border border-dashed border-line px-2 py-0.5 text-[11px] text-muted hover:border-ink hover:text-ink">
              + {s}
            </button>
          ))}
        </div>
      </div>
      <label className="flex flex-col gap-2">
        <span className="text-xs text-muted">Private notes (staff only)</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="e.g. Prefers WhatsApp, size L in hoodies, refused a parcel in March…"
          className="border border-line bg-bone p-3 text-sm outline-none focus:border-ink"
        />
      </label>
      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={pending} className="h-10 px-5">
          {pending ? "Saving…" : "Save"}
        </Button>
        {status && <span className={`text-xs ${status.ok ? "text-muted" : "text-maroon"}`}>{status.message}</span>}
      </div>
    </div>
  );
}
