<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

You can find comprehensive documentation in the [README.md](README.md) and docs folder.

# Package Manager

**CRITICAL**: This project uses **pnpm** (v8.15.1+). NEVER use npm or yarn.

```bash
pnpm install         # Install dependencies
pnpm build:libs      # Build all library packages
pnpm test            # Run all tests
pnpm lint            # Lint all projects
```

# Nx Commands

Always prefer running tasks through `nx` rather than using underlying tooling directly:

```bash
# Run tasks
nx run <project>:build
nx run <project>:test
nx run <project>:lint

# Run tasks for multiple projects
nx run-many -t build
nx run-many -t test -p dynamic-form,dynamic-form-material

# Run tasks for affected projects only
nx affected -t build
nx affected -t test
nx affected -t lint
```

# Workflow

- Always typecheck after making code changes
- Prefer running single tests for performance: `nx run <project>:test --testNamePattern="specific test"`
- Use the Nx MCP server tools to understand workspace architecture
- For Nx configuration questions, use the `nx_docs` MCP tool

# Nx MCP Tools

- `nx_workspace` - Get workspace structure and project graph
- `nx_project_details` - Get detailed project configuration
- `nx_docs` - Search Nx documentation for best practices

---

# ng-forge Dynamic Forms Architecture

You are working on **ng-forge**, a type-safe, dynamic forms library for Angular 21+ built on Angular's signal forms. This project has specific architectural patterns that MUST be followed.

## Project Structure

```
ng-forge/
├── packages/                    # Published npm packages
│   ├── dynamic-form/           # Core library (UI-agnostic)
│   ├── dynamic-form-material/  # Material Design adapter
│   ├── dynamic-form-primeng/   # PrimeNG adapter
│   ├── dynamic-form-ionic/     # Ionic adapter
│   └── dynamic-form-bootstrap/ # Bootstrap adapter
├── apps/
│   ├── docs/                   # Documentation site
│   └── examples/               # Example applications
│       ├── material/
│       ├── primeng/
│       └── ionic/
```

**Package Tags:**

- `npm:public` - Publishable packages
- `npm:private` - Internal packages
- `examples` - Example applications
- `demo` - Demo applications with e2e tests

---

## TypeScript & Angular Best Practices

### TypeScript

- Use strict type checking
- Prefer type inference when obvious
- Avoid `any`; use `unknown` when uncertain
- Use `lodash-es` (tree-shakeable) and `date-fns` for utility functions

### Angular Fundamentals

- **ALWAYS** use standalone components (NgModules are forbidden)
- **DO NOT** set `standalone: true` - it's the default in Angular 21
- **ALWAYS** use signals for state management
- **ALWAYS** use `input()` and `output()` functions, **NEVER** decorators
- **ALWAYS** use `computed()` for derived state
- **ALWAYS** set `changeDetection: ChangeDetectionStrategy.OnPush`
- **ALWAYS** use `inject()` function, **NEVER** constructor injection

### Templates & Control Flow

- **DO NOT** use `*ngIf`, `*ngFor`, `*ngSwitch` - use `@if`, `@for`, `@switch`
- **DO NOT** use `ngClass` - use `[class]` bindings
- **DO NOT** use `ngStyle` - use `[style]` bindings
- **ALWAYS** use the `async` pipe for observables

### Host Bindings

**DO NOT** use `@HostBinding` or `@HostListener` decorators. Use the `host` object:

```typescript
@Component({
  selector: 'my-component',
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
    '(click)': 'onClick()',
  },
})
```

### State Management

- Use signals for local component state
- Use `computed()` for derived state
- **DO NOT** use `mutate()` on signals - use `set()` or `update()`

---

## Core Dynamic Forms Patterns

### 1. Field Definition Hierarchy

All field types extend from these base interfaces:

