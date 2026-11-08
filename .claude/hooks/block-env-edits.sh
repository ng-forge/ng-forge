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
  # A .env path: unquoted, or quoted (spaces allowed inside the quotes).
  env="(\"[^\"]*\\.env[^\"]*\"|'[^']*\\.env[^']*'|[^[:space:];&|<>'\"]*\\.env[^[:space:];&|<>'\"]*)"
  # Command position: line start (indent allowed) or after a shell separator.
  start='(^|[;&|])[[:space:]]*'
  end='([[:space:]]|$|[;&|])'
  # Trailing redirections (`2>/dev/null`, `>&2`) after a cp/mv destination.
  redir='([[:space:]]+[0-9]*[<>]+&?[^[:space:];&|]*)*'
  # Here-strings rather than pipes: under pipefail an early `grep -q` exit can
  # fail the pipeline and turn a match into a pass.
  if grep -qE ">>?[[:space:]]*${env}${end}" <<<"$cmd" ||
    grep -qE "${start}tee([[:space:]]+[^;&|]*)?[[:space:]]${env}${end}" <<<"$cmd" ||
    grep -qE "${start}(sed|perl)[[:space:]]([^;&|]*[[:space:]])?-[[:alpha:]]*i[^;&|]*[[:space:]]${env}${end}" <<<"$cmd" ||
    grep -qE "${start}(cp|mv|install)[[:space:]][^;&|]*[[:space:]]${env}${redir}[[:space:]]*($|[;&|#])" <<<"$cmd"; then
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
