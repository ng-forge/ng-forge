# Testing Guide

## Introduction

This guide covers testing patterns for ng-forge dynamic forms, including unit tests, type tests, E2E tests, and visual regression testing.

## Testing Strategy Overview

ng-forge uses a layered testing approach:

| Layer                 | Location                                   | Purpose                                               | Tools                         |
| --------------------- | ------------------------------------------ | ----------------------------------------------------- | ----------------------------- |
| **Unit Tests**        | `packages/dynamic-forms/`                  | Core library logic (mappers, validators, expressions) | Vitest                        |
| **Type Tests**        | `packages/dynamic-forms-*/src/lib/fields/` | Compile-time type safety for UI adapters              | Vitest typecheck              |
| **E2E Tests**         | `apps/examples/*/src/app/testing/`         | User-facing behavior across all UI libraries          | Playwright in Docker          |
| **Visual Regression** | `apps/examples/*/src/app/testing/`         | Screenshot comparison for UI consistency              | Playwright toHaveScreenshot() |

### Why This Approach?

1. **Core logic is thoroughly unit tested** - The `dynamic-forms` package has 65+ spec files covering expressions, mappers, validators, and components.

2. **UI adapters use type tests** - Field components in UI adapters (Material, Bootstrap, PrimeNG, Ionic) are thin wrappers. Type tests verify compile-time correctness; runtime behavior is covered by E2E tests.

3. **E2E tests verify real user behavior** - Running against actual example applications ensures components work correctly in real browser environments.

4. **Visual regression catches styling issues** - Screenshot comparison ensures UI changes are intentional and consistent.

## E2E Testing

### Docker-Based Setup

All E2E tests run in Docker to ensure consistent rendering across developer machines and CI. This eliminates platform-specific screenshot differences.

```bash
# Run E2E tests for any UI library
pnpm e2e:ionic
pnpm e2e:material
pnpm e2e:bootstrap
pnpm e2e:primeng

# Update visual regression baselines
pnpm e2e:ionic:update
pnpm e2e:material:update
pnpm e2e:bootstrap:update
pnpm e2e:primeng:update
```

### Test Structure

E2E tests are organized by scenario in each example app:

```
apps/examples/ionic/src/app/testing/
├── shared/
│   ├── fixtures.ts          # Test helpers and custom matchers
│   ├── test-utils.ts         # URL helpers, ionBlur, etc.
│   └── types.ts              # TypeScript interfaces
├── accessibility/
│   └── accessibility.spec.ts # ARIA, keyboard navigation, focus
├── comprehensive-field-tests/
│   └── comprehensive-field-tests.spec.ts  # All field types
├── validation/
│   └── advanced-validation.spec.ts        # Validation scenarios
└── ...
```

### Writing E2E Tests

Use the provided fixtures and helpers:

```typescript
import { expect, setupConsoleCheck, setupTestLogging, test } from '../shared/fixtures';
import { testUrl } from '../shared/test-utils';

setupTestLogging();
setupConsoleCheck();

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(testUrl('/my-feature'));
    await page.waitForLoadState('networkidle');
  });

  test('should display form fields', async ({ page, helpers }) => {
    const scenario = helpers.getScenario('my-scenario');
    await expect(scenario).toBeVisible({ timeout: 10000 });

    // Interact with fields
    const input = scenario.locator('#myField input');
    await input.fill('test value');
    await input.blur();

    // Verify behavior
    await expect(input).toHaveValue('test value');
  });
});
```

### Visual Regression Testing

Capture screenshots at key states for visual comparison:

```typescript
test('should render form states correctly', async ({ page, helpers }) => {
  const scenario = helpers.getScenario('validation-test');
  await expect(scenario).toBeVisible({ timeout: 10000 });

  // Screenshot 1: Empty state
  await helpers.expectScreenshotMatch(scenario, 'ionic-validation-empty');

  // Fill with invalid data
  await scenario.locator('#email input').fill('invalid');
  await scenario.locator('#email input').blur();

  // Screenshot 2: Error state
  await helpers.expectScreenshotMatch(scenario, 'ionic-validation-errors');

  // Fill with valid data
  await scenario.locator('#email input').fill('valid@example.com');
  await scenario.locator('#email input').blur();

  // Screenshot 3: Valid state
  await helpers.expectScreenshotMatch(scenario, 'ionic-validation-valid');
});
```

