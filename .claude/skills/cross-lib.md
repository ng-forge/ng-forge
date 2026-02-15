---
name: cross-lib
description: Implement a feature or change across all 4 UI adapter libraries (Material, Bootstrap, PrimeNG, Ionic) using parallel subagents
---

# Cross-Library Feature Implementation

Coordinates parallel implementation of a feature or change across all 4 UI adapter libraries, ensuring consistency while respecting each library's conventions.

## Required User Input

1. **What to implement** — the feature, fix, or change
2. **Scope** — which libraries (default: all four)

If not specified, ask:

> What feature/change should be applied across the libraries?
> Which libraries? (material, bootstrap, primeng, ionic, or all)

## Libraries

| Library   | Package                             | Prefix  | Example Path                        |
| --------- | ----------------------------------- | ------- | ----------------------------------- |
| Material  | `@ng-forge/dynamic-forms-material`  | `Mat`   | `packages/dynamic-forms-material/`  |
| Bootstrap | `@ng-forge/dynamic-forms-bootstrap` | `Bs`    | `packages/dynamic-forms-bootstrap/` |
| PrimeNG   | `@ng-forge/dynamic-forms-primeng`   | `Prime` | `packages/dynamic-forms-primeng/`   |
| Ionic     | `@ng-forge/dynamic-forms-ionic`     | `Ionic` | `packages/dynamic-forms-ionic/`     |

## Workflow

### 1. Define the shared contract

Before spawning agents, establish:

- **Interface/behavior**: What the feature should do across all libraries
- **Test criteria**: How to verify correctness
- **Reference implementation**: Pick one library (usually Material) as the reference if the pattern is novel

Present the contract to the user for approval before proceeding.

### 2. Implement the reference (if novel pattern)

If this is a new pattern that doesn't exist in any library yet:

1. Implement in Material first (it has the best docs and examples)
2. Verify it works: `nx test dynamic-forms-material && nx build dynamic-forms-material`
3. Use the working implementation as the contract for other libraries

### 3. Spawn parallel subagents

Use the Task tool to spawn one agent per target library. Each agent receives:

- The shared contract / reference implementation
- Instruction to read existing patterns in its library directory
- Instruction to implement following that library's conventions
- Instruction to run tests: `nx test dynamic-forms-{library}`
- **Strict scope**: do NOT modify files outside `packages/dynamic-forms-{library}/`

### 4. Review and integrate

After all agents complete:

1. Review each agent's output for consistency
2. Run the full build: `pnpm build:libs`
3. Run all affected tests: `nx run-many -t test -p dynamic-forms-material dynamic-forms-bootstrap dynamic-forms-primeng dynamic-forms-ionic`
4. If example apps need updating, update them consistently across all `apps/examples/*/`

### 5. Verify

```bash
nx run-many -t build -p dynamic-forms-material dynamic-forms-bootstrap dynamic-forms-primeng dynamic-forms-ionic
nx run-many -t test -p dynamic-forms-material dynamic-forms-bootstrap dynamic-forms-primeng dynamic-forms-ionic
nx run-many -t lint -p dynamic-forms-material dynamic-forms-bootstrap dynamic-forms-primeng dynamic-forms-ionic
```

## Common Cross-Library Changes

- **New field props**: Add to each library's type definition + component + type-test
- **New field type**: Use `/new-field` skill per library instead
- **Template changes**: Update component template in all 4 libraries + update example apps
- **Mapper changes**: Usually only in core, but verify adapter mappers aren't affected
- **E2E scenarios**: Add/update test scenarios in all `apps/examples/*/src/app/testing/`

## Checklist

- [ ] Contract defined and approved by user
- [ ] All 4 libraries implement consistently
- [ ] All tests pass per library
- [ ] Full build passes (`pnpm build:libs`)
- [ ] Example apps updated if needed
- [ ] No files modified outside target library scopes
