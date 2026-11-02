// JSON.stringify with every "<" escaped, so a "</script>" inside a value cannot close an inline script tag.
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
