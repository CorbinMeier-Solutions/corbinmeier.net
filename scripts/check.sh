#!/usr/bin/env bash
# Purpose: the project's single verification gate: lint -> typecheck -> test -> build.
# Usage:   scripts/check.sh   (from any cwd)
# Success: last line prints "CHECK PASS"; exits non-zero at the first failing stage.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
root="$PWD"

# Records the outcome in .check-result (gitignored) for `hub handback submit` to attach.
# shellcheck source=check-result.sh
source scripts/check-result.sh
check_result_clear "$root"
stage="start"
trap '[ -f "$root/.check-result" ] || check_result_write "$root" "CHECK FAIL: interrupted" "$stage"' EXIT

fail() { echo "CHECK FAIL: $1"; check_result_write "$root" "CHECK FAIL: $1" "$1"; exit 1; }

stage=lint;      echo "== lint";      npm run --silent lint  || fail lint
stage=typecheck; echo "== typecheck"; npm run --silent check || fail typecheck
stage=test;      echo "== test";      npm run --silent test  || fail test
stage=build;     echo "== build";     npm run --silent build || fail build

check_result_write "$root" "CHECK PASS"
echo "CHECK PASS"
