#!/usr/bin/env bash
# Block writes to .env files: Edit/Write by path, and Bash by redirect, tee,
# in-place sed/perl or a cp/mv destination. Claude Code passes the tool call as
# JSON on stdin; exit 2 blocks the call and shows stderr to Claude.
set -uo pipefail

if ! command -v jq >/dev/null 2>&1; then
  echo "BLOCKED: .env guard hook requires jq. Install jq or remove this hook from .claude/settings.json." >&2
  exit 2
fi

input=$(cat)

if [ "$(printf '%s' "$input" | jq -r '.tool_name // ""')" = "Bash" ]; then
  cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // ""')
  q="['\"]?"
  env="${q}[^[:space:];&|<>'\"]*\.env[^[:space:];&|<>'\"]*${q}"
  end='([[:space:]]|$|[;&|])'
  if printf '%s' "$cmd" | grep -qE ">>?[[:space:]]*${env}${end}" ||
    printf '%s' "$cmd" | grep -qE "(^|[;&|][[:space:]]*)tee([[:space:]]+[^;&|]*)?[[:space:]]${env}${end}" ||
    printf '%s' "$cmd" | grep -qE "(^|[;&|][[:space:]]*)(sed|perl)[[:space:]][^;&|]*-i[^;&|]*[[:space:]]${env}${end}" ||
    printf '%s' "$cmd" | grep -qE "(^|[;&|][[:space:]]*)(cp|mv|install)[[:space:]][^;&|]*[[:space:]]${env}[[:space:]]*($|[;&|])"; then
    echo "Blocked: Cannot write .env files" >&2
    exit 2
  fi
  exit 0
fi

file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // ""')
case "$file" in
  *.env*)
    echo "Blocked: Cannot edit .env files" >&2
    exit 2
    ;;
esac
exit 0
