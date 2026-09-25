"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

/** Search input that updates ?q= in the URL (debounced) and resets pagination. */
export function SearchBox({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");

  useEffect(() => {
    if (value === (params.get("q") ?? "")) return;
    const id = setTimeout(() => {
      const next = new URLSearchParams(params);
      if (value) next.set("q", value);
      else next.delete("q");
      next.delete("page");
      router.replace(`${pathname}?${next}`);
    }, 300);
    return () => clearTimeout(id);
  }, [value, params, pathname, router]);

  return (
    <label className="flex h-10 w-full max-w-xs items-center gap-2 border border-line bg-paper px-3 focus-within:border-ink">
      <Search size={15} className="text-muted" />
      <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} className="flex-1 bg-transparent text-sm outline-none" />
    </label>
  );
}