**Baseline Management:**

- Baselines are stored in `apps/examples/*/src/app/testing/__snapshots__/`
- Baselines are committed to git
- Update baselines with `pnpm e2e:{lib}:update`
- Review screenshot changes carefully before committing

### Error Visibility Testing

Use `expectErrorVisible` to verify errors are not just in the DOM but actually visible to users:

```typescript
test('should show visible error messages', async ({ page, helpers }) => {
  const scenario = helpers.getScenario('error-test');

  // Trigger validation error
  const input = scenario.locator('#required input');
  await input.focus();
  await input.blur();

  // Verify error is VISIBLE (not just exists in DOM)
  await helpers.expectErrorVisible(scenario, 'required');
});
```

### Console Error Checking

Tests automatically fail on console errors:

```typescript
setupConsoleCheck(); // Add this to catch console errors

// Optionally ignore specific patterns:
setupConsoleCheck({
  ignorePatterns: [/Expected warning pattern/],
});
```

## Type Tests

UI adapter packages use type tests instead of unit tests. Type tests verify compile-time type safety without runtime execution.

### Purpose

Type tests ensure:

1. **Field definitions are correctly typed** - Props match expected interfaces
2. **Union type narrowing works** - Discriminated unions narrow correctly
3. **Form value inference is correct** - `FormConfig` infers proper value types
4. **Module augmentation is working** - Field types are registered properly

### Writing Type Tests

Type tests use `// @ts-expect-error` and `expectTypeOf` assertions:

**`packages/dynamic-forms-material/src/lib/fields/input/mat-input.type-test.ts`:**

```typescript
import { expectTypeOf } from 'vitest';
import type { FormConfig, RegisteredFieldTypes } from '@ng-forge/dynamic-forms';
import type { MatInputField } from './mat-input.type';
import { MatField } from '../../types/types';

// Verify field type is registered
expectTypeOf<MatInputField>().toMatchTypeOf<RegisteredFieldTypes>();

// Verify FormConfig accepts MatInputField
const config = {
  fields: [
    {
      type: MatField.Input,
      key: 'email',
      value: '',
      label: 'Email',
      props: {
        type: 'email',
        placeholder: 'Enter email',
      },
    },
  ],
} as const satisfies FormConfig;

// Verify inferred form value type
type FormValue = typeof config extends FormConfig<infer V> ? V : never;
expectTypeOf<FormValue>().toEqualTypeOf<{ email: string }>();

// @ts-expect-error - Invalid prop should error
const invalidConfig: FormConfig = {
  fields: [
    {
      type: MatField.Input,
      key: 'test',
      value: '',
      props: {
        invalidProp: true, // This should error
      },
    },
  ],
};
```

### Running Type Tests

```bash
# Run type tests for all packages
pnpm nx run-many -t type-test

# Run for specific package
pnpm nx run dynamic-forms-material:type-test
```

Type tests run via Vitest's `typecheck` mode and don't execute code - they only verify types at compile time.

## Unit Test Utilities

### Why Test Utilities?

Test utilities provide:

1. **Consistent setup** - Standard way to create test components
2. **Reduced boilerplate** - Helper functions for common operations
3. **Type safety** - Proper typing for test scenarios
4. **Maintainability** - Changes to library reflected in one place

### Core Test Utility Structure

