import { useLocation } from "react-router";

// Prerender requests every page as `/about/` while the browser loads the flattened
// `/about.html` as `/about`. Dropping the trailing slash gives both the same path,
// so active-link markup matches between prerendered HTML and hydration.
export function normalizePathname(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

export function useRoutePath(): string {
  return normalizePathname(useLocation().pathname);
}
