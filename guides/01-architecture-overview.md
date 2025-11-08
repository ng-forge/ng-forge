# Architecture Overview

## Introduction

ng-forge dynamic forms is a type-safe, UI-agnostic form library for Angular 21+ that provides declarative form configuration with full TypeScript inference. This guide explains how the library is architected and how all the pieces work together.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  (Component using DynamicForm with FormConfig)              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│               Core Library (@ng-forge/dynamic-form)          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  DynamicForm (Root Component)              │   │
│  │  - Receives FormConfig                              │   │
│  │  - Creates FormState signal                         │   │
│  │  - Manages form lifecycle                           │   │
│  └──────────────────┬──────────────────────────────────┘   │
│                     │                                        │
│                     ↓                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  FormStructureBuilder                               │   │
│  │  - Parses FormConfig                                │   │
│  │  - Builds form tree structure                       │   │
│  │  - Creates Angular signal forms                     │   │
│  │  - Applies mappers to create component bindings     │   │
│  └──────────────────┬──────────────────────────────────┘   │
│                     │                                        │
│                     ↓                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Field Registry                                     │   │
│  │  - Stores FieldTypeDefinition[]                     │   │
│  │  - Maps field type names to components              │   │
│  │  - Provides lazy loading                            │   │
│  └──────────────────┬──────────────────────────────────┘   │
│                     │                                        │
└─────────────────────┼────────────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────────┐
│          UI Adapter (@ng-forge/dynamic-form-*)               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Field Type Definitions                             │   │
│  │  - PRIMENG_FIELD_TYPES / MATERIAL_FIELD_TYPES       │   │
│  │  - Maps type names to component loaders             │   │
│  │  - Specifies mappers and value handling             │   │
│  └──────────────────┬──────────────────────────────────┘   │
│                     │                                        │
│                     ↓                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Field Components (PrimeInputFieldComponent, etc.)  │   │
│  │  - Receives field bindings via Angular's Binding[]  │   │
│  │  - Renders UI using library components              │   │
│  │  - Uses [field] directive for two-way binding       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. DynamicForm

The root component that applications interact with:

```typescript
@Component({
  selector: 'dynamic-form',
  template: `
    @for (fieldContext of fieldContexts(); track fieldContext.fieldDef.key) {
    <dynamic-field [context]="fieldContext" />
    }
  `,
})
export class DynamicForm {
  // Input: User's form configuration
  config = input.required<FormConfig>();

  // Output: Form submission
  submitted = output<FormValue>();

  // Internal: Form state as a signal
  formState = signal<FormState | null>(null);

  // Computed: Field contexts for rendering
  fieldContexts = computed(() => {
    const state = this.formState();
    return state ? state.fieldContexts : [];
  });
}
```

**Key Responsibilities:**

- Accept `FormConfig` from user
- Build form structure using `FormStructureBuilder`
- Create and manage `FormState` signal
- Provide form context to child fields
- Handle form submission and events

### 2. Form Setup (within DynamicForm)

The form structure is built directly within the `DynamicForm` component using computed signals:

```typescript
// Inside DynamicForm component
private readonly formSetup = computed(() => {
  const config = this.config();
  const registry = this.rawFieldRegistry();

  if (config.fields && config.fields.length > 0) {
    // 1. Flatten fields for form schema
    const flattenedFields = this.memoizedFlattenFields(config.fields, registry);

    // 2. Index fields by key
    const fieldsById = this.memoizedKeyBy(flattenedFields);

    // 3. Calculate default values
    const defaultValues = this.memoizedDefaultValues(fieldsById, registry);

    // 4. Determine fields to render (paged vs non-paged)
    const fieldsToRender = modeDetection.mode === 'paged'
      ? config.fields
      : flattenedFields;

    return {
      fields: fieldsToRender,
      schemaFields: flattenedFields,
      defaultValues,
      mode: modeDetection.mode,
      registry,
    };
  }

  return { fields: [], schemaFields: [], defaultValues: {}, mode: 'non-paged', registry };
});

private readonly form = computed(() => {
  const setup = this.formSetup();
  const schema = createSchemaFromFields(setup.schemaFields, setup.registry);
  return form(this.entity, schema);
});
```

**Key Responsibilities:**

- Flatten and index field definitions
- Create Angular signal forms with schema
- Calculate default values
- Detect form mode (paged vs non-paged)
- Set up validation through schema creation

### 3. Field Registry

A global registry that stores field type definitions:

