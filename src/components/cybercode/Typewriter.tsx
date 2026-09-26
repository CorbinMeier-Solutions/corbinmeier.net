import React, { useState, useEffect, useRef } from "react";

// React 19 types element props as `unknown`, so narrow to the only shape we read.
type WithChildren = { children?: React.ReactNode };

// Recursively count text characters in the React children tree
function countTextCharacters(children: React.ReactNode): number {
  let count = 0;
  React.Children.forEach(children, (child) => {
    if (child === null || child === undefined) return;
    if (typeof child === "string" || typeof child === "number") {
      count += String(child).length;
    } else if (React.isValidElement<WithChildren>(child)) {
      count += countTextCharacters(child.props.children);
    }
  });
  return count;
}

// Recursively clone the React children tree, showing only up to `limit` characters.
// Returns [clonedElement, remainingLimit]
function renderLimit(
  children: React.ReactNode,
  limit: number,
  cursorInsertedRef: { inserted: boolean },
  showCursor: boolean
): [React.ReactNode, number] {
  let remaining = limit;

  const result = React.Children.map(children, (child) => {
    if (remaining <= 0) return null;

    if (child === null || child === undefined) return null;

    if (typeof child === "string" || typeof child === "number") {
      const text = String(child);
      if (text.length <= remaining) {
        remaining -= text.length;
        // If this is the end of this text node, and remaining is 0 or it's the end of all text nodes
        if (remaining === 0 && !cursorInsertedRef.inserted && showCursor) {
          cursorInsertedRef.inserted = true;
          return (
            <>
              {text}
              <span className="inline-block w-[0.15em] h-[1.1em] bg-accent ml-0.5 animate-[cc-blink_1.2s_infinite] align-middle" />
            </>
          );
        }
        return text;
      } else {
        const slicedText = text.slice(0, remaining);
        remaining = 0;
        if (!cursorInsertedRef.inserted && showCursor) {
          cursorInsertedRef.inserted = true;
          return (
            <>
              {slicedText}
              <span className="inline-block w-[0.15em] h-[1.1em] bg-accent ml-0.5 animate-[cc-blink_1.2s_infinite] align-middle" />
            </>
          );
        }
        return slicedText;
      }
    }

    if (React.isValidElement<WithChildren>(child)) {
      const [newChildren, newRemaining] = renderLimit(
        child.props.children,
        remaining,
        cursorInsertedRef,
        showCursor
      );
      remaining = newRemaining;

      // Clone the element with the typed subset of children
      return React.cloneElement(child, { children: newChildren });
    }

    return null;
  });

  return [result, remaining];
}

interface TypewriterProps {
  children: React.ReactNode;
  durationMs?: number;
  delayMs?: number;
  as?: React.ElementType;
  className?: string;
  showCursor?: boolean;
}

export default function Typewriter({
  children,
  durationMs = 2000,
  delayMs = 0,
  as: Component = "div",
  className,
  showCursor = true,
}: TypewriterProps) {
  const totalChars = countTextCharacters(children);
  const [visibleCharCount, setVisibleCharCount] = useState(0);
  const [started, setStarted] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(showCursor);
  const elementRef = useRef<HTMLElement | null>(null);

  // A visitor who asked the OS for less motion gets the full text immediately,
  // with no blinking cursor - this is the only reveal effect on the site, so
  // it is the only place that needs to check. The initial value is read
  // lazily from `useState` (not set from inside an effect) so it is correct
  // on the very first render; the effect below only subscribes to changes.
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const timer = setTimeout(() => setStarted(true), delayMs);
          observer.disconnect();
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.05 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [delayMs, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !started || totalChars <= 0) return;

    // Add +/- 0.6 seconds (600ms) random jitter. Kept in the effect so render stays pure.
    const jitteredDuration = durationMs + (Math.random() - 0.5) * 1200;
    const speedMs = Math.max(1, jitteredDuration) / totalChars;

    let current = 0;
    const interval = setInterval(() => {
      current++;
      setVisibleCharCount(current);
      if (current >= totalChars) {
        clearInterval(interval);
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [started, totalChars, durationMs, reducedMotion]);

  useEffect(() => {
    if (visibleCharCount >= totalChars && totalChars > 0 && showCursor) {
      const jitterMs = 1000 + (Math.random() - 0.5) * 1000;
      const timer = setTimeout(() => {
        setCursorVisible(false);
      }, jitterMs);
      return () => clearTimeout(timer);
    }
  }, [visibleCharCount, totalChars, showCursor]);

  if (reducedMotion) {
    return <Component className={className}>{children}</Component>;
  }

  const cursorInsertedRef = { inserted: false };
  const [renderedChildren] = renderLimit(
    children,
    visibleCharCount,
    cursorInsertedRef,
    cursorVisible
  );

  // If typing is complete, and cursor still hasn't been inserted (e.g. empty or exact fit)
  const isComplete = visibleCharCount >= totalChars;

  return (
    <Component ref={elementRef} className={className}>
      {renderedChildren}
      {isComplete && cursorVisible && !cursorInsertedRef.inserted && (
        <span className="inline-block w-[0.15em] h-[1.1em] bg-accent ml-0.5 animate-[cc-blink_1.2s_infinite] align-middle" />
      )}
    </Component>
  );
}
