#!/usr/bin/env bash
# Purpose: the project's single verification gate: lint -> typecheck -> test -> build.
# Usage:   scripts/check.sh   (from any cwd)
# Success: last line prints "CHECK PASS"; exits non-zero at the first failing stage.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

fail() { echo "CHECK FAIL: $1"; exit 1; }

echo "== lint";      npm run --silent lint  || fail lint
echo "== typecheck"; npm run --silent check || fail typecheck
echo "== test";      npm run --silent test  || fail test
echo "== build";     npm run --silent build || fail build

echo "CHECK PASS"
