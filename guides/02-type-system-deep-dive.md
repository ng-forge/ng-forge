# Type System Deep Dive

## Introduction

The type system in ng-forge dynamic forms is one of its most powerful features. It provides end-to-end type safety from form configuration to submission handlers, with full IntelliSense support. This guide explains how the type system works internally.

## Type Registry Architecture

### The Problem

How do we provide autocomplete for field types when different UI libraries provide different fields? The core library can't know about Material, PrimeNG, or Ionic field types at compile time.

### The Solution: Module Augmentation

TypeScript's **module augmentation** allows packages to extend interfaces defined in other packages. ng-forge uses this to create a global field registry that UI adapters populate.

### Core Registry Definition

**`packages/dynamic-forms/src/lib/models/registry/field-registry.ts`:**

```typescript
/**
 * Container fields (have children)
 */
export interface FieldRegistryContainers {
  page: PageField;
  row: RowField;
  group: GroupField;
}

/**
 * Leaf fields (no children)
 */
export interface FieldRegistryLeaves {
  text: TextField; // Core library provides only text field
}

/**
 * Combined registry
 */
export interface DynamicFormFieldRegistry {
  containers: FieldRegistryContainers;
  leaves: FieldRegistryLeaves;
}

/**
 * Union of all field types
 */
export type AnyField = FieldRegistryContainers[keyof FieldRegistryContainers] | FieldRegistryLeaves[keyof FieldRegistryLeaves];
```

At this point, TypeScript knows about:

- `page`, `row`, `group` (containers)
- `text` (core leaf field)

### Adapter Augmentation

**`packages/dynamic-forms-primeng/src/lib/types/registry-augmentation.ts`:**

```typescript
declare module '@ng-forge/dynamic-forms' {
  interface FieldRegistryLeaves {
    input: PrimeInputField;
    select: PrimeSelectField<unknown>;
    checkbox: PrimeCheckboxField;
    radio: PrimeRadioField<unknown>;
    textarea: PrimeTextareaField;
    datepicker: PrimeDatepickerField;
    slider: PrimeSliderField;
    toggle: PrimeToggleField;
    button: PrimeButtonField;
    multiCheckbox: PrimeMultiCheckboxField<unknown>;
  }
}
```

**Critical:** This file MUST be imported in the adapter's `index.ts` for the augmentation to take effect:

```typescript
// packages/dynamic-forms-primeng/src/lib/index.ts

// Import for side effects (module augmentation)
import './types/registry-augmentation';

// ... other exports
```

### Result: Full Type Safety

After augmentation, TypeScript knows about ALL field types:

```typescript
const config = {
  fields: [
    {
      key: 'email',
      type: 'input', // ✅ Autocomplete shows: input, select, checkbox, ...
      value: '',
      // ... TypeScript knows valid properties for 'input' type
    },
  ],
} as const satisfies FormConfig;
```

## Field Definition Type Hierarchy

### Base Types

**1. FieldDef (All Fields)**

```typescript
export interface FieldDef<TProps> {
  key: string;
  type: string;
  label?: DynamicText;
  props?: TProps;
  className?: string;
  disabled?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  tabIndex?: number;
  col?: number;
}
```

**2. BaseValueField (Fields with Values)**

```typescript
export type BaseValueField<TProps, TValue> = FieldDef<TProps> & {
  value: TValue;
  value?: TValue;
  placeholder?: DynamicText;
  required?: boolean;
  // Validation properties
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string | RegExp;
  email?: boolean;
  // Advanced validation
  validators?: ValidatorConfig[];
  validationMessages?: ValidationMessages;
  // Conditional logic
  logic?: LogicConfig[];
};
```

**3. BaseCheckedField (Boolean Fields)**

```typescript
export type BaseCheckedField<TProps> = FieldDef<TProps> & {
  checked?: boolean;
  required?: boolean;
  validators?: ValidatorConfig[];
  validationMessages?: ValidationMessages;
  logic?: LogicConfig[];
};
```

**4. ContainerField (Fields with Children)**

```typescript
export type ContainerField<TProps> = FieldDef<TProps> & {
  fields: AnyField[];
};
```

**5. ArrayField (Dynamic Lists)**

```typescript
export type ArrayField<TProps> = FieldDef<TProps> & {
  key: string;
  value: unknown[];
  itemTemplate: {
    fields: AnyField[];
  };
  minItems?: number;
  maxItems?: number;
  addButtonLabel?: DynamicText;
  removeButtonLabel?: DynamicText;
};
```

### Adapter Field Types

Adapters extend base types with UI-specific props:

