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
> The `fieldComponent` query must be `viewChild.required('fieldComponent', { read: ViewContainerRef })`, and the `#fieldComponent` template ref cannot live inside an `@if`, `@defer`, or other conditional — the outlet needs the slot ready at creation time, not later.

## 2. Receive config as inputs

The outlet strips the `type` discriminant from the wrapper config and pushes every remaining key as an Angular input via `setInput()`. If the user writes:

```typescript
{ type: 'section', title: 'Contact details' }
```

the component's `title` input becomes `'Contact details'`.

> [!WARNING]
> A typo like `tilte` won't throw — the wrapper just renders without a title. The `FieldRegistryWrappers` augmentation makes it a TypeScript error where you wrote it, which is why registering the config type matters.

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

## 4. Style the wrapped field

Wrappers are ordinary Angular components — view-encapsulated styles, `:host` selectors, and global styles all work as usual. The wrapper-specific concern is **reaching across the encapsulation boundary** to the inner field, since Angular 21 removes `::ng-deep` from new projects. Three patterns cover it:

- **CSS custom properties** — set something like `--field-spacing` on the wrapper host and read it in the field's stylesheet. Custom properties cross view encapsulation, so the field doesn't need to know a wrapper is even there.
- **A class on the child** — set the field's own `className` property. The field applies it to its own host; the wrapper never has to cross the boundary.
- **Global styles** — declare the rules in a global stylesheet and let them match both sides.

The library's own `RowWrapperComponent` [uses `:host-context(.modifier)` + global grid classes](https://github.com/ng-forge/ng-forge/blob/main/packages/dynamic-forms/src/lib/wrappers/row/row-wrapper.component.scss) for a worked example.

## 5. Test the wrapper

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
