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

## Angular API Usage

- **You MUST investigate real Angular APIs and use those.** Before implementing custom solutions, research whether Angular provides a built-in API. Use official Angular documentation and source code as reference.
- **Offload as much logic to Angular as possible.** We only wrap Angular APIs - we don't reinvent them. Our role is to provide configuration-driven wrappers that delegate to Angular's underlying functionality.
- When wrapping Angular APIs (validators, logic functions, form controls), keep the wrapper thin and delegate to Angular's implementation.

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

- Use memoization for expensive computations that may be called multiple times with the same inputs.
- Handle errors gracefully with proper error recovery patterns.
- Use custom injection tokens with factory functions that throw descriptive errors when context is missing.
- Prefer `untracked()` when reading signals inside reactive contexts where you don't want to establish a dependency.

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
- Use the `providedIn: 'root'` option for singleton services.
- Use the `inject()` function instead of constructor injection.
