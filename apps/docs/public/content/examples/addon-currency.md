---
title: Addon Currency
slug: examples/addon-currency
description: 'Universal text addons: a dollar sign in the prefix slot and a USD label in the suffix slot. Single config, no per-adapter branching.'
---

When the addon content is just text, use `type: 'text'`. It works the same in every adapter without any per-adapter branching. The config object below is byte-identical regardless of which UI library renders it.

## Live Demo

<docs-live-example scenario="examples/addon-currency"></docs-live-example>

## Config

```typescript
{
  fields: [
    {
      key: 'amount',
      type: 'input',
      label: 'Amount',
      value: '99.00',
      addons: [
        { slot: 'prefix', type: 'text', text: '$' },
        { slot: 'suffix', type: 'text', text: 'USD' },
      ],
    },
  ],
}
```

`text` is one of three universal types (alongside `template` and `component`) registered by core. The icon and button types (`mat-icon`, `prime-button`, and so on) are per-adapter, but for simple labels and currency markers the universal `text` type is the lowest-friction choice.

## What to read next

- **[Addons / Overview](/addons/overview)**: types catalog, slots, reactive `hidden`.
- **[Addon Clear Button](/examples/addon-clear-button)**: the adapter-specific icon + button pattern.
