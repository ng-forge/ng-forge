# Creating a UI Adapter

## Introduction

This guide walks you through creating a complete UI adapter for ng-forge dynamic forms. We'll create a fictional "SuperUI" adapter from scratch, covering every step and best practice.

## Prerequisites

Before creating an adapter, you should have:

- Understanding of the core library architecture
- Familiarity with the target UI framework (SuperUI)
- Knowledge of Angular signals and forms

## Project Structure

```
packages/dynamic-forms-superui/
├── src/
│   ├── lib/
│   │   ├── config/
│   │   │   └── superui-field-config.ts
│   │   ├── fields/
│   │   │   ├── input/
│   │   │   │   ├── superui-input.component.ts
│   │   │   │   ├── superui-input.type.ts
│   │   │   │   ├── superui-input.type-test.ts
│   │   │   │   └── index.ts
│   │   │   ├── select/
│   │   │   │   ├── superui-select.component.ts
│   │   │   │   ├── superui-select.type.ts
│   │   │   │   ├── superui-select.type-test.ts
│   │   │   │   └── index.ts
│   │   │   ├── checkbox/
│   │   │   │   └── ...
│   │   │   └── index.ts
│   │   ├── providers/
│   │   │   └── superui-providers.ts
│   │   ├── shared/
│   │   │   └── superui-errors.component.ts
│   │   ├── styles/
│   │   │   └── _form-field.scss
│   │   ├── testing/
│   │   │   └── superui-test-utils.ts
│   │   ├── types/
│   │   │   ├── registry-augmentation.ts
│   │   │   └── types.ts
│   │   └── index.ts
│   ├── package.json
│   └── README.md
```

## Step 1: Set Up Package

### `package.json`

```json
{
  "name": "@ng-forge/dynamic-forms-superui",
  "version": "1.0.0",
  "description": "SuperUI integration for ng-forge dynamic forms",
  "peerDependencies": {
    "@angular/common": "^21.0.1",
    "@angular/core": "^21.0.1",
    "@angular/forms": "^21.0.1",
    "@ng-forge/dynamic-forms": "^1.0.0",
    "superui": "^5.0.0"
  },
  "dependencies": {
    "tslib": "^2.3.0"
  },
  "type": "module",
  "exports": {
    ".": {
      "default": "./src/index.ts"
    }
  }
}
```

### `README.md`

```markdown
# @ng-forge/dynamic-forms-superui

SuperUI integration for ng-forge dynamic forms.

## Installation

\`\`\`bash group="install" name="npm"
npm install @ng-forge/dynamic-forms-superui superui
\`\`\`

\`\`\`bash group="install" name="yarn"
yarn add @ng-forge/dynamic-forms-superui superui
\`\`\`

\`\`\`bash group="install" name="pnpm"
pnpm add @ng-forge/dynamic-forms-superui superui
\`\`\`

## Usage

\`\`\`typescript
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withSuperUIFields } from '@ng-forge/dynamic-forms-superui';

export const appConfig: ApplicationConfig = {
providers: [provideDynamicForm(...withSuperUIFields())],
};
\`\`\`
```

## Step 2: Define Field Types

### Base Type Enum

**`src/lib/types/types.ts`:**

```typescript
export enum SuperUIField {
  INPUT = 'input',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  TEXTAREA = 'textarea',
  DATEPICKER = 'datepicker',
  SLIDER = 'slider',
  TOGGLE = 'toggle',
  RADIO = 'radio',
  BUTTON = 'button',
  MULTI_CHECKBOX = 'multiCheckbox',
}
```

This enum provides:

1. Centralized field type names
2. Autocomplete for field types
3. Single source of truth

## Step 3: Create Type Registry Augmentation

**`src/lib/types/registry-augmentation.ts`:**

