import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicForm } from '../../src/lib/dynamic-form.component';
import { delay } from '@ng-forge/utils';
import { FieldDef } from '../../src/lib/definitions/base/field-def';
import { provideDynamicForm } from '../../src/lib/providers/dynamic-form-providers';
import { Component, computed, Injector, input, runInInjectionContext, signal, Type } from '@angular/core';
import { FIELD_REGISTRY } from '../../src/lib/models/field-type';
import { FieldTypeDefinition } from '../../src/lib/models/field-type';
import { FIELD_SIGNAL_CONTEXT } from '../../src/lib/models/field-signal-context.token';
import { EventBus } from '../../src/lib/events/event.bus';
import { form } from '@angular/forms/signals';
import { RegisteredFieldTypes } from '../../src/lib/models/registry/field-registry';

/**
 * Simple form configuration interface for testing
 */
export interface TestFormConfig {
  fields: FieldDef<unknown>[];
}

/**
 * Configuration for creating a dynamic form test
 */
export interface SimpleTestConfig<T = Record<string, unknown>> {
  config: TestFormConfig;
  initialValue?: T;
}

/**
 * Result of creating a dynamic form test.
 * Uses the base DynamicForm type without generic constraints for flexibility in tests.
 */
export interface SimpleTestResult {
  component: DynamicForm<RegisteredFieldTypes[]>;
  fixture: ComponentFixture<DynamicForm<RegisteredFieldTypes[]>>;
}

/**
 * Fluent API for building form configurations using existing field structure
 */
export class TestFormConfigBuilder<T = Record<string, unknown>> {
  private fields: FieldDef<unknown>[] = [];

  field(field: FieldDef<unknown>): TestFormConfigBuilder<T> {
    this.fields.push(field);
    return this;
  }

  inputField(key: string, props?: Record<string, unknown>): TestFormConfigBuilder<T> {
    return this.field({
      key,
      type: 'input',
      label: key.charAt(0).toUpperCase() + key.slice(1),
      ...props,
    });
  }

  requiredInputField(key: string, props?: Record<string, unknown>): TestFormConfigBuilder<T> {
    return this.inputField(key, { required: true, ...props });
  }

  checkboxField(key: string, props?: Record<string, unknown>): TestFormConfigBuilder<T> {
    return this.field({
      key,
      type: 'checkbox',
      label: key.charAt(0).toUpperCase() + key.slice(1),
      ...props,
    });
  }

  build(): TestFormConfig {
    return { fields: this.fields };
  }
}

/**
 * Simple utility class for testing dynamic forms
 */
export class SimpleTestUtils {
  /**
   * Creates a new form config builder
   */
  static builder<T = Record<string, unknown>>(): TestFormConfigBuilder<T> {
    return new TestFormConfigBuilder<T>();
  }

  /**
   * Creates a simple test component - assumes TestBed is already configured
   */
  static createComponent<T = Record<string, unknown>>(config: TestFormConfig = { fields: [] }, initialValue?: T): SimpleTestResult {
    const fixture = TestBed.createComponent(DynamicForm);
    const component = fixture.componentInstance;

    // Use 'dynamic-form' as the input name since config uses alias: 'dynamic-form'
    fixture.componentRef.setInput('dynamic-form', config);
    if (initialValue !== undefined) {
      fixture.componentRef.setInput('value', initialValue);
    }

    fixture.detectChanges();
    TestBed.flushEffects();
    // Cast to SimpleTestResult - type variance in DynamicForm generics doesn't affect runtime behavior
    return { component, fixture } as SimpleTestResult;
  }

  /**
   * Waits for the dynamic form to initialize
   */
  static async waitForInit(fixture: ComponentFixture<DynamicForm>): Promise<void> {
    await delay(0);
    fixture.detectChanges();
    TestBed.flushEffects();
    await delay(0);
  }

