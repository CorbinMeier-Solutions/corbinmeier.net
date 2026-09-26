# History

Superseded decisions and incidents. Live decisions are in `CLAUDE.md` (local-only).

## 2026-09-26

- **Site background**: blurred accent glow blobs + 40px square grid (global,
  `BackgroundMotion.tsx`) replaced by a static CRT backdrop (#19). The July style
  guide had specified matrix rain in the homepage hero instead; that never shipped.
  The blobs had already been disabled on touch devices (2026-08-16) because
  scroll-animated blur layers blanked the page on iOS Safari.
- **Positioning**: the site leaned toward SaaS; it now sells a one-time website
  build plus monthly DNS/email/website management (Scope approved 2026-09-26).
- **Pricing naming**: "a la carte" menu grouped by technology replaced by
  Packages + Add-ons grouped by category then level (#23).
- **CLAUDE.md** was committed until 2026-09-26; it is now local-only because the
  repo is public (#21).
- **Loose docs folded into README** (#24): `GEMINI.md` (architecture notes),
  `CLOUDFLARE.md` (deploy settings), `todo.md` (carried to #25).
- **Style guide moved** from `docs/style_guide.md` to the path-scoped
  `.claude/rules/style.md` (#27), trimmed to the 100-line topic-rule budget.
  Rationale for the standing rules, kept for reference (the rules themselves
  did not change):
  - **Aesthetic concept** ("The Steady Console"): dialed down from
    neon-cyberpunk toward something a client can trust - reads like a senior
    engineer's own tooling, not a hacker showcase. Key techniques: flat dark
    panels with hairline borders, one accent color used sparingly (never
    decoratively), glow reserved for hover/focus/interactive states only, one
    static CRT backdrop behind every page.
  - **Void Navy over pure black**: keeps the "console" warmth instead of
    reading as OLED-crush.
  - **Fog Gray over white** for body text: softens the terminal starkness to
    support the "warm & approachable" personality.
  - **Signal Blue is the only accent** used for emphasis on the site -
    deliberately no secondary accent color, to keep emphasis legible and
    singular.
  - **Panel Navy has no blur/gradient**: visual richness is minimal per brand
    direction, so panels are distinguished by fill + hairline border, not
    glow or glass blur.
  - **Mono for structure, sans for body**: reads as precise without going
    cold. `DM Serif Display` was retired from the palette; both current
    fonts were already loaded, so no third webfont was added.
  - **Ambient background stays a single static effect**: explicitly ruled out
    the 2023+ "AI landing page" tells (blurred glow blobs, square/dot grids,
    mesh gradients, cursor-following spotlight, particle fields, custom
    cursors, floating code snippets) to keep the site feeling controlled
    rather than busy.
  - Palette reference (unchanged from the original guide):
    ```
    Void Navy (#0a0e17)     - Page background
    Panel Navy (#0d1420)    - Card / container background
    Fog Gray (#c9d1d9)      - Body text
    Slate Gray (#8b96a5)    - Muted / secondary text
    Signal Blue (#3b82f6)   - Accent: links, focus, glow
    Alert Red (#e5484d)     - Error state only, never bold
    Hairline Navy (#1e2836) - Borders, dividers
    ```
