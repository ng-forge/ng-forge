<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->

# ng-forge Development Guidelines

## Working Style

- **Spawn subagents if you believe the task is better to be divided**
- **Never jump to implementation without explicit user approval.** When asked to analyze, plan, or investigate, stay in analysis mode until the user says to proceed with code changes
- **Always scope changes precisely to what was requested.** Do not apply changes globally when they should be limited to a specific file, component, or example. When in doubt, ask
- **When the user describes a design constraint or architectural principle, treat it as absolute.** Do not attempt to relax, work around, or make stated design principles optional
- **Keep plans concise and correct on the first attempt.** Do not over-engineer solutions. If the user says the plan is too complex, simplify immediately rather than rewriting with similar complexity
- **When adding workarounds like arbitrary delays or skipping tests, flag them as code smells** and propose a proper fix first. Only use workarounds as a last resort with explicit user approval
- **When working with git operations, confirm the target branch, repo directory, and scope** before executing. Never run destructive git operations without confirmation

## Quick Reference

| Command                                     | Description                                 |
| ------------------------------------------- | ------------------------------------------- |
| `pnpm install`                              | Install dependencies                        |
| `nx test <project>`                         | Unit tests (Vitest)                         |
| `nx build <project>`                        | Build library                               |
| `nx lint <project>`                         | ESLint                                      |
| `nx e2e <project>`                          | E2E tests locally (screenshots will differ) |
| `nx serve <project>`                        | Serve app for dev                           |
| `pnpm e2e:material`                         | E2E in Docker (screenshots match CI)        |
| `pnpm e2e:material:update`                  | Update screenshots in Docker                |
| `pnpm e2e:clean`                            | Clean Docker E2E cache                      |
| `nx run dynamic-form-mcp:generate-registry` | Regenerate MCP metadata                     |
| `pnpm build:libs`                           | Build all 6 library packages                |
| `pnpm test:ci`                              | Run all tests with coverage                 |
| `pnpm lint`                                 | Lint all projects                           |

## Architecture

```
ng-forge/
├── packages/
│   ├── dynamic-forms/               # Core library (@ng-forge/dynamic-forms)
│   ├── dynamic-forms-material/      # Material UI adapter
│   ├── dynamic-forms-bootstrap/     # Bootstrap UI adapter
│   ├── dynamic-forms-primeng/       # PrimeNG UI adapter
│   ├── dynamic-forms-ionic/         # Ionic UI adapter
│   └── dynamic-form-mcp/           # MCP server for AI-assisted form generation
├── apps/
│   ├── docs/                        # Documentation app (SSR with Analog)
│   └── examples/
│       ├── material/                # Material demo/test app
│       ├── bootstrap/               # Bootstrap demo/test app
│       ├── primeng/                  # PrimeNG demo/test app
│       ├── ionic/                   # Ionic demo/test app
│       └── core/                    # Core (no UI lib) demo/test app
├── .claude/skills/                  # Custom Claude Code skills
└── scripts/                         # CI/Docker/deployment helpers
```

**Dependency direction:** UI adapters depend on core. Core has zero knowledge of adapters. Adapters provide field components + mappers that plug into core's registry via `provideDynamicForm(...withMaterialFields())`.

**Data flow:** `FormConfig` → `FormStateManager` (state machine + field resolution) → `ResolvedField[]` (component + injector + inputs signal) → `NgComponentOutlet` renders each field.

## Environment

- **Node.js**: `>=22.0.0`
- **pnpm**: `>=10.0.0`
- **Angular**: `~21.1.0`
- **TypeScript**: `~5.9.2`
- **Nx**: `22.4.5`

## MCP Server Synchronization

The `@ng-forge/dynamic-form-mcp` package provides an MCP server for AI-assisted form schema generation. **When making changes to the dynamic-forms library that affect behavior, configuration, or APIs, you MUST also update the MCP server accordingly.**

Update `packages/dynamic-form-mcp/` when adding/modifying field types, validators, field configuration options, UI adapter features, form configuration schema, or API surface/behavior.

After making changes, regenerate the registry: `nx run dynamic-form-mcp:generate-registry`

## Code Style

### Angular API Usage

- **Investigate real Angular APIs before implementing custom solutions.** We wrap Angular APIs, we don't reinvent them. Keep wrappers thin
- **Do NOT set `standalone: true`** in component/directive decorators — it's the default in Angular v20+
- Use `input()`, `output()`, `model()`, `computed()`, `linkedSignal()`, `viewChild()`, `viewChildren()` — never decorators
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in all components
- Use `inject()` instead of constructor injection
- Put host bindings inside the `host` object of `@Component`/`@Directive`, not `@HostBinding`/`@HostListener`
- Use native control flow (`@if`, `@for`, `@switch`), not structural directives
- Use `class` bindings instead of `ngClass`, `style` bindings instead of `ngStyle`
- Prefer Reactive forms over Template-driven
- Use `runInInjectionContext()` when creating forms outside constructor/field initializers
- Use `NgOptimizedImage` for static images (not for inline base64)

### Effects and Reactivity

- **Use `explicitEffect` from ngxtension instead of `effect()`** for explicit dependency declaration:
  ```typescript
  explicitEffect([this.someSignal], ([value]) => {
    /* side effect */
  });
  ```
