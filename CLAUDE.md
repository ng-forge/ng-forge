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

- **Spawn subagents if you believe the task is better to be divided**

## MCP Server Synchronization

The `@ng-forge/dynamic-form-mcp` package provides an MCP server for AI-assisted form schema generation. **When making changes to the dynamic-forms library that affect behavior, configuration, or APIs, you MUST also update the MCP server accordingly.**

### When to Update the MCP

Update `packages/dynamic-form-mcp/` when:

- **Adding new field types** - Add metadata to the registry and update examples
- **Adding/modifying validators** - Update the validators registry and documentation
- **Changing field configuration options** - Update the field types registry
- **Adding new UI adapter features** - Update the UI adapters registry
- **Changing the form configuration schema** - Update tools and resources
- **Modifying API surface or behavior** - Update instructions and examples

### MCP Package Structure

```
packages/dynamic-form-mcp/
├── src/
│   ├── registry/           # Generated metadata (field types, validators, UI adapters)
│   ├── resources/          # MCP resources (documentation, examples, schemas)
│   ├── tools/              # MCP tools (lookup, examples, validate, scaffold)
│   └── server.ts           # MCP server setup
├── scripts/
│   └── generate-registry.ts  # Regenerates metadata from source
└── bin/
    └── ng-forge-mcp.ts     # CLI entry point
```

### Regenerating the Registry

After making changes to dynamic-forms packages, regenerate the MCP registry:

```bash
nx run dynamic-form-mcp:generate-registry
```

This extracts metadata from the source packages and updates the JSON registry files.

### Local Development

The MCP is configured in `.mcp.json` to run from `dist/`. After `pnpm install`, the MCP is automatically built. To manually rebuild:

```bash
nx build dynamic-form-mcp
```

## Angular API Usage

- **You MUST investigate real Angular APIs and use those.** Before implementing custom solutions, research whether Angular provides a built-in API. Use official Angular documentation and source code as reference.
- **Offload as much logic to Angular as possible.** We only wrap Angular APIs - we don't reinvent them. Our role is to provide configuration-driven wrappers that delegate to Angular's underlying functionality.
- When wrapping Angular APIs (validators, logic functions, form controls), keep the wrapper thin and delegate to Angular's implementation.
- **Do NOT set `standalone: true`** in component/directive decorators - it's the default in Angular v20+.

## Effects and Reactivity

- **Use `explicitEffect` from ngxtension instead of `effect()`.** This ensures explicit dependency declaration and more predictable reactivity.

  ```typescript
  // ✅ Correct
  explicitEffect([this.someSignal], ([value]) => {
    // side effect logic
  });

  // ❌ Avoid
  effect(() => {
    const value = this.someSignal();
    // side effect logic
  });
  ```

- **Use `derivedFrom` from ngxtension for async signal derivations.** This handles RxJS pipelines declaratively while returning a signal.

  ```typescript
  // ✅ Correct - declarative async derivation
  readonly result = derivedFrom(
    [this.config],
    pipe(
      switchMap(([config]) => this.httpValidator(config)),
      map(response => response.data)
    )
  );

  // ❌ Avoid - manual subscription
  constructor() {
    toObservable(this.config)
      .pipe(switchMap(config => this.httpValidator(config)))
      .subscribe(result => this.result.set(result));
  }
  ```

- **Use `outputFromObservable()` for event stream outputs.** This is acceptable for converting signal changes to output events.

  ```typescript
  // ✅ Acceptable for outputs
  readonly validityChange = outputFromObservable(toObservable(this.valid));
  ```

- Use modern Angular signal APIs: `input()`, `output()`, `model()`, `computed()`, `linkedSignal()`, `viewChild()`, `viewChildren()`, `contentChild()`, `contentChildren()`.
- Use `runInInjectionContext()` when creating forms or other injection-dependent code outside of constructor/field initializers.

## Type Safety

- **Avoid using `any` at all costs.** Use proper type inference, generics, and type guards instead.
- **Use type guards for discriminated unions.** Create `is*` functions to safely narrow types:
  ```typescript
  export function isContainerField(field: RegisteredFieldTypes): field is ContainerFieldTypes {
    return isPageField(field) || isRowField(field) || isGroupField(field);
  }
  ```
