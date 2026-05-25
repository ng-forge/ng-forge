---
name: verify-e2e
description: Run Playwright E2E suites via Nx CLI for scripted, repeatable verification instead of driving a browser interactively through an MCP
---

# Run E2E Tests

For behavior-level verification of form fields, container components, validation flows, or any change touching the sandbox examples, run the existing Playwright suites via Nx rather than driving a browser via MCP. CLI output is targeted (pass/fail + failure traces) and avoids the token bleed of interactive MCP browser sessions.

## When to use

- After changes to field components, form state, container components, or validation logic
- Regression checks before opening a PR
- When the same scenario will be re-verified multiple times
- When you only need to know "does it still work?" not "does it look right?"

## When NOT to use

- Ad-hoc visual checks of styling, theming, mobile layout — use `/verify` with `chrome-devtools` MCP
- Live debugging of hydration, SSR mismatches, or runtime issues — use `/verify`
- Generating new screenshots for unmounted scenarios — write the spec first, then `pnpm e2e:<adapter>:update`

## Required User Input

- **Adapter(s)**: `material`, `bootstrap`, `primeng`, `ionic`, or `core` (default: the one most relevant to the change)
- **Scope** (optional): a specific suite (`array-fields`, `validation`, etc.) or scenario name to grep

## Workflow

### 1. Pick the runner

- **Local, fast iteration** (screenshots may differ from CI — fine for behavior checks):
  ```bash
  nx run sandbox-examples:e2e-<adapter>
  ```
- **CI-equivalent screenshots** (Docker):
  ```bash
  pnpm e2e:<adapter>
  ```
- **Single scenario only** (faster feedback):
  ```bash
  nx run sandbox-examples:e2e-<adapter> -- --grep "<scenario name or suite>"
  ```

### 2. Run + capture output

Run the command and capture the **actual** output. Do not claim "tests pass" without the run output in this session. If a test fails, paste the failing test name, error excerpt, and any new screenshot diff path.

### 3. Snapshot updates only in Docker

If screenshots need regenerating:

```bash
pnpm e2e:<adapter>:update     # Docker, matches CI
```

Never run `--update-snapshots` locally outside Docker — produces platform-specific screenshots that fail in CI.

### 4. Firefox flakiness

Firefox has pre-existing flakiness across `array-fields`, `row-fields`, `group-fields`, `multi-page`, and `expression-logic`. Don't spend time debugging Firefox-only failures unless explicitly asked.

## Checklist

- [ ] Picked the correct adapter for the change
- [ ] Used local runner unless updating snapshots
- [ ] Captured real test output before claiming verified
- [ ] Reported failing scenarios with error excerpts, not just counts