```typescript
import type {
  SuperUIInputField,
  SuperUISelectField,
  SuperUICheckboxField,
  SuperUITextareaField,
  SuperUIDatepickerField,
  SuperUISliderField,
  SuperUIToggleField,
  SuperUIRadioField,
  SuperUIButtonField,
  SuperUIMultiCheckboxField,
} from '../fields';

declare module '@ng-forge/dynamic-forms' {
  interface FieldRegistryLeaves {
    input: SuperUIInputField;
    select: SuperUISelectField<unknown>;
    checkbox: SuperUICheckboxField;
    textarea: SuperUITextareaField;
    datepicker: SuperUIDatepickerField;
    slider: SuperUISliderField;
    toggle: SuperUIToggleField;
    radio: SuperUIRadioField<unknown>;
    button: SuperUIButtonField;
    multiCheckbox: SuperUIMultiCheckboxField<unknown>;
  }
}
```

**CRITICAL RULES:**

1. Use `FieldRegistryLeaves` for leaf fields (no children)
2. Use `FieldRegistryContainers` for container fields (with children)
3. Use `unknown` for generic type parameters
4. Field type names MUST match the `name` in `FieldTypeDefinition`
5. This file MUST be imported in `index.ts` for side effects

## Step 4: Create Field Components

Let's create a complete input field component as an example.

### Input Type Definition

**`src/lib/fields/input/superui-input.type.ts`:**

```typescript
import { InputField, InputProps, ValueFieldComponent, DynamicText } from '@ng-forge/dynamic-forms';

/**
 * SuperUI-specific input properties
 */
export interface SuperUIInputProps extends InputProps {
  /**
   * CSS class for styling
   */
  styleClass?: string;

  /**
   * Hint text displayed below input
   */
  hint?: DynamicText;

  /**
   * Input size variant
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Input style variant
   */
  variant?: 'outlined' | 'filled' | 'underlined';

  /**
   * HTML input type
   * @default 'text'
   */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

  /**
   * Icon to display (SuperUI icon name)
   */
  icon?: string;

  /**
   * Icon position
   * @default 'left'
   */
  iconPosition?: 'left' | 'right';
}

/**
 * SuperUI input field definition
 */
export type SuperUIInputField = InputField<SuperUIInputProps>;

/**
 * SuperUI input component interface
 */
export type SuperUIInputComponent = ValueFieldComponent<SuperUIInputField>;
```

### Input Component

**`src/lib/fields/input/superui-input.component.ts`:**

```typescript
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Field, FieldTree } from '@angular/forms/signals';
import { AsyncPipe, FormsModule } from '@angular/common';
import { DynamicText, DynamicTextPipe } from '@ng-forge/dynamic-forms';

// SuperUI imports
import { SuperInput } from 'superui/input';
import { SuperIcon } from 'superui/icon';

// Local imports
import { SuperUIErrorsComponent } from '../../shared/superui-errors.component';
import { SuperUIInputComponent, SuperUIInputProps } from './superui-input.type';

@Component({
  selector: 'df-superui-input',
  imports: [SuperInput, SuperIcon, SuperUIErrorsComponent, DynamicTextPipe, AsyncPipe, FormsModule, Field],
  styleUrl: '../../styles/_form-field.scss',
  template: `
    @let f = field();

    <div class="df-superui-field">
      <!-- Label -->
      @if (label(); as label) {
        <label [for]="key()" class="df-superui-label">
          {{ label | dynamicText | async }}
        </label>
      }

      <!-- Input Container -->
      <div class="df-superui-input-container">
        <!-- Left Icon -->
        @if (props()?.icon && props()?.iconPosition === 'left') {
          <super-icon [name]="props()!.icon" />
        }

        <!-- Input -->
        <super-input
          [field]="f"
          [id]="key()"
          [type]="props()?.type ?? 'text'"
          [placeholder]="(placeholder() | dynamicText | async) ?? ''"
          [disabled]="f().disabled()"
          [class]="inputClasses()"
          [size]="props()?.size ?? 'medium'"
          [variant]="props()?.variant ?? 'outlined'"
        />

        <!-- Right Icon -->
        @if (props()?.icon && props()?.iconPosition === 'right') {
          <super-icon [name]="props()!.icon" />
        }
      </div>

      <!-- Hint -->
      @if (props()?.hint; as hint) {
        <div class="df-superui-hint">
          {{ hint | dynamicText | async }}
        </div>
      }

      <!-- Errors -->
      <df-superui-errors [errors]="f().errors()" [invalid]="f().invalid()" [touched]="f().touched()" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
    '[class]': 'className()',
  },
})
export default class SuperUIInputFieldComponent implements SuperUIInputComponent {
  // ========== Required Inputs ==========
  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  // ========== Standard Inputs ==========
  readonly label = input<DynamicText>();
  readonly placeholder = input<DynamicText>();
  readonly className = input<string>('');
  readonly tabIndex = input<number>();

