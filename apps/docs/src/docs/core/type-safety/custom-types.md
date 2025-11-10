# Custom Types & Advanced Usage

Extending the type system with custom field types, runtime validation, and type guards.

## Custom Field Types

Extend `FieldRegistryLeaves` to add custom field types with full type safety:

### Step 1: Define Field Interfaces

Create type definitions for your custom fields:

```typescript
// custom-fields.d.ts
import type { FieldDef } from '@ng-forge/dynamic-form';

// Color picker field
export interface ColorPickerField extends FieldDef {
  type: 'color-picker';
  value: string;
  props?: {
    format?: 'hex' | 'rgb' | 'hsl';
    alpha?: boolean;
  };
}

// File upload field
export interface FileUploadField extends FieldDef {
  type: 'file-upload';
  value: File[];
  props?: {
    accept?: string;
    multiple?: boolean;
    maxSize?: number;
  };
}

// Rating field
export interface RatingField extends FieldDef {
  type: 'rating';
  value: number;
  props?: {
    max?: number;
    allowHalf?: boolean;
  };
}
```

### Step 2: Augment Field Registry

Register your types with the global registry:

```typescript
// custom-fields.d.ts (continued)
declare module '@ng-forge/dynamic-form' {
  interface FieldRegistryLeaves {
    'color-picker': ColorPickerField;
    'file-upload': FileUploadField;
    'rating': RatingField;
  }
}
```

This enables:
- TypeScript autocomplete for `type: 'color-picker'`
- Type checking for field properties
- Automatic type inference in `InferFormValue`

### Step 3: Create Field Components

Implement the component for each field type:

```typescript
// color-picker.component.ts
import { Component, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { ColorPickerField } from './custom-fields';

@Component({
  selector: 'df-color-picker',
  template: `
    <div class="color-picker-field">
      @if (label(); as label) {
        <label [for]="key()">{{ label }}</label>
      }
      <input
        type="color"
        [field]="field()"
        [id]="key()"
        [disabled]="field().disabled()"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColorPickerComponent {
  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();
  readonly label = input<string>();
  readonly props = input<ColorPickerField['props']>();
}
```

### Step 4: Register Field Type

Create field type definitions and register them:

```typescript
// custom-fields.provider.ts
import { FieldTypeDefinition, valueFieldMapper } from '@ng-forge/dynamic-form';
import type { ColorPickerField, FileUploadField, RatingField } from './custom-fields';

export const ColorPickerFieldType: FieldTypeDefinition<ColorPickerField> = {
  name: 'color-picker',
  loadComponent: () => import('./color-picker.component'),
  mapper: valueFieldMapper,
  valueHandling: 'include',
};

export const FileUploadFieldType: FieldTypeDefinition<FileUploadField> = {
  name: 'file-upload',
  loadComponent: () => import('./file-upload.component'),
  mapper: valueFieldMapper,
  valueHandling: 'include',
};

export const RatingFieldType: FieldTypeDefinition<RatingField> = {
  name: 'rating',
  loadComponent: () => import('./rating.component'),
  mapper: valueFieldMapper,
  valueHandling: 'include',
};
```

### Step 5: Provide Field Types

Add to your app configuration:

```typescript
// app.config.ts
import { provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '@ng-forge/dynamic-form-material';
import { ColorPickerFieldType, FileUploadFieldType, RatingFieldType } from './custom-fields.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    provideDynamicForm(
      ...withMaterialFields(),
      ColorPickerFieldType,
      FileUploadFieldType,
      RatingFieldType
    ),
  ],
};
```

### Step 6: Use Custom Fields

Now use your custom fields with full type safety:

```typescript
const config = {
  fields: [
    {
      key: 'brandColor',
      type: 'color-picker',
      value: '#000000',
      label: 'Brand Color',
      required: true,
      props: {
        format: 'hex',
        alpha: true,
      },
    },
    {
      key: 'logo',
      type: 'file-upload',
      value: [],
      label: 'Company Logo',
      props: {
        accept: 'image/*',
        multiple: false,
        maxSize: 5242880, // 5MB
      },
    },
    {
      key: 'satisfaction',
      type: 'rating',
      value: 0,
      label: 'Overall Satisfaction',
      required: true,
      props: {
        max: 5,
        allowHalf: true,
      },
    },
  ],
} as const satisfies FormConfig;

