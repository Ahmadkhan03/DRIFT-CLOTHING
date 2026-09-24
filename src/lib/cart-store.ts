"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartLine = {
  slug: string;
  size: string;
  quantity: number;
};

type CartState = {
  lines: CartLine[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (slug: string, size: string, quantity?: number) => void;
  setQuantity: (slug: string, size: string, quantity: number) => void;
  remove: (slug: string, size: string) => void;
  clear: () => void;
};

const same = (l: CartLine, slug: string, size: string) => l.slug === slug && l.size === size;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      add: (slug, size, quantity = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => same(l, slug, size));
          const lines = existing
            ? s.lines.map((l) => (same(l, slug, size) ? { ...l, quantity: Math.min(l.quantity + quantity, 10) } : l))
            : [...s.lines, { slug, size, quantity }];
          return { lines, isOpen: true };
        }),
      setQuantity: (slug, size, quantity) =>
        set((s) => ({
          lines:
            quantity <= 0
              ? s.lines.filter((l) => !same(l, slug, size))
              : s.lines.map((l) => (same(l, slug, size) ? { ...l, quantity: Math.min(quantity, 10) } : l)),
        })),
      remove: (slug, size) => set((s) => ({ lines: s.lines.filter((l) => !same(l, slug, size)) })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "drift-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines }),
    },
  ),
);