```typescript
@Injectable({ providedIn: 'root' })
export class FieldRegistry {
  private registry = new Map<string, FieldTypeDefinition>();

  register(definition: FieldTypeDefinition): void {
    this.registry.set(definition.name, definition);
  }

  get(typeName: string): FieldTypeDefinition | undefined {
    return this.registry.get(typeName);
  }

  loadComponent(typeName: string): Promise<Type<any>> {
    const definition = this.get(typeName);
    if (!definition) {
      throw new Error(`Field type '${typeName}' not registered`);
    }
    return definition.loadComponent();
  }
}
```

**Key Responsibilities:**

- Store field type definitions
- Provide field component lookup
- Enable lazy loading of field components
- Populated by UI adapters via `provideDynamicForm()`

### 4. Field Rendering System

Fields are rendered using the `FieldRendererDirective` and `ViewContainerRef`:

```typescript
// Inside DynamicForm component
fields = toSignal(
  this.fields$.pipe(
    switchMap((fields) => {
      if (!fields || fields.length === 0) {
        return of([]);
      }
      return forkJoin(this.mapFields(fields));
    }),
    map((components) => components.filter(Boolean))
  ),
  { initialValue: [] }
);

private async mapSingleField(fieldDef: FieldDef<any>): Promise<ComponentRef<FormUiControl> | undefined> {
  return this.fieldRegistry
    .loadTypeComponent(fieldDef.type)
    .then((componentType) => {
      const bindings = mapFieldToBindings(fieldDef, {
        fieldSignalContext: this.fieldSignalContext(),
        fieldRegistry: this.rawFieldRegistry(),
      });

      return this.vcr.createComponent(componentType, {
        bindings,
        injector: this.injector
      });
    });
}
```

**Key Responsibilities:**

- Lazy load field components
- Create component bindings using mappers
- Dynamically create components using ViewContainerRef
- Handle component lifecycle and cleanup

## Data Flow

### 1. Configuration to Form Structure

```typescript
// User defines config
const config = {
  fields: [
    { key: 'email', type: 'input', value: '', required: true },
  ],
} as const satisfies FormConfig;

// ↓ DynamicForm receives config

// ↓ FormStructureBuilder parses config

// ↓ Creates Angular signal form
import { fieldPath, FieldTree } from '@angular/forms/signals';

const formRoot = form({
  email: fieldPath<string>('', { required: true }),
});

// ↓ Field Registry provides component
const inputDefinition = registry.get('input');
// { name: 'input', loadComponent: () => import('./input.component'), ... }

// ↓ Mapper creates bindings
const bindings = inputDefinition.mapper(fieldDef, { fieldSignalContext });
// [
//   inputBinding('field', () => formRoot.structure.childrenMap.get('email')),
//   inputBinding('key', () => 'email'),
//   inputBinding('label', () => fieldDef.label),
//   // ...
// ]

// ↓ DynamicFieldComponent renders with bindings
<InputFieldComponent [field]="..." [key]="'email'" [label]="..." />
```

### 2. User Interaction to Value Update

```typescript
// User types in input
<input [field]="field()" (input)="..." />

// ↓ Angular's [field] directive updates signal form
field().value.set('user@example.com');

// ↓ FormState signal updates (reactive)
formState.update(state => ({
  ...state,
  values: { email: 'user@example.com' },
}));

// ↓ Conditional logic evaluates (if any)
if (logicConfig) {
  evaluateCondition(logicConfig.condition, formState());
}

// ↓ Component re-renders (OnPush + signals)
// Only affected components re-render
```

### 3. Form Submission

```typescript
// User clicks submit button
<button type="submit">Submit</button>

// ↓ Button triggers event
eventBus.dispatch(new SubmitEvent());

// ↓ DynamicForm handles event
this.eventBus.on(SubmitEvent).subscribe(() => {
  if (this.formState().valid) {
    const value = this.extractFormValue();
    this.submitted.emit(value);
  }
});

// ↓ Application receives typed value
onSubmit(value: ExtractFormValue<typeof config>) {
  // TypeScript knows: { email: string }
}
```

## Type System

### 1. Type Registry (Module Augmentation)

The core library defines empty interfaces that UI adapters augment:

**Core Library:**

```typescript
// packages/dynamic-form/src/lib/models/registry/field-registry.ts
export interface FieldRegistryLeaves {
  text: TextField; // Only core types
}

export interface DynamicFormFieldRegistry {
  containers: FieldRegistryContainers;
  leaves: FieldRegistryLeaves;
}
```

**UI Adapter:**

```typescript
// packages/dynamic-form-primeng/src/lib/types/registry-augmentation.ts
declare module '@ng-forge/dynamic-form' {
  interface FieldRegistryLeaves {
    input: PrimeInputField;
    select: PrimeSelectField<unknown>;
    checkbox: PrimeCheckboxField;
    // ... all PrimeNG field types
  }
}
```

