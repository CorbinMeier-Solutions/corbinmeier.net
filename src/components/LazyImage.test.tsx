import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { fireEvent, render, screen } from "@testing-library/react";
import LazyImage from "./LazyImage";

describe("LazyImage", () => {
  it("puts a natively lazy img in the server markup", () => {
    const html = renderToString(
      <LazyImage src="/a.webp" alt="Project A" srcSet="/a.webp 1x" sizes="100vw" width={640} height={360} />,
    );
    expect(html).toContain("<img");
    expect(html).toContain('src="/a.webp"');
    expect(html).toContain('alt="Project A"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
    expect(html).toContain("sizes=");
    expect(html).not.toContain("backdrop-blur");
  });

  it("loads eagerly when priority is set", () => {
    expect(renderToString(<LazyImage src="/a.webp" alt="A" priority />)).toContain('loading="eager"');
  });

  it("shows the fallback when the image fails", () => {
    render(<LazyImage src="/missing.webp" alt="Missing" fallbackIcon={<span>fallback</span>} />);
    expect(screen.queryByText("fallback")).toBeNull();
    fireEvent.error(screen.getByAltText("Missing"));
    expect(screen.getByText("fallback")).toBeTruthy();
  });

  it("drops the spinner once the image loads", () => {
    const { container } = render(<LazyImage src="/a.webp" alt="A" />);
    expect(container.querySelector(".animate-spin")).not.toBeNull();
    fireEvent.load(screen.getByAltText("A"));
    expect(container.querySelector(".animate-spin")).toBeNull();
  });
});
