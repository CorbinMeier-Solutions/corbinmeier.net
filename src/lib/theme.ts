// Single source of truth for the site's per-page color palette. Mirrors the
// values previously duplicated across globals.css's .theme-* classes - those
// classes are now driven live from here instead of being toggled statically.
export type PaletteName = "blue" | "green" | "red" | "yellow" | "orange" | "teal";
export type ThemeName = PaletteName | "contact";

type Palette = {
  accent: string;
  background: string;
  cardBg: string;
  border: string;
  inputBg: string;
};

export const THEMES: Record<PaletteName, Palette> = {
  blue: { accent: "#3b82f6", background: "#0a0e17", cardBg: "#0d1420", border: "#1e2836", inputBg: "#0d1420" },
  green: { accent: "#10b981", background: "#04100c", cardBg: "#071712", border: "#0d2a21", inputBg: "#051a14" },
  red: { accent: "#ef4444", background: "#100404", cardBg: "#170707", border: "#2c0d0d", inputBg: "#1c0a0a" },
  yellow: { accent: "#eab308", background: "#120d02", cardBg: "#1a1305", border: "#2e2308", inputBg: "#1a1305" },
  orange: { accent: "#f97316", background: "#130904", cardBg: "#1c0f07", border: "#331a0a", inputBg: "#1c0f07" },
  teal: { accent: "#14b8a6", background: "#04100f", cardBg: "#071614", border: "#0d2a27", inputBg: "#051a18" },
};

// The "contact" theme keeps its own gradient background (see .theme-contact
// in globals.css) but otherwise reads as the blue palette.
export const CONTACT_PALETTE: PaletteName = "blue";

export const ROUTE_THEME: Record<string, PaletteName> = {
  "/": "blue",
  "/projects": "green",
  "/workshop": "yellow",
  "/faq": "orange",
  "/about": "red",
  "/pricing": "teal",
};

export const DEFAULT_PALETTE: PaletteName = "blue";

export function paletteForTheme(theme: ThemeName): PaletteName {
  return theme === "contact" ? CONTACT_PALETTE : theme;
}

export function accentForPath(pathname: string): string {
  return THEMES[ROUTE_THEME[pathname] ?? DEFAULT_PALETTE].accent;
}

// A symmetric ease-in-out curve - velocity ramps up then back down like a
// bell curve, rather than the linear pace of a default CSS transition.
export const bellEase: [number, number, number, number] = [0.65, 0, 0.35, 1];

// Framer Motion's color interpolation emits rgba()/hex strings depending on
// the animation stage; normalize either to an "r, g, b" triplet for the
// `--accent-rgb` custom property consumed by rgba(var(--accent-rgb), a).
export function colorToRgbTriplet(color: string): string {
  if (color.startsWith("#")) {
    const hex = color.length === 4
      ? color.slice(1).split("").map((c) => c + c).join("")
      : color.slice(1);
    const value = parseInt(hex, 16);
    return `${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}`;
  }
  const parts = color.match(/[\d.]+/g);
  if (parts && parts.length >= 3) {
    return `${Math.round(+parts[0])}, ${Math.round(+parts[1])}, ${Math.round(+parts[2])}`;
  }
  return color;
}