  // ========== Field-Specific Props ==========
  readonly props = input<SuperUIInputProps>();

  // ========== Computed Properties ==========
  readonly inputClasses = computed(() => {
    const classes: string[] = [];
    if (this.props()?.styleClass) {
      classes.push(this.props()!.styleClass);
    }
    return classes.join(' ');
  });
}
```

**Key Patterns:**

1. ✅ Default export (for lazy loading)
2. ✅ Implements component type interface
3. ✅ Uses `input.required()` for `field` and `key`
4. ✅ Uses `[field]` directive from `@angular/forms/signals`
5. ✅ OnPush change detection
6. ✅ Host bindings for `id`, `data-testid`, `class`
7. ✅ Uses `@let` for template variables
8. ✅ DynamicTextPipe for i18n support

### Input Type Tests

UI adapters use type tests to verify compile-time type safety. Runtime behavior is covered by E2E tests in the example applications.

**`src/lib/fields/input/superui-input.type-test.ts`:**

```typescript
import { expectTypeOf } from 'vitest';
import type { FormConfig, RegisteredFieldTypes } from '@ng-forge/dynamic-forms';
import type { SuperUIInputField } from './superui-input.type';
import { SuperUIField } from '../../types/types';

// Verify field type is registered in the global registry
expectTypeOf<SuperUIInputField>().toMatchTypeOf<RegisteredFieldTypes>();

// Verify FormConfig accepts SuperUIInputField with correct props
const validConfig = {
  fields: [
    {
      type: SuperUIField.INPUT,
      key: 'email',
      value: '',
      label: 'Email Address',
      props: {
        type: 'email',
        placeholder: 'Enter email',
        size: 'medium',
        variant: 'outlined',
        icon: 'mail',
        iconPosition: 'left',
      },
    },
  ],
} as const satisfies FormConfig;

// Verify inferred form value type is correct
type FormValue = typeof validConfig extends FormConfig<infer V> ? V : never;
expectTypeOf<FormValue>().toEqualTypeOf<{ email: string }>();

// Verify props type inference
type InputProps = Extract<RegisteredFieldTypes, { type: 'input' }>['props'];
expectTypeOf<InputProps>().toMatchTypeOf<{
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  size?: 'small' | 'medium' | 'large';
  variant?: 'outlined' | 'filled' | 'underlined';
}>();

// @ts-expect-error - Invalid size value should error
const invalidSizeConfig: FormConfig = {
  fields: [
    {
      type: SuperUIField.INPUT,
      key: 'test',
      value: '',
      props: {
        size: 'extra-large', // Invalid - not in union
      },
    },
  ],
};

// @ts-expect-error - Invalid prop should error
const invalidPropConfig: FormConfig = {
  fields: [
    {
      type: SuperUIField.INPUT,
      key: 'test',
      value: '',
      props: {
        nonExistentProp: true, // Invalid - not in interface
      },
    },
  ],
};
```

**Why type tests instead of unit tests?**

1. **Field components are thin wrappers** - They delegate to SuperUI components and Angular forms
2. **Type safety is critical** - Incorrect prop types cause runtime errors that are hard to debug
3. **E2E tests cover runtime behavior** - Real browser tests in example apps verify actual functionality
4. **Faster feedback** - Type tests run at compile time, catching errors before runtime

### Barrel Export

**`src/lib/fields/input/index.ts`:**

```typescript
export { default as SuperUIInputFieldComponent } from './superui-input.component';
export * from './superui-input.type';
```

## Step 5: Create Shared Error Component

**`src/lib/shared/superui-errors.component.ts`:**

```typescript
import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

