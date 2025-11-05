# Type Safety & Inference

ng-forge provides compile-time type inference for form configurations, eliminating manual type definitions and catching errors before runtime.

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

Field types are registered through the `FieldRegistryLeaves` interface. UI integrations (Material, Bootstrap, etc.) augment this interface to add their field types:

```typescript
// Material fields are registered via module augmentation
declare module '@ng-forge/dynamic-form' {
  interface FieldRegistryLeaves {
    input: MatInputField;
    select: MatSelectField<unknown>;
    checkbox: MatCheckboxField;
    textarea: MatTextareaField;
    // ... other Material fields
  }
}
```

The field registry determines what types are available and how they're inferred.

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
    { type: 'text', content: 'Enter your details:' }, // Excluded from values
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

// Augment the registry
declare module '@ng-forge/dynamic-form' {
  interface FieldRegistryLeaves {
    'color-picker': ColorPickerField;
    'file-upload': FileUploadField;
  }
}
```

Usage:

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

## Custom Type Guards

Create type guards for runtime validation of form values:

```typescript
interface UserFormValue {
  username: string;
  age: number;
  email: string;
}

function isValidUserForm(value: unknown): value is UserFormValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    'username' in value &&
    typeof value.username === 'string' &&
    'age' in value &&
    typeof value.age === 'number' &&
    'email' in value &&
    typeof value.email === 'string'
  );
}

onSubmit(value: unknown) {
  if (isValidUserForm(value)) {
    // value is now fully typed as UserFormValue
    console.log(value.username, value.age, value.email);
  }
}
```

## Type-Safe Validation

Validators integrate with the type system:

```typescript
const config = {
  fields: [
    {
      key: 'email',
      type: 'input',
      value: '',
      required: true,
      email: true,
      minLength: 5,
    },
  ],
} as const satisfies FormConfig;

// Type inferred: { email: string } (required, so no undefined)
```

The `required: true` flag removes `undefined` from the type, making the field mandatory in the inferred type.

See [Validation](../validation) for validator details.

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

**Type resolves to `never` or `unknown`:**

- Verify `as const` is used
- Check all field types are registered in `FieldRegistryLeaves`
- Ensure `value` property is present on value-bearing fields
- Verify nesting rules are followed (pages/rows/groups)
- Check TypeScript version is 5.0+

**IntelliSense not working:**

- Restart TypeScript server (VS Code: Cmd+Shift+P → "Restart TS Server")
- Check `fields` array is readonly (`as const`)
- Verify no circular type references
- Ensure field configuration uses proper generics

**Nesting depth exceeded:**

- Type inference is limited to 5 levels of nesting
- Flatten deeply nested structures using rows
- Consider splitting complex forms into multiple pages

**Field type not recognized:**

- Ensure UI integration is imported (`@ng-forge/dynamic-form-material`)
- Check module augmentation is loaded (import the field definitions)
- Verify custom field types are properly registered in `FieldRegistryLeaves`
