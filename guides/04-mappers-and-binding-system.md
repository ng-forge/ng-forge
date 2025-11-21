# Mappers & Binding System

## Introduction

Mappers are the bridge between declarative field definitions and Angular component bindings. They convert field configuration objects into Angular's `Binding[]` format, which is used by `ngComponentOutlet` to pass data to dynamically created components.

This guide explains how mappers work internally and how to create custom mappers.

## Understanding Angular Bindings

### What are Bindings?

Angular 21 introduced `Binding[]` for dynamic component creation:

```typescript
import { Binding, inputBinding, outputBinding } from '@angular/core';

const bindings: Binding[] = [
  inputBinding('name', () => 'John'),
  inputBinding('age', () => 30),
  outputBinding('clicked', (event) => console.log(event)),
];

// Used with ngComponentOutlet
<ng-container
  [ngComponentOutlet]="MyComponent"
  [ngComponentOutletInputs]="bindings"
/>
```

This is equivalent to:

```html
<my-component [name]="'John'" [age]="30" (clicked)="console.log($event)" />
```

### Why Bindings?

Bindings enable:

1. **Dynamic component creation** - Create components at runtime
2. **Type safety** - Input/output types are preserved
3. **Lazy loading** - Components loaded on-demand
4. **Signal compatibility** - Works with signal-based inputs

## Mapper Interface

### Definition

```typescript
export type FieldMapper = (fieldDef: FieldDef<any>, options: FieldMapperOptions) => Binding[];

export interface FieldMapperOptions<TModel = any> {
  fieldSignalContext: FieldSignalContext<TModel>;
  fieldRegistry: Map<string, FieldTypeDefinition>;
}

export interface FieldSignalContext<TModel = any> {
  injector: Injector;
  value: ModelSignal<Partial<TModel> | undefined>;
  defaultValues: Signal<TModel>;
  form: ReturnType<typeof form<TModel>>;
}
```

### Flow

```typescript
// 1. User defines field
const fieldDef = {
  key: 'email',
  type: 'input',
  value: '',
  label: 'Email',
  required: true,
};

// 2. Field registry provides mapper
const definition = registry.get('input');
const mapper = definition.mapper;  // e.g., valueFieldMapper

// 3. Mapper creates bindings
const bindings = mapper(fieldDef, {
  fieldSignalContext: {
    form: signal(formRoot),
    fieldPath: 'email',
  },
});

// 4. Bindings passed to component
// [
//   inputBinding('field', () => formRoot.controls.email),
//   inputBinding('key', () => 'email'),
//   inputBinding('label', () => 'Email'),
//   inputBinding('placeholder', () => undefined),
//   inputBinding('className', () => ''),
//   inputBinding('props', () => undefined),
// ]

// 5. Component receives inputs
@Component({...})
export class InputFieldComponent {
  field = input.required<FieldTree<string>>();
  key = input.required<string>();
  label = input<DynamicText>();
  // ...
}
```

## Built-in Mappers

### 1. baseFieldMapper

Maps common properties for all fields:

```typescript
import { Binding, inputBinding } from '@angular/core';

export function baseFieldMapper(fieldDef: FieldDef<any>): Binding[] {
  const bindings: Binding[] = [];

  // Required: Key
  bindings.push(inputBinding('key', () => fieldDef.key));

  // Optional: Label
  if (fieldDef.label !== undefined) {
    bindings.push(inputBinding('label', () => fieldDef.label));
  }

  // Optional: ClassName
  if (fieldDef.className !== undefined) {
    bindings.push(inputBinding('className', () => fieldDef.className));
  }

  // Optional: Hidden
  if (fieldDef.hidden !== undefined) {
    bindings.push(inputBinding('hidden', () => fieldDef.hidden));
  }

  // Optional: TabIndex
  if (fieldDef.tabIndex !== undefined) {
    bindings.push(inputBinding('tabIndex', () => fieldDef.tabIndex));
  }

  return bindings;
}
```