```typescript
// Input field
export interface PrimeInputProps extends InputProps {
  styleClass?: string;
  hint?: DynamicText;
  size?: 'small' | 'large';
  variant?: 'outlined' | 'filled';
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
}

export type PrimeInputField = InputField<PrimeInputProps>;
// Expands to: BaseValueField<PrimeInputProps, string>

// Select field
export interface PrimeSelectProps extends SelectProps {
  styleClass?: string;
  filter?: boolean;
  showClear?: boolean;
  multiple?: boolean;
}

export type PrimeSelectField<T> = SelectField<T, PrimeSelectProps>;
// Expands to: BaseValueField<PrimeSelectProps, T>
```

### Type Parameter Flow

```typescript
InputField<TProps>
  ↓ uses
BaseValueField<TProps, string>
  ↓ uses
FieldDef<TProps>
```

This hierarchy ensures:

1. All fields share common properties (`key`, `type`, `label`, etc.)
2. Value fields add value-related properties (`value`, `required`, etc.)
3. Adapter fields add UI-specific properties (`styleClass`, `filter`, etc.)

## Form Value Type Inference

### The Challenge

Given a form configuration, infer the exact TypeScript type of the form value:

```typescript
const config = {
  fields: [
    { key: 'email', type: 'input', value: '', required: true },
    { key: 'age', type: 'input', value: 0 },
    {
      key: 'address',
      type: 'group',
      fields: [
        { key: 'street', type: 'input', value: '' },
        { key: 'city', type: 'input', value: '' },
      ],
    },
    {
      key: 'contacts',
      type: 'array',
      value: [],
      itemTemplate: {
        fields: [
          { key: 'name', type: 'input', value: '' },
          { key: 'email', type: 'input', value: '' },
        ],
      },
    },
  ],
} as const satisfies FormConfig;

// Desired inferred type:
type FormValue = {
  email: string; // required: true → not optional
  age?: number; // required: false → optional
  address?: {
    // group creates nested object
    street?: string;
    city?: string;
  };
  contacts?: Array<{
    // array creates array of objects
    name?: string;
    email?: string;
  }>;
};
```

### The Solution: Recursive Type Mapping

**Step 1: Extract Fields**

```typescript
type ExtractFormValue<T extends FormConfig> = T extends { fields: infer F }
  ? F extends readonly FieldConfig[]
    ? ExtractFieldsValue<F>
    : never
  : never;
```

**Step 2: Map Fields to Properties**

```typescript
type ExtractFieldsValue<T extends readonly FieldConfig[]> = Prettify<UnionToIntersection<ExtractFieldValue<T[number]>>>;

// T[number] converts tuple to union:
// [Field1, Field2, Field3] → Field1 | Field2 | Field3

// ExtractFieldValue maps each field to its contribution:
// Field1 → { email: string }
// Field2 → { age?: number }
// Field3 → { address?: { street?: string, city?: string } }

// UnionToIntersection combines:
// { email: string } | { age?: number } | { address?: {...} }
// → { email: string, age?: number, address?: {...} }
```

**Step 3: Extract Field Value**

```typescript
type ExtractFieldValue<T extends FieldConfig> =
  // Container fields (group, row, page)
  T extends ContainerFieldConfig
    ? ExtractContainerValue<T>
    : // Value fields (input, select, etc.)
      T extends ValueFieldConfig
      ? ExtractValueFieldValue<T>
      : // Non-value fields (button, text)
        never;
```

**Step 4: Handle Container Fields**

```typescript
type ExtractContainerValue<T extends ContainerFieldConfig> =
  // Group: nested object
  T extends { key: infer K; type: 'group'; fields: infer F }
    ? K extends string
      ? F extends readonly FieldConfig[]
        ? { [P in K]?: ExtractFieldsValue<F> }
        : never
      : never
    : // Row/Page: flattened children
      T extends { type: 'row' | 'page'; fields: infer F }
      ? F extends readonly FieldConfig[]
        ? ExtractFieldsValue<F>
        : never
      : never;
```

**Step 5: Handle Value Fields**

```typescript
type ExtractValueFieldValue<T extends ValueFieldConfig> = T extends { key: infer K; value: infer V; required: true }
  ? { [P in K & string]: V } // Required: not optional
  : T extends { key: infer K; value: infer V }
    ? { [P in K & string]?: V } // Not required: optional
    : never;
```

**Step 6: Utility Types**

```typescript
// Makes intersection types readable
type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// Converts union of objects to intersection
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
```

### Example Walkthrough

Given:

```typescript
const config = {
  fields: [
    { key: 'email', type: 'input', value: '', required: true },
    { key: 'age', type: 'input', value: 0 },
  ],
} as const satisfies FormConfig;
```

