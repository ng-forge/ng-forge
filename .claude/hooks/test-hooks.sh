#!/usr/bin/env bash
# Feeds the guard hooks the JSON Claude Code sends on stdin and checks the exit codes.
# Run: bash .claude/hooks/test-hooks.sh
set -uo pipefail
cd "$(dirname "$0")/../.."
fail=0

expect() { # expect <exit> <script> <json>
  printf '%s' "$3" | bash "$2" >/dev/null 2>&1
  local got=$?
  if [ "$got" != "$1" ]; then echo "FAIL ($got != $1): $2 $3"; fail=1; fi
}

env_guard=.claude/hooks/block-env-edits.sh
expect 2 "$env_guard" '{"tool_input":{"file_path":".env"}}'
expect 2 "$env_guard" '{"tool_input":{"file_path":"apps/demo/.env.local"}}'
expect 0 "$env_guard" '{"tool_input":{"file_path":"packages/dynamic-forms/src/index.ts"}}'

push_guard=.claude/hooks/block-push-to-main.sh
cmd_json() { jq -cn --arg c "$1" '{tool_input:{command:$c}}'; }
for c in 'git push origin main' 'git push origin HEAD:main' 'git -C . push origin main' \
  'git -c core.x=y push origin main' 'git --no-pager push origin main' 'git --git-dir=.git push origin main' \
  "git -C 'other tree' push origin main" 'git -C "other tree" push origin main' 'git -C ../sibling push'; do
  expect 2 "$push_guard" "$(cmd_json "$c")"
done
for c in 'git push origin feat/x' 'git -C . push origin feat/main-menu' 'git log --oneline main' \
  'git commit -m "push to main later"'; do
  expect 0 "$push_guard" "$(cmd_json "$c")"
done

[ "$fail" = 0 ] && echo "all hook checks passed"
exit "$fail"