**Usage:** Base for all other mappers. Rarely used directly.

### 2. valueFieldMapper

Maps fields with form values (input, select, textarea, etc.):

```typescript
export type ValueFieldMapperOptions<TModel = any> = Omit<FieldMapperOptions<TModel>, 'fieldRegistry'>;

export function valueFieldMapper(fieldDef: BaseValueField<any, any>, options: ValueFieldMapperOptions): Binding[] {
  // 1. Omit value and value from field definition
  const omittedFields = omit(fieldDef, ['value', 'value']);

  // 2. Start with base bindings (includes label, placeholder, className, props, etc.)
  const bindings: Binding[] = baseFieldMapper(omittedFields);

  // 3. Get form field from signal context
  const formRoot = options.fieldSignalContext.form();
  const childrenMap = formRoot.structure?.childrenMap?.();
  const formField = childrenMap?.get(fieldDef.key);

  // 4. Bind Angular signal form field (the only additional binding)
  if (formField?.fieldProxy) {
    bindings.push(inputBinding('field', () => formField.fieldProxy));
  }

  return bindings;
}
```

**Note:** The actual implementation is simpler than often assumed. The `baseFieldMapper` handles most properties (label, placeholder, className, props, etc.), and `valueFieldMapper` only adds the `field` binding.

**Usage:** Most common mapper. Used for input, select, textarea, datepicker, slider, etc.

### 3. checkboxFieldMapper

Maps boolean fields (checkbox, toggle):

```typescript
export function checkboxFieldMapper(fieldDef: BaseCheckedField<any>, options: FieldMapperOptions): Binding[] {
  // 1. Start with base bindings
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  // 2. Get form field
  const formRoot = options.fieldSignalContext.form();
  const childrenMap = formRoot.structure?.childrenMap?.();
  const formField = childrenMap?.get(fieldDef.key);

  // 3. Bind form field
  if (formField?.fieldProxy) {
    bindings.push(inputBinding('field', () => formField.fieldProxy));
  }

  // 4. Bind checked state (if provided)
  if (fieldDef.checked !== undefined) {
    bindings.push(inputBinding('checked', () => fieldDef.checked));
  }

  // 5. Bind required
  if (fieldDef.required !== undefined) {
    bindings.push(inputBinding('required', () => fieldDef.required));
  }

  // 6. Bind props
  if (fieldDef.props !== undefined) {
    bindings.push(inputBinding('props', () => fieldDef.props));
  }

  return bindings;
}
```

**Usage:** For checkbox and toggle fields.

### 4. buttonFieldMapper

Maps button fields (no form binding):

```typescript
export function buttonFieldMapper(fieldDef: ButtonField<any, any>, options: FieldMapperOptions): Binding[] {
  // 1. Start with base bindings
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  // 2. Bind disabled state
  if (fieldDef.disabled !== undefined) {
    bindings.push(inputBinding('disabled', () => fieldDef.disabled));
  }

  // 3. Bind button type
  if (fieldDef.buttonType !== undefined) {
    bindings.push(inputBinding('buttonType', () => fieldDef.buttonType));
  }

  // 4. Bind event
  if (fieldDef.event !== undefined) {
    bindings.push(inputBinding('event', () => fieldDef.event));
  }

  // 5. Bind props
  if (fieldDef.props !== undefined) {
    bindings.push(inputBinding('props', () => fieldDef.props));
  }

  return bindings;
}
```

**Usage:** For button fields. Note: No form field binding.

### 5. groupFieldMapper

Maps group container fields:

```typescript
export function groupFieldMapper(fieldDef: GroupField<any>, options: FieldMapperOptions): Binding[] {
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  // Bind child fields
  if (fieldDef.fields !== undefined) {
    bindings.push(inputBinding('fields', () => fieldDef.fields));
  }

  return bindings;
}
```

