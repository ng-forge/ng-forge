---
name: refactor
description: Execute a structured multi-phase refactoring with plan-lock protocol to prevent scope drift and premature implementation
---

# Structured Refactoring

Executes multi-phase refactoring with a strict plan-lock protocol. Prevents the common failure modes: wrong approach, scope drift, premature implementation.

## Required User Input

The user provides:

- **What to refactor** — the target code/feature/pattern
- **Why** — the goal (performance, readability, architecture, etc.)
- **Constraints** — any design principles or limitations to respect

## Workflow

### Phase 1: Analysis (NO code changes)

1. **State understanding** of the goal in one sentence. Wait for user confirmation
2. **Investigate** the current code using subagents:
   - Read all relevant files
   - Map dependencies and callers
   - Identify the blast radius
3. **Report findings**:
   - Current architecture and data flow
   - All files that will be affected
   - Potential risks or gotchas

### Phase 2: Plan (NO code changes)

1. List the **exact files** to modify/create (full paths). No others
2. For each file, describe the **specific change** in 1-2 sentences
3. State what is **explicitly out of scope**
4. Define the **phases** — break large refactors into incremental steps where each phase leaves the codebase in a working state
5. State the **validation strategy** for each phase:
   ```bash
   nx test <project>
   nx build <project>
   nx lint <project>
   ```

### APPROVAL GATE

Present the plan and **STOP**. Do not write code. Wait for:

- `approved` — proceed to implementation
- `revise [feedback]` — adjust the plan
- `just analyze, no code` — stay in analysis mode

### Phase 3: Implementation (only after approval)

For each phase:

1. **Announce** which phase you're starting
2. **Touch ONLY approved files**. If you discover you need to change an unapproved file, stop and ask
3. **Run validation** after each phase:
   ```bash
   nx test <affected-project>
   nx build <affected-project>
   ```
4. **Report results** before moving to the next phase

### Phase 4: Final Verification

After all phases complete:

```bash
# Full project validation
nx run-many -t test -p <all-affected-projects>
nx run-many -t build -p <all-affected-projects>
nx run-many -t lint -p <all-affected-projects>
```

## Rules

- If the user says "analysis only" at any point, switch to read-only mode
- If tests fail after a phase, fix within that phase before proceeding
- If the fix requires changing unapproved files, stop and ask
- No dead code, unused imports, or commented-out code left behind
- All phases must leave the codebase in a buildable, testable state
- Do not over-engineer — the right amount of complexity is the minimum needed

## Phase Sizing Guidelines

| Refactor Size | Phases | Example                             |
| ------------- | ------ | ----------------------------------- |
| Single file   | 1      | Extract a utility function          |
| 2-5 files     | 2-3    | Move shared logic to a new service  |
| 5-15 files    | 3-5    | Restructure a module's architecture |
| 15+ files     | 5-8    | Cross-cutting pattern change        |

## Checklist

- [ ] User confirmed understanding of goal
- [ ] All affected files identified upfront
- [ ] Plan approved before any code changes
- [ ] Each phase validated independently
- [ ] Final full validation passes
- [ ] No dead code or unused imports left behind