```typescript
// Base for all fields
interface FieldDef<TProps> {
  key: string;
  type: string;
  label?: DynamicText;
  props?: TProps;
  className?: string;
  disabled?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  tabIndex?: number;
  col?: number; // 1-12 for grid layout
}

// For fields with values (input, select, textarea, etc.)
type BaseValueField<TProps, TValue> = FieldDef<TProps> & {
  value: TValue;
  defaultValue?: TValue;
  placeholder?: DynamicText;
  required?: boolean;
  // validation props...
};

// For checkbox/toggle fields
type BaseCheckedField<TProps> = FieldDef<TProps> & {
  checked?: boolean;
  // validation props...
};
```

**RULE**: NEVER create field definitions from scratch. ALWAYS extend base field interfaces.

### 2. Type Registry & Module Augmentation Pattern

**CRITICAL PATTERN**: The core library defines a global field registry that UI adapters augment via TypeScript module declaration.

**Core Registry** (`packages/dynamic-form/src/lib/models/registry/field-registry.ts`):

```typescript
export interface FieldRegistryContainers {
  page: PageField;
  row: RowField;
  group: GroupField;
}

export interface FieldRegistryLeaves {
  text: TextField;
  // Core field types
}

export interface DynamicFormFieldRegistry {
  containers: FieldRegistryContainers;
  leaves: FieldRegistryLeaves;
}
```

**Adapter Augmentation** (`packages/dynamic-form-primeng/src/lib/types/registry-augmentation.ts`):

```typescript
declare module '@ng-forge/dynamic-form' {
  interface FieldRegistryLeaves {
    input: PrimeInputField;
    select: PrimeSelectField<unknown>;
    checkbox: PrimeCheckboxField;
    // ... more field types
  }
}
```

**MANDATORY RULES:**

1. **ALWAYS** create `types/registry-augmentation.ts` in adapter packages
2. **ALWAYS** import this file in the adapter's `index.ts` (for side effects)
3. Container fields go in `FieldRegistryContainers`, leaf fields in `FieldRegistryLeaves`
4. Field type names MUST match the `name` in `FieldTypeDefinition`

### 3. Field Type Definition Pattern

**In `config/{library}-field-config.ts`:**

```typescript
import { FieldTypeDefinition } from '@ng-forge/dynamic-form';

export const PRIMENG_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: 'input',
    loadComponent: () => import('../fields/input/prime-input.component'),
    mapper: valueFieldMapper, // From core library
    valueHandling: 'include', // 'include' | 'exclude' | 'flatten'
  },
  {
    name: 'button',
    loadComponent: () => import('../fields/button/prime-button.component'),
    mapper: buttonFieldMapper,
    valueHandling: 'exclude', // Buttons don't contribute to form values
  },
];
```

**Value Handling Modes:**

- `'include'` (default) - Field contributes to form values (input, select, textarea)
- `'exclude'` - Field excluded from form values (button, text, display)
- `'flatten'` - Children flattened to parent level (page, row containers)

**RULE**: **ALWAYS** use lazy loading: `loadComponent: () => import(...)`

### 4. Field Component Implementation

**Required File Structure:**

```
packages/dynamic-form-{library}/src/lib/fields/{field-name}/
├── {library}-{field-name}.component.ts  # Component (default export)
├── {library}-{field-name}.type.ts       # Type definitions
├── {library}-{field-name}.spec.ts       # Tests
└── index.ts                             # Barrel export
```

**Type Definition Pattern** (`prime-input.type.ts`):

```typescript
import { InputField, InputProps, ValueFieldComponent } from '@ng-forge/dynamic-form';

export interface PrimeInputProps extends InputProps {
  styleClass?: string;
  hint?: DynamicText;
  size?: 'small' | 'large';
  variant?: 'outlined' | 'filled';
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
}

export type PrimeInputField = InputField<PrimeInputProps>;
export type PrimeInputComponent = ValueFieldComponent<PrimeInputField>;
```

**Component Implementation** (`prime-input.component.ts`):