- Use `isSignal()` from `@angular/core` to check if a value is a signal at runtime.
- Use `as const satisfies` for configuration objects to get literal type inference with validation.
- When type casting is truly necessary, document why it's safe with a comment.
- Prefer conditional type mapping and generics over loose typing.

## Import Rules

- **In the dynamic-forms library (`packages/dynamic-forms`), do NOT import from barrel files (index.ts).** Import directly from the specific file to avoid circular dependencies and improve build performance.

  ```typescript
  // ✅ Correct - direct import
  import { SomeType } from './models/types/some-type';

  // ❌ Avoid - barrel import within the library
  import { SomeType } from './models';
  ```

## Code Patterns

- **Write code declaratively whenever possible.** Prefer declarative patterns over imperative ones - use `computed()` for derived state, reactive streams for data flow, and configuration-driven approaches over procedural logic.
- Handle errors gracefully with proper error recovery patterns.
- Use custom injection tokens with factory functions that throw descriptive errors when context is missing.
- Prefer `untracked()` when reading signals inside reactive contexts where you don't want to establish a dependency.

## Memoization

- **Use `memoize()` utility for expensive computations** that may be called multiple times with the same inputs.
- Located in `packages/dynamic-forms/src/lib/utils/memoize.ts`.
- Use for: field resolution, schema generation, type inference, and other repeated computations.

  ```typescript
  import { memoize } from '../utils/memoize';

  const resolveField = memoize((fieldConfig: FieldConfig) => {
    // expensive resolution logic
  });
  ```

## Error Handling

- **Use `DynamicFormError` for library errors** with the consistent `[Dynamic Forms]` prefix.

  ```typescript
  import { DynamicFormError } from '../errors/dynamic-form-error';

  throw new DynamicFormError('Field "name" is required but was not provided');
  // Output: [Dynamic Forms] Field "name" is required but was not provided
  ```

- Throw descriptive errors from injection tokens when context is missing.
- Log warnings for recoverable issues; throw for unrecoverable ones.
- Use the `DynamicFormLogger` injection token for customizable logging.

## File Structure

### Field Components

Each UI library field follows this structure:

```
packages/dynamic-forms-{library}/src/lib/fields/{field-name}/
├── {prefix}-{field-name}.component.ts       # Component implementation
├── {prefix}-{field-name}.component.spec.ts  # Unit tests
└── index.ts                                 # Barrel export
```

**Naming by library:**

| Library   | Prefix  | Example Component     | Example File               |
| --------- | ------- | --------------------- | -------------------------- |
| Material  | `Mat`   | `MatInputComponent`   | `mat-input.component.ts`   |
| Bootstrap | `Bs`    | `BsInputComponent`    | `bs-input.component.ts`    |
| PrimeNG   | `Prime` | `PrimeInputComponent` | `prime-input.component.ts` |
| Ionic     | `Ionic` | `IonicInputComponent` | `ionic-input.component.ts` |

### Test Files

| Type           | Pattern                    | Example                           |
| -------------- | -------------------------- | --------------------------------- |
| Component test | `{name}.component.spec.ts` | `mat-input.component.spec.ts`     |
| Service test   | `{name}.service.spec.ts`   | `schema-registry.service.spec.ts` |
| Utility test   | `{name}.spec.ts`           | `memoize.spec.ts`                 |
| Type test      | `{name}.type-test.ts`      | `mat-input.type-test.ts`          |

### Type Definition Files

| Type            | Pattern          | Example             |
| --------------- | ---------------- | ------------------- |
| Type definition | `{name}.type.ts` | `mat-input.type.ts` |

## Quality Assurance

- **When working on a feature, you MUST ensure all checks pass:** tests, build, lint, and format.
- **Remove redundant code when refactoring.** Do not leave dead code, unused imports, or commented-out code behind.
- **Update related documentation and imports accordingly.** When renaming, moving, or deleting code, ensure all references are updated.

## E2E Testing and Screenshots

