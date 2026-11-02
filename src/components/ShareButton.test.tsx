import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ShareButton from "./ShareButton";
import { buildShareLinks, canonicalShareUrl, supportsNativeShare } from "@/lib/share";

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <ShareButton />
    </MemoryRouter>,
  );

describe("share URLs", () => {
  it("uses the production origin, path and utm parameters", () => {
    expect(canonicalShareUrl("/pricing", "x")).toBe(
      "https://corbinmeier.net/pricing?utm_source=x&utm_medium=social&utm_campaign=share",
    );
    expect(canonicalShareUrl("/", "share")).toBe(
      "https://corbinmeier.net?utm_source=share&utm_medium=social&utm_campaign=share",
    );
  });

  it("builds plain platform links with encoded targets and no Instagram", () => {
    const links = buildShareLinks("/faq", "FAQ & more");
    expect(links.map((l) => l.label)).toEqual(["Facebook", "X", "LinkedIn", "WhatsApp", "Email"]);
    const x = links.find((l) => l.platform === "x")!.href;
    expect(x.startsWith("https://x.com/intent/tweet?text=FAQ%20%26%20more&url=")).toBe(true);
    expect(x).toContain(encodeURIComponent("https://corbinmeier.net/faq?utm_source=x"));
    expect(links.find((l) => l.platform === "email")!.href.startsWith("mailto:?subject=")).toBe(true);
  });

  it("detects native share", () => {
    expect(supportsNativeShare({ share: () => Promise.resolve() })).toBe(true);
    expect(supportsNativeShare({})).toBe(false);
  });
});

describe("ShareButton", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
  });

  it("opens the menu when native share is missing and closes on Escape", () => {
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    renderAt("/faq");
    const button = screen.getByRole("button", { name: "Share this page" });
    fireEvent.click(button);
    expect(screen.getByRole("link", { name: "Facebook" })).toHaveAttribute("target", "_blank");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("link", { name: "Facebook" })).toBeNull();
    expect(button).toHaveFocus();
  });

  it("calls navigator.share with the canonical URL and skips the menu", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { value: share, configurable: true });
    renderAt("/pricing");
    fireEvent.click(screen.getByRole("button", { name: "Share this page" }));
    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    expect(share.mock.calls[0][0].url).toBe(
      "https://corbinmeier.net/pricing?utm_source=share&utm_medium=social&utm_campaign=share",
    );
    expect(screen.queryByRole("link", { name: "Facebook" })).toBeNull();
  });

  it("copies the link and announces it", async () => {
    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", Object.assign(Object.create(navigator), { clipboard: { writeText } }));
    renderAt("/about");
    fireEvent.click(screen.getByRole("button", { name: "Share this page" }));
    fireEvent.click(screen.getByRole("button", { name: /Copy link/ }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Link copied"));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("https://corbinmeier.net/about?utm_source=copy"));
  });
});
