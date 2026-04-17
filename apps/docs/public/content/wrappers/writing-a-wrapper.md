---
title: Writing a Wrapper
slug: wrappers/writing-a-wrapper
description: "Build a custom ng-forge wrapper component — the FieldWrapperContract, config props as Angular inputs, and the fieldInputs bag that carries the wrapped field's mapper outputs and a read-only view of its form state."
---

A wrapper is an Angular component that implements a single contract: it exposes a `ViewContainerRef` slot named `fieldComponent`. Everything else — template, styling, DI — is yours.

This page builds a `section` wrapper that renders a titled card around any field.

## 1. Implement `FieldWrapperContract`

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
  styleUrl: './section-wrapper.component.scss',
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

the component's `title` input becomes `'Contact details'`. Inputs you don't declare are silently ignored, so a typo in config doesn't break rendering — add validation in review.

### `fieldInputs` — the mapper's outputs

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

This is the same set of inputs the mapper would push onto the field component, plus the field's `FieldTree` narrowed into a `ReadonlyFieldTree` — a whitelist of read-only signals (`value`, `valid`, `invalid`, `touched`, `dirty`, `required`, `disabled`, `hidden`, `errors`). Wrappers observe through this surface; they cannot write.

A validation-aware version of the section wrapper:

```typescript name="section-wrapper.component.ts"
@Component({
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
})
export default class SectionWrapperComponent implements FieldWrapperContract {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });
  readonly title = input<string>();
  readonly fieldInputs = input<WrapperFieldInputs>();

  readonly isInvalid = computed(() => this.fieldInputs()?.field?.invalid() ?? false);
}
```

`this.fieldInputs()?.field` is a `ReadonlyFieldTree`; calling `.invalid()` reads Angular Signal Forms' invalid signal.

> [!NOTE]
> Container-type fields (`type: 'container'`) wrap a children template rather than a single field. Wrappers used in that position do not receive `fieldInputs` — inject `FIELD_SIGNAL_CONTEXT` directly if you need form state in that scenario.

## 3. Style freely

Wrappers are ordinary Angular components. Use Emulated view encapsulation, `:host` selectors, global styles, adapter-specific classes — whatever fits. The outlet creates the component via `ViewContainerRef.createComponent()`, so scoped styles work like any other component.

## Next

With the component done, the next step is registering it so `provideDynamicForm(...)` knows about it and making wrappers fire on real fields: **[Registering and applying wrappers](/wrappers/registering-and-applying)**.
