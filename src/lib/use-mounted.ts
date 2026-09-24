"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** True only after hydration, so client-only state (cart, storage) can't cause mismatches. */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
