# Scripts

| Script | What it does | Run | Success prints |
|---|---|---|---|
| `check.sh` | Lint, typecheck, test, build; stops at the first failure | `scripts/check.sh` | `CHECK PASS` |
| `check-faq-sources.mjs` | Verifies every citation link in `src/data/faqs.json` resolves and flags hosts outside source tiers 1-2 | `npm run check:sources` | a clean report, exit 0 |
| `sync-project-images.mjs` | Syncs project images before `dev` and `build` (runs as `predev`/`prebuild`) | automatic | no output on success |
| `one-off/` | Single-use scripts, named `YYYY-MM-DD-<slug>.sh`, kept as the record | - | - |
