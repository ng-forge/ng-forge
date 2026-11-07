#!/usr/bin/env bash
# Block Edit/Write on .env files. Claude Code passes the tool call as JSON on
# stdin; exit 2 blocks the call and shows stderr to Claude.
set -uo pipefail

if ! command -v jq >/dev/null 2>&1; then
  echo "BLOCKED: .env guard hook requires jq. Install jq or remove this hook from .claude/settings.json." >&2
  exit 2
fi

file=$(jq -r '.tool_input.file_path // ""')
case "$file" in
  *.env*)
    echo "Blocked: Cannot edit .env files" >&2
    exit 2
    ;;
esac
exit 0
