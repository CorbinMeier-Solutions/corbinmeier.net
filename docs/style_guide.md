# Corbin Meier - Visual Style Guide

This document establishes the design language, color palette, typography, and
interactive aesthetics for corbinmeier.net, the personal business site for
Corbin Meier, a solo digital contractor building high-performance websites
and infrastructure for local businesses.

---

## 1. Aesthetic Concept: "The Steady Console"

A dark-navy terminal aesthetic built around the CyberCodeUIKit component
library (`src/components/cybercode/`), dialed down from neon-cyberpunk toward
something a client can trust: precise where it needs to be, warm where it
counts. The site should read like a senior engineer's own tooling - quiet,
controlled, dependable - not a hacker showcase.

*   **Atmosphere:** technical, warm, restrained, dependable, quietly confident.
*   **Core Metaphor:** a well-kept terminal window at night - dark, focused,
    one glowing accent color, no visual noise.
*   **Key Design Techniques:** flat dark panels with hairline borders, a
    single accent color used sparingly (never decoratively), glow reserved
    for hover/focus/interactive states only, one static CRT backdrop
    (faint scanlines + edge vignette) behind every page.

---

## 2. Color Palette

Dark-only. There is no light theme - a terminal aesthetic does not translate
to a light background, and maintaining two palettes would dilute the identity.

### Core Theme Colors

*   **Void Navy (`#0a0e17`):** primary canvas / page background. Deep
    navy-black, not pure black - keeps the "console" warmth instead of
    reading as OLED-crush.
*   **Panel Navy (`#0d1420`):** card / container background. Flat, no blur -
    visual richness is minimal per brand direction, so panels are
    distinguished by a slightly lighter fill and a hairline border, not glow
    or glass blur.
*   **Fog Gray (`#c9d1d9`):** primary body text. Light gray, not white -
    softens the terminal starkness to support the "warm & approachable"
    personality. Contrast vs. Void Navy: ~13.8:1 (AA/AAA pass).
*   **Slate Gray (`#8b96a5`):** muted / secondary text, labels, metadata.
    Contrast vs. Void Navy: ~6.4:1 (AA pass for normal text).
*   **Signal Blue (`#3b82f6`):** primary accent - links, active nav state,
    focus rings, button borders/glow, emphasis spans. This is the *only*
    color used for emphasis on the site; do not introduce secondary accents.
    Contrast vs. Void Navy: ~4.6:1 (AA pass for UI components/large text; use
    at 16px+ or semibold when carrying body-sized text).
*   **Alert Red (`#e5484d`):** error/danger state only (form validation,
    failed submissions). Used *rarely* - never decoratively, never as an
    accent, and **never at `font-weight: bold`**. Normal or medium weight
    only. Contrast vs. Void Navy: ~4.9:1 (AA pass).
*   **Hairline Navy (`#1e2836`):** borders, dividers, input outlines. Low
    contrast against both background tones - present but not loud.

```
┌─────────────────────────────────────────────────────────────┐
│  Void Navy (#0a0e17)    - Page background                   │
│  Panel Navy (#0d1420)   - Card / container background       │
│  Fog Gray (#c9d1d9)     - Body text                         │
│  Slate Gray (#8b96a5)   - Muted / secondary text            │
│  Signal Blue (#3b82f6)  - Accent: links, focus, glow         │
│  Alert Red (#e5484d)    - Error state only, never bold       │
│  Hairline Navy (#1e2836)- Borders, dividers                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Typography

Mono for structure and headings, sans for body copy - reads as precise
without going cold. Both are already loaded (no third webfont added); `DM
Serif Display` is retired.

*   **Display Headers:** `Geist Mono`, fallback `ui-monospace, SFMono-Regular,
    Menlo, monospace`.
    *   *Usage:* h1–h3, nav labels, eyebrow/kicker text, buttons, form
        labels, stat/tag chips.
    *   *Style:* 500–700 weight, tight tracking on large display sizes
        (`tracking-tighter` at hero scale), uppercase + wide tracking
        (`tracking-[0.2em]`) for eyebrows/labels only. Color: Fog Gray, with
        Signal Blue used for emphasized spans/fragments.
*   **Body Copy:** `Geist`, fallback `ui-sans-serif, system-ui, sans-serif`.
    *   *Usage:* paragraphs, descriptions, form field values, footer copy.
    *   *Style:* 400 weight, relaxed line-height (`leading-relaxed`), Fog
        Gray (`#c9d1d9`); Slate Gray for de-emphasized/secondary copy.

---

## 4. UI Components & Micro-Animations

Primitives come from `src/components/cybercode/CyberCodeUIKit.tsx`, retinted
to this palette (see Phase 4 of the implementation plan - the kit's
`ACCENT` map should read from these tokens, not its original hardcoded
green/cyan/purple values).

### Cards & Containers
*   Flat `#0d1420` fill, `1px solid #1e2836` border, `rounded-xl`. No
    backdrop blur, no gradient fill - richness stays in the accent color, not
    the surface.
*   `CyberCodeWindowChrome` / `CyberCodeTerminalWindow` header bars use the
    same border color at a faint `background: rgba(255,255,255,0.03)` tint,
    matching the kit's existing structure.

### Buttons & Interactive States
*   **Primary Action Buttons (`CyberCodeButton`):** transparent fill,
    `1px solid #3b82f6` border, `Geist Mono` label in Signal Blue. No glow at
    rest.
*   **Secondary / Link Buttons (`CyberCodeLinkButton`):** Slate Gray text,
    Hairline Navy border, transitions to Signal Blue text on hover.
*   **Hover States:** on hover/focus only - `text-shadow: 0 0 16px
    rgba(59,130,246,0.35)` (the kit's existing glow value, reused as-is since
    it already matches Signal Blue) and a subtle `-translate-y-0.5`. No glow
    at rest anywhere on the site - glow is earned by interaction, never
    ambient.
*   **Error state (`CyberCodeStatusPill`, form validation):** Alert Red text
    at normal weight, `1px solid rgba(229,72,77,0.35)` border,
    `rgba(229,72,77,0.08)` background tint. Never `font-bold`.

### Ambient / Background Effects
*   One effect only: `ConsoleBackdrop` (`src/components/ConsoleBackdrop.tsx`),
    mounted by `PageShell` on every page. It is two static CSS layers:
    `.crt-scanlines` (a 1px line every 3px in the page accent at 5% opacity)
    and `.crt-vignette` (a black radial shadow toward the edges). No motion,
    no blur.
*   Never the 2023+ "AI landing page" tells: blurred glow blobs, square line
    grids, dot grids, mesh gradients, or a cursor-following spotlight.
*   No particle field, no custom cursor, no floating code snippets - these
    are explicitly out of scope to keep the site feeling controlled rather
    than busy.
*   `CyberCodeGlitchHeading` is reserved for the homepage `<h1>` only. Every
    other page heading uses the plain `Geist Mono` display style above - no
    glitch animation elsewhere on the site.
