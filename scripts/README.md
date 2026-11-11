# Scripts

| Script | What it does | Run | Success prints |
|---|---|---|---|
| `check.sh` | Lint, typecheck, test, build; stops at the first failure; records `.check-result`; an unchanged passing tree prints `CHECK PASS (cached)` (`CHECK_NO_CACHE=1` forces a run). `--fast`: lint, types and tests related to changed files, no build. `--quick`: lint and types only | `scripts/check.sh [--fast\|--quick]` | `CHECK PASS` (`(fast)`, `(quick)`) |
| `check-result.sh` | Sourced by `check.sh`: writes `.check-result` for the hub handback | - | - |
| `worktree-setup.sh` | Installs dependencies by lockfile in a fresh worktree, then runs the baseline check | `scripts/worktree-setup.sh [<worktree>]` | `WORKTREE-SETUP PASS` |
| `check-faq-sources.mjs` | Verifies every citation link in `src/data/faqs.json` resolves and flags hosts outside source tiers 1-2 | `npm run check:sources` | a clean report, exit 0 |
| `check-turnstile-key.mjs` | Fails the production Pages build (main) when `src/data/turnstile.ts` has no real `0x` site key; warns elsewhere | runs first in `npm run build` | silent with a real key |
| `finish-build.sh` | Post-build step: `404/index.html` to `404.html`, flattens `<route>/index.html` to `<route>.html`, generates `sitemap.xml` from each page's canonical with `<lastmod>` from git (omitted, with a log line, when history is shallow) (and `robots.txt` when `public/robots.txt` is absent) | runs inside `npm run build` | `FINISH PASS` |
| `build-llms.mjs` | Post-build step: writes `llms.txt` and a Markdown version of each indexable page from the prerendered HTML, appends per-page `Link` headers, fails the build on an invalid `llms.txt` | runs inside `npm run build`, after `finish-build.sh` | `LLMS PASS (<n> pages)` |
| `verify-build.mjs` | Post-build step: asserts on `build/client`: every sitemap URL is linked by a plain `<a href>` from another page; indexable pages carry exactly one canonical and noindex pages none; the Search Console verification file is intact | runs inside `npm run build`, after `build-llms.mjs` | `VERIFY PASS (<n> pages)` |
| `site-url.mjs` | Build guard: prints the production `SITE_URL` origin from `wrangler.toml` `[vars]`, fails on a missing or invalid value | `node scripts/site-url.mjs` | the origin, exit 0 |
| `sync-project-images.mjs` | Syncs project images before `dev` and `build` (runs as `predev`/`prebuild`) | automatic | no output on success |
| `one-off/` | Single-use scripts, named `YYYY-MM-DD-<slug>.sh`, kept as the record | - | - |
