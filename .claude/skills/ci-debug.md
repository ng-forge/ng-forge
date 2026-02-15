---
name: ci-debug
description: Diagnose CI pipeline failures by reading logs, identifying root cause, and suggesting or applying a fix
---

# CI Failure Diagnosis

Diagnoses CI pipeline failures by reading GitHub Actions logs, identifying root cause, and suggesting fixes.

## Required User Input

The user may provide:

- A PR number or URL
- A specific CI run URL
- Just "CI is failing" (will check the current branch)

## Workflow

### 1. Identify the failing run

```bash
# Check current branch CI status
gh run list --branch $(git branch --show-current) --limit 5

# Or check a specific PR
gh pr checks <PR_NUMBER>
```

### 2. Get the failure logs

```bash
# View the failed run
gh run view <RUN_ID> --log-failed
```

### 3. Diagnose root cause

Analyze the logs to identify which job failed and why. Common failure categories:

| Category              | Symptoms            | Common Causes                                             |
| --------------------- | ------------------- | --------------------------------------------------------- |
| **Build failure**     | `nx build` errors   | Type errors, missing imports, circular deps               |
| **Test failure**      | `vitest` errors     | Broken assertions, missing mocks, timing issues           |
| **Lint failure**      | `eslint` errors     | Style violations, unused imports                          |
| **E2E failure**       | `playwright` errors | Screenshot mismatch, timing, selector changes             |
| **Format failure**    | `prettier` errors   | Unformatted files                                         |
| **Type test failure** | `type-test` errors  | Type inference changes                                    |
| **MCP registry**      | Registry mismatch   | Forgot to run `nx run dynamic-form-mcp:generate-registry` |

### 4. Present diagnosis

Report to the user:

1. **Which job failed** and the specific error
2. **Root cause hypothesis** with evidence from the logs
3. **Suggested fix** — either a specific code change or a command to run

**Do NOT apply fixes without user approval** unless explicitly told to.

### 5. Apply fix (if approved)

After user approves:

1. Apply the fix
2. Run the relevant check locally to verify:
   ```bash
   # Match the failing CI step
   nx test <project>           # for test failures
   nx build <project>          # for build failures
   nx lint <project>           # for lint failures
   pnpm format:check           # for format failures
   ```
3. Commit and push

### 6. Monitor the re-run

```bash
gh run watch <RUN_ID>
```

## Quick Fixes

| Issue                             | Fix                                                                          |
| --------------------------------- | ---------------------------------------------------------------------------- |
| Format failures                   | `pnpm format` then commit                                                    |
| MCP registry outdated             | `nx run dynamic-form-mcp:generate-registry` then commit                      |
| Screenshot mismatch (intentional) | `pnpm e2e:{library}:update` then commit                                      |
| Circular dependency               | Check imports — likely a barrel file import within `packages/dynamic-forms/` |

## Important Notes

- E2E screenshot failures may be intentional if visual changes were made — verify with user before "fixing"
- Firefox E2E flakiness is pre-existing — if only Firefox fails, it may be a known issue
- Never retry a CI run without understanding why it failed first
