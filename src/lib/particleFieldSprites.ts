/**
 * Canvas helpers for ParticleField: offscreen sprite pre-rendering (so the
 * live draw loop never touches `filter: blur`, which blanked iOS Safari -
 * see issue #26 / the 2026-08-16 fix) plus small easing/color utilities.
 */

/** Pre-renders a soft filled circle (radial gradient fading to transparent) once, to draw from every frame. */
export function createRadialSprite(rgb: string, maxAlpha: number, radius: number): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  const size = Math.max(2, Math.ceil(radius * 2));
  const sprite = document.createElement("canvas");
  sprite.width = size;
  sprite.height = size;
  const ctx = sprite.getContext("2d");
  if (!ctx) return null;

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, `rgba(${rgb}, ${maxAlpha})`);
  gradient.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return sprite;
}

/** Pre-renders a soft filled ellipse the same way, for the three ambient "light" blobs. */
export function createEllipseSprite(rgb: string, maxAlpha: number, width: number, height: number): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  const w = Math.max(2, Math.ceil(width));
  const h = Math.max(2, Math.ceil(height));
  const sprite = document.createElement("canvas");
  sprite.width = w;
  sprite.height = h;
  const ctx = sprite.getContext("2d");
  if (!ctx) return null;

  ctx.translate(w / 2, h / 2);
  ctx.scale(1, h / w);
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, w / 2);
  gradient.addColorStop(0, `rgba(${rgb}, ${maxAlpha})`);
  gradient.addColorStop(1, `rgba(${rgb}, 0)`);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
  ctx.fill();
  return sprite;
}

/** Reads the live `--accent-rgb` custom property tweened by useThemeTransition, falling back to Signal Blue. */
export function readAccentRgb(): string {
  if (typeof document === "undefined") return "59, 130, 246";
  const value = getComputedStyle(document.documentElement).getPropertyValue("--accent-rgb").trim();
  return value || "59, 130, 246";
}

/** Mixes an "r, g, b" triplet toward white by `amount` (0-1) to derive a lighter tint of the page accent. */
export function lightenRgbTriplet(rgb: string, amount: number): string {
  const parts = rgb.split(",").map((part) => Number.parseFloat(part.trim()));
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return rgb;
  const [r, g, b] = parts;
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
  return `${mix(r)}, ${mix(g)}, ${mix(b)}`;
}

export function easeInOutCubic(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped < 0.5 ? 4 * clamped ** 3 : 1 - (-2 * clamped + 2) ** 3 / 2;
}

/** Smooth 0 -> 1 -> 0 envelope across a leg's duration, for "fade in then out". */
export function fadeEnvelope(t: number): number {
  return Math.sin(Math.PI * Math.min(1, Math.max(0, t)));
}
