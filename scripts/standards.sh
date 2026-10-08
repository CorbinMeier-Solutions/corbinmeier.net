#!/usr/bin/env bash
# standards.sh - compare the hub check stamps (fallback .corbin/checks.md) with the local standards and report drift.
# Usage:   scripts/standards.sh                          report stale keys
#          scripts/standards.sh --set <key> EXEMPT|PINNED   silence a key on purpose
# Success: last line `STANDARDS PASS`. Drift: one `<KEY>: <CURRENT> -> <UPDATED>` line
#          per stale key, then `STANDARDS FAIL: <n> out of date` (exit 1).
# Local only: the runner lives in the developer's home directory, so this script is
# never part of a build or CI (Cloudflare cannot run it). Without the runner it
# prints SKIP and exits 0. Never call it from package.json or scripts/check.sh.
set -euo pipefail

root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
runner="$HOME/.claude/standards/standards.sh"

[ -x "$runner" ] || { echo "STANDARDS SKIP: runner not found (local-only check)"; exit 0; }
exec "$runner" "$root" --stamps "$@"
