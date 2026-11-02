# Scripts

| Script | What it does | Run | Success prints |
|---|---|---|---|
| `check.sh` | Lint, typecheck, test, build; stops at the first failure; records `.check-result`; an unchanged passing tree prints `CHECK PASS (cached)` (`CHECK_NO_CACHE=1` forces a run). `--fast`: lint, types and tests related to changed files, no build. `--quick`: lint and types only | `scripts/check.sh [--fast\|--quick]` | `CHECK PASS` (`(fast)`, `(quick)`) |
| `check-result.sh` | Sourced by `check.sh`: writes `.check-result` for the hub handback | - | - |
| `worktree-setup.sh` | Installs dependencies by lockfile in a fresh worktree, then runs the baseline check | `scripts/worktree-setup.sh [<worktree>]` | `WORKTREE-SETUP PASS` |
| `check-faq-sources.mjs` | Verifies every citation link in `src/data/faqs.json` resolves and flags hosts outside source tiers 1-2 | `npm run check:sources` | a clean report, exit 0 |
| `check-turnstile-key.mjs` | Fails the production Pages build (main) when `src/data/turnstile.ts` has no real `0x` site key; warns elsewhere | runs first in `npm run build` | silent with a real key |
| `sync-project-images.mjs` | Syncs project images before `dev` and `build` (runs as `predev`/`prebuild`) | automatic | no output on success |
| `one-off/` | Single-use scripts, named `YYYY-MM-DD-<slug>.sh`, kept as the record | - | - |
