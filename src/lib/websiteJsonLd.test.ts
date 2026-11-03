import { describe, expect, it } from "vitest";
import { SITE_URL } from "@/config/site";
import { site } from "@/data/site";
import { websiteJsonLd } from "./websiteJsonLd";

describe("websiteJsonLd", () => {
  const ld = websiteJsonLd();

  it("is a schema.org WebSite", () => {
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("WebSite");
  });

  it("names the site by its brand and points at the site origin", () => {
    expect(ld.name).toBe(site.brandName);
    expect(ld.url).toBe(SITE_URL);
  });

  it("carries no alternateName", () => {
    expect(ld).not.toHaveProperty("alternateName");
  });
});
