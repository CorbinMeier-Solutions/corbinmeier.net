import { describe, expect, it } from "vitest";
import { SITE_URL } from "@/config/site";
import routes from "./routes";
import { meta as home } from "@/pages/Home";
import { meta as about } from "@/pages/About";
import { meta as projects } from "@/pages/Projects";
import { meta as workshop } from "@/pages/Workshop";
import { meta as faq } from "@/pages/Faq";
import { meta as pricing } from "@/pages/Pricing";
import { meta as privacy } from "@/pages/PrivacyPolicy";
import { meta as terms } from "@/pages/TermsOfService";
import { meta as contact } from "@/pages/ContactRedirect";

import type { MetaDescriptor } from "react-router";
import type { RouteConfigEntry } from "@react-router/dev/routes";

type Entry = MetaDescriptor;

function flatten(nodes: RouteConfigEntry[]): RouteConfigEntry[] {
  return nodes.flatMap((n) => [n, ...flatten(n.children ?? [])]);
}

const indexable: Array<[string, () => Entry[]]> = [
  ["/", home],
  ["/about", about],
  ["/projects", projects],
  ["/workshop", workshop],
  ["/faq", faq],
  ["/pricing", pricing],
  ["/privacy-policy", privacy],
  ["/terms-of-service", terms],
];

function canonicals(entries: Entry[]) {
  return entries.filter((e) => "rel" in e && e.rel === "canonical");
}

function named(entries: Entry[], name: string) {
  return entries.filter((e) => "name" in e && e.name === name);
}

const nodes = flatten(await routes);

describe("route table", () => {
  const paths = nodes.map((n) => n.path);

  it("has distinct ids for the 404 route and the splat", () => {
    expect(paths).toContain("*");
    expect(paths).toContain("404");
    const ids = nodes.filter((n) => n.id).map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("serves /contact and no longer routes /tools or /ai-setup", () => {
    expect(paths).toContain("contact");
    expect(paths).not.toContain("tools");
    expect(paths).not.toContain("ai-setup");
  });
});

describe("page meta", () => {
  it("gives the 8 indexable pages unique titles and descriptions", () => {
    const titles = indexable.map(([, m]) => m().find((e) => "title" in e));
    const descriptions = indexable.map(([, m]) => named(m(), "description")[0]);
    expect(new Set(titles).size).toBe(8);
    expect(new Set(descriptions).size).toBe(8);
  });

  it.each(indexable)("%s has exactly one canonical equal to its URL", (path, m) => {
    const found = canonicals(m());
    expect(found).toHaveLength(1);
    expect("href" in found[0] && found[0].href).toBe(path === "/" ? SITE_URL : `${SITE_URL}${path}`);
  });

  it("marks /contact noindex with no canonical", () => {
    const entries = contact();
    expect(named(entries, "robots")).toEqual([{ name: "robots", content: "noindex" }]);
    expect(canonicals(entries)).toHaveLength(0);
  });
});
