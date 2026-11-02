import { describe, expect, it } from "vitest";
import { buildReplyTo, parseContactForm } from "./contact-form";

const valid = { firstName: "Ada", lastName: "Lovelace", email: "ada@example.com", subject: "Hi", message: "Line 1\nLine 2" };

describe("parseContactForm", () => {
  it("accepts a valid submission and keeps a multi-line message", () => {
    const result = parseContactForm(valid);
    expect(result.ok && result.form.message).toBe("Line 1\nLine 2");
  });
  it.each(["firstName", "lastName", "email", "phone", "subject"])("rejects CR/LF in %s", (key) => {
    expect(parseContactForm({ ...valid, [key]: "a\r\nBcc: x@y.com" }).ok).toBe(false);
  });
  it("rejects missing required fields and non-objects", () => {
    expect(parseContactForm({ ...valid, subject: "" }).ok).toBe(false);
    expect(parseContactForm(null).ok).toBe(false);
  });
  it("rejects bad dots in the email", () => {
    expect(parseContactForm({ ...valid, email: "a..b@example.com" }).ok).toBe(false);
  });
});

describe("buildReplyTo", () => {
  it("quotes the name and replaces inner quotes", () => {
    const result = parseContactForm({ ...valid, firstName: 'Ada "A"' });
    if (!result.ok) throw new Error("expected a valid form");
    expect(buildReplyTo(result.form)).toBe(`"Ada 'A' Lovelace" <ada@example.com>`);
  });
});
