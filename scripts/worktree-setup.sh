#!/usr/bin/env bash
# worktree-setup.sh - make a fresh git worktree ready for scripts/check.sh: install dependencies by lockfile, then a baseline check.
# Usage:   scripts/worktree-setup.sh [<worktree>]   (default: the checkout containing the cwd; any cwd works)
# Success: the baseline scripts/check.sh passes; last line "WORKTREE-SETUP PASS". On failure: "WORKTREE-SETUP FAIL: <why>", exit 1.
# Installs: package-lock.json -> npm ci; pnpm-lock.yaml -> pnpm install --frozen-lockfile; yarn.lock -> yarn install --frozen-lockfile.
set -euo pipefail

fail() { echo "WORKTREE-SETUP FAIL: $*"; exit 1; }

target="${1:-${PROJECT_ROOT:-$PWD}}"
[ -d "$target" ] || fail "no such folder: $target"
root="$(git -C "$target" rev-parse --show-toplevel 2>/dev/null)" || fail "$target is not in a git repo"
cd "$root"
[ -f package.json ] || fail "no package.json in $root"
[ -x scripts/check.sh ] || fail "no executable scripts/check.sh in $root"

start=$SECONDS
if [ -f package-lock.json ]; then
  echo "== install: npm ci"
  npm ci --no-audit --no-fund >/dev/null 2>&1 || { npm ci --no-audit --no-fund 2>&1 | tail -30; fail "npm ci"; }
elif [ -f pnpm-lock.yaml ]; then
  echo "== install: pnpm install --frozen-lockfile"
  pnpm install --frozen-lockfile >/dev/null 2>&1 || { pnpm install --frozen-lockfile 2>&1 | tail -30; fail "pnpm install"; }
elif [ -f yarn.lock ]; then
  echo "== install: yarn install --frozen-lockfile"
  yarn install --frozen-lockfile >/dev/null 2>&1 || fail "yarn install"
else
  fail "no lockfile (package-lock.json, pnpm-lock.yaml or yarn.lock) in $root"
fi

echo "== baseline: scripts/check.sh"
scripts/check.sh || fail "baseline check (the tree fails before any change)"
echo "WORKTREE-SETUP PASS ($((SECONDS - start))s)"