```typescript
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { DynamicText, DynamicTextPipe } from '@ng-forge/dynamic-form';
import { AsyncPipe, FormsModule } from '@angular/common';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'df-prime-input',
  imports: [InputText, DynamicTextPipe, AsyncPipe, FormsModule, Field],
  template: `
    @let f = field();

    <div class="df-prime-field">
      @if (label(); as label) {
      <label [for]="key()" class="df-prime-label">
        {{ label | dynamicText | async }}
      </label>
      }

      <input
        pInputText
        [field]="f"
        [id]="key()"
        [type]="props()?.type ?? 'text'"
        [placeholder]="(placeholder() | dynamicText | async) ?? ''"
        [disabled]="f().disabled()"
        [class]="inputClasses()"
      />

      <df-prime-errors [errors]="f().errors()" [invalid]="f().invalid()" [touched]="f().touched()" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
  },
})
export default class PrimeInputFieldComponent implements PrimeInputComponent {
  // REQUIRED inputs from mapper
  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  // Standard inputs from FieldDef
  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  // Field-specific props
  readonly props = input<PrimeInputProps>();

  // Computed properties
  readonly inputClasses = computed(() => {
    const classes: string[] = [];
    if (this.props()?.styleClass) {
      classes.push(this.props()!.styleClass);
    }
    return classes.join(' ');
  });
}
```

**MANDATORY COMPONENT RULES:**

1. Component MUST be a **default export** (for lazy loading)
2. MUST implement the component type interface (e.g., `PrimeInputComponent`)
3. MUST use `input.required()` for `field` and `key`
4. MUST use Angular's `Field` directive from `@angular/forms/signals` with `[field]` binding
5. MUST set `changeDetection: ChangeDetectionStrategy.OnPush`
6. MUST include `host` bindings for `id`, `data-testid`, and `class`
7. **NEVER** use `model()` in field components (only used in root `DynamicForm`)
8. **NEVER** use `@Input()` or `@Output()` decorators
9. **ALWAYS** use `@let` for template variables to avoid multiple function calls

### 5. DynamicText Support

Fields support multiple text sources:

```typescript
type DynamicText = string | Observable<string> | Signal<string>;

// Static string
{
  label: 'Email Address';
}

// Observable (translation service)
{
  label: this.transloco.selectTranslate('form.email.label');
}

// Signal
{
  label: computed(() => this.translations().email.label);
}
```

**RULE**: **ALWAYS** use `DynamicTextPipe` with `async` pipe in templates:

```html
<label>{{ label() | dynamicText | async }}</label>
```

### 6. Form Configuration Pattern

```typescript
import { FormConfig, ExtractFormValue } from '@ng-forge/dynamic-form';

const config = {
  fields: [
    {
      key: 'email',
      type: 'input',
      value: '',
      label: 'Email',
      required: true,
      email: true,
    },
    {
      key: 'address',
      type: 'group',
      label: 'Address',
      fields: [
        { key: 'street', type: 'input', value: '' },
        { key: 'city', type: 'input', value: '' },
      ],
    },
  ],
} as const satisfies FormConfig;

// Type inference
onSubmit(value: ExtractFormValue<typeof config>) {
  // TypeScript knows: { email: string, address?: { street?: string, city?: string } }
}
```

**CRITICAL**: **ALWAYS** use `as const satisfies FormConfig` for type inference.

### 7. Provider Pattern

**Application-level:**

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideDynamicForm } from '@ng-forge/dynamic-form';
import { withPrimeNGFields } from '@ng-forge/dynamic-form-primeng';

export const appConfig: ApplicationConfig = {
  providers: [provideDynamicForm(...withPrimeNGFields())],
};
```

**Adapter Provider** (`packages/dynamic-form-{library}/src/lib/providers/{library}-providers.ts`):

```typescript
export function withPrimeNGFields(): FieldTypeDefinition[] {
  return PRIMENG_FIELD_TYPES;
}
```