**Result:** TypeScript knows all registered field types and provides autocomplete.

### 2. Type Inference

The library uses TypeScript's template literal types and conditional types:

```typescript
// User config
const config = {
  fields: [
    { key: 'email', type: 'input', value: '', required: true },
    { key: 'age', type: 'input', value: 0 },
  ],
} as const satisfies FormConfig;

// ExtractFormValue infers:
type FormValue = {
  email: string; // required: true → T (not T | undefined)
  age?: number; // required: false → T | undefined
};
```

This is achieved through recursive type mapping:

```typescript
type ExtractFormValue<T extends FormConfig> = T extends { fields: infer F }
  ? F extends readonly FieldConfig[]
    ? ExtractFieldsValue<F>
    : never
  : never;

type ExtractFieldsValue<T extends readonly FieldConfig[]> = Prettify<UnionToIntersection<ExtractFieldValue<T[number]>>>;

// Handles required/optional, groups, rows, etc.
```

## Mapper System

Mappers convert field definitions to Angular component bindings:

```typescript
export interface FieldTypeDefinition {
  name: string;
  loadComponent: () => Promise<Type<any>>;
  mapper: FieldMapper;
  valueHandling?: 'include' | 'exclude' | 'flatten';
}

export type FieldMapper = (fieldDef: FieldDef<any>, options: FieldMapperOptions) => Binding[];
```

**Example: Value Field Mapper**

```typescript
export function valueFieldMapper(fieldDef: BaseValueField<any, any>, options: ValueFieldMapperOptions): Binding[] {
  const bindings: Binding[] = [];

  // 1. Get form field from signal context
  const formRoot = options.fieldSignalContext.form();
  const childrenMap = formRoot.structure?.childrenMap?.();
  const formField = childrenMap?.get(fieldDef.key);

  if (formField?.fieldProxy) {
    // 2. Bind Angular signal form field
    bindings.push(inputBinding('field', () => formField.fieldProxy));
  }

  // 3. Bind key (required for field identification)
  bindings.push(inputBinding('key', () => fieldDef.key));

  // 4. Bind standard properties
  if (fieldDef.label !== undefined) {
    bindings.push(inputBinding('label', () => fieldDef.label));
  }
  if (fieldDef.placeholder !== undefined) {
    bindings.push(inputBinding('placeholder', () => fieldDef.placeholder));
  }
  if (fieldDef.className !== undefined) {
    bindings.push(inputBinding('className', () => fieldDef.className));
  }

  // 5. Bind field-specific props
  if (fieldDef.props !== undefined) {
    bindings.push(inputBinding('props', () => fieldDef.props));
  }

  return bindings;
}
```

**Built-in Mappers:**

- `baseFieldMapper` - Base bindings (label, className, key)
- `valueFieldMapper` - Adds form field binding for input fields
- `checkboxFieldMapper` - For boolean fields
- `buttonFieldMapper` - For button fields (no form binding)
- `groupFieldMapper` - For group containers
- `rowFieldMapper` - For row layout
- `pageFieldMapper` - For multi-step forms

## Validation System

### 1. Shorthand to Validator Conversion

```typescript
// User writes:
{ key: 'email', type: 'input', value: '', required: true, email: true }

// Converted to:
import { required, email } from '@angular/forms/signals';

form({
  email: fieldPath<string>('', {
    required: required(fieldPath('email')),
    email: email(fieldPath('email')),
  }),
});
```

### 2. Advanced Validation

```typescript
// User writes:
{
  validators: [{
    type: 'max',
    value: 100,
    when: {
      type: 'fieldValue',
      fieldPath: 'discountType',
      operator: 'equals',
      value: 'percentage',
    },
  }],
}

// Converted to:
computed(() => {
  const discountType = form().value().discountType;
  return discountType === 'percentage'
    ? { max: max(100)(fieldPath('discount')) }
    : null;
});
```

### 3. Custom Error Messages

Error messages are stored in a separate map and injected into field components:

```typescript
validationMessages: {
  required: 'Email is required',
  email: 'Invalid email format',
}

// In error display component:
@Component({
  template: `
    @if (invalid() && touched()) {
      @for (error of errors(); track error.key) {
        <div class="error">
          {{ getErrorMessage(error.key) }}
        </div>
      }
    }
  `,
})
export class ErrorsComponent {
  errors = input.required<ValidationErrors>();
  customMessages = input<ValidationMessages>();

  getErrorMessage(errorKey: string): string {
    return this.customMessages()?.[errorKey]
      ?? DEFAULT_MESSAGES[errorKey]
      ?? 'Invalid value';
  }
}
```

