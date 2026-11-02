import { describe, expect, it } from "vitest";
import { SITE_URL } from "@/config/site";
import { canonicalUrl, pageMeta } from "./seo";

function entries(meta: ReturnType<typeof pageMeta>, key: string, value: string) {
  return meta.filter((m) => key in m && (m as Record<string, unknown>)[key] === value);
}

describe("canonicalUrl", () => {
  it("is the bare origin for the home page", () => {
    expect(canonicalUrl("/")).toBe(SITE_URL);
  });

  it("is origin plus path with no trailing slash", () => {
    expect(canonicalUrl("/about")).toBe(`${SITE_URL}/about`);
  });
});

describe("pageMeta", () => {
  const meta = pageMeta({ title: "About | Corbin Meier", description: "About me.", path: "/about" });

  it("has one title, one description and one canonical link", () => {
    expect(meta.filter((m) => "title" in m)).toHaveLength(1);
    expect(entries(meta, "name", "description")).toHaveLength(1);
    const canonical = entries(meta, "rel", "canonical");
    expect(canonical).toEqual([{ tagName: "link", rel: "canonical", href: `${SITE_URL}/about` }]);
  });

  it("sets og:url to the canonical and an absolute https og:image", () => {
    expect(entries(meta, "property", "og:url")).toEqual([{ property: "og:url", content: `${SITE_URL}/about` }]);
    const [image] = entries(meta, "property", "og:image");
    expect(image).toMatchObject({ content: expect.stringMatching(/^https:\/\//) });
    expect(entries(meta, "property", "og:type")).toEqual([{ property: "og:type", content: "website" }]);
  });

  it("carries the twitter tags", () => {
    for (const name of ["twitter:card", "twitter:title", "twitter:description", "twitter:image"]) {
      expect(entries(meta, "name", name)).toHaveLength(1);
    }
  });

  it("noindex output has one robots tag and no canonical, og:url or og:image", () => {
    const noindex = pageMeta({ title: "T", description: "D", path: "/contact", noindex: true });
    expect(entries(noindex, "name", "robots")).toEqual([{ name: "robots", content: "noindex" }]);
    expect(entries(noindex, "rel", "canonical")).toHaveLength(0);
    expect(entries(noindex, "property", "og:url")).toHaveLength(0);
    expect(entries(noindex, "property", "og:image")).toHaveLength(0);
    expect(noindex).toHaveLength(3);
  });
});