**Usage:** For group containers (nested objects in form value).

### 6. rowFieldMapper

Maps row layout fields:

```typescript
export function rowFieldMapper(fieldDef: RowField, options: FieldMapperOptions): Binding[] {
  const bindings: Binding[] = [];

  // Row fields don't have a key
  // Just bind children
  if (fieldDef.fields !== undefined) {
    bindings.push(inputBinding('fields', () => fieldDef.fields));
  }

  return bindings;
}
```

**Usage:** For row layout (children flattened to parent level).

### 7. pageFieldMapper

Maps page fields (multi-step forms):

```typescript
export function pageFieldMapper(fieldDef: PageField, options: FieldMapperOptions): Binding[] {
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  // Bind page title
  if (fieldDef.title !== undefined) {
    bindings.push(inputBinding('title', () => fieldDef.title));
  }

  // Bind child fields
  if (fieldDef.fields !== undefined) {
    bindings.push(inputBinding('fields', () => fieldDef.fields));
  }

  return bindings;
}
```

**Usage:** For page fields in multi-step forms.

## Creating Custom Mappers

### When to Create Custom Mappers

Create a custom mapper when:

1. Field has unique binding requirements
2. Need to transform data before binding
3. Need computed bindings based on multiple properties
4. Built-in mappers don't fit your use case

### Example: Custom Rating Field Mapper

Let's create a custom mapper for a star rating field:

**Step 1: Define Field Type**

```typescript
import { FieldDef } from '@ng-forge/dynamic-forms';

export interface RatingFieldProps {
  maxRating?: number;
  allowHalf?: boolean;
  icon?: string;
  color?: string;
}

export interface RatingField extends FieldDef<RatingFieldProps> {
  key: string;
  type: 'rating';
  value: number;
  readonly?: boolean;
}
```

**Step 2: Create Mapper**

```typescript
import { Binding, inputBinding } from '@angular/core';
import { baseFieldMapper } from '@ng-forge/dynamic-forms';

export function ratingFieldMapper(fieldDef: RatingField, options: FieldMapperOptions): Binding[] {
  // 1. Start with base bindings
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  // 2. Get form field
  const formRoot = options.fieldSignalContext.form();
  const childrenMap = formRoot.structure?.childrenMap?.();
  const formField = childrenMap?.get(fieldDef.key);

  if (formField?.fieldProxy) {
    bindings.push(inputBinding('field', () => formField.fieldProxy));
  }

  // 3. Bind rating-specific properties with defaults
  bindings.push(inputBinding('maxRating', () => fieldDef.props?.maxRating ?? 5));

  bindings.push(inputBinding('allowHalf', () => fieldDef.props?.allowHalf ?? false));

  bindings.push(inputBinding('icon', () => fieldDef.props?.icon ?? 'star'));

  bindings.push(inputBinding('color', () => fieldDef.props?.color ?? 'gold'));

  // 4. Bind readonly state
  if (fieldDef.readonly !== undefined) {
    bindings.push(inputBinding('readonly', () => fieldDef.readonly));
  }

  return bindings;
}
```

**Step 3: Register Field Type**

```typescript
export const CUSTOM_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: 'rating',
    loadComponent: () => import('./rating-field.component'),
    mapper: ratingFieldMapper,
    valueHandling: 'include',
  },
];
```

**Step 4: Implement Component**

```typescript
@Component({
  selector: 'app-rating-field',
  template: `
    @let f = field();

    <div class="rating-field">
      @if (label(); as label) {
        <label>{{ label | dynamicText | async }}</label>
      }

      <div class="stars">
        @for (star of stars(); track star) {
          <button type="button" [disabled]="readonly()" (click)="rate(star)" [class.active]="star <= f().value()">
            <i [class]="icon()"></i>
          </button>
        }
      </div>
    </div>
  `,
})
export default class RatingFieldComponent {
  // From mapper
  field = input.required<FieldTree<number>>();
  key = input.required<string>();
  label = input<DynamicText>();
  maxRating = input<number>(5);
  allowHalf = input<boolean>(false);
  icon = input<string>('star');
  color = input<string>('gold');
  readonly = input<boolean>(false);

  // Computed
  stars = computed(() => {
    const max = this.maxRating();
    return Array.from({ length: max }, (_, i) => i + 1);
  });

  rate(value: number): void {
    if (!this.readonly()) {
      this.field().value.set(value);
    }
  }
}
```

