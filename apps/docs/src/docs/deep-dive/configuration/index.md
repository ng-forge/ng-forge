> Prerequisites: [Installation](../../installation)

Configure ng-forge dynamic forms behavior at the application level using provider features.

## Overview

ng-forge uses a feature-based configuration pattern similar to Angular's `provideRouter()`. Features are optional add-ons that modify the library's behavior globally.

```typescript
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';

export const appConfig: ApplicationConfig = {
  providers: [
    provideDynamicForm(
      ...withMaterialFields(),
      // Logging is enabled by default
    ),
  ],
};
```

**Three Levels of Configuration:**

| Level       | Scope     | Where                     | Examples                                          |
| ----------- | --------- | ------------------------- | ------------------------------------------------- |
| **Library** | App-wide  | `withXXXFields({ ... })`  | `appearance`, `size`, `color`, `variant`          |
| **Form**    | Per-form  | `FormConfig.defaultProps` | Same options as library-level, scoped to one form |
| **Field**   | Per-field | `field.props`             | Override any prop on individual fields            |

---

## Default Props Cascade

Configure default styling for all fields at the library or form level. Props cascade in this order, with each level overriding the previous:

**Library-level → Form-level → Field-level**

### Library-Level Configuration

Set defaults for all forms in your application by passing a config object to your UI library's `withXXXFields()` function:

```typescript
// app.config.ts
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withMaterialFields } from '@ng-forge/dynamic-forms-material';

export const appConfig: ApplicationConfig = {
  providers: [
    provideDynamicForm(
      ...withMaterialFields({
        appearance: 'outline',
        color: 'accent',
      }),
    ),
  ],
};
```

### Form-Level Configuration

Override library defaults for a specific form using `defaultProps`:

```typescript
import { MatFormConfig } from '@ng-forge/dynamic-forms-material';

const formConfig: MatFormConfig = {
  defaultProps: {
    appearance: 'fill',
    color: 'primary',
  },
  fields: [
    { key: 'name', type: 'input', label: 'Name' },
    { key: 'email', type: 'input', label: 'Email' },
  ],
};
```

### Field-Level Override

Override form defaults on individual fields using the `props` property:

```typescript
const formConfig: MatFormConfig = {
  defaultProps: {
    appearance: 'fill',
  },
  fields: [
    { key: 'name', type: 'input', label: 'Name' }, // Uses 'fill'
    { key: 'email', type: 'input', label: 'Email', props: { appearance: 'outline' } }, // Overrides to 'outline'
  ],
};
```

### Library-Specific Options

Each UI library has its own set of configurable options. See the integration guides for available options:

- [Material Design](../../ui-libs-integrations/material) - `appearance`, `color`, `subscriptSizing`, `labelPosition`, `disableRipple`
- [Bootstrap](../../ui-libs-integrations/bootstrap) - `size`, `floatingLabel`
- [PrimeNG](../../ui-libs-integrations/primeng) - `size`, `variant`, `severity`, `text`, `outlined`, `raised`, `rounded`
- [Ionic](../../ui-libs-integrations/ionic) - `fill`, `shape`, `labelPlacement`, `color`, `size`, `expand`, `buttonFill`, `strong`

---

## Logging

Control how ng-forge logs diagnostic information using `withLoggerConfig()`.

By default, ng-forge logs all messages to the console. No configuration is needed.

```typescript
import { provideDynamicForm, withLoggerConfig } from '@ng-forge/dynamic-forms';

// Disable logging entirely
provideDynamicForm(...withMaterialFields(), withLoggerConfig(false));

// Conditional logging (e.g., only in dev mode)
provideDynamicForm(
  ...withMaterialFields(),
  withLoggerConfig(() => isDevMode()),
);
```

You can also provide your own logger implementation by providing a value for the `DynamicFormLogger` injection token.

## Next Steps

- **[Field Types](../core/field-types)** - Explore available field types
- **[Validation](../core/validation)** - Configure validation rules
- **[Custom Validators](../core/validation/custom-validators)** - Register custom validation functions
