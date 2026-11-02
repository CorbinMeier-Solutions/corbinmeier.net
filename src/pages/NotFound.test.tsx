import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound, { meta } from "./NotFound";

describe("NotFound meta", () => {
  const tags = meta();

  it("has exactly one robots noindex", () => {
    const robots = tags.filter((t) => "name" in t && t.name === "robots");
    expect(robots).toEqual([{ name: "robots", content: "noindex" }]);
  });

  it("has no canonical link and no og:url", () => {
    expect(tags.some((t) => "rel" in t && t.rel === "canonical")).toBe(false);
    expect(tags.some((t) => "property" in t && t.property === "og:url")).toBe(false);
  });

  it("has a non-empty title", () => {
    const title = tags.find((t) => "title" in t);
    expect(title && "title" in title && title.title).toBeTruthy();
  });
});

describe("NotFound page", () => {
  it("still renders the heading and both links", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("404");
    expect(screen.getByText("go back")).toBeTruthy();
    expect(screen.getByText("return to the homepage")).toBeTruthy();
  });
});
