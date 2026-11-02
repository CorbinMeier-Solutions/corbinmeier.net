import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// false on the server and during the hydration render, true on every client render after.
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
