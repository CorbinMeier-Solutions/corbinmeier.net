#!/usr/bin/env bash
# Purpose: the recorded result of a check.sh run, so a handback carries evidence instead of a claim.
# Usage:   source scripts/check-result.sh; check_result_clear <dir>; check_result_write <dir> <last line> [stage]
# Success: <dir>/.check-result holds key=value lines: commit, tree (git tree id of the checked files, tracked and untracked, ignored excluded), dirty (1 when they differ from the commit), at
#          (epoch seconds), result (the run's last line), stage (failing stage, empty on pass). Gitignored.

check_result_clear() { rm -f "$1/.check-result"; }

# Tree id of the working files (a throwaway index, so the real one is untouched): what the check actually saw.
check_result_tree() {
  local idx
  idx="$(mktemp "${TMPDIR:-/tmp}/hub-check-index.XXXXXX")"
  rm -f "$idx"
  (cd "$1" && GIT_INDEX_FILE="$idx" git add -A . >/dev/null 2>&1 && GIT_INDEX_FILE="$idx" git write-tree 2>/dev/null) || true
  rm -f "$idx"
}

check_result_write() {
  local dir="$1" result="$2" stage="${3:-}" commit tree dirty=0
  commit="$(git -C "$dir" rev-parse HEAD 2>/dev/null || echo unknown)"
  tree="$(check_result_tree "$dir")"
  [ "$tree" != "$(git -C "$dir" rev-parse 'HEAD^{tree}' 2>/dev/null)" ] && dirty=1
  printf 'commit=%s\ntree=%s\ndirty=%s\nat=%s\nresult=%s\nstage=%s\n' "$commit" "$tree" "$dirty" "$(date +%s)" "$result" "$stage" >"$dir/.check-result"
}