- **Use `derivedFrom` from ngxtension for async signal derivations** (RxJS pipelines → signal):
  ```typescript
  readonly result = derivedFrom([this.config], pipe(switchMap(([c]) => this.http(c))));
  ```
- **Use `outputFromObservable()`** for converting signal changes to output events

### Type Safety

- **Avoid `any` at all costs.** Use `unknown`, generics, type guards, and conditional types
- **Use `is*` type guards** for discriminated unions
- Use `isSignal()` from `@angular/core` for runtime signal checks
- Use `as const satisfies` for configuration objects
- When type casting is necessary, document why it's safe with a comment

### Import Rules

- **In `packages/dynamic-forms/`, do NOT import from barrel files (index.ts).** Import directly from the specific file to avoid circular dependencies:
  ```typescript
  import { SomeType } from './models/types/some-type'; // correct
  // NOT: import { SomeType } from './models';           // creates cycles
  ```

### Code Patterns

- Write declaratively: `computed()` for derived state, reactive streams for data flow, configuration-driven over procedural
- Prefer `untracked()` when reading signals without establishing a dependency
- Use custom injection tokens with factory functions that throw descriptive errors when context is missing
- Use `memoize()` utility (`packages/dynamic-forms/src/lib/utils/memoize.ts`) for expensive repeated computations
- Prefer scoped services over `providedIn: 'root'` when the service is only needed in a specific feature tree

### SSR Compatibility

- **Never use module-scoped mutable state** (Maps, caches, singletons outside DI). These break SSR because they're shared across requests
- Use Angular's DI system for all caching and state. Injection tokens scoped to the component tree are SSR-safe

## Error Handling

- **Use `DynamicFormError`** with the `[Dynamic Forms]` prefix for library errors
- Throw descriptive errors from injection tokens when context is missing
- Log warnings for recoverable issues; throw for unrecoverable ones
- Use the `DynamicFormLogger` injection token for customizable logging

## Cross-Library Changes

When implementing a feature across all 4 UI adapter libraries:

1. **Define the shared contract first** — the interface, behavior, and test criteria
2. **Use subagents per library** — spawn parallel Task agents, each scoped to one library directory, implementing against the shared contract
3. **Each agent should**: read existing patterns in its library, implement following those conventions, run that library's tests
4. **After all complete**: review together, run the full build (`pnpm build:libs`), create a single commit
5. **No agent should modify files outside its library scope**

## Quality Assurance

- **When working on a feature, ensure all checks pass:** tests, build, lint
- Remove dead code, unused imports, and commented-out code when refactoring
- Update all references when renaming, moving, or deleting code
- Code must pass AXE checks and follow WCAG AA minimums (focus management, color contrast, ARIA attributes)

## E2E Testing

- **Playwright-based**, located in `apps/examples/*/src/app/testing/`
- **Run locally for fast iteration**: `nx e2e material-examples` (screenshots will differ from CI — that's expected)
- **Use Docker for screenshot updates only**: `pnpm e2e:material:update` (ensures cross-platform consistency)
- **Never run `--update-snapshots` locally** outside Docker — creates platform-specific screenshots that fail in CI
- **Clean Docker cache** when upgrading Playwright, seeing cache warnings, or unexpected behavior: `pnpm e2e:clean`
- See `/e2e-update` skill for the full workflow

## Debugging Guidelines

- **Diagnose root causes before proposing fixes.** Don't chase the first symptom; investigate whether the real cause is elsewhere
- **Share your hypothesis** before implementing a fix. State what you think is wrong and why, so the user can redirect early if needed
- **Arbitrary delays, `setTimeout` workarounds, and skipped tests are code smells.** If you find yourself reaching for one, stop and investigate the underlying timing or lifecycle issue
- **For reactive/signal bugs**: check for circular dependencies in computed chains, verify `untracked()` usage, and check `explicitEffect` dependency arrays
- **For E2E flakiness**: Firefox has pre-existing flakiness across array-fields, row-fields, group-fields, multi-page, and expression-logic suites. Don't spend time debugging Firefox-only failures unless specifically asked

## Commit Messages

**Angular-style conventional commits for PR titles.** PRs are squash-merged, so only the PR title matters for the changelog. Validated by commitlint in CI.

**Do NOT add** `Co-authored-by: Claude`, `Generated by AI`, or any AI attribution.

### Format

```
<type>(<scope>): <subject>
```

### Allowed Types

| Type       | Use For                                  |
| ---------- | ---------------------------------------- |
| `feat`     | New features                             |
| `fix`      | Bug fixes                                |
| `perf`     | Performance improvements                 |
| `refactor` | Code changes (no feature/fix)            |
| `docs`     | Documentation changes                    |
| `test`     | Adding/updating tests                    |
| `build`    | Build system or dependency changes       |
| `ci`       | CI configuration                         |
| `chore`    | Maintenance (doesn't modify src or test) |
| `style`    | Code style (formatting, semicolons)      |
| `revert`   | Reverting previous commits               |

### Allowed Scopes

`core`, `forms`, `dynamic-forms`, `material`, `bootstrap`, `primeng`, `ionic`, `mcp`, `docs`, `examples`, `release`, `deps`, `config`, or empty

### Rules

- Subject: lowercase, imperative mood, no period, max 100 characters
- Examples: `feat(dynamic-forms): add async validator support`, `fix(primeng): correct select option binding`
