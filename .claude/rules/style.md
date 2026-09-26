---
description: "Visual design language for corbinmeier.net: color palette, typography, UI components, spacing scale, shared components, and the text-reveal motion rule. Consult before any UI/styling work."
paths:
  - "src/**/*.tsx"
  - "src/globals.css"
---

# Visual Style Guide

Dark-navy terminal aesthetic ("The Steady Console") built on `CyberCodeUIKit`
(`src/components/cybercode/`). Quiet, controlled, dependable - not a hacker
showcase. Dark-only; no light theme.

## Color Palette

- **Void Navy** `#0a0e17` - page background
- **Panel Navy** `#0d1420` - card/container background, `1px solid #1e2836`
  border, `rounded-xl`; no blur, no gradient fill
- **Fog Gray** `#c9d1d9` - primary body text (contrast vs Void Navy ~13.8:1)
- **Slate Gray** `#8b96a5` - muted/secondary text, labels, metadata (~6.4:1)
- **Signal Blue** `#3b82f6` - the only accent: links, active nav state, focus
  rings, button borders/glow, emphasis spans (~4.6:1; use at 16px+ or
  semibold for body-sized text)
- **Alert Red** `#e5484d` - error/danger state only, normal/medium weight,
  never `font-bold` (~4.9:1)
- **Hairline Navy** `#1e2836` - borders, dividers, input outlines

## Typography

- **Display** (`h1`-`h3`, nav labels, eyebrow/kicker, buttons, form labels,
  stat/tag chips): `Geist Mono`, fallback `ui-monospace, SFMono-Regular,
  Menlo, monospace`. 500-700 weight, tight tracking at hero scale
  (`tracking-tighter`), uppercase + `tracking-[0.2em]` for eyebrows/labels
  only. Fog Gray, Signal Blue for emphasized spans.
- **Body** (paragraphs, descriptions, form values, footer copy): `Geist`,
  fallback `ui-sans-serif, system-ui, sans-serif`. 400 weight,
  `leading-relaxed`, Fog Gray; Slate Gray for de-emphasized copy.

## UI Components & Micro-Animations

Primitives: `src/components/cybercode/CyberCodeUIKit.tsx`, retinted to this
palette (`ACCENT` map reads from these tokens).

- **Cards:** flat `#0d1420` fill, `1px solid #1e2836`, `rounded-xl`. No
  backdrop blur, no gradient fill.
- **`CyberCodeButton` (primary):** transparent fill, `1px solid #3b82f6`
  border, `Geist Mono` label in Signal Blue. No glow at rest.
- **`CyberCodeLinkButton` (secondary):** Slate Gray text, Hairline Navy
  border, transitions to Signal Blue text on hover.
- **Hover/focus only:** `text-shadow: 0 0 16px rgba(59,130,246,0.35)` plus
  `-translate-y-0.5`. No glow at rest anywhere on the site.
- **Error state** (`CyberCodeStatusPill`, form validation): Alert Red text at
  normal weight, `1px solid rgba(229,72,77,0.35)` border,
  `rgba(229,72,77,0.08)` background tint. Never `font-bold`.
- **Ambient background:** one effect only, `ConsoleBackdrop`
  (`src/components/ConsoleBackdrop.tsx`), mounted by `PageShell` on every
  page - `.crt-scanlines` + `.crt-vignette`, static, no motion, no blur.
  Never blurred glow blobs, line/dot grids, mesh gradients, a
  cursor-following spotlight, a particle field, a custom cursor, or floating
  code snippets.
- **`CyberCodeGlitchHeading`:** homepage `<h1>` only. Every other page
  heading uses the plain `Geist Mono` display style - no glitch animation
  elsewhere.

## Spacing Scale

`@layer components` classes in `src/globals.css` - extend this list before an
ad hoc margin/padding/gap value:

- **Section padding** (`.section-container`): `px-6 sm:px-10 py-10 sm:py-16`
- **Page top clearance** (`PageShell`): `pt-16 lg:pt-6 pb-10`
- **Header-to-content gap** (`.page-header-gap`): `mb-16` - below a page's own
  `<header>` (eyebrow + h1 + lead)
- **Section-to-section gap** (`.section-gap`): `mb-16` - between sections
- **Card/grid gap** (`.card-grid-gap`): `gap-6`

## Shared Components

- **`PageSection`** (`src/components/PageSection.tsx`): eyebrow, heading,
  lead, then children, on the spacing scale above. `headingLevel={1}` renders
  a page's own `<h1>` header (`.page-header-gap` below it); `headingLevel={2}`
  (default) renders a section further down the page (`.section-gap` below
  it). Every page adopts this over hand-rolled header/section markup.
- **`DataTable`** (`src/components/DataTable.tsx`): shared table for tabular
  content. Hairline Navy borders, Panel Navy header row, `Geist Mono`
  uppercase labels (`tracking-[0.2em]`, Slate Gray), `Geist` body copy in Fog
  Gray. Below 640px each row collapses into a stacked label/value card -
  never a horizontal scroll.

## Text Reveal (Motion Rule)

The typing/reveal effect (`Typewriter`, `src/components/cybercode/
Typewriter.tsx`) runs **only** on a page's own `h1`, its eyebrow, and its
lead description/flavor text - i.e. only inside a `PageSection` with
`headingLevel={1}` and `reveal`. Body copy, cards, lists, tables, and any
heading further down the page render static; wrapping them in `Typewriter`
is a defect. It checks `prefers-reduced-motion` itself and renders the full
text immediately, with no cursor, when reduced motion is requested;
`App.tsx` wraps the site in `<MotionConfig reducedMotion="user">` so every
other framer-motion animation respects the same setting.