```typescript
export class FormTestUtils {
  /**
   * Config builder pattern
   */
  static builder() {
    return new ConfigBuilder();
  }

  /**
   * Create test component
   */
  static async createTest(options: TestOptions): Promise<TestFixture> {
    // Setup TestBed
    // Create component
    // Set inputs
    // Return fixture
  }

  /**
   * Simulate user interactions
   */
  static async simulateInput(fixture, selector, value) {}
  static async simulateClick(fixture, selector) {}
  static async simulateBlur(fixture, selector) {}

  /**
   * Form value helpers
   */
  static getFormValue(component) {}
  static updateFormValue(fixture, value) {}
  static assertFormValue(component, expected) {}

  /**
   * Validation helpers
   */
  static assertValid(component) {}
  static assertInvalid(component) {}
  static getErrors(component, key) {}
}
```

### PrimeNG Test Utils Example

**`packages/dynamic-forms-primeng/src/lib/testing/primeng-test-utils.ts`:**

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-forms';
import { withPrimeNGFields } from '../providers/primeng-providers';
import { untracked } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import { delay } from './delay';
import { waitForDFInit } from './wait-for-df';

/**
 * Fluent API for building PrimeNG form configurations
 */
export class PrimeNGFormConfigBuilder {
  private fields: unknown[] = [];

  field(field: unknown): PrimeNGFormConfigBuilder {
    this.fields.push(field);
    return this;
  }

  primeInputField(input: Omit<PrimeInputField, 'type'>): PrimeNGFormConfigBuilder {
    return this.field({
      type: PrimeField.Input,
      ...input,
    });
  }

  // ... other field-specific methods

  build(): FormConfig {
    return { fields: this.fields } as unknown as FormConfig;
  }
}

export class PrimeNGFormTestUtils {
  /**
   * Creates a new PrimeNG form config builder
   */
  static builder(): PrimeNGFormConfigBuilder {
    return new PrimeNGFormConfigBuilder();
  }