**RULE**: Provider functions MUST be named `with{LibraryName}Fields()`.

### 8. Validation & Conditional Logic

**Simple Validation (Shorthand):**

```typescript
{
  key: 'email',
  type: 'input',
  required: true,
  email: true,
  minLength: 5,
  maxLength: 100,
  pattern: /^[a-z]+$/,
}
```

**Conditional Validation:**

```typescript
{
  key: 'discount',
  type: 'input',
  validators: [{
    type: 'max',
    value: 100,
    when: {
      type: 'fieldValue',
      fieldPath: 'discountType',
      operator: 'equals',
      value: 'percentage',
    },
    errorMessage: 'Percentage cannot exceed 100%',
  }],
}
```

**Conditional Logic:**

```typescript
{
  key: 'taxId',
  type: 'input',
  logic: [{
    type: 'required',  // 'hidden' | 'readonly' | 'disabled' | 'required'
    condition: {
      type: 'fieldValue',  // 'formValue' | 'custom' | 'javascript'
      fieldPath: 'accountType',
      operator: 'equals',  // 'notEquals' | 'greater' | 'less' | 'contains'...
      value: 'business',
    },
    errorMessage: 'Tax ID required for business accounts',
  }],
}
```

### 9. Testing Patterns

**ALWAYS** use the test utilities for your UI library:

```typescript
import { PrimeNGFormTestUtils } from '../../testing/primeng-test-utils';
import { untracked } from '@angular/core';

describe('PrimeInputFieldComponent', () => {
  it('should render and handle input', async () => {
    const config = PrimeNGFormTestUtils.builder()
      .field({
        key: 'email',
        type: 'input',
        label: 'Email',
        required: true,
      })
      .build();

    const { fixture, component } = await PrimeNGFormTestUtils.createTest({
      config,
      initialValue: { email: '' },
    });

    // Simulate user input
    await PrimeNGFormTestUtils.simulatePrimeInput(fixture, 'input[type="email"]', 'test@example.com');

    // Assert form value
    expect(PrimeNGFormTestUtils.getFormValue(component).email).toBe('test@example.com');
  });
});
```

**CRITICAL**: Use `untracked(() => fixture.detectChanges())` when updating values.

### 10. Container Fields (Group, Row, Page)

**Group Field** (`valueHandling: 'include'`):

```typescript
{
  key: 'address',
  type: 'group',
  fields: [
    { key: 'street', type: 'input', value: '' },
    { key: 'city', type: 'input', value: '' },
  ],
}
// Form value: { address: { street?: string, city?: string } }
```

**Row Field** (`valueHandling: 'flatten'`):

```typescript
{
  key: 'nameRow',  // Key is required for all fields
  type: 'row',
  fields: [
    { key: 'firstName', type: 'input', value: '', col: 6 },
    { key: 'lastName', type: 'input', value: '', col: 6 },
  ],
}
// Form value: { firstName?: string, lastName?: string }
// Note: Row fields flatten their children to parent level
```

**Page Field** (Multi-step forms):

```typescript
{
  fields: [
    {
      key: 'step1',
      type: 'page',
      title: 'Personal Info',
      fields: [
        { key: 'firstName', type: 'input', value: '', required: true },
        { type: 'next', key: 'next', label: 'Continue' },
      ],
    },
    {
      key: 'step2',
      type: 'page',
      title: 'Contact',
      fields: [
        { key: 'email', type: 'input', value: '', required: true },
        { type: 'previous', key: 'back', label: 'Back' },
        { type: 'submit', key: 'submit', label: 'Complete' },
      ],
    },
  ],
}
```

### 11. Mappers

**Built-in Mappers** (from core library - ALWAYS reuse):

