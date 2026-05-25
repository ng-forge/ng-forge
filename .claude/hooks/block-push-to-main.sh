#!/usr/bin/env bash
# Block direct `git push` to main. Encoded as a hook rather than only a CLAUDE.md
# rule because the cost of an unwanted push to main is high.
#
# To override (e.g. for hotfixes the user has approved), invoke git directly
# yourself rather than via Claude, or temporarily disable this hook.
set -uo pipefail

input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // ""' 2>/dev/null || true)

# Only fire when the command actually invokes `git push` at a command position
# (start of line or after a shell separator). This avoids false positives when
# "git push" or "main" appear inside argument strings (heredocs, PR bodies, etc).
if ! printf '%s' "$cmd" | grep -qE '(^|[;&|][[:space:]]*)git[[:space:]]+push\b'; then
  exit 0
fi

# Case 1: explicit `main` destination in the push command (e.g. `git push origin main`,
# `git push origin HEAD:main`, `git push --force origin +main`).
if printf '%s' "$cmd" | grep -qE 'git[[:space:]]+push[^;&|]*\b(\+|[^[:space:]]+:)?main([[:space:]]|$|[;&|])'; then
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
