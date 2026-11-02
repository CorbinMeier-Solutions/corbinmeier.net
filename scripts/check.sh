#!/usr/bin/env bash
# check.sh - the green chain: lint -> typecheck -> test -> build (house rules §6).
# Usage:   scripts/check.sh [--fast|--quick]     (from any directory)
# Success: each stage prints PASS and the last line is "CHECK PASS" ("CHECK PASS (fast)" with --fast).
# --fast:  lint, typecheck, and only the tests related to files changed vs the base branch (CHECK_BASE, else
#          dev, main, master); no build. Records mode=fast, never reads or writes the full-check cache.
# --quick: lint and typecheck only; last line "CHECK PASS (quick)". Records mode=quick, never touches the full cache.
# Stops at the first failing stage, prints the tail of its log, exits 1.
# Records EVERY outcome (pass, fail, interrupt) in .check-result (gitignored; scripts/check-result.sh) for `hub handback submit`.
# Cached: a tree identical to the last passing run prints "CHECK PASS (cached)", exits 0 and reruns nothing
# (CHECK_NO_CACHE=1 forces a full run). Failures are never cached.
set -euo pipefail

ROOT="${PROJECT_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
cd "$ROOT"

CHECK_MODE=full
case "${1:-}" in
  "") ;;
  --fast) CHECK_MODE=fast ;;
  --quick) CHECK_MODE=quick ;;
  *) echo "usage: scripts/check.sh [--fast|--quick]"; exit 2 ;;
esac
export CHECK_MODE

# shellcheck source=check-result.sh
source scripts/check-result.sh
if [ "$CHECK_MODE" = full ] && [ -z "${CHECK_NO_CACHE:-}" ] && [ -f .check-result ]; then
  prev_tree="$(sed -n 's/^tree=//p' .check-result)"
  prev_result="$(sed -n 's/^result=//p' .check-result)"
  [ "$(sed -n 's/^mode=//p' .check-result)" = fast ] && prev_result="" # a fast pass never stands in for a full one
  if [ "$prev_result" = "CHECK PASS" ] && [ -n "$prev_tree" ] && [ "$prev_tree" = "$(check_result_tree "$ROOT")" ]; then
    check_result_write "$ROOT" "CHECK PASS" # same files, so the record follows the current commit
    echo "CHECK PASS (cached)"
    exit 0
  fi
fi
check_result_clear "$ROOT"
STAGE="start"
trap '[ -f "$ROOT/.check-result" ] || check_result_write "$ROOT" "CHECK FAIL: interrupted" "$STAGE"' EXIT

LOG_DIR="${TMPDIR:-/tmp}/check-$(basename "$ROOT")"
mkdir -p "$LOG_DIR"

fail() { echo "CHECK FAIL: $*"; check_result_write "$ROOT" "CHECK FAIL: $*" "$STAGE"; exit 1; }

[ -f package.json ] || fail "no package.json in $ROOT"
command -v jq >/dev/null || fail "jq is required"

has_script() { jq -e --arg s "$1" '.scripts[$s] // empty' package.json >/dev/null; }

run_stage() {
  local label=$1 script=$2 log="$LOG_DIR/$1.log" start=$SECONDS
  STAGE=$label
  if ! has_script "$script"; then
    printf '%-10s MISSING  no "%s" script in package.json - create it (house rules §6)\n' "$label" "$script"
    fail "$label"
  fi
  if CI=1 npm run --silent "$script" >"$log" 2>&1; then
    printf '%-10s PASS     %ss\n' "$label" "$((SECONDS - start))"
  else
    printf '%-10s FAIL     %ss  (full log: %s)\n' "$label" "$((SECONDS - start))" "$log"
    tail -n 30 "$log" | sed 's/^/    /'
    fail "$label"
  fi
}

# Changed files vs the base branch (committed, uncommitted and untracked), for --fast.
changed_files() {
  local base="${CHECK_BASE:-}" b
  if [ -z "$base" ]; then
    for b in dev main master; do git rev-parse -q --verify "$b" >/dev/null 2>&1 && { base=$b; break; }; done
  fi
  [ -n "$base" ] || fail "fast: no base branch (set CHECK_BASE)"
  { git diff --name-only "$(git merge-base "$base" HEAD)"; git ls-files -o --exclude-standard; } | sort -u
}

# Tests related to the changed files; a runner without a related mode runs the whole suite.
run_related_tests() {
  local files log="$LOG_DIR/test.log" start=$SECONDS bin=node_modules/.bin
  STAGE=test
  has_script test || { printf '%-10s MISSING  no "test" script in package.json\n' test; fail test; }
  mapfile -t files < <(changed_files | grep -E '\.(m|c)?[jt]sx?$' || true)
  if [ "${#files[@]}" -eq 0 ]; then printf '%-10s PASS     no changed source files\n' test; return; fi
  local cmd=(npm run --silent test)
  if [ -x "$bin/vitest" ]; then cmd=("$bin/vitest" related --run "${files[@]}")
  elif [ -x "$bin/jest" ]; then cmd=("$bin/jest" --findRelatedTests "${files[@]}" --passWithNoTests); fi
  if CI=1 "${cmd[@]}" >"$log" 2>&1; then
    printf '%-10s PASS     %ss  (%s changed files)\n' test "$((SECONDS - start))" "${#files[@]}"
  else
    printf '%-10s FAIL     %ss  (full log: %s)\n' test "$((SECONDS - start))" "$log"
    tail -n 30 "$log" | sed 's/^/    /'
    fail test
  fi
}

run_stage lint lint
run_stage typecheck check
if [ "$CHECK_MODE" = quick ]; then
  check_result_write "$ROOT" "CHECK PASS"
  echo "CHECK PASS (quick)"
  exit 0
fi
if [ "$CHECK_MODE" = fast ]; then
  run_related_tests
  check_result_write "$ROOT" "CHECK PASS"
  echo "CHECK PASS (fast)"
  exit 0
fi
run_stage test test
run_stage build build
check_result_write "$ROOT" "CHECK PASS"
echo "CHECK PASS"
