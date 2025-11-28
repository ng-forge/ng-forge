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
- Use modern Angular signal APIs: `input()`, `output()`, `model()`, `computed()`, `linkedSignal()`.
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