@Component({
  selector: 'df-superui-errors',
  template: `
    @if (shouldShowErrors()) {
      <div class="df-superui-errors">
        @for (error of errorMessages(); track error) {
          <div class="df-superui-error">{{ error }}</div>
        }
      </div>
    }
  `,
  styleUrl: '../styles/_form-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuperUIErrorsComponent {
  errors = input<ValidationErrors | null>(null);
  invalid = input<boolean>(false);
  touched = input<boolean>(false);

  shouldShowErrors = computed(() => {
    return this.invalid() && this.touched() && this.errors();
  });

  errorMessages = computed(() => {
    const errors = this.errors();
    if (!errors) return [];

    return Object.keys(errors).map((key) => {
      return this.getErrorMessage(key, errors[key]);
    });
  });

  private getErrorMessage(key: string, value: any): string {
    switch (key) {
      case 'required':
        return 'This field is required';
      case 'email':
        return 'Please enter a valid email address';
      case 'minLength':
        return `Minimum length is ${value.requiredLength} characters`;
      case 'maxLength':
        return `Maximum length is ${value.requiredLength} characters`;
      case 'min':
        return `Minimum value is ${value.min}`;
      case 'max':
        return `Maximum value is ${value.max}`;
      case 'pattern':
        return 'Invalid format';
      default:
        return 'Invalid value';
    }
  }
}
```

## Step 6: Create Field Configuration

**`src/lib/config/superui-field-config.ts`:**

```typescript
import { FieldTypeDefinition, valueFieldMapper, checkboxFieldMapper, buttonFieldMapper } from '@ng-forge/dynamic-forms';

export const SUPERUI_FIELD_TYPES: FieldTypeDefinition[] = [
  // ========== Input Field ==========
  {
    name: 'input',
    loadComponent: () => import('../fields/input/superui-input.component'),
    mapper: valueFieldMapper,
    valueHandling: 'include',
  },

  // ========== Select Field ==========
  {
    name: 'select',
    loadComponent: () => import('../fields/select/superui-select.component'),
    mapper: valueFieldMapper,
    valueHandling: 'include',
  },

  // ========== Checkbox Field ==========
  {
    name: 'checkbox',
    loadComponent: () => import('../fields/checkbox/superui-checkbox.component'),
    mapper: checkboxFieldMapper,
    valueHandling: 'include',
  },

  // ========== Textarea Field ==========
  {
    name: 'textarea',
    loadComponent: () => import('../fields/textarea/superui-textarea.component'),
    mapper: valueFieldMapper,
    valueHandling: 'include',
  },

  // ========== Datepicker Field ==========
  {
    name: 'datepicker',
    loadComponent: () => import('../fields/datepicker/superui-datepicker.component'),
    mapper: valueFieldMapper,
    valueHandling: 'include',
  },

  // ========== Slider Field ==========
  {
    name: 'slider',
    loadComponent: () => import('../fields/slider/superui-slider.component'),
    mapper: valueFieldMapper,
    valueHandling: 'include',
  },

  // ========== Toggle Field ==========
  {
    name: 'toggle',
    loadComponent: () => import('../fields/toggle/superui-toggle.component'),
    mapper: checkboxFieldMapper,
    valueHandling: 'include',
  },

  // ========== Radio Field ==========
  {
    name: 'radio',
    loadComponent: () => import('../fields/radio/superui-radio.component'),
    mapper: valueFieldMapper,
    valueHandling: 'include',
  },

  // ========== Button Field ==========
  {
    name: 'button',
    loadComponent: () => import('../fields/button/superui-button.component'),
    mapper: buttonFieldMapper,
    valueHandling: 'exclude', // Buttons don't contribute to form value
  },

  // ========== Multi-Checkbox Field ==========
  {
    name: 'multiCheckbox',
    loadComponent: () => import('../fields/multi-checkbox/superui-multi-checkbox.component'),
    mapper: valueFieldMapper,
    valueHandling: 'include',
  },
];
```

**Mapper Selection:**

- **`valueFieldMapper`**: For fields with form values (input, select, textarea, etc.)
- **`checkboxFieldMapper`**: For boolean fields (checkbox, toggle)
- **`buttonFieldMapper`**: For buttons (no form binding)
- **Custom mapper**: When you need special binding logic

**Value Handling:**

- **`'include'`**: Field value included in form submission
- **`'exclude'`**: Field excluded from form value (buttons, text displays)
- **`'flatten'`**: Children flattened to parent level (row, page containers)

## Step 7: Create Provider Function

**`src/lib/providers/superui-providers.ts`:**

````typescript
import { FieldTypeDefinition } from '@ng-forge/dynamic-forms';
import { SUPERUI_FIELD_TYPES } from '../config/superui-field-config';

/**
 * Provides SuperUI field types to the dynamic form system.
 *
 * @example
 * ```typescript
 * import { provideDynamicForm } from '@ng-forge/dynamic-forms';
 * import { withSuperUIFields } from '@ng-forge/dynamic-forms-superui';
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [provideDynamicForm(...withSuperUIFields())],
 * };
 * ```
 */
export function withSuperUIFields(): FieldTypeDefinition[] {
  return SUPERUI_FIELD_TYPES;
}
````

## Step 8: Create Test Utilities

**`src/lib/testing/superui-test-utils.ts`:**

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicForm, provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withSuperUIFields } from '../providers/superui-providers';
import { untracked } from '@angular/core';
import { By } from '@angular/platform-browser';

export class SuperUIFormTestUtils {
  /**
   * Config builder
   */
  static builder() {
    return {
      fields: [] as any[],
      field(field: any) {
        this.fields.push(field);
        return this;
      },
      build() {
        return { fields: this.fields };
      },
    };
  }

  /**
   * Create test component
   */
  static async createTest(options: { config: any; initialValue?: any }): Promise<{
    fixture: ComponentFixture<DynamicForm>;
    component: DynamicForm;
  }> {
    await TestBed.configureTestingModule({
      imports: [DynamicForm],
      providers: [provideDynamicForm(...withSuperUIFields())],
    }).compileComponents();

    const fixture = TestBed.createComponent(DynamicForm);
    const component = fixture.componentInstance;

    // Set config - use 'dynamic-form' as the input name since config uses alias: 'dynamic-form'
    untracked(() => {
      fixture.componentRef.setInput('dynamic-form', options.config);
      fixture.detectChanges();
    });

    // Set initial value
    if (options.initialValue) {
      this.updateFormValue(fixture, options.initialValue);
    }

    return { fixture, component };
  }

  /**
   * Simulate user input in SuperUI input
   */
  static async simulateSuperUIInput(fixture: ComponentFixture<any>, selector: string, value: string): Promise<void> {
    const input = fixture.debugElement.query(By.css(selector));
    expect(input).toBeTruthy();

    // Update the input value
    input.nativeElement.value = value;
    input.nativeElement.dispatchEvent(new Event('input'));

    untracked(() => fixture.detectChanges());
    await fixture.whenStable();
  }

  /**
   * Get current form value
   */
  static getFormValue(component: DynamicForm): any {
    const formState = component.formState();
    return formState?.form().value() ?? {};
  }

  /**
   * Update form value programmatically
   */
  static updateFormValue(fixture: ComponentFixture<any>, value: any): void {
    const component = fixture.componentInstance;
    const formState = component.formState();

    if (formState) {
      untracked(() => {
        formState.form().value.set(value);
        fixture.detectChanges();
      });
    }
  }

  /**
   * Assert form value
   */
  static assertFormValue(component: DynamicForm, expected: any): void {
    const actual = this.getFormValue(component);
    expect(actual).toEqual(expected);
  }
}
```

