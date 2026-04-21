---
title: Writing a Wrapper
slug: wrappers/writing-a-wrapper
description: 'Build a custom wrapper component that decorates any dynamic form field. Walks through the component contract, config inputs, reading form state, styling, and testing.'
---

Build a custom wrapper component that decorates any dynamic form field. This page walks through the contract, the data that flows in, and the common extensions (validation-aware chrome, styling, tests). Once the component exists, **[Registering and applying wrappers](/wrappers/registering-and-applying)** covers how to make it available to a form.

The example here is a `section` wrapper that renders a titled card around any field.

## 1. Implement the contract

A wrapper is an Angular component whose template contains a `#fieldComponent` template reference pointing at a `ViewContainerRef`. The outlet creates the wrapper, finds the ref, and renders the next wrapper (or the field component) inside. Everything else — template, styling, DI — is yours.

```typescript name="section-wrapper.component.ts"
import { ChangeDetectionStrategy, Component, input, ViewContainerRef, viewChild } from '@angular/core';
import type { FieldWrapperContract, WrapperFieldInputs } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-section-wrapper',
  template: `
    <div class="section">
      @if (title()) {
        <div class="section__header">{{ title() }}</div>
      }
      <div class="section__body">
        <ng-container #fieldComponent></ng-container>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SectionWrapperComponent implements FieldWrapperContract {
  // Required by FieldWrapperContract — the slot where the inner content renders.
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });

  // Config props arrive as regular Angular inputs (the `type` discriminant is stripped).
  readonly title = input<string>();

  // Mapper outputs for the wrapped field, plus a read-only view of its form state.
  readonly fieldInputs = input<WrapperFieldInputs>();
}
```

> [!NOTE]
> The `fieldComponent` query must be `viewChild.required('fieldComponent', { read: ViewContainerRef })`, and the `#fieldComponent` template ref cannot live inside an `@if`, `@defer`, or other conditional — the outlet needs the slot ready at creation time, not later. See [Contract pitfalls](#contract-pitfalls) below for the runtime errors you'll see when the contract is violated.

### The `#fieldComponent` slot must be unconditional

The outlet reads the `ViewContainerRef` immediately after creating the wrapper and running one `detectChanges()` pass. If the ref isn't present at that moment, `viewChild.required` throws `NG0951` (REQUIRED_QUERY_NO_VALUE), the chain is torn down, and the field renders bare.

✗ Wrong — the slot only materialises when `expanded()` is true:

```html
<div class="section">
  @if (expanded()) {
  <ng-container #fieldComponent></ng-container>
  }
</div>
```

Also broken — `@defer`, `@for`, `@switch`, `<ng-template>` (without projecting), or any structural directive that delays view creation.

✓ Right — always present, visibility toggled with CSS / attribute bindings:

```html
<div class="section" [class.section--collapsed]="!expanded()">
  <ng-container #fieldComponent></ng-container>
</div>
```

If you need to genuinely suspend rendering, gate the wrapper config itself at a higher level (conditional `wrappers` on the field) rather than conditionally mounting the slot inside the wrapper template.

## 2. Receive config as inputs

The outlet strips the `type` discriminant from the wrapper config and pushes every remaining key as an Angular input via `ComponentRef.setInput()`. Each key you want to receive must be declared on the wrapper component with `input()`:

```typescript
{ type: 'section', title: 'Contact details' }
```

With `readonly title = input<string>();` on the component, `title()` returns `'Contact details'`. Keys the user wrote that the component doesn't declare are **silently dropped** — the outlet probes `reflectComponentType(ComponentRef.componentType).inputs` before calling `setInput()`, so the normal NG0303 ("input not declared") runtime error never fires. Config-key typos don't crash; they just render with an unset input.

> [!WARNING]
> A typo like `tilte` won't throw — the wrapper just renders without a title. Because unknown keys are suppressed, the safety net is TypeScript, not runtime: declaring a `FieldRegistryWrappers` augmentation for your wrapper (see [Registering and applying wrappers](/wrappers/registering-and-applying)) turns typos into compile errors at the call site.

### Dynamic config

Any config prop can be a signal or observable instead of a literal. Angular's input system doesn't know the difference — pass a `Signal<string>` for `title` if you want the header text to react to form state, or an `Observable<string>` from a translation service. The built-in `css` wrapper uses this (`cssClasses: DynamicText = string | Signal<string> | Observable<string>`); adopt the same pattern in your own wrappers whenever config should flex at runtime.

## 3. Read field state via `fieldInputs`

Alongside config, every wrapper receives a single `fieldInputs` input of type `WrapperFieldInputs`:

```typescript
interface WrapperFieldInputs {
  readonly key: string;
  readonly label?: string;
  readonly placeholder?: string;
  readonly className?: string;
  readonly props?: Record<string, unknown>;
  readonly validationMessages?: Record<string, string>;
  readonly defaultValidationMessages?: Record<string, string>;
  readonly field?: ReadonlyFieldTree;
  readonly [key: string]: unknown;
}
```

