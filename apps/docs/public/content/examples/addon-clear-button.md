---
title: Addon Clear Button
slug: examples/addon-clear-button
description: 'Canonical addon pattern — an icon in the prefix slot and a clear-preset button in the suffix slot. JSON-safe and works the same on every adapter.'
---

The canonical addon pattern: a search icon in the prefix slot, a clear button in the suffix slot. The button uses the built-in `'clear'` preset — no handler code required. Switch the adapter at the top of the page and the same config renders through each adapter s native projection mechanism (`matPrefix` / `matSuffix` for Material, `.input-group` for Bootstrap, `slot="start|end"` for Ionic, `<p-inputgroup>` for PrimeNG).

## Live Demo

<docs-live-example scenario="examples/addon-clear-button"></docs-live-example>

## Config

```typescript
{
  fields: [
    {
      key: 'search',
      type: 'input',
      label: 'Search',
      value: 'initial value',
      placeholder: 'Type to search…',
      addons: [
        { slot: 'prefix', kind: 'pi-icon',   icon: 'search', ariaLabel: 'Search' },
        { slot: 'suffix', kind: 'pi-button', icon: 'times',  ariaLabel: 'Clear', preset: 'clear' },
      ],
    },
  ],
}
```

The `kind` strings (`pi-icon`, `pi-button`) are adapter-specific. Swap them per adapter:

| Adapter   | Icon kind  | Button kind  | Icon `search`    | Icon `clear`    |
| --------- | ---------- | ------------ | ---------------- | --------------- |
| PrimeNG   | `pi-icon`  | `pi-button`  | `search`         | `times`         |
| Material  | `mat-icon` | `mat-button` | `search`         | `close`         |
| Bootstrap | `bs-icon`  | `bs-button`  | `search`         | `x`             |
| Ionic     | `ion-icon` | `ion-button` | `search-outline` | `close-outline` |

## What to read next

- **[Addons / Overview](/addons/overview)** — kinds, slots, reactive `hidden` / `disabled`.
- **[Presets and Actions](/addons/presets-and-actions)** — the five built-in presets and how to register your own via `actionRef`.