  /**
   * Simulates user input on a field element
   */
  static async simulateInput(fixture: ComponentFixture<DynamicForm>, selector: string, value: string): Promise<void> {
    const input = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
    if (!input) {
      throw new Error(`[Dynamic Forms] Input element not found with selector: ${selector}`);
    }

    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates checkbox toggle
   */
  static async simulateCheckbox(fixture: ComponentFixture<DynamicForm>, selector: string, checked: boolean): Promise<void> {
    const checkbox = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
    if (!checkbox) {
      throw new Error(`[Dynamic Forms] Checkbox element not found with selector: ${selector}`);
    }

    checkbox.checked = checked;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Gets the current form value from the component
   */
  static getFormValue(component: DynamicForm): Record<string, unknown> | undefined {
    return component.formValue();
  }

  /**
   * Checks if the form is valid
   */
  static isFormValid(component: DynamicForm): boolean {
    return component.valid();
  }

  /**
   * Asserts that the form has a specific value
   */
  static assertFormValue(component: DynamicForm, expectedValue: Record<string, unknown>): void {
    const actualValue = component.formValue();
    if (JSON.stringify(actualValue) !== JSON.stringify(expectedValue)) {
      throw new Error(`[Dynamic Forms] Expected form value to be ${JSON.stringify(expectedValue)}, but got ${JSON.stringify(actualValue)}`);
    }
  }
}

// Mock field component for testing
// Includes all inputs that baseFieldMapper and valueFieldMapper might create bindings for
@Component({
  selector: 'df-test-field',
  template: '<div>Test Field: {{ value() }}</div>',
})
export class TestFieldComponent {
  // Field tree input
  field = input<unknown>();

  // Required inputs from baseFieldMapper
  key = input<string>('');
  label = input<string>('');
  className = input<string>('');
  tabIndex = input<number | undefined>(undefined);
  props = input<Record<string, unknown> | undefined>(undefined);
  placeholder = input<string>('');

  // Array-related inputs
  arrayContext = input<unknown>(undefined);
  fields = input<unknown[]>([]);

  // Validation inputs from valueFieldMapper
  validationMessages = input<Record<string, string> | undefined>(undefined);
  defaultValidationMessages = input<Record<string, string> | undefined>(undefined);

  value = signal('test');
}

/**
 * Configuration for setting up a simple component test
 */
export interface SimpleComponentTestConfig<T = unknown> {
  field: FieldDef<unknown>;
  value?: T;
  pageIndex?: number;
  isVisible?: boolean;
  [key: string]: unknown; // Allow additional inputs for flexible component testing
}

/**
 * Result of setting up a simple component test
 */
export interface SimpleComponentTestResult<T = unknown> {
  component: T;
  fixture: ComponentFixture<T>;
}

/**
 * Creates a simple test setup for individual field components
 */
export function setupSimpleTest<T>(componentType: Type<T>, config: SimpleComponentTestConfig): SimpleComponentTestResult<T> {
  const mockFieldType: FieldTypeDefinition = {
    name: 'test',
    loadComponent: async () => TestFieldComponent,
    mapper: () => computed(() => ({})), // Simple mapper that returns empty inputs signal for testing
  };

  TestBed.configureTestingModule({
    imports: [componentType],
    providers: [
      provideDynamicForm(),
      EventBus,
      {
        provide: FIELD_REGISTRY,
        useValue: new Map([['test', mockFieldType]]),
      },
      {
        provide: FIELD_SIGNAL_CONTEXT,
        useFactory: (injector: Injector) => {
          // Create test context using factory
          return runInInjectionContext(injector, () => {
            const defaultValue = (config.value || {}) as T & Record<string, unknown>;
            const valueSignal = signal(defaultValue);
            const formInstance = form(valueSignal);
            return {
              injector,
              value: valueSignal,
              defaultValues: () => defaultValue,
              form: formInstance,
            };
          });
        },
        deps: [Injector],
      },
    ],
  });

  const fixture = TestBed.createComponent(componentType);
  const component = fixture.componentInstance;

  fixture.componentRef.setInput('field', config.field);
  fixture.componentRef.setInput('key', config.field.key);
  if (config.value !== undefined) {
    fixture.componentRef.setInput('value', config.value);
  }
  if (config.pageIndex !== undefined) {
    fixture.componentRef.setInput('pageIndex', config.pageIndex);
  }
  if (config.isVisible !== undefined) {
    fixture.componentRef.setInput('isVisible', config.isVisible);
  }

  // Set any additional inputs provided in config
  Object.keys(config).forEach((key) => {
    if (!['field', 'value', 'pageIndex', 'isVisible'].includes(key) && config[key] !== undefined) {
      fixture.componentRef.setInput(key, config[key]);
    }
  });

  fixture.detectChanges();

  return { component, fixture };
}

/**
 * Creates a simple test field definition
 */
export function createSimpleTestField(key: string, label: string, value?: unknown): FieldDef<unknown> {
  const field: FieldDef<unknown> = {
    key,
    type: 'test',
    label,
  };

  if (value !== undefined) {
    (field as FieldDef<unknown> & { value: unknown }).value = value;
  }

  return field;
}
