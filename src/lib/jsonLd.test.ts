import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "./jsonLd";

describe("serializeJsonLd", () => {
  const value = { name: "a </script><script>alert(1)</script>", n: [1, 2], nested: { ok: true } };

  it("round-trips to the same value", () => {
    expect(JSON.parse(serializeJsonLd(value))).toEqual(value);
  });

  it("contains no raw <", () => {
    expect(serializeJsonLd(value)).not.toContain("<");
  });
});
