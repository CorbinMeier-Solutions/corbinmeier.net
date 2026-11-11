import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

// True when the element is rendered: the browser's own visibility check
// where it exists, else display:none or visibility:hidden on the element or an
// ancestor inside the dialog (jsdom has no layout, so zero-size cannot be used).
function isRendered(el: HTMLElement, container: HTMLElement): boolean {
  if (typeof el.checkVisibility === "function") return el.checkVisibility();
  for (let node: HTMLElement | null = el; node && node !== container.parentElement; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (style.display === "none" || (node === el && style.visibility === "hidden")) return false;
  }
  return true;
}

function isReachable(el: HTMLElement, container: HTMLElement): boolean {
  return !el.closest('[inert], [aria-hidden="true"]') && isRendered(el, container);
}

// Keeps keyboard focus inside a modal while it is open.
//
// On open, focus moves to the container (which needs tabIndex={-1}); Tab and
// Shift+Tab wrap at its ends, and also pull focus back in if it has escaped
// (the focused element can unmount mid-dialog); on close, focus returns to the
// control that opened it. Escape is left to each dialog, which has its own rules.
// Only reachable controls count as the ends (not hidden, unrendered or inert ones).
// `paused` keeps the wrap off while another dialog stacked on top owns Tab.
export function useDialogFocus(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
  paused = false,
): void {
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const container = containerRef.current;
    if (!active || !container) return;

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    container.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || pausedRef.current) return;
      const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) =>
        isReachable(el, container),
      );
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