// Inferred type:
// {
//   brandColor: string;
//   logo?: File[];
//   satisfaction: number;
// }
```

## Runtime Type Guards

Use type guards to check field categories at runtime:

### Available Type Guards

```typescript
import {
  isContainerField,
  isLeafField,
  isValueBearingField,
  isDisplayOnlyField,
  isPageField,
  isRowField,
  isGroupField,
} from '@ng-forge/dynamic-form';
```

### Container vs Leaf Fields

```typescript
function processField(field: RegisteredFieldTypes) {
  if (isContainerField(field)) {
    // field is PageField | RowField | GroupField
    console.log('Container field:', field.type);
    console.log('Children:', field.fields.length);
  }

  if (isLeafField(field)) {
    // field is not a container (input, select, button, text, etc.)
    console.log('Leaf field:', field.type);
  }
}
```

### Value-Bearing vs Display-Only

```typescript
function analyzeField(field: RegisteredFieldTypes) {
  if (isValueBearingField(field)) {
    // field has a 'value' property (input, select, checkbox, etc.)
    console.log('Field value:', field.value);
    console.log('Field key:', field.key);
  }

  if (isDisplayOnlyField(field)) {
    // field doesn't contribute to form values (text, button, containers)
    console.log('Display-only field:', field.type);
  }
}
```

### Specific Container Checks

```typescript
function processContainers(field: RegisteredFieldTypes) {
  if (isPageField(field)) {
    console.log('Page with', field.fields.length, 'children');
    console.log('Page title:', field.title);
  }

  if (isRowField(field)) {
    console.log('Row with', field.fields.length, 'columns');
  }

  if (isGroupField(field)) {
    console.log('Group key:', field.key);
    console.log('Group label:', field.label);
  }
}
```

### Complete Example

```typescript
import {
  isContainerField,
  isValueBearingField,
  isPageField,
} from '@ng-forge/dynamic-form';

function collectFormKeys(fields: RegisteredFieldTypes[]): string[] {
  const keys: string[] = [];

  for (const field of fields) {
    // Skip pages (they're containers but don't have keys)
    if (isPageField(field)) {
      keys.push(...collectFormKeys(field.fields));
      continue;
    }

    // Process value-bearing fields
    if (isValueBearingField(field)) {
      keys.push(field.key);
    }

    // Recursively process other containers
    if (isContainerField(field) && !isPageField(field)) {
      keys.push(...collectFormKeys(field.fields));
    }
  }

  return keys;
}
```

## Runtime Validation

Form values are typed at compile-time via `InferFormValue`, but runtime validation may be needed:

### Type Assertion (Trust Form Structure)

If you trust the form structure, cast the value:

```typescript
import { InferFormValue } from '@ng-forge/dynamic-form';

const USER_FORM = {
  fields: [
    { key: 'username', type: 'input', value: '', required: true },
    { key: 'email', type: 'input', value: '', required: true },
    { key: 'age', type: 'input', value: 0 },
  ],
} as const satisfies FormConfig;

type UserFormValue = InferFormValue<typeof USER_FORM['fields']>;

function onSubmit(value: unknown) {
  // Cast to inferred type
  const data = value as UserFormValue;

  console.log(data.username); // string
  console.log(data.email);    // string
  console.log(data.age);      // number | undefined
}
```

### Runtime Validation with Zod

For runtime guarantees, use a validation library like Zod:

```typescript
import { z } from 'zod';
import { InferFormValue } from '@ng-forge/dynamic-form';

const USER_FORM = {
  fields: [
    { key: 'username', type: 'input', value: '', required: true },
    { key: 'email', type: 'input', value: '', required: true },
    { key: 'age', type: 'input', value: 0 },
  ],
} as const satisfies FormConfig;

// Define Zod schema matching form structure
const userSchema = z.object({
  username: z.string().min(1),
  email: z.string().email(),
  age: z.number().optional(),
});

function onSubmit(value: unknown) {
  // Runtime validation
  const result = userSchema.safeParse(value);

  if (!result.success) {
    console.error('Validation failed:', result.error);
    return;
  }

  // Type-safe access
  const data = result.data;
  console.log(data.username); // string
  console.log(data.email);    // string
  console.log(data.age);      // number | undefined
}
```

### Combining Compile-Time and Runtime

Use both for maximum safety:

```typescript
import { z } from 'zod';
import { InferFormValue } from '@ng-forge/dynamic-form';

const REGISTRATION_FORM = {
  fields: [
    { key: 'username', type: 'input', value: '', required: true },
    { key: 'email', type: 'input', value: '', required: true },
    { key: 'password', type: 'input', value: '', required: true },
    { key: 'confirmPassword', type: 'input', value: '', required: true },
  ],
} as const satisfies FormConfig;

// Compile-time type
type RegistrationValue = InferFormValue<typeof REGISTRATION_FORM['fields']>;

// Runtime schema (with additional validation)
const registrationSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

@Component({...})
export class RegistrationComponent {
  config = REGISTRATION_FORM;

  // Compile-time type for signal
  formValue = signal<RegistrationValue>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  onSubmit() {
    const value = this.formValue();

    // Runtime validation with cross-field check
    const result = registrationSchema.safeParse(value);

    if (!result.success) {
      console.error('Validation failed:', result.error);
      return;
    }

    // Safe to use
    this.register(result.data);
  }
}
```

## Type-Safe Validation

ng-forge integrates validation with the type system. Validators affect the inferred type:

### Shorthand Validators

Shorthand validators are simple and affect type inference:

```typescript
const config = {
  fields: [
    {
      key: 'email',
      type: 'input',
      value: '',
      required: true,    // Removes undefined from type
      email: true,       // Email validation
      minLength: 5,      // Min length validation
    },
  ],
} as const satisfies FormConfig;

