import { useEffect, useRef } from "react";
import {
  createEllipseSprite,
  createRadialSprite,
  easeInOutCubic,
  lightenRgbTriplet,
  readAccentRgb,
} from "@/lib/particleFieldSprites";

/**
 * Ambient particle + light field behind the CRT scanlines/vignette, tinted
 * with the page's live accent color. Plain Canvas 2D + rAF, no dependencies.
 *
 * Ported from a reference CreateJS/TweenMax "projector" canvas (behavior
 * spec only, not the code): three soft breathing light ellipses plus rings
 * and dots that drift, scale, and fade forever. Kept deliberately cheap -
 * the previous blurred-blob backdrop blanked iOS Safari (fixed 2026-08-16) -
 * so nothing here uses `filter: blur` or a per-frame canvas filter; soft
 * shapes are pre-rendered once to offscreen sprites and drawn from those.
 */

const MAX_DPR = 1.5;
const NARROW_WIDTH = 640;
const REDUCE_FACTOR = 1 / 3;

const RING_COUNT = 300;
const RING_RADIUS = 3;
const RING_MAX_ALPHA = 0.4;

const MEDIUM_COUNT = 100;
const MEDIUM_RADIUS = 8;
const MEDIUM_MAX_ALPHA = 0.3;

const LARGE_COUNT = 10;
const LARGE_RADIUS = 30;
const LARGE_MAX_ALPHA = 0.2;

// Dimmed to ~5% opacity and anchored to the bottom edge (their vertical
// center sits on the viewport's bottom edge, so the glow rises from below)
// per #31; offsets are horizontal-only now that there is no vertical center
// to offset from.
const LIGHTS = [
  { width: 400, height: 100, alpha: 0.05, offsetX: 0 },
  { width: 350, height: 250, alpha: 0.03, offsetX: -50 },
  { width: 100, height: 80, alpha: 0.02, offsetX: 80 },
];

// Particles fade in once, staggered over this many milliseconds after
// mount, then hold their resting opacity forever - no fade-out cycle (#31).
const FADE_IN_STAGGER_MS = 4000;
const FADE_IN_DURATION_MS = 2000;

const PARTICLE_TINTS = [0.15, 0.35, 0.55];
const LIGHT_TINTS = [0.25, 0.4, 0.6];

const ACCENT_POLL_FRAMES = 15;

type Drifter = {
  radius: number;
  maxAlpha: number;
  /** Fixed brightness variance (0-1) picked once at spawn; unlike the old
   * per-leg peak this never resets, so the particle holds a steady resting
   * alpha instead of fading out between legs. */
  restAlpha: number;
  /** Absolute `performance.now()` timestamp the fade-in begins; staggered
   * per particle so they don't all pop in together. */
  fadeInStart: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  fromScale: number;
  toScale: number;
  legStart: number;
  legDuration: number;
};

function randomBand(width: number, height: number) {
  return {
    x: Math.random() * width,
    // Concentrated in the middle half of the height.
    y: height * 0.25 + Math.random() * height * 0.5,
  };
}

/** Position/scale for the next leg only - alpha lives on the drifter itself
 * (`restAlpha`/`fadeInStart`) and is untouched by `Object.assign` below, so
 * a drifter's resting brightness survives every leg change. */
type Leg = Pick<Drifter, "fromX" | "fromY" | "toX" | "toY" | "fromScale" | "toScale" | "legStart" | "legDuration">;

function newLeg(drifter: Pick<Drifter, "radius">, width: number, height: number, fromX: number, fromY: number, fromScale: number, now: number): Leg {
  const spread = drifter.radius * 2;
  const targetX = Math.min(width, Math.max(0, fromX + (Math.random() - 0.5) * 2 * spread));
  const targetY = Math.min(height * 0.9, Math.max(height * 0.1, fromY + (Math.random() - 0.5) * 2 * spread));
  return {
    fromX,
    fromY,
    toX: targetX,
    toY: targetY,
    fromScale,
    toScale: 0.3 + Math.random() * 0.7,
    legStart: now,
    legDuration: 2000 + Math.random() * 8000,
  };
}

