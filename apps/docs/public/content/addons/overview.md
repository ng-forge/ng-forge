---
title: Addons
slug: addons/overview
description: 'Render icons, buttons, or text inside a fields prefix and suffix slots. Addons are typed, JSON-safe, with built-in presets for clear, reset, paste, copy, and password toggle.'
---

Addons decorate a field with inline content — a search icon, a clear button, a currency symbol, a password-visibility toggle — placed in the field s `prefix` or `suffix` slot. They re typed, JSON-safe, and ship as a first-class feature of every UI adapter.

## Quickstart

<docs-addon-info field="quickstart"></docs-addon-info>

## Live example

<docs-live-example scenario="examples/addon-clear-button"></docs-live-example>

## Available kinds

<docs-addon-info field="kinds-table"></docs-addon-info>

## How addons render

<docs-addon-info field="rendering-mechanism"></docs-addon-info>

The wrapper is dropped entirely when every addon is reactively hidden — no empty group element.

## Provider setup

<docs-addon-info field="provider-setup"></docs-addon-info>

## Reactive `hidden` and `disabled`

Both axes accept `boolean | Signal<boolean> | Observable<boolean>` (`DynamicValue<boolean>`). The classic "show clear button only when input has value" pattern:

```typescript
const hasValue = computed(() => (formValue()?.search?.length ?? 0) > 0);

{
  slot: 'suffix',
  kind: 'pi-button', // or mat-button / bs-button / ion-button
  icon: 'times',
  ariaLabel: 'Clear',
  preset: 'clear',
  hidden: computed(() => !hasValue()),
}
```

When `hidden` resolves to `true` the addon stays in DOM but is `display: none` — cheaper than tearing down the component, and the reactive transition is instant.

## Accessibility

Icon kinds emit `aria-hidden="true"` by default. When the icon conveys meaning (status, action), set `ariaLabel`. Icon-only button kinds (no `label`) require `ariaLabel` — TypeScript and the runtime validator both enforce this.

## Where to next

1. **[Presets and Actions](/addons/presets-and-actions)** — built-in click presets (`clear`, `reset`, `paste`, `copy`, `toggle-password-visibility`), `actionRef` for registered handlers, and inline `action` for code-only behaviour.
2. **[Custom Kinds](/addons/custom-kinds)** — register your own addon kind (rating widget, status pill, anything) with `withCustomAddon(...)` and augment the type-level extensions seam.