- **E2E tests use Playwright** and are located in `apps/examples/*/src/app/testing/`.
- **Run tests locally for faster iteration** using `nx e2e <project>` (e.g., `nx e2e primeng-examples`). This is much faster than Docker and should be used during development.
- **Only use Docker for screenshot updates** - Docker ensures cross-platform consistency for visual regression tests. Font rendering differs between macOS, Linux, and CI environments.
- **If screenshot tests fail locally, skip them** - Screenshot assertions will fail locally due to platform differences. You can temporarily comment out screenshot tests or use `.skip` when running locally, then verify in CI.
- **Use the provided scripts** in `package.json`:

  ```bash
  # Run E2E tests in Docker (validates screenshots)
  pnpm e2e:material
  pnpm e2e:bootstrap
  pnpm e2e:primeng
  pnpm e2e:ionic

  # Update screenshots in Docker (when visual changes are intentional)
  pnpm e2e:material:update
  pnpm e2e:bootstrap:update
  pnpm e2e:primeng:update
  pnpm e2e:ionic:update

  # Run all E2E tests sequentially
  pnpm e2e:all
  pnpm e2e:all:update
  ```

- **Never run `--update-snapshots` locally** outside Docker, as this will create platform-specific screenshots that fail in CI.
- The Docker script is at `scripts/playwright-docker.sh` and uses `docker-compose.playwright.yml`.

## Docker Cache Management

E2E tests use Docker volumes to cache Playwright browsers and Nx artifacts for faster subsequent runs.

**When to clean caches:**

- After upgrading Playwright version
- When seeing "Unrecognized Cache Artifacts" warnings
- When tests behave unexpectedly
- When Docker volumes become corrupted

**How to clean:**

```bash
pnpm e2e:clean
```

**Running tests with fresh cache:**

```bash
# Clean and run in one command
./scripts/playwright-docker.sh material-examples --clean
```

## Commit Messages

**You MUST use Angular-style conventional commits for PR titles.** PRs are squash-merged, so only the PR title matters for the changelog. PR titles are validated by commitlint in CI.

**Do NOT add any of the following to commits or PR titles:**

- `Co-authored-by: Claude` or any AI co-authorship attribution
- `Generated by AI` or similar disclaimers
- References to Claude, AI assistants, or automated tools

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

- Subject must be lowercase
- No period at end of subject
- Max 100 characters for header
- Use imperative mood ("add feature" not "added feature")

### Examples

```bash
feat(dynamic-forms): add async validator support
fix(primeng): correct select option binding
docs: update contributing guidelines
chore(deps): update angular to v21
```

---

# Docs App Styling Guidelines

The docs app (`apps/docs`) uses a custom "Forge" design language - a dark industrial aesthetic with ember/fire accents representing the creative process of forging dynamic forms.

## Theme System Location

All reusable styles are in `apps/docs/src/styles/`:

- `_variables.scss` - Design tokens (colors, spacing, typography, etc.)
- `_mixins.scss` - Reusable SCSS mixins for common patterns
- `_animations.scss` - Keyframe animations and animation utilities
- `_index.scss` - Main entry point that forwards all modules

## Using the Theme

Import the theme modules in component SCSS files (no path adjustment needed - `includePaths` is configured in `project.json`):

```scss
@use 'variables' as *; // All design tokens available without prefix
@use 'mixins' as mix; // Use mix.card(), mix.btn-primary(), etc.
@use 'animations' as anim; // Use anim.shimmer-border, etc.

.my-card {
  @include mix.card($with-ember-border: true);
  padding: $space-6;
}
```

## Color Palette

### Background Colors (Dark to Light)

| Variable       | Hex       | Use                         |
| -------------- | --------- | --------------------------- |
| `$bg-void`     | `#000000` | Absolute black, sparingly   |
| `$bg-deep`     | `#0a0908` | Primary dark background     |
| `$bg-surface`  | `#131210` | Headers, panels             |
| `$bg-elevated` | `#1a1916` | Cards, interactive elements |

### Ember/Fire Palette (Primary Accent)

| Variable      | Hex       | Use                       |
| ------------- | --------- | ------------------------- |
| `$ember-core` | `#ff4d00` | Primary action color      |
| `$ember-hot`  | `#ff6b2b` | Hover/active states       |
| `$ember-glow` | `#ff8c42` | Highlights, links, code   |
| `$molten`     | `#ffb627` | Gold accent, premium feel |

### Steel Palette (Text & Borders)

| Variable      | Hex       | Use                          |
| ------------- | --------- | ---------------------------- |
| `$steel`      | `#e8e4de` | Primary text                 |
| `$steel-mid`  | `#9a958c` | Secondary text, descriptions |
| `$steel-dim`  | `#5c5850` | Muted text, placeholders     |
| `$steel-dark` | `#2a2824` | Borders, dividers            |

