> Prerequisites: [Getting Started](../../getting-started), [Field Types](../field-types)

ng-forge dynamic forms provides compile-time type inference for form configurations, eliminating manual type definitions and catching errors before runtime.

## Basic Type Inference

Use `as const` with `FormConfig` to enable type inference:

```typescript
import { FormConfig } from '@ng-forge/dynamic-form';

const formConfig = {
  fields: [
    { key: 'firstName', type: 'input', value: '' },
    { key: 'email', type: 'input', value: '' },
    { key: 'age', type: 'input', value: 0, props: { type: 'number' } },
    { key: 'newsletter', type: 'checkbox', value: false },
  ],
} as const satisfies FormConfig;

// Type is automatically inferred based on value property:
// { firstName?: string; email?: string; age?: number; newsletter?: boolean }
```

## Field Registry System

UI integrations register their field types via `provideDynamicForm`. For example, with Material Design:

```typescript
// app.config.ts
import { provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '@ng-forge/dynamic-form-material';

export const appConfig: ApplicationConfig = {
  providers: [
    provideDynamicForm(...withMaterialFields()),
    // other providers
  ],
};
```

Material fields augment the `FieldRegistryLeaves` interface for type safety:

```typescript
// From @ng-forge/dynamic-form-material (already included)
declare module '@ng-forge/dynamic-form' {
  interface FieldRegistryLeaves {
    input: MatInputField;
    select: MatSelectField<unknown>;
    checkbox: MatCheckboxField;
    // ... other Material fields
  }
}
```

This determines what field types are available and how they're inferred.

## Required vs Optional Fields

The `required` flag affects type inference:

```typescript
const config = {
  fields: [
    { key: 'email', type: 'input', value: '', required: true }, // string (required)
    { key: 'name', type: 'input', value: '' }, // string | undefined (optional)
    { key: 'age', type: 'input', value: 0, required: false }, // number | undefined (optional)
  ],
} as const satisfies FormConfig;

// Inferred type:
// {
//   email: string;           // Required - no undefined
//   name?: string;           // Optional - includes undefined
//   age?: number;            // Optional - includes undefined
// }
```

## Container Fields

Container fields organize form layout without contributing values. There are three types:

### Group Fields

Groups nest children under a single key:

```typescript
const config = {
  fields: [
    {
      type: 'group',
      key: 'address',
      fields: [
        { key: 'street', type: 'input', value: '' },
        { key: 'city', type: 'input', value: '' },
        { key: 'zip', type: 'input', value: '' },
      ],
    },
  ],
} as const satisfies FormConfig;

// Inferred type:
// {
//   address: {
//     street?: string;
//     city?: string;
//     zip?: string;
//   }
// }
```

### Row Fields

Rows organize fields horizontally, flattening children to parent level:

```typescript
const config = {
  fields: [
    {
      type: 'row',
      fields: [
        { key: 'firstName', type: 'input', value: '' },
        { key: 'lastName', type: 'input', value: '' },
      ],
    },
  ],
} as const satisfies FormConfig;

// Inferred type (flattened):
// {
//   firstName?: string;
//   lastName?: string;
// }
```

### Page Fields

Pages organize multi-step forms, flattening children like rows:

```typescript
const config = {
  fields: [
    {
      type: 'page',
      fields: [
        { key: 'email', type: 'input', value: '' },
        { key: 'password', type: 'input', value: '' },
      ],
    },
    {
      type: 'page',
      fields: [
        { key: 'firstName', type: 'input', value: '' },
        { key: 'lastName', type: 'input', value: '' },
      ],
    },
  ],
} as const satisfies FormConfig;

// Inferred type (all pages flattened):
// {
//   email?: string;
//   password?: string;
//   firstName?: string;
//   lastName?: string;
// }
```

## Nesting Rules

Container fields enforce nesting constraints at compile-time:

- **Pages** can contain: rows, groups, leaf fields (not other pages)
- **Rows** can contain: groups, leaf fields (not pages or rows)
- **Groups** can contain: rows, leaf fields (not pages or groups)

```typescript
// ✓ Valid nesting
const validConfig = {
  fields: [
    {
      type: 'page',
      fields: [
        {
          type: 'row',
          fields: [
            { key: 'field1', type: 'input', value: '' },
            { key: 'field2', type: 'input', value: '' },
          ],
        },
        {
          type: 'group',
          key: 'section',
          fields: [{ key: 'field3', type: 'input', value: '' }],
        },
      ],
    },
  ],
} as const satisfies FormConfig;

// ✗ Invalid: page inside page (TypeScript error)
const invalidConfig = {
  fields: [
    {
      type: 'page',
      fields: [
        { type: 'page', fields: [] }, // Error!
      ],
    },
  ],
} as const satisfies FormConfig;
```

## IntelliSense Support

TypeScript provides autocomplete for form values:

