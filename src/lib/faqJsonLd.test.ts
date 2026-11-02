import { describe, expect, it } from "vitest";
import type { FaqCategory } from "@/components/FaqLog";
import { faqJsonLd } from "./faqJsonLd";

const categories: FaqCategory[] = [
  {
    slug: "a",
    title: "A",
    logPath: "a.log",
    entries: [
      { id: "1", logId: "l1", question: "Q1?", answer: "<p>First <a href=\"/x\">answer</a>.</p>" },
      { id: "2", logId: "l2", question: "Q2?", answer: "Second." },
    ],
  },
  {
    slug: "b",
    title: "B",
    logPath: "b.log",
    entries: [{ id: "3", logId: "l3", question: "Q3?", answer: "Third." }],
  },
];

describe("faqJsonLd", () => {
  const ld = faqJsonLd(categories);

  it("is a FAQPage with one Question per entry", () => {
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity.map((q) => q.name)).toEqual(["Q1?", "Q2?", "Q3?"]);
    expect(ld.mainEntity.every((q) => q["@type"] === "Question")).toBe(true);
  });

  it("strips HTML from the answers", () => {
    expect(ld.mainEntity[0].acceptedAnswer.text).toBe("First answer .");
  });
});
