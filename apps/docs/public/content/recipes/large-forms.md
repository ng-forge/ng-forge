---
title: Large Forms
slug: recipes/large-forms
description: 'Keep large ng-forge forms fast: preload neighbouring pages in paged forms, defer and park fields in long flat forms, and show skeleton placeholders while fields load.'
---

Paged and flat forms use separate rendering controls.

## Paged forms

For a paged form, `options.pagePreloadWindow` controls how many neighbouring pages are mounted and preloaded. The default is `1`. Set it to `0` when only the active page should load, or increase it when fast jump navigation matters more than initial work.

## Flat forms

For a large flat form, `options.fieldWindowing` can defer leaf fields until they approach the viewport:

```typescript
const config = {
  options: {
    fieldWindowing: {
      eager: 20,
      placeholderHeight: '4rem',
      park: { margin: '100%' },
    },
  },
  fields: [
    // Flat field definitions
  ],
} as const satisfies FormConfig;
```

- `eager` mounts the leading leaf fields immediately.
- `placeholderHeight` reserves layout space before a deferred field mounts.
- `park` leaves mounted offscreen DOM in place while removing its view from routine change detection. Disabled, readonly, required, and validation state stays current. Other model-to-DOM updates catch up when the field returns.
- `park.margin` follows `IntersectionObserver.rootMargin`: use one to four `px` or `%` values. Unsupported units fall back to the inherited margin.
- `fieldWindowing: false` disables inherited deferred mounting for this form.
- A park-only object changes parking without changing the inherited mounting mode. Use `{ park: false }` to opt out or `{ park: true }` to opt in.

Use `withFieldWindowing()` at provider level when the same defaults should apply to every form. Per-form options take precedence.

## Placeholder templates

A deferred field shows an empty box until it mounts. To show a skeleton instead, put `<ng-template>` elements with `dfPlaceholder` inside the form and import `DfPlaceholder` in your component:

```html
<form [dynamic-form]="config">
  <ng-template dfPlaceholder let-field>
    <div class="skeleton">{{ field.label }}</div>
  </ng-template>
  <ng-template dfPlaceholder="textarea">
    <div class="skeleton skeleton--tall"></div>
  </ng-template>
  <ng-template dfPlaceholderKey="avatar">
    <div class="skeleton skeleton--circle"></div>
  </ng-template>
</form>
```

For each deferred field, the form picks the template whose `dfPlaceholderKey` matches the field key. If there is none, it uses the template whose `dfPlaceholder` matches the field type, then a template with an empty `dfPlaceholder`. If nothing matches, the box stays empty. `let-field` gives the template the field's `key`, `type`, `label` and `col`. `label` is only set when the field label is a plain string. Placeholders work in flat forms and inside pages, and render inside the box that already reserves `placeholderHeight`. The box is hidden from assistive technology and is inert, so nothing inside it can receive focus. Templates must be direct children of the form element.