```typescript
import { signal } from '@angular/core';
import { InferFormValue } from '@ng-forge/dynamic-form';

@Component({...})
export class UserFormComponent {
  config = {
    fields: [
      { key: 'username', type: 'input', value: '', required: true },
      { key: 'age', type: 'input', value: 0 },
    ]
  } as const satisfies FormConfig;

  formValue = signal<InferFormValue<typeof this.config.fields>>({
    username: '',
  });

  onSubmit() {
    const value = this.formValue();
    // IntelliSense suggests: username, age
    console.log(value.username);  // ✓ Type: string (required)
    console.log(value.age);       // ✓ Type: number | undefined (optional)
    console.log(value.invalid);   // ✗ TypeScript error
  }
}
```

## Value-Bearing vs Display Fields

Fields are categorized by whether they contribute to form values:

**Value-bearing fields** have a `value` property and contribute to output:

- `input`, `select`, `checkbox`, `textarea`, `datepicker`, `slider`, `toggle`, etc.

**Display-only fields** don't have values (layout/content):

- `text` - displays content
- `page`, `row`, `group` - container fields
- Custom display components

```typescript
const config = {
  fields: [
    { type: 'text', label: 'Enter your details:' }, // Excluded from values
    { key: 'name', type: 'input', value: '' }, // Included in values
    {
      type: 'row', // Excluded (container)
      fields: [
        { key: 'city', type: 'input', value: '' }, // Included
      ],
    },
  ],
} as const satisfies FormConfig;

// Inferred type (only value-bearing fields):
// {
//   name?: string;
//   city?: string;
// }
```

## Runtime Type Guards

Use type guards to check field categories at runtime:

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

function processField(field: RegisteredFieldTypes) {
  if (isContainerField(field)) {
    // field is PageField | RowField | GroupField
    console.log('Container field:', field.type);
  }

  if (isLeafField(field)) {
    // field is not a container
    console.log('Leaf field:', field.type);
  }

  if (isValueBearingField(field)) {
    // field has a 'value' property
    console.log('Value:', field.value);
  }

  if (isDisplayOnlyField(field)) {
    // field doesn't contribute to form values
    console.log('Display-only field');
  }

  // Specific container checks
  if (isPageField(field)) {
    console.log('Page with', field.fields.length, 'children');
  }
}
```

## Custom Field Types

Extend `FieldRegistryLeaves` for custom field types:

```typescript
// custom-fields.d.ts
import type { FieldDef } from '@ng-forge/dynamic-form';

// Define custom field interfaces
export interface ColorPickerField extends FieldDef {
  type: 'color-picker';
  value: string;
  props?: {
    format?: 'hex' | 'rgb';
  };
}

export interface FileUploadField extends FieldDef {
  type: 'file-upload';
  value: File[];
  props?: {
    accept?: string;
    multiple?: boolean;
  };
}

// Augment the registry for type safety
declare module '@ng-forge/dynamic-form' {
  interface FieldRegistryLeaves {
    'color-picker': ColorPickerField;
    'file-upload': FileUploadField;
  }
}
```

Register your custom field components:

```typescript
// custom-fields.provider.ts
import { FieldTypeDefinition } from '@ng-forge/dynamic-form';
import { ColorPickerComponent } from './color-picker.component';
import { FileUploadComponent } from './file-upload.component';
import type { ColorPickerField, FileUploadField } from './custom-fields';

export const ColorPickerFieldType: FieldTypeDefinition<ColorPickerField> = {
  name: 'color-picker',
  component: ColorPickerComponent,
};

export const FileUploadFieldType: FieldTypeDefinition<FileUploadField> = {
  name: 'file-upload',
  component: FileUploadComponent,
};

// app.config.ts
import { provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '@ng-forge/dynamic-form-material';
import { ColorPickerFieldType, FileUploadFieldType } from './custom-fields.provider';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(...withMaterialFields(), ColorPickerFieldType, FileUploadFieldType)],
};
```

Use in form config:

```typescript
const config = {
  fields: [
    {
      key: 'avatar',
      type: 'file-upload',
      value: [],
      props: { accept: 'image/*' },
    },
    {
      key: 'brandColor',
      type: 'color-picker',
      value: '#000000',
      props: { format: 'hex' },
    },
  ],
} as const satisfies FormConfig;

// Inferred type:
// { avatar?: File[]; brandColor?: string }
```

## Array Fields

Multi-select fields and multi-checkbox fields return arrays:

```typescript
const config = {
  fields: [
    {
      key: 'skills',
      type: 'select',
      value: [],
      props: { multiple: true },
      options: [
        { value: 'js', label: 'JavaScript' },
        { value: 'ts', label: 'TypeScript' },
      ],
    },
    {
      key: 'interests',
      type: 'multi-checkbox',
      value: [],
      options: [
        { value: 'sports', label: 'Sports' },
        { value: 'music', label: 'Music' },
      ],
    },
  ],
} as const satisfies FormConfig;

// Type: { skills?: string[]; interests?: string[] }
```

## Runtime Validation

Form values are typed via `InferFormValue` at compile-time, but come as `unknown` at runtime. You can cast to the inferred type if you trust the form structure, or re-validate if you need runtime guarantees:

```typescript
import { InferFormValue } from '@ng-forge/dynamic-form';

