#!/usr/bin/env bash
# worktree-setup.sh - make a fresh git worktree ready for scripts/check.sh: dependencies only, no check (dec-892).
# Usage:   scripts/worktree-setup.sh [<worktree>]   (default: the checkout containing the cwd; any cwd works)
# Success: last line "WORKTREE-SETUP PASS (<n>s)". On failure: "WORKTREE-SETUP FAIL: <why>", exit 1.
# Installs: when the main checkout has node_modules and the same lockfile, hard-links it (cp -al, seconds);
#           else package-lock.json -> npm ci; pnpm-lock.yaml -> pnpm install --frozen-lockfile; yarn.lock -> yarn --frozen-lockfile.
#           Tool caches inside node_modules (.vite, .cache) are reset so a worktree never writes through a hard link.
set -euo pipefail

fail() { echo "WORKTREE-SETUP FAIL: $*"; exit 1; }
step() { echo "== $* ($((SECONDS - start))s)" >&2; }

target="${1:-${PROJECT_ROOT:-$PWD}}"
[ -d "$target" ] || fail "no such folder: $target"
root="$(git -C "$target" rev-parse --show-toplevel 2>/dev/null)" || fail "$target is not in a git repo"
cd "$root"
[ -f package.json ] || fail "no package.json in $root"
start=$SECONDS

lockfile=""
for f in package-lock.json pnpm-lock.yaml yarn.lock; do [ -f "$f" ] && { lockfile="$f"; break; }; done
[ -n "$lockfile" ] || fail "no lockfile (package-lock.json, pnpm-lock.yaml or yarn.lock) in $root"

main="$(cd "$(git rev-parse --path-format=absolute --git-common-dir)/.." && pwd)"

link_from_main() {
  [ "$main" != "$root" ] && [ -d "$main/node_modules" ] && [ ! -e node_modules ] \
    && cmp -s "$main/$lockfile" "$lockfile" || return 1
  step "link node_modules from $main"
  cp -al "$main/node_modules" node_modules 2>/dev/null || { rm -rf node_modules; return 1; }
  rm -rf node_modules/.vite node_modules/.cache
}

install_lockfile() {
  step "install: $lockfile"
  case "$lockfile" in
    package-lock.json) npm ci --no-audit --no-fund >/dev/null 2>&1 || { npm ci --no-audit --no-fund 2>&1 | tail -30; fail "npm ci"; } ;;
    pnpm-lock.yaml) pnpm install --frozen-lockfile >/dev/null 2>&1 || { pnpm install --frozen-lockfile 2>&1 | tail -30; fail "pnpm install"; } ;;
    yarn.lock) yarn install --frozen-lockfile >/dev/null 2>&1 || fail "yarn install" ;;
  esac
}

if [ -d node_modules ] && { [ "$main" = "$root" ] || cmp -s "$main/$lockfile" "$lockfile"; }; then
  step "node_modules present for this lockfile"
elif ! link_from_main; then
  install_lockfile
fi
echo "WORKTREE-SETUP PASS ($((SECONDS - start))s)"