- `baseFieldMapper` - For fields with no form binding (text, button)
- `valueFieldMapper` - For fields with values (input, select, textarea)
- `checkboxFieldMapper` - For boolean fields (checkbox, toggle)
- `groupFieldMapper` - For group containers
- `rowFieldMapper` - For row layout
- `pageFieldMapper` - For multi-step forms

**Custom Mapper Example** (button field):

```typescript
import { Binding, inputBinding } from '@angular/core';

export function buttonFieldMapper(fieldDef: ButtonField<any, any>): Binding[] {
  const bindings: Binding[] = baseFieldMapper(fieldDef);

  if (fieldDef.disabled !== undefined) {
    bindings.push(inputBinding('disabled', () => fieldDef.disabled));
  }
  if (fieldDef.event !== undefined) {
    bindings.push(inputBinding('event', () => fieldDef.event));
  }

  return bindings;
}
```

### 12. Field Options Pattern

For select, radio, and multi-checkbox fields:

```typescript
export interface FieldOption<T = unknown> {
  label: DynamicText;
  value: T;
  disabled?: boolean;
  [key: string]: unknown;  // Allow custom properties
}

// Usage:
{
  key: 'country',
  type: 'select',
  options: [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
  ],
}
```

**RULE**: Options MUST use `label` and `value` properties (not `text`).

### 13. Naming Conventions

**MANDATORY Naming:**

- Field components: `{Library}{FieldType}FieldComponent` (e.g., `PrimeInputFieldComponent`)
- Field types: `{Library}{FieldType}Field` (e.g., `PrimeInputField`)
- Component types: `{Library}{FieldType}Component` (e.g., `PrimeInputComponent`)
- Props interfaces: `{Library}{FieldType}Props` (e.g., `PrimeInputProps`)
- Default export: Component class (for lazy loading)

**CSS Class Naming:**

- Container: `df-{library}-field`
- Label: `df-{library}-label`
- Hint: `df-{library}-hint`
- Errors: `df-{library}-errors`

---

## Critical "DO NOT" Rules

### Component Decorators

❌ **DO NOT** set `standalone: true` (it's the default)
❌ **DO NOT** use `@Input()`, `@Output()`, `@HostBinding()`, `@HostListener()`
✅ **DO** use `input()`, `output()`, and `host` object

### State Management

❌ **DO NOT** use `mutate()` on signals
✅ **DO** use `set()` or `update()`

### Templates

❌ **DO NOT** use `*ngIf`, `*ngFor`, `*ngSwitch`
✅ **DO** use `@if`, `@for`, `@switch`

### Styling

❌ **DO NOT** use `ngClass` or `ngStyle`
✅ **DO** use `[class]` and `[style]` bindings

### Forms

❌ **DO NOT** use template-driven forms or reactive forms
✅ **DO** use Angular signal forms

### Field Components

❌ **DO NOT** use `model()` in field components
✅ **DO** use `[field]` directive from `@angular/forms/signals`

### Field Type Properties

❌ **DO NOT** hardcode `type` property in base field type definitions
✅ **DO** let consuming field definition specify the `type`

---

## Package Exports & Public API

**Adapter Package Exports** (`packages/dynamic-form-{library}/src/lib/index.ts`):

```typescript
// Field components (re-exported from barrel files)
export * from './fields';

// Configuration
export { PRIMENG_FIELD_TYPES } from './config/primeng-field-config';

// Types
export type { PrimeField } from './types/types';

// Module augmentation (import for side effects)
import './types/registry-augmentation';

// Providers
export { withPrimeNGFields } from './providers/primeng-providers';

// Shared components
export { PrimeErrorsComponent } from './shared/prime-errors.component';

// Testing utilities
export * from './testing';
```

**RULE**: Adapter packages MUST export testing utilities.

---

## Additional Notes

- Angular version: 21.0.0-next.10
- Node.js: >=20.0.0
- pnpm: >=8.0.0
- Key dependencies: lodash-es, date-fns, @angular/forms/signals

<!-- nx configuration end-->