**Step-by-step inference:**

```typescript
ExtractFormValue<typeof config>

// Step 1: Extract fields array
→ ExtractFieldsValue<typeof config.fields>

// Step 2: Convert to union
→ ExtractFieldValue<Field1> | ExtractFieldValue<Field2>

// Step 3: Extract each field value
→ { email: string } | { age?: number }

// Step 4: Union to intersection
→ { email: string } & { age?: number }

// Step 5: Prettify
→ { email: string; age?: number }
```

## Component Type Inference

### Field Component Interface

Field components receive bindings created by mappers. The component type interface ensures type safety:

```typescript
export type ValueFieldComponent<T extends BaseValueField<any, any>> = Prettify<
  WithInputSignals<
    Pick<T, 'label' | 'placeholder' | 'className' | 'tabIndex'> & {
      field: FieldTree<ExtractFieldValueType<T>>;
      key: string;
      props: ExtractProps<T>;
    }
  >
>;
```

**Breakdown:**

1. **`Pick<T, 'label' | 'placeholder' | 'className' | 'tabIndex'>`**
   - Extracts standard field properties

2. **`field: FieldTree<ExtractFieldValueType<T>>`**
   - Angular signal form field
   - Generic type matches field's value type

3. **`key: string`**
   - Field identifier

4. **`props: ExtractProps<T>`**
   - UI-specific properties

5. **`WithInputSignals<...>`**
   - Converts properties to Angular input signals

### WithInputSignals Type

```typescript
type WithInputSignals<T> = {
  readonly [K in keyof T]: InputSignal<T[K]>;
};

// Transforms:
// { label?: string, field: FieldTree<string> }
// → { label: InputSignal<string | undefined>, field: InputSignal<FieldTree<string>> }
```

### Component Implementation

```typescript
export default class PrimeInputFieldComponent implements PrimeInputComponent {
  // TypeScript infers all these as InputSignal<T>
  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();
  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();
  readonly props = input<PrimeInputProps>();
}
```

## DynamicText Type

### Definition

```typescript
export type DynamicText = string | Observable<string> | Signal<string>;
```

### Purpose

Supports i18n by allowing:

- Static strings: `'Email Address'`
- Observables: `this.transloco.selectTranslate('form.email')`
- Signals: `computed(() => this.translations().email)`

### Usage in Templates

```typescript
@Component({
  template: `
    <label>{{ label() | dynamicText | async }}</label>
  `,
})
```

The `DynamicTextPipe` handles all three types:

```typescript
@Pipe({ name: 'dynamicText' })
export class DynamicTextPipe implements PipeTransform {
  transform(value: DynamicText | undefined): Observable<string> {
    if (!value) {
      return of('');
    }
    if (typeof value === 'string') {
      return of(value);
    }
    if (isObservable(value)) {
      return value;
    }
    // Signal
    return toObservable(value);
  }
}
```

## Generic Type Constraints

### Select Field Generics

Select fields are generic to support any value type:

```typescript
export type SelectField<T, TProps = SelectProps> = BaseValueField<TProps, T> & {
  options: FieldOption<T>[];
};

export interface FieldOption<T = unknown> {
  label: DynamicText;
  value: T;
  disabled?: boolean;
}
```

**Usage:**

```typescript
// String values
const countryField: SelectField<string> = {
  key: 'country',
  type: 'select',
  value: '',
  options: [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
  ],
};

// Number values
const priorityField: SelectField<number> = {
  key: 'priority',
  type: 'select',
  value: 0,
  options: [
    { value: 1, label: 'Low' },
    { value: 2, label: 'Medium' },
    { value: 3, label: 'High' },
  ],
};

// Object values
interface User {
  id: number;
  name: string;
}

const userField: SelectField<User> = {
  key: 'user',
  type: 'select',
  value: null,
  options: [
    { value: { id: 1, name: 'Alice' }, label: 'Alice' },
    { value: { id: 2, name: 'Bob' }, label: 'Bob' },
  ],
};
```

### Type Registry Generics

The registry uses `unknown` for generic fields:

```typescript
declare module '@ng-forge/dynamic-forms' {
  interface FieldRegistryLeaves {
    select: PrimeSelectField<unknown>; // Generic parameter
    radio: PrimeRadioField<unknown>;
    multiCheckbox: PrimeMultiCheckboxField<unknown>;
  }
}
```

When you use these fields, you specify the concrete type:

```typescript
const config = {
  fields: [
    {
      key: 'country',
      type: 'select', // Type: PrimeSelectField<unknown>
      value: '', // But TypeScript infers: string
      options: [{ value: 'us', label: 'United States' }],
    } satisfies PrimeSelectField<string>, // Explicitly constrain
  ],
};
```