## Conditional Logic System

### 1. Condition Evaluation

```typescript
interface LogicConfig {
  type: 'hidden' | 'readonly' | 'required' | 'disabled';
  condition: ConditionalExpression | boolean;
}

// Evaluator creates computed signal
const shouldHide = computed(() => {
  const condition = logicConfig.condition;
  const formValue = this.formState().value;

  if (condition.type === 'fieldValue') {
    const fieldValue = get(formValue, condition.fieldPath);
    return evaluateOperator(fieldValue, condition.operator, condition.value);
  }
  // ... other condition types
});

// Applied to field binding
bindings.push(inputBinding('hidden', shouldHide));
```

### 2. Logic Types

- **hidden**: Field not rendered (but still in form state)
- **readonly**: Field displayed but not editable
- **disabled**: Field disabled (grayed out)
- **required**: Field validation added conditionally

## Value Handling

Fields have different value handling behaviors:

### 1. Include (Default)

Field contributes to form value:

```typescript
{ key: 'email', type: 'input', value: '' }
// Form value: { email: string }
```

### 2. Exclude

Field excluded from form value (buttons, text displays):

```typescript
{ type: 'button', key: 'submit', label: 'Submit' }
// Form value: {} (button doesn't contribute)
```

### 3. Flatten

Container's children added to parent level:

```typescript
{
  type: 'row',  // No key
  fields: [
    { key: 'firstName', type: 'input', value: '' },
    { key: 'lastName', type: 'input', value: '' },
  ],
}
// Form value: { firstName: string, lastName: string }
// NOT: { row: { firstName, lastName } }
```

### 4. Include (Nested)

Container creates nested object:

```typescript
{
  key: 'address',
  type: 'group',
  fields: [
    { key: 'street', type: 'input', value: '' },
    { key: 'city', type: 'input', value: '' },
  ],
}
// Form value: { address: { street: string, city: string } }
```

## Event System

### 1. Event Bus

Global event bus for form events:

```typescript
@Injectable({ providedIn: 'root' })
export class EventBus {
  private subject = new Subject<FormEvent>();

  emit(event: FormEvent): void {
    this.subject.next(event);
  }

  on<T extends FormEvent>(eventType: FormEventConstructor<T>): Observable<T> {
    return this.subject.pipe(
      filter((event) => event.type === eventType.eventName),
      map((event) => event as T)
    );
  }
}
```

### 2. Built-in Events

- `SubmitEvent` - Form submitted
- `NextPageEvent` - Navigate to next page
- `PreviousPageEvent` - Navigate to previous page
- `PageChangeEvent` - Page changed
- `ComponentInitializedEvent` - Field component initialized

### 3. Custom Events

```typescript
export class SaveDraftEvent extends FormEvent {
  static override readonly eventName = 'SaveDraft';
}

// In button:
{ type: 'button', key: 'draft', event: new SaveDraftEvent() }

// In component:
eventBus.on(SaveDraftEvent).subscribe(() => {
  console.log('Draft saved');
});
```

## Performance Optimizations

### 1. Lazy Loading

All field components are lazy loaded:

```typescript
{
  name: 'input',
  loadComponent: () => import('./input.component'),
}
```

Only components used in the form are loaded.

### 2. OnPush Change Detection

All components use `OnPush`:

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})
```

Combined with signals, only affected components re-render.

### 3. Computed Signals

Derived state uses `computed()`:

```typescript
readonly inputClasses = computed(() => {
  const props = this.props();
  return props?.styleClass ?? '';
});
```

Automatically memoized and only recalculated when dependencies change.

### 4. Field Context Memoization

Field contexts are memoized to avoid recreating bindings:

```typescript
private readonly memoizedBuildContext = memoize(
  (fieldDef, formField, mapper) => mapper(fieldDef, { formField }),
  (fieldDef, formField) => `${fieldDef.key}-${fieldDef.type}`
);
```

## Summary

The ng-forge dynamic forms library is built on these core principles:

1. **Declarative Configuration**: Forms defined as data, not templates
2. **Type Safety**: Full TypeScript inference throughout
3. **Signal Forms Integration**: Native Angular 21 support
4. **UI Agnostic**: Core library doesn't depend on any UI framework
5. **Extensible**: Easy to add custom field types
6. **Performance**: Lazy loading, OnPush, memoization
7. **Developer Experience**: Autocomplete, type checking, clear errors

The architecture separates concerns cleanly:

- **Core**: Form logic, validation, state management
- **Adapters**: UI-specific field components
- **Application**: Form configuration and submission handling

This separation allows the library to support multiple UI frameworks while maintaining a consistent API and type-safe developer experience.
