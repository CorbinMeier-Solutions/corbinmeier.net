import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Typewriter from "./Typewriter";

const TEXT = "Hello world";

function stubMatchMedia(reduced: boolean) {
  vi.stubGlobal(
    "matchMedia",
    (query: string) => ({
      matches: reduced,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  );
}

class ImmediateObserver {
  private readonly callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  observe(target: Element) {
    this.callback([{ isIntersecting: true, target } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
  disconnect() {}
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("IntersectionObserver", ImmediateObserver);
  stubMatchMedia(false);
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Typewriter before hydration", () => {
  it("server markup holds the full text at opacity 0", () => {
    const html = renderToString(<Typewriter as="h1">{TEXT}</Typewriter>);
    expect(html).toContain(TEXT);
    expect(html).toContain("opacity:0");
  });

  it.each([false, true])("hydrates without a mismatch (reduced motion %s)", async (reduced) => {
    stubMatchMedia(reduced);
    const html = renderToString(<Typewriter as="h1">{TEXT}</Typewriter>);
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});

    let root!: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, <Typewriter as="h1">{TEXT}</Typewriter>);
    });

    expect(errors).not.toHaveBeenCalled();
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});

describe("Typewriter after hydration", () => {
  it("shows the full text with no opacity style under reduced motion", () => {
    stubMatchMedia(true);
    render(<Typewriter as="h1">{TEXT}</Typewriter>);
    const heading = screen.getByRole("heading");
    expect(heading).toHaveTextContent(TEXT);
    expect(heading.getAttribute("style")).toBeNull();
  });

  it("starts empty and reveals the text when motion is allowed", async () => {
    render(<Typewriter as="h1" durationMs={1000}>{TEXT}</Typewriter>);
    const heading = screen.getByRole("heading");
    expect(heading).not.toHaveTextContent(TEXT);

    // Each step is its own act so the start flag and the interval effect it
    // triggers commit between ticks.
    for (let step = 0; step < 4; step++) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
    }
    expect(heading).toHaveTextContent(TEXT);
  });
});
