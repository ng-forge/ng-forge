---
description: 'Wrap an array and its add/remove buttons with a custom section wrapper — title, framing, and action chrome without changing the array config.'
---

Wrappers are a natural home for the chrome around an array: titles, counts, action toolbars, surrounding cards. Because wrappers attach to any field, you can frame the array itself _and_ the add-button that feeds it without teaching the array (or the button) about presentation.

## Live Demo

<docs-live-example scenario="examples/wrapper-array-actions"></docs-live-example>

## What it shows

- A `section` wrapper around the array gives the whole list a titled frame.
- A second `section` wrapper around the `addArrayItem` button groups the toolbar visually — the same wrapper infrastructure works on any field, including action buttons.
- The array config itself stays presentation-free: no card markup, no header styling, no manual spacing.

## Implementation

```typescript
import { DynamicForm, FormConfig } from '@ng-forge/dynamic-forms';

const tagItemTemplate = {
  key: 'tag',
  type: 'row',
  fields: [
    { key: 'value', type: 'input', label: 'Tag', required: true, minLength: 2 },
    { key: 'removeTag', type: 'removeArrayItem', label: 'Remove', props: { color: 'warn' } },
  ],
} as const;

const config = {
  fields: [
    {
      key: 'tags',
      type: 'array',
      wrappers: [{ type: 'section', title: 'Tags' }],
      fields: [
        // …starting items…
      ],
    },
    {
      key: 'addTagButton',
      type: 'addArrayItem',
      label: 'Add tag',
      arrayKey: 'tags',
      template: [tagItemTemplate],
      wrappers: [{ type: 'section', title: 'Actions' }],
    },
    { key: 'submit', type: 'submit', label: 'Save' },
  ],
} as const satisfies FormConfig;
```

## Why use a wrapper here

- **Keeps array config focused** — the array owns data shape; the wrapper owns UI chrome.
- **Reusable across forms** — register a `section` (or your own `card` / `collapsible`) wrapper once and apply it wherever you need the same framing.
- **Per-field opt-out still works** — inner items can set `wrappers: null` to skip the frame if needed.

## Related Documentation

- **[Wrappers overview](/wrappers/overview)** — concept and built-ins
- **[Registering and applying wrappers](/wrappers/registering-and-applying)** — `defaultWrappers`, per-field, auto-associations
- **[Complete Array API](/prebuilt/form-arrays/complete)** — full array reference