## Typography

- **Primary font**: `$font-primary` - 'Space Grotesk', sans-serif
- **Monospace font**: `$font-mono` - 'JetBrains Mono', monospace

## Key Mixins

Use `@use 'mixins' as mix;` then call with `@include mix.mixin-name();`

### Cards

```scss
@include mix.card; // Basic card with hover transform
@include mix.card($with-ember-border: true); // Card with gradient top border
@include mix.card-static; // Card without hover effects
```

### Buttons

```scss
@include mix.btn-primary; // Ember gradient button
@include mix.btn-secondary; // Outlined button with border
```

### Code Blocks

```scss
@include mix.code-block; // Container with ember accent
@include mix.code-header; // Header with traffic light dots
@include mix.code-body; // Content area with proper font
```

### Links

```scss
@include mix.link-inline; // Link with animated underline
@include mix.link-nav; // Navigation link with hover underline
```

### Sections

```scss
@include mix.section-container; // Max-width container with padding
@include mix.section-label; // "FEATURES" style label
@include mix.section-title; // Large section heading
@include mix.section-desc; // Section description text
```

### Animations

Use `@use 'animations' as anim;` then call with `@include anim.mixin-name();`

```scss
@include anim.animated-border; // Shimmer gradient border
@include anim.pulse-rings; // Radiating pulse effect
@include anim.spinner($size: 24px); // Loading spinner
@include anim.skeleton; // Loading skeleton effect
```

## Design Principles

1. **Dark-first**: All backgrounds are dark; light text provides contrast
2. **Ember accents**: Use ember colors for CTAs, links, and interactive states
3. **Subtle animations**: Hover transforms, border shimmers, pulse effects
4. **Glass effects**: Use `@include glass-panel` for floating navigation
5. **Consistent spacing**: Use `$space-*` variables, never arbitrary values
6. **Mobile-responsive**: Use `@include mobile { }` for responsive overrides

## Example Component

```scss
@use 'variables' as *;
@use 'mixins' as mix;

:host {
  display: block;
  font-family: $font-primary;
  color: $steel;
}

.feature-card {
  @include mix.card($with-ember-border: true);
  padding: $space-6;

  h3 {
    color: $steel;
    margin-bottom: $space-2;
  }

  p {
    color: $steel-mid;
    font-size: $text-sm;
  }

  code {
    font-family: $font-mono;
    color: $ember-glow;
    background: $bg-elevated;
    padding: $space-1 $space-2;
    border-radius: $radius-sm;
  }

  @include mix.mobile {
    padding: $space-4;
  }
}
```

---

# Angular Official Best Practices

## TypeScript Best Practices

- Use strict type checking.
- Prefer type inference when the type is obvious.
- Avoid the `any` type; use `unknown` when type is uncertain.

## Angular Best Practices

- Always use standalone components over NgModules.
- Do NOT set `standalone: true` inside Angular decorators - it's the default in Angular v20+.
- Use signals for state management.
- Implement lazy loading for feature routes.
- Do NOT use `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead.
- Use `NgOptimizedImage` for all static images (does not work for inline base64 images).

## Accessibility Requirements

- Code MUST pass all AXE checks.
- Code MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

## Components

- Keep components small and focused on a single responsibility.
- Use `input()` and `output()` functions instead of decorators.
- Use `computed()` for derived state.
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator.
- Prefer inline templates for small components.
- Prefer Reactive forms instead of Template-driven ones.
- Do NOT use `ngClass`, use `class` bindings instead.
- Do NOT use `ngStyle`, use `style` bindings instead.
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state.
- Use `computed()` for derived state.
- Keep state transformations pure and predictable.
- Do NOT use `mutate` on signals, use `update` or `set` instead.

## Templates

- Keep templates simple and avoid complex logic.
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`.
- Use the async pipe to handle observables.
- Do not assume globals like `new Date()` are available in templates.
- Do not write arrow functions in templates (they are not supported).

## Services

- Design services around a single responsibility.
- Prefer scoped services over global singletons when the service is only needed within a specific feature or component tree.
- Use `providedIn: 'root'` only for truly application-wide singleton services.
- Use the `inject()` function instead of constructor injection.
