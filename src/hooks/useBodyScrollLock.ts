import { useEffect } from "react";

// Holds the page still while an overlay is open.
//
// `overflow: hidden` on <body> is only advisory on iOS Safari: the page behind
// the overlay keeps scrolling under your finger and drags the overlay with it.
// Pinning the body with `position: fixed` at a negative top offset is the
// pattern that actually holds there, provided the scroll position is put back
// on release - otherwise closing the overlay returns you to the top of the page.
//
// Running as an effect rather than from an open/close handler also means an
// overlay that unmounts while still open (a route change with the modal up)
// releases the lock instead of leaving the page permanently unscrollable.
export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;

    const { body } = document;
    const scrollY = window.scrollY;
    // Taking the scrollbar's width out of the layout is what causes the page to
    // jump sideways as an overlay opens; pad the body by the same amount.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}
