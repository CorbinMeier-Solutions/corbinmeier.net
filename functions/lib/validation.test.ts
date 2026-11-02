import { describe, expect, it } from "vitest";
import { hasBadDots, isValidEmail } from "./validation";

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