  /**
   * Create test fixture with DynamicForm
   */
  static async createTest(testConfig: { config: FormConfig; initialValue?: Record<string, unknown>; providers?: unknown[] }): Promise<{
    fixture: ComponentFixture<DynamicForm>;
    component: DynamicForm;
  }> {
    await TestBed.configureTestingModule({
      imports: [DynamicForm],
      providers: [
        provideAnimations(),
        providePrimeNG({ ripple: false }),
        provideDynamicForm(...withPrimeNGFields()),
        ...(testConfig.providers || []),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DynamicForm);
    const component = fixture.componentInstance;

    // Set up the component - use 'dynamic-form' as the input name since config uses alias: 'dynamic-form'
    fixture.componentRef.setInput('dynamic-form', testConfig.config);

    // Set initial value if provided
    if (testConfig.initialValue !== undefined) {
      fixture.componentRef.setInput('value', testConfig.initialValue);
    }

    // Wrap detectChanges in untracked to allow PrimeNG signal writes
    untracked(() => fixture.detectChanges());
    await PrimeNGFormTestUtils.waitForInit(fixture);

    return { fixture, component };
  }

  /**
   * Waits for the PrimeNG dynamic form to initialize
   */
  static async waitForInit(fixture: ComponentFixture<DynamicForm>): Promise<void> {
    await waitForDFInit(fixture.componentInstance, fixture);

    // Flush effects critical for zoneless change detection
    TestBed.flushEffects();
    untracked(() => fixture.detectChanges());
    await fixture.whenStable();

    // Additional cycles for PrimeNG directives to fully initialize
    for (let i = 0; i < 2; i++) {
      TestBed.flushEffects();
      untracked(() => fixture.detectChanges());
      await delay(0);
    }

    // Final stabilization
    await fixture.whenStable();
    TestBed.flushEffects();
    untracked(() => fixture.detectChanges());
  }

  /**
   * Simulate user typing in PrimeNG input
   */
  static async simulatePrimeInput(fixture: ComponentFixture<any>, selector: string, value: string): Promise<void> {
    const inputElement = fixture.debugElement.query(By.css(selector));
    expect(inputElement).toBeTruthy(`Input with selector '${selector}' not found`);

    const nativeElement = inputElement.nativeElement;
    nativeElement.value = value;
    nativeElement.dispatchEvent(new Event('input'));

    untracked(() => fixture.detectChanges());
    await fixture.whenStable();
  }

  /**
   * Simulate clicking an element
   */
  static async simulateClick(fixture: ComponentFixture<any>, selector: string): Promise<void> {
    const element = fixture.debugElement.query(By.css(selector));
    expect(element).toBeTruthy(`Element with selector '${selector}' not found`);

    element.nativeElement.click();

    untracked(() => fixture.detectChanges());
    await fixture.whenStable();
  }

  /**
   * Get current form value
   */
  static getFormValue(component: DynamicForm): Record<string, unknown> {
    return component.formValue();
  }

  /**
   * Update form value programmatically and wait for PrimeNG to synchronize
   */
  static async updateFormValue(fixture: ComponentFixture<DynamicForm>, value: Record<string, unknown>): Promise<void> {
    fixture.componentRef.setInput('value', value);
    untracked(() => fixture.detectChanges());
    await delay(0);
    untracked(() => fixture.detectChanges());
    await delay(0);
  }

  /**
   * Assert form value matches expected
   */
  static assertFormValue(component: DynamicForm, expected: any): void {
    const actual = this.getFormValue(component);
    expect(actual).toEqual(expected);
  }

  /**
   * Assert form is valid
   */
  static assertValid(component: DynamicForm): void {
    const formState = component.formState();
    expect(formState?.form().valid()).toBe(true);
  }

  /**
   * Assert form is invalid
   */
  static assertInvalid(component: DynamicForm): void {
    const formState = component.formState();
    expect(formState?.form().invalid()).toBe(true);
  }

  /**
   * Get errors for a specific field
   */
  static getErrors(component: DynamicForm, key: string): any {
    const formState = component.formState();
    const childrenMap = formState?.form().structure?.childrenMap?.();
    const field = childrenMap?.get(key);
    return field?.errors() ?? null;
  }

  /**
   * Mark field as touched
   */
  static markAsTouched(component: DynamicForm, key: string): void {
    const formState = component.formState();
    const childrenMap = formState?.form().structure?.childrenMap?.();
    const field = childrenMap?.get(key);
    if (field) {
      field.markAsTouched();
    }
  }

  /**
   * Mark all fields as touched
   */
  static markAllAsTouched(component: DynamicForm): void {
    const formState = component.formState();
    formState?.form().markAsTouched();
  }
}
```

## Testing Field Components

### Basic Component Test

```typescript
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PrimeNGFormTestUtils } from '../../testing/primeng-test-utils';

describe('PrimeInputFieldComponent', () => {
  let fixture: ComponentFixture<any>;
  let component: any;

  beforeEach(async () => {
    const config = PrimeNGFormTestUtils.builder()
      .field({
        key: 'email',
        type: 'input',
        value: '',
        label: 'Email Address',
        placeholder: 'Enter your email',
      })
      .build();

    const testResult = await PrimeNGFormTestUtils.createTest({
      config,
      initialValue: { email: '' },
    });

    fixture = testResult.fixture;
    component = testResult.component;
  });

  it('should render label', () => {
    const label = fixture.debugElement.query(By.css('label'));
    expect(label).toBeTruthy();
    expect(label.nativeElement.textContent).toContain('Email Address');
  });

  it('should render input with placeholder', () => {
    const input = fixture.debugElement.query(By.css('input'));
    expect(input).toBeTruthy();
    expect(input.nativeElement.placeholder).toBe('Enter your email');
  });

  it('should bind to form field', () => {
    expect(PrimeNGFormTestUtils.getFormValue(component).email).toBe('');
  });
});
```

### Testing User Interactions

```typescript
describe('PrimeInputFieldComponent - User Interactions', () => {
  it('should update form value when user types', async () => {
    const config = PrimeNGFormTestUtils.builder()
      .field({
        key: 'username',
        type: 'input',
        value: '',
      })
      .build();

    const { fixture, component } = await PrimeNGFormTestUtils.createTest({
      config,
      initialValue: { username: '' },
    });

    // User types
    await PrimeNGFormTestUtils.simulatePrimeInput(fixture, 'input', 'johndoe');

    // Assert value updated
    expect(PrimeNGFormTestUtils.getFormValue(component).username).toBe('johndoe');
  });

  it('should handle blur event', async () => {
    const config = PrimeNGFormTestUtils.builder()
      .field({
        key: 'email',
        type: 'input',
        value: '',
        required: true,
      })
      .build();

    const { fixture, component } = await PrimeNGFormTestUtils.createTest({
      config,
      initialValue: { email: '' },
    });

    const input = fixture.debugElement.query(By.css('input'));

    // Focus and blur without value
    input.nativeElement.focus();
    input.nativeElement.blur();
    fixture.detectChanges();

    // Should show validation error after blur
    PrimeNGFormTestUtils.markAsTouched(component, 'email');
    fixture.detectChanges();

    const errors = fixture.debugElement.query(By.css('.df-prime-errors'));
    expect(errors).toBeTruthy();
  });
});
```

### Testing Props

```typescript
describe('PrimeInputFieldComponent - Props', () => {
  it('should apply custom styleClass', async () => {
    const config = PrimeNGFormTestUtils.builder()
      .field({
        key: 'email',
        type: 'input',
        value: '',
        props: {
          styleClass: 'custom-input',
        },
      })
      .build();

    const { fixture } = await PrimeNGFormTestUtils.createTest({
      config,
      initialValue: { email: '' },
    });

    const input = fixture.debugElement.query(By.css('input'));
    expect(input.nativeElement.classList.contains('custom-input')).toBe(true);
  });

  it('should use specified input type', async () => {
    const config = PrimeNGFormTestUtils.builder()
      .field({
        key: 'password',
        type: 'input',
        value: '',
        props: {
          type: 'password',
        },
      })
      .build();

    const { fixture } = await PrimeNGFormTestUtils.createTest({
      config,
      initialValue: { password: '' },
    });

    const input = fixture.debugElement.query(By.css('input'));
    expect(input.nativeElement.type).toBe('password');
  });

  it('should display hint', async () => {
    const config = PrimeNGFormTestUtils.builder()
      .field({
        key: 'username',
        type: 'input',
        value: '',
        props: {
          hint: 'Must be 3-20 characters',
        },
      })
      .build();

    const { fixture } = await PrimeNGFormTestUtils.createTest({
      config,
      initialValue: { username: '' },
    });

    const hint = fixture.debugElement.query(By.css('.df-prime-hint'));
    expect(hint).toBeTruthy();
    expect(hint.nativeElement.textContent).toContain('Must be 3-20 characters');
  });
});
```

### Testing Disabled/Readonly States

```typescript
describe('PrimeInputFieldComponent - States', () => {
  it('should disable input when disabled=true', async () => {
    const config = PrimeNGFormTestUtils.builder()
      .field({
        key: 'email',
        type: 'input',
        value: '',
        disabled: true,
      })
      .build();

    const { fixture } = await PrimeNGFormTestUtils.createTest({
      config,
      initialValue: { email: '' },
    });

    const input = fixture.debugElement.query(By.css('input'));
    expect(input.nativeElement.disabled).toBe(true);
  });

  it('should make input readonly when readonly=true', async () => {
    const config = PrimeNGFormTestUtils.builder()
      .field({
        key: 'email',
        type: 'input',
        value: 'readonly@example.com',
        readonly: true,
      })
      .build();

    const { fixture } = await PrimeNGFormTestUtils.createTest({
      config,
      initialValue: { email: 'readonly@example.com' },
    });

    const input = fixture.debugElement.query(By.css('input'));
    expect(input.nativeElement.readOnly).toBe(true);
  });
});
```

## Testing Validation

### Required Validation

```typescript
describe('Validation - Required', () => {
  it('should validate required field', async () => {
    const config = PrimeNGFormTestUtils.builder()
      .field({
        key: 'email',
        type: 'input',
        value: '',
        required: true,
      })
      .build();

    const { fixture, component } = await PrimeNGFormTestUtils.createTest({
      config,
      initialValue: { email: '' },
    });

    // Initially invalid (empty + required)
    PrimeNGFormTestUtils.assertInvalid(component);

    // Fill in value
    await PrimeNGFormTestUtils.simulatePrimeInput(fixture, 'input', 'test@example.com');

    // Now valid
    PrimeNGFormTestUtils.assertValid(component);
  });

  it('should show required error message', async () => {
    const config = PrimeNGFormTestUtils.builder()
      .field({
        key: 'email',
        type: 'input',
        value: '',
        required: true,
        validationMessages: {
          required: 'Email is required',
        },
      })
      .build();

    const { fixture, component } = await PrimeNGFormTestUtils.createTest({
      config,
      initialValue: { email: '' },
    });

    // Mark as touched to show errors
    PrimeNGFormTestUtils.markAsTouched(component, 'email');
    fixture.detectChanges();

    const errorElement = fixture.debugElement.query(By.css('.df-prime-error'));
    expect(errorElement).toBeTruthy();
    expect(errorElement.nativeElement.textContent).toContain('Email is required');
  });
});
```

### Email Validation

```typescript
describe('Validation - Email', () => {
  it('should validate email format', async () => {
    const config = PrimeNGFormTestUtils.builder()
      .field({
        key: 'email',
        type: 'input',
        value: '',
        required: true,
        email: true,
      })
      .build();

    const { fixture, component } = await PrimeNGFormTestUtils.createTest({
      config,
      initialValue: { email: '' },
    });

    // Invalid email
    await PrimeNGFormTestUtils.simulatePrimeInput(fixture, 'input', 'invalid-email');
    PrimeNGFormTestUtils.assertInvalid(component);

    // Valid email
    await PrimeNGFormTestUtils.simulatePrimeInput(fixture, 'input', 'valid@example.com');
    PrimeNGFormTestUtils.assertValid(component);
  });
});
```

### Length Validation

```typescript
describe('Validation - Length', () => {
  it('should validate minLength', async () => {
    const config = PrimeNGFormTestUtils.builder()
      .field({
        key: 'username',
        type: 'input',
        value: '',
        minLength: 3,
      })
      .build();

    const { fixture, component } = await PrimeNGFormTestUtils.createTest({
      config,
      initialValue: { username: '' },
    });

    // Too short
    await PrimeNGFormTestUtils.simulatePrimeInput(fixture, 'input', 'ab');
    PrimeNGFormTestUtils.assertInvalid(component);

    // Valid length
    await PrimeNGFormTestUtils.simulatePrimeInput(fixture, 'input', 'abc');
    PrimeNGFormTestUtils.assertValid(component);
  });

  it('should validate maxLength', async () => {
    const config = PrimeNGFormTestUtils.builder()
      .field({
        key: 'username',
        type: 'input',
        value: '',
        maxLength: 20,
      })
      .build();

    const { fixture, component } = await PrimeNGFormTestUtils.createTest({
      config,
      initialValue: { username: '' },
    });

    // Too long
    await PrimeNGFormTestUtils.simulatePrimeInput(fixture, 'input', 'a'.repeat(21));
    PrimeNGFormTestUtils.assertInvalid(component);

    // Valid length
    await PrimeNGFormTestUtils.simulatePrimeInput(fixture, 'input', 'a'.repeat(20));
    PrimeNGFormTestUtils.assertValid(component);
  });
});
```

### Pattern Validation

```typescript
describe('Validation - Pattern', () => {
  it('should validate against regex pattern', async () => {
    const config = PrimeNGFormTestUtils.builder()
      .field({
        key: 'username',
        type: 'input',
        value: '',
        pattern: '^[a-zA-Z0-9_]+$',
      })
      .build();

    const { fixture, component } = await PrimeNGFormTestUtils.createTest({
      config,
      initialValue: { username: '' },
    });

    // Invalid pattern (contains special char)
    await PrimeNGFormTestUtils.simulatePrimeInput(fixture, 'input', 'user@name');
    PrimeNGFormTestUtils.assertInvalid(component);

    // Valid pattern
    await PrimeNGFormTestUtils.simulatePrimeInput(fixture, 'input', 'user_name');
    PrimeNGFormTestUtils.assertValid(component);
  });
});
```

## Testing Conditional Logic

### Conditional Visibility

```typescript
describe('Conditional Logic - Visibility', () => {
  it('should hide field based on condition', async () => {
    const config = PrimeNGFormTestUtils.builder()
      .field({
        key: 'accountType',
        type: 'select',
        value: 'personal',
        options: [
          { value: 'personal', label: 'Personal' },
          { value: 'business', label: 'Business' },
        ],
      })
      .field({
        key: 'companyName',
        type: 'input',
        value: '',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'accountType',
              operator: 'notEquals',
              value: 'business',
            },
          },
        ],
      })
      .build();

    const { fixture, component } = await PrimeNGFormTestUtils.createTest({
      config,
      initialValue: { accountType: 'personal', companyName: '' },
    });

    // Company name should be hidden for personal account
    let companyField = fixture.debugElement.query(By.css('[data-testid="companyName"]'));
    expect(companyField).toBeFalsy();

    // Change to business account
    PrimeNGFormTestUtils.updateFormValue(fixture, {
      accountType: 'business',
      companyName: '',
    });

    // Company name should now be visible
    companyField = fixture.debugElement.query(By.css('[data-testid="companyName"]'));
    expect(companyField).toBeTruthy();
  });
});
```

### Conditional Required

```typescript
describe('Conditional Logic - Required', () => {
  it('should make field required based on condition', async () => {
    const config = PrimeNGFormTestUtils.builder()
      .field({
        key: 'accountType',
        type: 'select',
        value: 'personal',
        options: [
          { value: 'personal', label: 'Personal' },
          { value: 'business', label: 'Business' },
        ],
      })
      .field({
        key: 'taxId',
        type: 'input',
        value: '',
        logic: [
          {
            type: 'required',
            condition: {
              type: 'fieldValue',
              fieldPath: 'accountType',
              operator: 'equals',
              value: 'business',
            },
            errorMessage: 'Tax ID required for business accounts',
          },
        ],
      })
      .build();

    const { fixture, component } = await PrimeNGFormTestUtils.createTest({
      config,
      initialValue: { accountType: 'personal', taxId: '' },
    });

    // Personal account: taxId not required, form valid
    PrimeNGFormTestUtils.assertValid(component);

    // Switch to business account
    PrimeNGFormTestUtils.updateFormValue(fixture, {
      accountType: 'business',
      taxId: '',
    });

    // Business account: taxId required, form invalid
    PrimeNGFormTestUtils.assertInvalid(component);

    // Fill in taxId
    await PrimeNGFormTestUtils.simulatePrimeInput(fixture, 'input[id="taxId"]', '12-3456789');

    // Now valid
    PrimeNGFormTestUtils.assertValid(component);
  });
});
```

## Testing Complex Scenarios

### Multi-Step Forms

```typescript
describe('Multi-Step Forms', () => {
  it('should navigate between pages', async () => {
    const config = {
      fields: [
        {
          key: 'step1',
          type: 'page',
          title: 'Personal Info',
          fields: [
            { key: 'name', type: 'input', value: '', required: true },
            { type: 'next', key: 'next1', label: 'Continue' },
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
    };

    const { fixture, component } = await PrimeNGFormTestUtils.createTest({
      config,
      initialValue: { name: '', email: '' },
    });

    // Initially on step 1
    let step1 = fixture.debugElement.query(By.css('[data-testid="step1"]'));
    expect(step1).toBeTruthy();

    // Fill in name
    await PrimeNGFormTestUtils.simulatePrimeInput(fixture, 'input[id="name"]', 'John Doe');

    // Click next
    await PrimeNGFormTestUtils.simulateClick(fixture, 'button[data-testid="next1"]');

    // Now on step 2
    const step2 = fixture.debugElement.query(By.css('[data-testid="step2"]'));
    expect(step2).toBeTruthy();

    // Click back
    await PrimeNGFormTestUtils.simulateClick(fixture, 'button[data-testid="back"]');

    // Back on step 1
    step1 = fixture.debugElement.query(By.css('[data-testid="step1"]'));
    expect(step1).toBeTruthy();
  });
});
```

### Form Groups

```typescript
describe('Form Groups', () => {
  it('should create nested form value', async () => {
    const config = PrimeNGFormTestUtils.builder()
      .field({
        key: 'address',
        type: 'group',
        label: 'Address',
        fields: [
          { key: 'street', type: 'input', value: '' },
          { key: 'city', type: 'input', value: '' },
          { key: 'zip', type: 'input', value: '' },
        ],
      })
      .build();

    const { fixture, component } = await PrimeNGFormTestUtils.createTest({
      config,
      initialValue: { address: { street: '', city: '', zip: '' } },
    });

    // Fill in address fields
    await PrimeNGFormTestUtils.simulatePrimeInput(fixture, 'input[id="address.street"]', '123 Main St');
    await PrimeNGFormTestUtils.simulatePrimeInput(fixture, 'input[id="address.city"]', 'New York');
    await PrimeNGFormTestUtils.simulatePrimeInput(fixture, 'input[id="address.zip"]', '10001');

    // Assert nested value structure
    const formValue = PrimeNGFormTestUtils.getFormValue(component);
    expect(formValue).toEqual({
      address: {
        street: '123 Main St',
        city: 'New York',
        zip: '10001',
      },
    });
  });
});
```

## Best Practices

### 1. Use Test Utilities

✅ **DO:**

```typescript
const { fixture, component } = await PrimeNGFormTestUtils.createTest({
  config,
  initialValue,
});
```

❌ **DON'T:**

```typescript
const fixture = TestBed.createComponent(DynamicForm);
// Manual setup...
```

### 2. Test User Perspective

✅ **DO:**

```typescript
it('should show error after touching empty required field', async () => {
  // Simulate user interaction
  await PrimeNGFormTestUtils.simulatePrimeInput(fixture, 'input', '');
  await PrimeNGFormTestUtils.simulateBlur(fixture, 'input');

  // Check visible UI
  const error = fixture.debugElement.query(By.css('.error'));
  expect(error).toBeTruthy();
});
```

❌ **DON'T:**

```typescript
it('should have required validator', () => {
  // Testing implementation details
  expect(component.formState().controls.email.validators).toContain('required');
});
```

### 3. Test Edge Cases

✅ **DO:**

```typescript
it('should handle empty value', async () => {});
it('should handle null value', async () => {});
it('should handle very long input', async () => {});
it('should handle special characters', async () => {});
```

### 4. Use Descriptive Test Names

✅ **DO:**

```typescript
it('should show validation error when email format is invalid', async () => {});
it('should hide company field when account type is personal', async () => {});
```

❌ **DON'T:**

```typescript
it('test 1', async () => {});
it('should work', async () => {});
```

### 5. Clean Up Between Tests

✅ **DO:**

```typescript
afterEach(() => {
  fixture.destroy();
});
```

### 6. Test Accessibility

```typescript
it('should have proper aria attributes', () => {
  const input = fixture.debugElement.query(By.css('input'));
  expect(input.nativeElement.getAttribute('aria-label')).toBeTruthy();
  expect(input.nativeElement.getAttribute('aria-required')).toBe('true');
});
```

## Summary

Effective testing for ng-forge dynamic forms:

1. ✅ Use test utilities for consistency
2. ✅ Test from user perspective
3. ✅ Cover validation scenarios
4. ✅ Test conditional logic
5. ✅ Test complex scenarios (multi-step, groups)
6. ✅ Test edge cases
7. ✅ Write descriptive test names
8. ✅ Test accessibility

This ensures robust, maintainable form components and configurations.