function makeDrifter(radius: number, maxAlpha: number, width: number, height: number, now: number): Drifter {
  const { x, y } = randomBand(width, height);
  const leg = newLeg({ radius }, width, height, x, y, 0.3 + Math.random() * 0.7, now);
  return {
    ...leg,
    radius,
    maxAlpha,
    restAlpha: 0.5 + Math.random() * 0.5,
    fadeInStart: now + Math.random() * FADE_IN_STAGGER_MS,
  };
}

function reduceCount(base: number, factor: number) {
  return Math.max(1, Math.round(base * factor));
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return; // fail to nothing

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

    let accentRgb = readAccentRgb();
    let particleSprites: (HTMLCanvasElement | null)[] = [];
    let lightSprites: (HTMLCanvasElement | null)[] = [];

    let rings: Drifter[] = [];
    let mediums: Drifter[] = [];
    let larges: Drifter[] = [];

    const rebuildSprites = () => {
      particleSprites = [
        createRadialSprite(lightenRgbTriplet(accentRgb, PARTICLE_TINTS[1]), MEDIUM_MAX_ALPHA, MEDIUM_RADIUS),
        createRadialSprite(lightenRgbTriplet(accentRgb, PARTICLE_TINTS[2]), LARGE_MAX_ALPHA, LARGE_RADIUS),
      ];
      lightSprites = LIGHTS.map((light, index) =>
        createEllipseSprite(lightenRgbTriplet(accentRgb, LIGHT_TINTS[index]), light.alpha, light.width, light.height),
      );
    };

    const sizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const populate = (now: number) => {
      const narrow = width < NARROW_WIDTH || window.matchMedia("(pointer: coarse)").matches;
      const factor = narrow ? REDUCE_FACTOR : 1;
      rings = Array.from({ length: reduceCount(RING_COUNT, factor) }, () => makeDrifter(RING_RADIUS, RING_MAX_ALPHA, width, height, now));
      mediums = Array.from({ length: reduceCount(MEDIUM_COUNT, factor) }, () => makeDrifter(MEDIUM_RADIUS, MEDIUM_MAX_ALPHA, width, height, now));
      larges = Array.from({ length: reduceCount(LARGE_COUNT, factor) }, () => makeDrifter(LARGE_RADIUS, LARGE_MAX_ALPHA, width, height, now));
    };

    const stepDrifter = (drifter: Drifter, now: number) => {
      const elapsed = now - drifter.legStart;
      if (elapsed >= drifter.legDuration) {
        const next = newLeg({ radius: drifter.radius }, width, height, drifter.toX, drifter.toY, drifter.toScale, now);
        Object.assign(drifter, next);
        return stepDrifter(drifter, now);
      }
      const t = easeInOutCubic(elapsed / drifter.legDuration);
      const x = drifter.fromX + (drifter.toX - drifter.fromX) * t;
      const y = drifter.fromY + (drifter.toY - drifter.fromY) * t;
      const scale = drifter.fromScale + (drifter.toScale - drifter.fromScale) * t;
      const fadeIn = easeInOutCubic(Math.min(1, Math.max(0, (now - drifter.fadeInStart) / FADE_IN_DURATION_MS)));
      const alpha = fadeIn * drifter.restAlpha * drifter.maxAlpha;
      return { x, y, scale, alpha };
    };

    const drawRing = (drifter: Drifter, now: number, rgb: string) => {
      const { x, y, scale, alpha } = stepDrifter(drifter, now);
      if (alpha <= 0.002) return;
      context.beginPath();
      context.arc(x, y, drifter.radius * scale, 0, Math.PI * 2);
      context.strokeStyle = `rgba(${rgb}, ${alpha})`;
      context.lineWidth = 1;
      context.stroke();
    };

    const drawSprite = (drifter: Drifter, now: number, sprite: HTMLCanvasElement | null) => {
      if (!sprite) return;
      const { x, y, scale, alpha } = stepDrifter(drifter, now);
      if (alpha <= 0.002) return;
      const size = sprite.width * scale;
      context.globalAlpha = Math.min(1, alpha / drifter.maxAlpha);
      context.drawImage(sprite, x - size / 2, y - size / 2, size, size);
      context.globalAlpha = 1;
    };

    const drawLights = (now: number) => {
      LIGHTS.forEach((light, index) => {
        const sprite = lightSprites[index];
        if (!sprite) return;
        const period = (8 + index) * 1000 + index * 500; // 8-12s, staggered per light
        const phase = (now / period) * Math.PI * 2 + index;
        const breathe = 1 + 0.08 * Math.sin(phase);
        const driftX = light.offsetX + 12 * Math.sin(phase * 0.6);
        // Vertical drift halved and clamped to stay near the bottom edge -
        // the light's center anchors on `height` (viewport bottom), not the
        // midpoint, so the glow rises from below (#31).
        const driftY = 4 * Math.cos(phase * 0.5);
        const w = light.width * breathe;
        const h = light.height * breathe;
        context.drawImage(sprite, width / 2 + driftX - w / 2, height + driftY - h / 2, w, h);
      });
    };

    let animationId = 0;
    let paused = false;
    let accentPollCount = 0;
    const ringRgb = () => lightenRgbTriplet(accentRgb, PARTICLE_TINTS[0]);

    const drawStaticFrame = () => {
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";
      drawLights(0);
      const rgb = ringRgb();
      rings.forEach((ring) => {
        const alpha = 0.5 * ring.maxAlpha;
        context.beginPath();
        context.arc(ring.fromX, ring.fromY, ring.radius, 0, Math.PI * 2);
        context.strokeStyle = `rgba(${rgb}, ${alpha})`;
        context.stroke();
      });
      mediums.forEach((dot) => {
        const sprite = particleSprites[0];
        if (!sprite) return;
        context.globalAlpha = 0.5;
        context.drawImage(sprite, dot.fromX - sprite.width / 2, dot.fromY - sprite.height / 2);
        context.globalAlpha = 1;
      });
      larges.forEach((dot) => {
        const sprite = particleSprites[1];
        if (!sprite) return;
        context.globalAlpha = 0.5;
        context.drawImage(sprite, dot.fromX - sprite.width / 2, dot.fromY - sprite.height / 2);
        context.globalAlpha = 1;
      });
      context.globalCompositeOperation = "source-over";
    };

    const loop = (now: number) => {
      if (paused) {
        animationId = window.requestAnimationFrame(loop);
        return;
      }

      accentPollCount += 1;
      if (accentPollCount >= ACCENT_POLL_FRAMES) {
        accentPollCount = 0;
        const latest = readAccentRgb();
        if (latest !== accentRgb) {
          accentRgb = latest;
          rebuildSprites();
        }
      }

      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";

      drawLights(now);
      const rgb = ringRgb();
      rings.forEach((ring) => drawRing(ring, now, rgb));
      mediums.forEach((dot) => drawSprite(dot, now, particleSprites[0]));
      larges.forEach((dot) => drawSprite(dot, now, particleSprites[1]));

      context.globalCompositeOperation = "source-over";
      animationId = window.requestAnimationFrame(loop);
    };

    let resizeTimeout = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        sizeCanvas();
        populate(performance.now());
      }, 150);
    };

    const onVisibilityChange = () => {
      paused = document.hidden;
    };

    sizeCanvas();
    rebuildSprites();
    populate(performance.now());

    if (reducedMotion) {
      drawStaticFrame();
    } else {
      animationId = window.requestAnimationFrame(loop);
      window.addEventListener("resize", onResize);
      document.addEventListener("visibilitychange", onVisibilityChange);
    }

    return () => {
      window.cancelAnimationFrame(animationId);
      window.clearTimeout(resizeTimeout);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}
