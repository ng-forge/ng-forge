---
title: Addon Password Toggle
slug: examples/addon-password-toggle
description: 'The toggle-password-visibility preset flips a password input between hidden and visible. Ships in every adapter with no handler code.'
---

The `'toggle-password-visibility'` preset flips the input s `type` attribute between `'password'` and `'text'`. The button addon writes to a per-field type-override signal provided by the adapter; the input reads the override when computing its effective `type`. Click the eye icon below to see the value reveal — then click again to hide.

## Live Demo

<docs-live-example scenario="examples/addon-password-toggle"></docs-live-example>

## Config

```typescript
{
  fields: [
    {
      key: 'password',
      type: 'input',
      label: 'Password',
      value: 'hunter2',
      props: { type: 'password' },
      addons: [
        {
          slot: 'suffix',
          kind: 'pi-button',
          icon: 'eye',
          ariaLabel: 'Toggle password visibility',
          preset: 'toggle-password-visibility',
        },
      ],
    },
  ],
}
```

The preset is a no-op (warning logged) outside an input-style field that exposes a type-override token. Every shipping `*-input` field provides one — Material via `MAT_INPUT_TYPE_OVERRIDE`, Bootstrap via `BS_INPUT_TYPE_OVERRIDE`, Ionic via `IONIC_INPUT_TYPE_OVERRIDE`, PrimeNG via `PRIME_INPUT_TYPE_OVERRIDE`. Custom field types opting into the preset declare an analogous token.

## What to read next

- **[Presets and Actions](/addons/presets-and-actions)** — the full preset table and `actionRef` recipe for registered handlers.
- **[Addons / Overview](/addons/overview)** — addon kinds and slots primer.