// Type inferred: { email: string } (required, so no undefined)
```

### Validator Array

For complex validation, use the `validators` array:

```typescript
const config = {
  fields: [
    {
      key: 'discount',
      type: 'input',
      value: 0,
      validators: [
        {
          type: 'min',
          value: 0,
          errorMessage: 'Discount cannot be negative',
        },
        {
          type: 'max',
          value: 100,
          when: {
            type: 'fieldValue',
            fieldPath: 'discountType',
            operator: 'equals',
            value: 'percentage',
          },
          errorMessage: 'Percentage discount cannot exceed 100',
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

### Conditional Required

Use the `logic` array for conditional required fields:

```typescript
const config = {
  fields: [
    { key: 'accountType', type: 'select', value: '', options: [] },
    {
      key: 'taxId',
      type: 'input',
      value: '',
      logic: [{
        type: 'required',
        condition: {
          type: 'fieldValue',
          fieldPath: 'accountType',
          operator: 'equals',
          value: 'business',
        },
        errorMessage: 'Tax ID required for business accounts',
      }],
    },
  ],
} as const satisfies FormConfig;

// Type: { accountType?: string; taxId?: string }
// Note: Conditional required doesn't affect type inference
```

For more details, see [Validation](/core-concepts/validation/basics).

## Advanced Patterns

### Generic Field Type

Create reusable field types with generics:

```typescript
// autocomplete-field.d.ts
import type { FieldDef } from '@ng-forge/dynamic-form';

export interface AutocompleteField<T = string> extends FieldDef {
  type: 'autocomplete';
  value: T | null;
  options: Array<{ value: T; label: string }>;
  props?: {
    filterFn?: (value: T, query: string) => boolean;
    displayFn?: (value: T) => string;
  };
}

declare module '@ng-forge/dynamic-form' {
  interface FieldRegistryLeaves {
    autocomplete: AutocompleteField<unknown>;
  }
}
```

Usage:

```typescript
interface User {
  id: number;
  name: string;
}

const config = {
  fields: [
    {
      key: 'assignee',
      type: 'autocomplete',
      value: null,
      options: [
        { value: { id: 1, name: 'John' }, label: 'John' },
        { value: { id: 2, name: 'Jane' }, label: 'Jane' },
      ],
    } as AutocompleteField<User>,
  ],
} as const satisfies FormConfig;

// Inferred: { assignee?: User | null }
```

### Container Custom Fields

Create custom container fields:

```typescript
// accordion-field.d.ts
import type { FieldDef, FieldTypes } from '@ng-forge/dynamic-form';

export interface AccordionField extends FieldDef {
  type: 'accordion';
  sections: Array<{
    title: string;
    fields: FieldTypes[];
  }>;
}

declare module '@ng-forge/dynamic-form' {
  interface FieldRegistryContainers {
    accordion: AccordionField;
  }
}
```

## Best Practices

### Organize Custom Types

Keep type definitions separate from implementations:

```
src/
├── custom-fields/
│   ├── types/
│   │   ├── color-picker.d.ts
│   │   ├── file-upload.d.ts
│   │   └── rating.d.ts
│   ├── components/
│   │   ├── color-picker.component.ts
│   │   ├── file-upload.component.ts
│   │   └── rating.component.ts
│   ├── providers/
│   │   └── custom-fields.provider.ts
│   └── index.ts
```

### Document Custom Props

Provide JSDoc comments for custom field properties:

```typescript
export interface ColorPickerField extends FieldDef {
  type: 'color-picker';
  value: string;
  props?: {
    /** Color format: 'hex', 'rgb', or 'hsl'. Default: 'hex' */
    format?: 'hex' | 'rgb' | 'hsl';

    /** Enable alpha channel (transparency). Default: false */
    alpha?: boolean;

    /** Predefined color palette */
    palette?: string[];
  };
}
```

### Export Helper Functions

Create helper functions for common field configurations:

```typescript
// helpers.ts
import type { ColorPickerField, RatingField } from './types';

export function colorPicker(
  key: string,
  label: string,
  options?: Partial<ColorPickerField>
): ColorPickerField {
  return {
    type: 'color-picker',
    key,
    label,
    value: '#000000',
    ...options,
  };
}

export function rating(
  key: string,
  label: string,
  options?: Partial<RatingField>
): RatingField {
  return {
    type: 'rating',
    key,
    label,
    value: 0,
    props: { max: 5 },
    ...options,
  };
}

// Usage:
const config = {
  fields: [
    colorPicker('brandColor', 'Brand Color', { required: true }),
    rating('satisfaction', 'How satisfied are you?', {
      props: { max: 10, allowHalf: true }
    }),
  ],
} as const satisfies FormConfig;
```

## Related

- **[Type Safety Basics](/core-concepts/type-safety/basics)** - Foundation of type inference
- **[Container Fields](/core-concepts/type-safety/containers)** - Understanding containers
- **[Custom Integration Guide](/ui-libs-integrations/guide)** - Building UI adapter packages
- **[Validation](/core-concepts/validation/basics)** - Type-safe validation
