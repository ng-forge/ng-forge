Value exclusion controls which field values are included in the form submission output based on the field's reactive state (hidden, disabled, readonly).

## Overview

By default, field values are **excluded** from the `(submitted)` output when the field is hidden, disabled, or readonly. This prevents stale or irrelevant data from being sent to the server.

**Key point:** Value exclusion only affects the submission output. Internal form controls retain their values so they can be restored when a field becomes visible, enabled, or editable again. Two-way binding via `[value]` / `[(value)]` is **not affected**.

## Default Behavior

When no configuration is specified, the defaults are:

| Rule                     | Default | Effect                                              |
| ------------------------ | ------- | --------------------------------------------------- |
| `excludeValueIfHidden`   | `true`  | Hidden field values are excluded from submission    |
| `excludeValueIfDisabled` | `true`  | Disabled field values are excluded from submission  |
| `excludeValueIfReadonly` | `true`  | Read-only field values are excluded from submission |

> **Breaking change from pre-1.0:** Previously, all field values were always included. To restore the old behavior, see [Migration from Previous Versions](#migration-from-previous-versions).

## 3-Tier Configuration

Value exclusion supports a 3-tier configuration hierarchy. The most specific level wins for each property:

| Priority | Level  | Where to set                                    |
| -------- | ------ | ----------------------------------------------- |
| 1 (wins) | Field  | `excludeValueIf*` on individual `FieldDef`      |
| 2        | Form   | `excludeValueIf*` on `FormOptions`              |
| 3        | Global | `withValueExclusionDefaults()` feature function |

If a property is `undefined` at a given level, the next level down is checked.

## Global Configuration

Use `withValueExclusionDefaults()` in your provider setup to configure global defaults:

```typescript
import { provideDynamicForm, withValueExclusionDefaults } from '@ng-forge/dynamic-forms';

// All exclusions enabled (same as default)
provideDynamicForm(...withMaterialFields(), withValueExclusionDefaults());

// Disable readonly exclusion globally
provideDynamicForm(...withMaterialFields(), withValueExclusionDefaults({ excludeValueIfReadonly: false }));

// Disable all exclusions globally (pre-1.0 behavior)
provideDynamicForm(
  ...withMaterialFields(),
  withValueExclusionDefaults({
    excludeValueIfHidden: false,
    excludeValueIfDisabled: false,
    excludeValueIfReadonly: false,
  }),
);
```

## Form-Level Configuration

Override the global setting for a specific form using `FormOptions`:

```typescript
const config: FormConfig = {
  fields: [...],
  options: {
    // Include hidden field values for this form only
    excludeValueIfHidden: false,
    // Use global default for disabled and readonly
  }
};
```

## Field-Level Configuration

Override both global and form settings for a specific field:

```typescript
const config: FormConfig = {
  fields: [
    {
      type: 'input',
      key: 'internalId',
      label: 'Internal ID',
      readonly: true,
      // Always include this field's value, even when readonly
      excludeValueIfReadonly: false,
    },
    {
      type: 'input',
      key: 'notes',
      label: 'Notes',
      // This field uses the form/global defaults
    },
  ],
};
```

## Resolution Example

Given these settings:

- **Global:** `excludeValueIfHidden: true`
- **Form:** `excludeValueIfHidden: false`
- **Field A:** `excludeValueIfHidden: undefined` (not set)
- **Field B:** `excludeValueIfHidden: true`

Resolution:

- **Field A** uses form-level (`false`) because field-level is `undefined` &rarr; value is **included** when hidden
- **Field B** uses field-level (`true`) &rarr; value is **excluded** when hidden

## HiddenField Type

The `HiddenField` type (`type: 'hidden'`) is **not affected** by value exclusion. These fields:

- Store values without rendering any UI
- Have a `hidden()` reactive state of `false` (they are part of the form, just not rendered)
- Are always included in submission output

Value exclusion applies to the `hidden` **property** on regular fields (e.g., `{ type: 'input', hidden: true }` or fields hidden via conditional logic), not to the `HiddenField` type.

## What's Excluded vs Retained

| Aspect                     | Affected by exclusion? | Details                                  |
| -------------------------- | ---------------------- | ---------------------------------------- |
| `(submitted)` output       | Yes                    | Excluded fields are omitted              |
| `filteredFormValue` signal | Yes                    | Same filtering as submission             |
| `formValue` signal         | No                     | Always contains all values               |
| `[(value)]` binding        | No                     | Two-way binding retains all values       |
| Internal form controls     | No                     | Fields keep their values for restoration |

## Migration from Previous Versions

If you relied on all field values being present in `(submitted)` output, disable exclusion globally:

```typescript
provideDynamicForm(
  ...withMaterialFields(),
  withValueExclusionDefaults({
    excludeValueIfHidden: false,
    excludeValueIfDisabled: false,
    excludeValueIfReadonly: false,
  }),
);
```

Or disable per-form via `FormOptions`:

```typescript
const config: FormConfig = {
  fields: [...],
  options: {
    excludeValueIfHidden: false,
    excludeValueIfDisabled: false,
    excludeValueIfReadonly: false,
  }
};
```
