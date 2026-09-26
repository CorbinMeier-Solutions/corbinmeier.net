import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useBodyScrollLock } from "./useBodyScrollLock";

describe("useBodyScrollLock", () => {
  beforeEach(() => {
    document.body.style.cssText = "";
    // jsdom has no layout, so scrollTo is a stub and scrollY is always 0.
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  it("pins the body while locked", () => {
    renderHook(() => useBodyScrollLock(true));

    // position: fixed is the part that holds on iOS, where overflow alone does not.
    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("leaves the body alone when not locked", () => {
    renderHook(() => useBodyScrollLock(false));

    expect(document.body.style.position).toBe("");
    expect(document.body.style.overflow).toBe("");
  });

  it("releases the lock when the overlay unmounts while still open", () => {
    // The leak this replaced: an open/close handler never runs its restore if
    // the component unmounts first, leaving the page unscrollable for good.
    const { unmount } = renderHook(() => useBodyScrollLock(true));
    expect(document.body.style.position).toBe("fixed");

    unmount();

    expect(document.body.style.position).toBe("");
    expect(document.body.style.overflow).toBe("");
    expect(document.body.style.top).toBe("");
  });

  it("restores the scroll position it captured", () => {
    Object.defineProperty(window, "scrollY", { value: 742, configurable: true });

    const { unmount } = renderHook(() => useBodyScrollLock(true));
    expect(document.body.style.top).toBe("-742px");

    unmount();

    expect(window.scrollTo).toHaveBeenCalledWith(0, 742);
  });

  it("restores styles the page already had rather than blanking them", () => {
    document.body.style.overflow = "auto";

    const { unmount } = renderHook(() => useBodyScrollLock(true));
    unmount();

    expect(document.body.style.overflow).toBe("auto");
  });
});
