/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";
import wranglerToml from "../../../wrangler.toml?raw";
import { hasBadDots, isValidEmail, parseRecipients } from "./mail";

// RFC 5322 "Display Name <user@domain.tld>" - the shape the API accepts.
const SENDER = /^[^<>@\r\n]+ <[^\s@<>.]+(\.[^\s@<>.]+)*@[^\s@<>.]+(\.[^\s@<>.]+)+>$/;

describe("MAIL_FROM in wrangler.toml", () => {
  const values = [...wranglerToml.matchAll(/^MAIL_FROM\s*=\s*"([^"]*)"/gm)].map((m) => m[1]);

  it("is set in both the production and preview blocks", () => {
    expect(values).toHaveLength(2);
  });

  it.each(values)("parses as a display name plus address: %s", (value) => {
    expect(value).toMatch(SENDER);
  });
});

describe("parseRecipients", () => {
  it("splits, trims and drops empties", () => {
    expect(parseRecipients(" a@x.com, b@y.com ,, ")).toEqual(["a@x.com", "b@y.com"]);
  });
  it("normalises arrays too", () => {
    expect(parseRecipients(["a@x.com ", ""])).toEqual(["a@x.com"]);
  });
  it("returns an empty list for an empty value", () => {
    expect(parseRecipients("")).toEqual([]);
  });
});

describe("hasBadDots / isValidEmail", () => {
  it.each([".a", "a.", "a..b"])("flags %s", (part) => {
    expect(hasBadDots(part)).toBe(true);
  });
  it("accepts ordinary parts", () => {
    expect(hasBadDots("first.last")).toBe(false);
  });
  it.each(["a@b.com", "first.last@sub.example.com"])("accepts %s", (v) => {
    expect(isValidEmail(v)).toBe(true);
  });
  it.each(["a@b", ".a@b.com", "a.@b.com", "a..b@c.com", "a@.b.com", "a@b..com", "a@b.com.", "a b@c.com"])(
    "rejects %s",
    (v) => {
      expect(isValidEmail(v)).toBe(false);
    }
  );
});
