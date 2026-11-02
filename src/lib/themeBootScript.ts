import { DEFAULT_PALETTE, ROUTE_THEME, THEMES, colorToRgbTriplet } from "@/lib/theme";

// Runs in <head> before first paint so the page opens in its route's palette.
// Built from theme.ts (never a copied table); sets the same custom properties
// useThemeTransition writes.
const palettes = Object.fromEntries(
  Object.entries(THEMES).map(([name, palette]) => [
    name,
    { ...palette, accentRgb: colorToRgbTriplet(palette.accent) },
  ]),
);

export const themeBootScript: string = `(function(){
var themes=${JSON.stringify(palettes)};
var routes=${JSON.stringify(ROUTE_THEME)};
var path=location.pathname.replace(/\\/+$/,"")||"/";
var t=themes[routes[path]||${JSON.stringify(DEFAULT_PALETTE)}];
var s=document.documentElement.style;
s.setProperty("--accent",t.accent);
s.setProperty("--accent-rgb",t.accentRgb);
s.setProperty("--background",t.background);
s.setProperty("--card-bg",t.cardBg);
s.setProperty("--border",t.border);
s.setProperty("--input-bg",t.inputBg);
})();`;
