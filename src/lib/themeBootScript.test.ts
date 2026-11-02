import { afterEach, describe, expect, it } from "vitest";
import { ROUTE_THEME, THEMES } from "@/lib/theme";
import { themeBootScript } from "./themeBootScript";

function runAt(path: string): CSSStyleDeclaration {
  window.history.replaceState({}, "", path);
  document.documentElement.removeAttribute("style");
  new Function(themeBootScript)();
  return document.documentElement.style;
}

afterEach(() => {
  window.history.replaceState({}, "", "/");
  document.documentElement.removeAttribute("style");
});

describe("themeBootScript", () => {
  it.each(Object.entries(ROUTE_THEME))("sets the %s accent from ROUTE_THEME", (path, palette) => {
    expect(runAt(path).getPropertyValue("--accent")).toBe(THEMES[palette].accent);
  });

  it("falls back to blue for an unknown path", () => {
    expect(runAt("/nope").getPropertyValue("--accent")).toBe(THEMES.blue.accent);
  });

  it("ignores a trailing slash", () => {
    expect(runAt("/about/").getPropertyValue("--accent")).toBe(THEMES.red.accent);
  });

  it("sets every custom property the transition writes", () => {
    const style = runAt("/faq");
    for (const prop of ["--accent", "--accent-rgb", "--background", "--card-bg", "--border", "--input-bg"]) {
      expect(style.getPropertyValue(prop)).not.toBe("");
    }
    expect(style.getPropertyValue("--accent-rgb")).toBe("249, 115, 22");
  });

  it("contains every palette name from THEMES", () => {
    for (const name of Object.keys(THEMES)) expect(themeBootScript).toContain(`"${name}"`);
  });
});