## Step 9: Create Styles

**`src/lib/styles/_form-field.scss`:**

```scss
.df-superui-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.df-superui-label {
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--superui-text-primary);
}

.df-superui-input-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.df-superui-hint {
  font-size: 0.75rem;
  color: var(--superui-text-secondary);
}

.df-superui-errors {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.df-superui-error {
  font-size: 0.75rem;
  color: var(--superui-error);
}
```

## Step 10: Create Public API

**`src/lib/index.ts`:**

```typescript
// ========== Field Components ==========
export * from './fields';

// ========== Configuration ==========
export { SUPERUI_FIELD_TYPES } from './config/superui-field-config';

// ========== Types ==========
export { SuperUIField } from './types/types';

// ========== Module Augmentation (Side Effects) ==========
import './types/registry-augmentation';

// ========== Providers ==========
export { withSuperUIFields } from './providers/superui-providers';

// ========== Shared Components ==========
export { SuperUIErrorsComponent } from './shared/superui-errors.component';

// ========== Testing Utilities ==========
export { SuperUIFormTestUtils } from './testing/superui-test-utils';
```

**Critical:** The registry augmentation import MUST be at the top level for side effects.

## Step 11: Add More Field Types

Now that you have the pattern, add remaining fields following the same structure:

### Select Field