### Example: Computed Binding

Create bindings that compute values dynamically:

```typescript
export function dynamicInputMapper(fieldDef: InputField<any>, options: FieldMapperOptions): Binding[] {
  const bindings: Binding[] = valueFieldMapper(fieldDef, options);

  // Add computed placeholder based on field type
  const computedPlaceholder = computed(() => {
    const type = fieldDef.props?.type ?? 'text';
    switch (type) {
      case 'email':
        return 'Enter your email address';
      case 'tel':
        return 'Enter phone number';
      case 'url':
        return 'Enter website URL';
      default:
        return fieldDef.placeholder ?? '';
    }
  });

  // Replace placeholder binding
  const index = bindings.findIndex((b) => {
    // Find and replace placeholder binding
  });
  if (index !== -1) {
    bindings[index] = inputBinding('placeholder', computedPlaceholder);
  }

  return bindings;
}
```

### Example: Conditional Binding

Add bindings conditionally:

```typescript
export function conditionalMapper(fieldDef: InputField<any>, options: FieldMapperOptions): Binding[] {
  const bindings: Binding[] = valueFieldMapper(fieldDef, options);

  // Only bind 'maxLength' if field is text or textarea
  if (fieldDef.props?.type === 'text' || fieldDef.props?.type === 'textarea') {
    if (fieldDef.maxLength !== undefined) {
      bindings.push(inputBinding('maxLength', () => fieldDef.maxLength));
    }
  }

  // Only bind 'min' and 'max' for number inputs
  if (fieldDef.props?.type === 'number') {
    if (fieldDef.min !== undefined) {
      bindings.push(inputBinding('min', () => fieldDef.min));
    }
    if (fieldDef.max !== undefined) {
      bindings.push(inputBinding('max', () => fieldDef.max));
    }
  }

  return bindings;
}
```

### Example: Output Binding

Handle component outputs:

```typescript
export function outputFieldMapper(fieldDef: CustomField, options: FieldMapperOptions): Binding[] {
  const bindings: Binding[] = valueFieldMapper(fieldDef, options);

  // Add output binding
  bindings.push(
    outputBinding('valueChanged', (newValue: any) => {
      console.log('Value changed:', newValue);
      // Handle custom logic
    }),
  );

  return bindings;
}
```

## Advanced Patterns

### 1. Mapper Composition

Combine multiple mappers:

```typescript
export function compositeMapper(fieldDef: FieldDef<any>, options: FieldMapperOptions): Binding[] {
  const baseBindings = baseFieldMapper(fieldDef);
  const valueBindings = valueFieldMapper(fieldDef as BaseValueField<any, any>, options);
  const customBindings = customMapper(fieldDef, options);

  // Merge all bindings
  return [...baseBindings, ...valueBindings, ...customBindings];
}
```

### 2. Mapper Factory

Create mappers dynamically:

```typescript
export function createMapper(config: MapperConfig): FieldMapper {
  return (fieldDef, options) => {
    const bindings: Binding[] = [];

    // Add bindings based on config
    for (const [key, value] of Object.entries(config.properties)) {
      if (fieldDef[key] !== undefined) {
        bindings.push(inputBinding(value, () => fieldDef[key]));
      }
    }

    return bindings;
  };
}

// Usage
const inputMapper = createMapper({
  properties: {
    label: 'label',
    placeholder: 'placeholder',
    required: 'required',
  },
});
```

