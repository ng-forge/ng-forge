#!/usr/bin/env bash
# Block direct `git push` to main. Encoded as a hook rather than only a CLAUDE.md
# rule because the cost of an unwanted push to main is high.
#
# To override (e.g. for hotfixes the user has approved), invoke git directly
# yourself rather than via Claude, or temporarily disable this hook.
set -uo pipefail

# Fail-closed if jq is missing. Without it the tool_input is unparseable and a
# silent pass would give a false sense of safety.
if ! command -v jq >/dev/null 2>&1; then
  echo "BLOCKED: push-to-main hook requires jq. Install jq or remove this hook from .claude/settings.json." >&2
  exit 2
fi

input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // ""')

# Only fire when the command actually invokes `git push` at a command position
# (start of line or after a shell separator). Prevents false positives when
# "git push" appears inside argument strings (heredocs, PR bodies, etc).
if ! printf '%s' "$cmd" | grep -qE '(^|[;&|][[:space:]]*)git[[:space:]]+push\b'; then
  exit 0
fi

# Strip trailing inline shell comments. Best-effort: does not parse quote context,
# so `git push origin "topic#1"` would be truncated. Rare enough to accept.
cmd=$(printf '%s' "$cmd" | sed -E 's/[[:space:]]+#.*$//')

# Case 1: explicit `main` as a refspec destination. The prefix must be
# whitespace, `:`, or `+` so we do not match slashed/hyphenated/dotted branch
# names (`release/main`, `feature-main`, `topic.main`, `user/main`).
if printf '%s' "$cmd" | grep -qE 'git[[:space:]]+push[^;&|]*([[:space:]]|:)\+?main([[:space:]]|$|[;&|])'; then
  echo "BLOCKED: direct push to main. Create a feature branch (or worktree) first." >&2
  exit 2
fi

# Case 2: bare `git push` (only flags, no refspec) while on main branch.
if printf '%s' "$cmd" | grep -qE '(^|[;&|][[:space:]]*)git[[:space:]]+push([[:space:]]+-[^[:space:]]+)*([[:space:]]*$|[[:space:]]*[;&|])'; then
  branch=$(git branch --show-current 2>/dev/null || echo "")
  if [ "$branch" = "main" ]; then
    echo "BLOCKED: bare 'git push' from main branch. Create a feature branch (or worktree) first." >&2
    exit 2
  fi
fi

exit 0
