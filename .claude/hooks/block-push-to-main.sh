#!/usr/bin/env bash
# Block direct `git push` to main. Encoded as a hook rather than only a CLAUDE.md
# rule because the cost of an unwanted push to main is high.
#
# To override (e.g. for hotfixes the user has approved), invoke git directly
# yourself rather than via Claude, or temporarily disable this hook.
set -uo pipefail

input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // ""' 2>/dev/null || true)

case "$cmd" in
  *"git push"*)
    branch=$(git branch --show-current 2>/dev/null || echo "")
    if [ "$branch" = "main" ] \
       || printf '%s' "$cmd" | grep -qE '(^|[[:space:]])(\+|[^[:space:]]+:)?main([[:space:]]|$)'; then
      echo "BLOCKED: direct push to main. Create a feature branch (or worktree) first." >&2
      exit 2
    fi
    ;;
esac
exit 0