## Type Constraints & Validation

### `satisfies` Operator

The `satisfies` operator ensures config matches the type without widening:

```typescript
// ❌ Without 'as const': types are widened
const config = {
  fields: [
    { key: 'email', type: 'input', value: '' }, // type: string
  ],
};
// typeof config.fields[0].key = string (too wide!)

// ✅ With 'as const': types are narrowed
const config = {
  fields: [
    { key: 'email', type: 'input', value: '' }, // type: "email"
  ],
} as const;
// typeof config.fields[0].key = "email" (perfect!)

// ✅ With 'satisfies': type-checked + narrowed
const config = {
  fields: [{ key: 'email', type: 'input', value: '' }],
} as const satisfies FormConfig;
// Type-checked against FormConfig, but preserves literal types
```

### FormConfig Interface

```typescript
export interface FormConfig {
  fields: readonly AnyField[];
  options?: FormOptions;
  schemas?: SchemaDefinition[];
  signalFormsConfig?: SignalFormsConfig;
}
```

The `satisfies FormConfig` check ensures:

1. All fields are valid (registered types)
2. Required properties present (`key`, `type`, `value`)
3. No typos in property names
4. Props match field type

## Type Inference Limitations

### 1. Computed Properties

TypeScript can't infer types for computed field definitions:

```typescript
// ❌ Type inference lost
const fields = [{ key: 'email', type: 'input', value: '' }, ...(someCondition ? [{ key: 'phone', type: 'input', value: '' }] : [])];

const config = { fields } as const satisfies FormConfig;

// ✅ Must define all fields statically
const config = {
  fields: [
    { key: 'email', type: 'input', value: '' },
    { key: 'phone', type: 'input', value: '', hidden: !someCondition },
  ],
} as const satisfies FormConfig;
```

### 2. Deep Nesting

Very deeply nested forms may hit TypeScript's recursion limit:

```typescript
// May cause "Type instantiation is excessively deep" error
const config = {
  fields: [
    {
      key: 'level1',
      type: 'group',
      fields: [
        {
          key: 'level2',
          type: 'group',
          fields: [
            // ... 10+ levels deep
          ],
        },
      ],
    },
  ],
} as const satisfies FormConfig;
```

**Solution:** Break into separate configs or use type annotation:

```typescript
const level2Config: GroupField = {
  key: 'level2',
  type: 'group',
  fields: [...],
};

const config = {
  fields: [
    {
      key: 'level1',
      type: 'group',
      fields: [level2Config],
    },
  ],
} as const satisfies FormConfig;
```

## Advanced Type Patterns

### 1. Discriminated Unions

Field types are discriminated by the `type` property:

```typescript
type AnyField =
  | { key: string; type: 'input'; value: string /* ... */ }
  | { key: string; type: 'select'; value: unknown; options: FieldOption[] /* ... */ }
  | { key: string; type: 'checkbox'; value: boolean /* ... */ };

function handleField(field: AnyField) {
  if (field.type === 'input') {
    // TypeScript knows: field.value is string
    console.log(field.value.toUpperCase());
  } else if (field.type === 'select') {
    // TypeScript knows: field.options exists
    console.log(field.options.length);
  } else if (field.type === 'checkbox') {
    // TypeScript knows: field.value exists
    console.log(field.value ? 'Checked' : 'Unchecked');
  }
}
```

### 2. Conditional Types

Used extensively for type inference:

```typescript
// Extract value type from field
type ExtractFieldValueType<T> = T extends { value: infer V } ? V : never;

// Extract props from field
type ExtractProps<T> = T extends { props: infer P } ? P : never;
```

### 3. Template Literal Types

Used for nested field paths:

```typescript
type FieldPath<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${Prefix}${K}` | FieldPath<T[K], `${Prefix}${K}.`>
          : `${Prefix}${K}`
        : never;
    }[keyof T]
  : never;

type ExamplePaths = FieldPath<{
  email: string;
  address: {
    street: string;
    city: string;
  };
}>;
// Result: "email" | "address" | "address.street" | "address.city"
```

## Summary

The type system in ng-forge provides:

1. **Module Augmentation**: UI adapters extend the global field registry
2. **Hierarchical Types**: Clear type hierarchy from base to adapter types
3. **Value Type Inference**: Automatic inference of form value types
4. **Component Type Safety**: Type-safe component bindings via mappers
5. **Generic Support**: Generic field types for flexible value types
6. **DynamicText**: Type-safe i18n support
7. **Type Constraints**: `satisfies` operator for type checking + narrowing

This system provides end-to-end type safety while maintaining flexibility and extensibility.