```typescript
// superui-select.type.ts
export interface SuperUISelectProps extends SelectProps {
  filter?: boolean;
  showClear?: boolean;
  multiple?: boolean;
}

export type SuperUISelectField<T> = SelectField<T, SuperUISelectProps>;
```

### Checkbox Field

```typescript
// superui-checkbox.type.ts
export interface SuperUICheckboxProps extends CheckboxProps {
  binary?: boolean;
}

export type SuperUICheckboxField = CheckboxField<SuperUICheckboxProps>;
```

### Button Field

```typescript
// superui-button.type.ts
export interface SuperUIButtonProps extends ButtonProps {
  color?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
}

export type SuperUIButtonField = ButtonField<SuperUIButtonProps>;
```

## Best Practices

### 1. Naming Conventions

✅ **DO:**

- Field components: `SuperUI{FieldType}FieldComponent`
- Field types: `SuperUI{FieldType}Field`
- Component types: `SuperUI{FieldType}Component`
- Props: `SuperUI{FieldType}Props`

❌ **DON'T:**

- Inconsistent naming: `SuperUIInput`, `SuperUiSelectComponent`
- Missing "Field" suffix: `SuperUIInputComponent`

### 2. Component Structure

✅ **DO:**

- Use `@let` for template variables
- Use `DynamicTextPipe | async` for labels/placeholders
- Include error display component
- Apply host bindings (`id`, `data-testid`, `class`)
- Use OnPush change detection

❌ **DON'T:**

- Call functions in templates: `{{ getLabel() }}`
- Forget to handle `disabled()` state
- Use `@Input()` decorators

### 3. Type Safety

✅ **DO:**

- Extend base field types (`InputField`, `SelectField`, etc.)
- Implement component type interfaces
- Use `input.required()` for `field` and `key`
- Document props with TSDoc

❌ **DON'T:**

- Create field types from scratch
- Use `any` types
- Skip type interfaces

### 4. Testing

✅ **DO:**

- Write type tests for each field type (`.type-test.ts`)
- Verify field types are registered in the global registry
- Test prop type inference and constraints
- Use `@ts-expect-error` for invalid type scenarios

❌ **DON'T:**

- Write unit tests for field components (use E2E tests instead)
- Skip type tests for new field types
- Forget to test generic type parameters

## Summary

Creating a UI adapter involves:

1. ✅ Set up package structure
2. ✅ Define field types enum
3. ✅ Create type registry augmentation
4. ✅ Implement field components
5. ✅ Create shared error component
6. ✅ Configure field type definitions
7. ✅ Create provider function
8. ✅ Write type tests for each field type
9. ✅ Add styles
10. ✅ Export public API

**Testing Strategy:**

- **Type tests** (`.type-test.ts`) - Verify compile-time type safety for each field type
- **E2E tests** - Runtime behavior is tested in the corresponding example app (`apps/examples/`)

Following this pattern ensures consistency, type safety, and maintainability across all UI adapters.
