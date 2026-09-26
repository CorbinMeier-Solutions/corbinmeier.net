# CorbinMeier.net

Business site for Corbin Meier: one-time website builds for local businesses,
plus monthly management of the DNS records that keep their email arriving and
their site online.

## Architecture

- **React 19 + Vite**, routing with React Router, pages in `src/pages/` and
  routes declared in `src/App.tsx`.
- **Cloudflare Pages** hosts the static build; Pages Functions in `functions/`
  handle the contact form (`functions/api/send.ts`: Turnstile check, then email).
- **JSON/TS content** in `src/data/`: copy, projects, pricing, FAQ. No database.
- No monthly infrastructure cost on the Cloudflare free tier.

## Development

```bash
npm install
npm run dev          # local dev server
scripts/check.sh     # lint, typecheck, test, build - must end CHECK PASS
```

Local secrets go in `.dev.vars` (gitignored); the keys are listed in
`.dev.vars.example`. Script index: `scripts/README.md`.

## Deployment (Cloudflare Pages)

- Build command: `npm run build`
- Output directory: `dist`
- Compatibility flag: `nodejs_compat` (required by the email library in Functions)
- Secrets (production and preview): `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`,
  `PERSONAL_EMAIL`, via `npx wrangler pages secret put <KEY>`

## Content notes

- Project entries (`src/data/projects.json`) take an optional `links` array of
  `{ label, url }`, shown in the project modal.
- The homepage "Selected Works" shows three chosen projects, picked in
  `src/components/FeaturedProjects.tsx`.
- Project `date`/`year` match the first commit of each project's repository.

## Design

Visual rules: `docs/style_guide.md` ("The Steady Console").