Same set of inputs the mapper would push onto the field component, plus the field's `FieldTree` narrowed to a `ReadonlyFieldTree` — a whitelist of read-only signals (`value`, `valid`, `invalid`, `touched`, `dirty`, `required`, `disabled`, `hidden`, `errors`). Wrappers observe through this surface; they cannot write.

A validation-aware section wrapper reads the field's validity:

```typescript name="section-wrapper.component.ts"
import { ChangeDetectionStrategy, Component, computed, input, ViewContainerRef, viewChild } from '@angular/core';
import type { FieldWrapperContract, WrapperFieldInputs } from '@ng-forge/dynamic-forms';

@Component({
  selector: 'app-section-wrapper',
  template: `
    <div class="section" [class.section--invalid]="isInvalid()">
      <div class="section__header">
        {{ title() }}
        @if (isInvalid()) {
          <span class="section__badge">needs attention</span>
        }
      </div>
      <div class="section__body">
        <ng-container #fieldComponent></ng-container>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SectionWrapperComponent implements FieldWrapperContract {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });
  readonly title = input<string>();
  readonly fieldInputs = input<WrapperFieldInputs>();

  readonly isInvalid = computed(() => this.fieldInputs()?.field?.invalid() ?? false);
}
```

### Wrappers on container fields

A wrapper around a `type: 'container'` field wraps a **children template**, not a single field — no single `field` is in scope, so containers don't push a `fieldInputs.field`. If you need to decorate a container based on form state, pass the relevant key(s) through config and look them up from the form tree, or inject `FIELD_SIGNAL_CONTEXT` when you need the broader form root. For most wrappers this isn't necessary — design them to take what they need as props.

## 4. Inject outer wrappers and field tokens

Wrappers are created with a merged injector. The library stacks them like this:

- **Field-level tokens first** — `ARRAY_CONTEXT`, `FIELD_SIGNAL_CONTEXT`, anything provided on the field's `ResolvedField.injector`.
- **Element injector behind** — the enclosing DOM chain, including every outer wrapper that's already been instantiated.

This means a nested wrapper can `inject()` the wrapper that contains it. Precedence goes to the field-level injector when tokens overlap ("more specific context wins").

```typescript
import { Component, inject, ViewContainerRef, viewChild } from '@angular/core';
import { ARRAY_CONTEXT, FieldWrapperContract } from '@ng-forge/dynamic-forms';
import { OuterWrapperComponent } from './outer-wrapper.component';

@Component({
  selector: 'app-inner-wrapper',
  template: `<ng-container #fieldComponent></ng-container>`,
})
export default class InnerWrapperComponent implements FieldWrapperContract {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });

  // Both of these work — field injector checked first, outer wrappers fall through.
  private readonly outer = inject(OuterWrapperComponent, { optional: true });
  private readonly arrayCtx = inject(ARRAY_CONTEXT, { optional: true });
}
```

Use this sparingly — most wrappers should take what they need via config inputs. Ancestor injection is the right tool when two wrappers are **designed to cooperate** (e.g., a `collapsible` outer wrapper that exposes an `expanded` signal to a `header` inner wrapper).

## 5. Understand the rebuild lifecycle

The outlet distinguishes **structural** changes from **transient flicker**:

- **Structural change → teardown + rebuild.** The wrapper chain array differs by identity, OR the innermost component class changed. The outlet tears down every wrapper and re-renders from scratch. Focus / caret / scroll on the innermost field are preserved automatically (the hostView is detached and re-inserted).
- **Transient `renderReady → false` flicker → no-op.** The mapper momentarily stops producing inputs mid-transition. The mounted chain stays alive, the controller ignores the gate, and the next truthy emission pushes new `fieldInputs` without rebuilding.
- **`fieldInputs` update → push-through.** A fresh `WrapperFieldInputs` snapshot is pushed to every wrapper via `setInput()` without touching the DOM. Mappers must emit new object references per tick rather than mutating — the push-through dedupes by identity.

What this means for wrapper authors: don't put expensive setup in constructor / `ngOnInit` hoping it'll run rarely — structural rebuilds destroy the whole chain. Use `computed()` / `effect()` off the inputs, which re-run cheaply across the lifetime of a single mount.

## 6. Style the wrapped field

Wrappers are ordinary Angular components — view-encapsulated styles, `:host` selectors, and global styles all work as usual. The wrapper-specific concern is **reaching across the encapsulation boundary** to the inner field, since Angular 21 removes `::ng-deep` from new projects. Three patterns cover it:

- **CSS custom properties** — set something like `--field-spacing` on the wrapper host and read it in the field's stylesheet. Custom properties cross view encapsulation, so the field doesn't need to know a wrapper is even there.
- **A class on the child** — set the field's own `className` property. The field applies it to its own host; the wrapper never has to cross the boundary.
- **Global styles** — declare the rules in a global stylesheet and let them match both sides.

The library's own `RowWrapperComponent` [uses `:host-context(.modifier)` + global grid classes](https://github.com/ng-forge/ng-forge/blob/main/packages/dynamic-forms/src/lib/wrappers/row/row-wrapper.component.scss) for a worked example.

## Contract pitfalls

Three wrapper-chain errors are logged with the `[Dynamic Forms]` prefix. If you see any of them in the console, find the matching cause below.

### `Wrapper type '<name>' could not be loaded`

```text
[Dynamic Forms] Wrapper type 'section' could not be loaded.
                Ensure it is registered via provideDynamicForm().
