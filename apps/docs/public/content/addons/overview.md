---
title: Addons
slug: addons/overview
description: 'Render icons, buttons, or text inside a field s prefix and suffix slots. Addons are typed, JSON-safe, and ship for all four UI adapters with built-in presets for clear, reset, paste, copy, and password toggle.'
---

Addons decorate a field with inline content — a search icon, a clear button, a currency symbol, a password-visibility toggle — placed in the field s `prefix` or `suffix` slot. They re typed, JSON-safe, and uniform across all four UI adapters.

## Quick shape

```typescript
{
  key: 'search',
  type: 'input',
  label: 'Search',
  addons: [
    { slot: 'prefix', kind: 'pi-icon', icon: 'search', ariaLabel: 'Search' },
    { slot: 'suffix', kind: 'pi-button', icon: 'times', ariaLabel: 'Clear', preset: 'clear' },
  ],
}
```

## Live example

<docs-live-example scenario="examples/addon-clear-button"></docs-live-example>

The same config shape works on every adapter — only the `kind` value changes (`mat-icon` / `mat-button` for Material, `bs-icon` / `bs-button` for Bootstrap, `ion-icon` / `ion-button` for Ionic, `pi-icon` / `pi-button` for PrimeNG). The library translates `slot: 'prefix' | 'suffix'` into the right rendering per adapter — Material uses `matPrefix` / `matSuffix` directives; Bootstrap switches to a `.input-group` wrapper; Ionic projects through shadow-DOM slots.

## Built-in kinds

Every adapter accepts these universal kinds:

- **`text`** — static or reactive text inside a span. Works the same in every adapter:

  ```typescript
  { slot: 'prefix', kind: 'text', text: '$' }
  ```

- **`template`** — render content from a named `<ng-template>` declared in the host component. JSON-safe; the config carries the template key, the front-end supplies the template.

- **`component`** — render an arbitrary Angular component. Code-only — dropped from JSON-derived configs by the validator.

Each adapter additionally ships icon and button kinds:

| Adapter   | Icon kind  | Button kind  | Icon source                                              |
| --------- | ---------- | ------------ | -------------------------------------------------------- |
| PrimeNG   | `pi-icon`  | `pi-button`  | PrimeIcons (`<i class="pi pi-search">`)                  |
| Material  | `mat-icon` | `mat-button` | Material Icons ligatures (`<mat-icon>search</mat-icon>`) |
| Bootstrap | `bs-icon`  | `bs-button`  | Bootstrap Icons (`<i class="bi bi-search">`)             |
| Ionic     | `ion-icon` | `ion-button` | Ionicons (`<ion-icon name="search-outline">`)            |

The icon and button kinds for the adapter you ve installed are pre-registered by `with{Adapter}Fields()` — no extra setup.

## Reactive `hidden` and `disabled`

Both axes accept `boolean | Signal<boolean> | Observable<boolean>` (`DynamicValue<boolean>`). The classic "show clear button only when input has value" pattern:

```typescript
const hasValue = computed(() => (formValue()?.search?.length ?? 0) > 0);

{
  slot: 'suffix',
  kind: 'pi-button',
  icon: 'times',
  ariaLabel: 'Clear',
  preset: 'clear',
  hidden: computed(() => !hasValue()),
}
```

When `hidden` resolves to `true` the addon stays in DOM but is `display: none` — cheaper than tearing down the component, and the reactive transition is instant.

## Slot vocabulary

Slot names are universal across adapters. Use `'prefix'` for the leading edge and `'suffix'` for the trailing edge. The adapter handles the translation internally:

- Material: addons render as direct `<mat-form-field>` children with `matPrefix` / `matSuffix` attribute directives.
- Bootstrap: the input switches to a `<div class="input-group">` wrapper when any addon is present; addons render in `<span class="input-group-text">` flanking the input. The floating-label branch nests `<div class="form-floating">` inside the group.
- Ionic: addons render as `<span slot="start">` / `<span slot="end">` wrappers inside `<ion-input>` for shadow-DOM projection.
- PrimeNG: the input switches to a `<p-inputgroup>` wrapper with `<p-inputgroup-addon>` flanking the input.

The wrapper is **dropped entirely** when every addon is reactively hidden — no empty group element.

## Where to next

1. **[Presets and Actions](/addons/presets-and-actions)** — built-in click presets (`clear`, `reset`, `paste`, `copy`, `toggle-password-visibility`), `actionRef` for registered handlers, and inline `action` for code-only behaviour.
2. **[Custom Kinds](/addons/custom-kinds)** — register your own addon kind (rating widget, status pill, anything) with `withCustomAddon(...)` and augment the type-level `*InputAddonExtensions` seam.

## Accessibility

Icon kinds emit `aria-hidden="true"` by default. When the icon conveys meaning (status, action), set `ariaLabel`:

```typescript
{ slot: 'prefix', kind: 'mat-icon', icon: 'warning', ariaLabel: 'Validation warning' }
```

Icon-only button kinds (no `label`) require `ariaLabel` — TypeScript and the runtime validator both enforce this.
