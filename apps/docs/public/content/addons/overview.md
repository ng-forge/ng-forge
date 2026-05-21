---
title: Addons
slug: addons/overview
description: 'Render icons, buttons, or text inside a fields prefix and suffix slots. Addons are typed, JSON-safe, with built-in presets for clear, reset, paste, copy, and password toggle.'
---

Addons decorate a field with inline content — a search icon, a clear button, a currency symbol, a password-visibility toggle — placed in the field s `prefix` or `suffix` slot. They re typed, JSON-safe, and ship as a first-class feature of every UI adapter.

> **Prerequisites.** Addons attach to a field, not the form. You need a working ng-forge setup first: `provideDynamicForm(...with{Adapter}Fields())` at the application config and a `[dynamic-form]`-bearing form using a field type that supports addons (today: every adapter's `input`). See [Getting Started](/getting-started) if you re new to ng-forge.

## Quickstart

<docs-addon-info field="quickstart"></docs-addon-info>

## Live example

<docs-live-example scenario="examples/addon-clear-button"></docs-live-example>

A universal addon (works the same in every adapter, no per-kind branching):

<docs-live-example scenario="examples/addon-currency"></docs-live-example>

## Available kinds

<docs-addon-info field="kinds-table"></docs-addon-info>

## How addons render

<docs-addon-info field="rendering-mechanism"></docs-addon-info>

The wrapper is dropped entirely when every addon is reactively hidden — no empty group element.

## Provider setup

<docs-addon-info field="provider-setup"></docs-addon-info>

## Reactive `hidden` and `disabled`

Both axes accept `DynamicValue<boolean>` — any of `boolean`, `Signal<boolean>`, or `Observable<boolean>`. Four equivalent shapes for the same toggle:

```typescript
{ ..., hidden: true }                              // Static — JSON-safe.
{ ..., hidden: signal(false) }                     // Signal — code-only.
{ ..., hidden: computed(() => !hasValue()) }       // Derived — code-only.
{ ..., hidden: visibility$ }                       // Observable — code-only.
```

The classic "show clear button only when input has value" pattern, in your active adapter:

<docs-addon-info field="reactive-hidden-snippet"></docs-addon-info>

When `hidden` resolves to `true` the addon stays in DOM but is `display: none` — cheaper than tearing down the component, and the reactive transition is instant.

Authoring forms in JSON? Reactive values can't survive serialization — see [Reactive addons from JSON](/addons/presets-and-actions#reactive-from-json).

## Accessibility

Icon kinds emit `aria-hidden="true"` by default. When the icon conveys meaning (status, action), set `ariaLabel`. Icon-only button kinds (no `label`) require `ariaLabel` — TypeScript and the runtime validator both enforce this.

## Troubleshooting

- **Addon doesn t render at all.** Check the console for `[Dynamic Forms]` warnings. Common causes: the active adapter s `with*Fields()` helper isn t in `provideDynamicForm`; the `kind` string belongs to a different adapter (e.g. `prime-button` in a Material form); the host field type doesn t support addons.
- **Icon-only button has no `ariaLabel`.** TypeScript and the runtime validator both refuse this — set `ariaLabel`. For genuinely decorative icons, prefer `kind: 'text'` or the adapter s `*-icon` kind.
- **`actionRef` warning at click time.** The handler name isn t registered. Did you call `provideAddonActions({ runSearch: ... })` for that name?
- **Inline function silently dropped.** Configs with `source: 'json'` strip functions on `action`, `hidden`, `disabled`, `loading` at validation time — they cant round-trip through JSON. See [Reactive addons from JSON](/addons/presets-and-actions#reactive-from-json).
- **Material `MatFormFieldControl` ContentChild missing.** Caused by wrapping the input in a template that breaks Material s content-projection query. Render `<input matInput>` directly inside `<mat-form-field>`.

## Where to next

1. **[Presets and Actions](/addons/presets-and-actions)** — built-in click presets (`clear`, `reset`, `paste`, `copy`, `toggle-password-visibility`), `actionRef` for registered handlers, and inline `action` for code-only behaviour.
2. **[Custom Kinds](/addons/custom-kinds)** — register your own addon kind (rating widget, status pill, anything) with `withCustomAddon(...)` and augment the type-level extensions seam.