const USER_FORM = {
  fields: [
    { key: 'username', type: 'input', value: '', required: true },
    { key: 'email', type: 'input', value: '', required: true },
  ],
} as const satisfies FormConfig;

type UserFormValue = InferFormValue<typeof USER_FORM['fields']>;

onSubmit(value: unknown) {
  // Option 1: Cast if you trust the form structure
  const data = value as UserFormValue;

  // Option 2: Re-validate with a library like Zod for runtime guarantees
  // const result = userSchema.safeParse(value);
}
```

## Type-Safe Validation

ng-forge integrates validation with the type system. Use shorthand syntax for common validators:

```typescript
const config = {
  fields: [
    {
      key: 'email',
      type: 'input',
      value: '',
      required: true, // Shorthand: removes undefined from inferred type
      email: true, // Shorthand: email validation
      minLength: 5, // Shorthand: min length validation
    },
  ],
} as const satisfies FormConfig;

// Type inferred: { email: string } (required, so no undefined)
```

For custom error messages, use `validationMessages`:

```typescript
const config = {
  fields: [
    {
      key: 'password',
      type: 'input',
      value: '',
      required: true,
      minLength: 8,
      pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)',
      validationMessages: {
        required: 'Password is required',
        minLength: 'Password must be at least 8 characters',
        pattern: 'Must include uppercase, lowercase, and number',
      },
    },
  ],
} as const satisfies FormConfig;
```

For advanced validation scenarios (conditional validators, dynamic values), use the `validators` array:

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
          when: { expression: 'formValue.discountType === "percentage"' },
          errorMessage: 'Percentage discount cannot exceed 100',
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

See [Validation](../validation) for full validator details.

## Best Practices

**Use `as const satisfies FormConfig`:**

```typescript
// ✓ Enables inference + type checking
const config = { fields: [...] } as const satisfies FormConfig;

// ✗ No inference
const config = { fields: [...] };
```

**Define configs as constants:**

```typescript
// form-configs.ts
export const USER_FORM = {
  fields: [
    { key: 'name', type: 'input', value: '', required: true },
    { key: 'email', type: 'input', value: '', required: true },
  ],
} as const satisfies FormConfig;
```

**Include `value` property for type inference:**

```typescript
// ✓ Type inferred from value
const config = {
  fields: [
    { key: 'age', type: 'input', value: 0 }, // number
    { key: 'name', type: 'input', value: '' }, // string
    { key: 'active', type: 'checkbox', value: false }, // boolean
  ],
} as const satisfies FormConfig;

// ✗ Without value, type inference may not work correctly
const config = {
  fields: [
    { key: 'age', type: 'input' }, // Type unclear
  ],
} as const satisfies FormConfig;
```

**Use proper nesting:**

```typescript
// ✓ Use group fields for nesting
const config = {
  fields: [
    {
      type: 'group',
      key: 'address',
      fields: [{ key: 'street', type: 'input', value: '' }],
    },
  ],
} as const satisfies FormConfig;

// ✗ Don't use invalid nesting
const config = {
  fields: [
    {
      type: 'page',
      fields: [
        { type: 'page', fields: [] }, // Error: page inside page
      ],
    },
  ],
} as const satisfies FormConfig;
```

**Extract types when needed:**

```typescript
import { InferFormValue } from '@ng-forge/dynamic-form';

type UserFormValue = InferFormValue<(typeof USER_FORM)['fields']>;

// Or use it directly in your component
function processForm(value: InferFormValue<(typeof USER_FORM)['fields']>) {
  console.log(value.name, value.email);
}
```

## Troubleshooting

**Type inference not working:**

Type inference requires `as const` - without it, TypeScript treats your config as mutable and can't infer precise types:

```typescript
// ✗ No inference - types are too wide
const config = {
  fields: [{ key: 'name', type: 'input', value: '' }],
};
// Type: { fields: { key: string; type: string; value: string }[] }

// ✓ With as const - precise inference
const config = {
  fields: [{ key: 'name', type: 'input', value: '' }],
} as const satisfies FormConfig;
// Type inferred: { name?: string }
```

**Dynamic form configs:**

If your form configuration is built dynamically (e.g., from API data, conditional logic, or runtime calculations), type inference won't work:

```typescript
// ✗ Dynamic - no inference possible
const fields = getFieldsFromAPI(); // Returns field array at runtime
const config = { fields } as const satisfies FormConfig;
// Can't infer - TypeScript doesn't know what getFieldsFromAPI() returns

// For dynamic forms, manually type your form values:
interface MyFormValue {
  name: string;
  email: string;
}

const formValue = signal<MyFormValue>({ name: '', email: '' });
```

Type inference only works for **static**, **compile-time constant** configurations.

## Related Topics

- **[Validation](../validation)** - How validators affect inferred types
- **[Field Types](../field-types)** - Understanding field types for better inference
- **[Custom Integration Guide](../../custom-integrations/guide)** - Creating type-safe custom fields
- **[Conditional Logic](../conditional-logic)** - Type-safe conditional expressions