```

Either the wrapper name isn't registered in `WRAPPER_REGISTRY`, or the `loadComponent()` promise rejected (bad import path, a throw from the module, etc.).

**Wrapper loading is fail-closed.** If any wrapper in a chain fails to resolve, the **entire chain is dropped** and the field renders bare — never half-wrapped. The error is logged once per failed load (per DI scope, because the cache is DI-scoped).

Fix: add the wrapper to your `provideDynamicForm(...)` call (see [Registering and applying wrappers](/wrappers/registering-and-applying)), or check that `loadComponent: () => import('./path')` resolves to the right module.

### `Wrapper component for type '<name>' does not provide a 'fieldComponent' ViewContainerRef`

```text
[Dynamic Forms] Wrapper component for type 'section' does not provide a 'fieldComponent' ViewContainerRef.
                Ensure the wrapper component has a viewChild('fieldComponent', { read: ViewContainerRef })
                query and that #fieldComponent is not inside a conditional (@if, @defer).
```

Two possible causes:

1. The wrapper component doesn't declare `fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef })` — the outlet can't find a slot.
2. The `#fieldComponent` template ref is inside an `@if`, `@defer`, `@for`, `@switch`, or `<ng-template>` that isn't rendered at query time — `viewChild.required` throws `NG0951` and the outlet catches it.

See [The `#fieldComponent` slot must be unconditional](#the-fieldcomponent-slot-must-be-unconditional) for correct patterns. When this fires, the outlet unwinds the partial chain so the field renders bare.

### `Wrapper chain render failed; tearing down partial state.`

```text
[Dynamic Forms] Wrapper chain render failed; tearing down partial state. <error>
```

Something threw while the controller was building the chain — most commonly a wrapper template expression (the user reads `fieldInputs().field!.value()` without the guard) or the `renderInnermost` callback blew up. The controller catches the throw, clears the mounted state, and keeps the subscription alive so the next emission can still render.

Check the stack in the attached error. If it points inside your wrapper's template, add a guard for `fieldInputs === undefined` — container wrappers don't push a `fieldInputs`.

## 7. Test the wrapper

Wrappers are components — test them with `TestBed` like any other. A minimal spec that mounts the wrapper via `createComponent`, passes a `fieldInputs` signal, and asserts DOM:

```typescript name="section-wrapper.component.spec.ts"
import { TestBed } from '@angular/core/testing';
import { Component, viewChild, ViewContainerRef } from '@angular/core';
import SectionWrapperComponent from './section-wrapper.component';
import type { WrapperFieldInputs } from '@ng-forge/dynamic-forms';

@Component({ template: `<ng-container #slot></ng-container>` })
class TestHost {
  readonly slot = viewChild.required('slot', { read: ViewContainerRef });
}

describe('SectionWrapperComponent', () => {
  it('renders the configured title', () => {
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();

    const ref = fixture.componentInstance.slot().createComponent(SectionWrapperComponent);
    ref.setInput('title', 'Contact details');
    ref.setInput('fieldInputs', { key: 'email' } satisfies WrapperFieldInputs);
    ref.changeDetectorRef.detectChanges();

    const header = ref.location.nativeElement.querySelector('.section__header');
    expect(header?.textContent.trim()).toBe('Contact details');
  });
});
```

For integration tests that exercise wrappers inside a live form (mapper + outlet + chain), the library's own [`container-field.component.spec.ts`](https://github.com/ng-forge/ng-forge/blob/main/packages/dynamic-forms/src/lib/fields/container/container-field.component.spec.ts) is a larger example — mock wrapper components, a `flushWrapperChain` helper, and assertions against the rendered chain.

## Next

You've built, styled, and tested a custom wrapper — now register it and reach for it in a form:

- **[Registering and applying wrappers](/wrappers/registering-and-applying)** — wire the wrapper into `provideDynamicForm`, apply it per-field or via form-wide defaults, opt out with `wrappers: null`, and understand the merge order when multiple sources stack.
