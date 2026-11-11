import { useEffect, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Keeps keyboard focus inside a modal while it is open.
//
// On open, focus moves to the container (which needs tabIndex={-1}); Tab and
// Shift+Tab wrap at its ends, and also pull focus back in if it has escaped
// (the focused element can unmount mid-dialog); on close, focus returns to the
// control that opened it. Escape is left to each dialog, which has its own rules.
export function useDialogFocus(active: boolean, containerRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!active || !container) return;

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    container.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        e.preventDefault();
        container.focus();
        return;
      }
      const current = document.activeElement;
      const inside = current instanceof Node && container.contains(current) && current !== container;
      if (e.shiftKey && (!inside || current === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (!inside || current === last)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (opener?.isConnected) opener.focus();
    };
  }, [active, containerRef]);
}