### 3. Mapper with Context

Access form-wide context:

```typescript
export function contextAwareMapper(fieldDef: FieldDef<any>, options: FieldMapperOptions): Binding[] {
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  // Access form context
  const formRoot = options.fieldSignalContext.form();
  const formValue = computed(() => formRoot.value());

  // Create conditional binding based on other fields
  const isVisible = computed(() => {
    const value = formValue();
    return value.accountType === 'business';
  });

  bindings.push(inputBinding('hidden', () => !isVisible()));

  return bindings;
}
```

## Debugging Mappers

### Logging Bindings

```typescript
export function debugMapper(fieldDef: FieldDef<any>, options: FieldMapperOptions): Binding[] {
  const bindings = valueFieldMapper(fieldDef as BaseValueField<any, any>, options);

  console.group(`Mapper Debug: ${fieldDef.key}`);
  console.log('Field Definition:', fieldDef);
  console.log('Bindings:', bindings);
  console.groupEnd();

  return bindings;
}
```

### Testing Mappers

```typescript
describe('ratingFieldMapper', () => {
  it('should create correct bindings', () => {
    const fieldDef: RatingField = {
      key: 'rating',
      type: 'rating',
      value: 0,
      label: 'Rate us',
      props: {
        maxRating: 5,
        allowHalf: false,
      },
    };

    const mockFormRoot = createMockFormRoot();
    const options: FieldMapperOptions = {
      fieldSignalContext: {
        form: signal(mockFormRoot),
        fieldPath: 'rating',
      },
    };

    const bindings = ratingFieldMapper(fieldDef, options);

    // Verify bindings
    expect(bindings.length).toBeGreaterThan(0);
    expect(bindings.some((b) => b.key === 'field')).toBe(true);
    expect(bindings.some((b) => b.key === 'maxRating')).toBe(true);
  });
});
```

## Best Practices

### 1. Reuse Built-in Mappers

✅ **DO:**

```typescript
export function customMapper(fieldDef, options) {
  const bindings = valueFieldMapper(fieldDef, options);
  // Add custom bindings
  return bindings;
}
```

❌ **DON'T:**

```typescript
export function customMapper(fieldDef, options) {
  // Reimplementing valueFieldMapper logic
  const bindings = [];
  bindings.push(inputBinding('key', () => fieldDef.key));
  // ... duplicate code
}
```

### 2. Handle Undefined Values

✅ **DO:**

```typescript
if (fieldDef.placeholder !== undefined) {
  bindings.push(inputBinding('placeholder', () => fieldDef.placeholder));
}
```

❌ **DON'T:**

```typescript
bindings.push(inputBinding('placeholder', () => fieldDef.placeholder));
// Always added, even if undefined
```

### 3. Use Factories for Defaults

✅ **DO:**

```typescript
bindings.push(inputBinding('maxRating', () => fieldDef.props?.maxRating ?? 5));
```

❌ **DON'T:**

```typescript
const maxRating = fieldDef.props?.maxRating || 5;
bindings.push(inputBinding('maxRating', () => maxRating));
// Value computed once, not reactive
```

### 4. Type Safety

✅ **DO:**

```typescript
export function customMapper(
  fieldDef: CustomField, // Specific type
  options: FieldMapperOptions,
): Binding[] {
  // TypeScript knows all properties
}
```

❌ **DON'T:**

```typescript
export function customMapper(
  fieldDef: any, // Too generic
  options: any,
): any {
  // No type safety
}
```

## Summary

Mappers are essential for ng-forge dynamic forms:

1. **Convert field definitions to Angular bindings**
2. **Enable dynamic component creation**
3. **Provide type-safe data passing**
4. **Support lazy loading**
5. **Allow customization**

Key points:

- Use built-in mappers when possible
- Create custom mappers for unique requirements
- Compose mappers for complex scenarios
- Test mappers thoroughly
- Maintain type safety
