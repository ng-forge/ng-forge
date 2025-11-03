import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicForm } from '../dynamic-form.component';
import { delay } from './delay';
import { FieldDef } from '../definitions';
import { provideDynamicForm } from '../providers/dynamic-form-providers';
import { Component, signal, Type } from '@angular/core';
import { FIELD_REGISTRY, FieldTypeDefinition } from '../models/field-type';
import { EventBus } from '../events/event.bus';

/**
 * Simple form configuration interface for testing
 */
export interface TestFormConfig {
  fields: FieldDef<Record<string, unknown>>[];
}

/**
 * Configuration for creating a dynamic form test
 */
export interface SimpleTestConfig<T = Record<string, unknown>> {
  config: TestFormConfig;
  initialValue?: T;
}

/**
 * Result of creating a dynamic form test
 */
export interface SimpleTestResult {
  component: any;
  fixture: any;
}

/**
 * Fluent API for building form configurations using existing field structure
 */
export class TestFormConfigBuilder<T = Record<string, unknown>> {
  private fields: FieldDef<Record<string, unknown>>[] = [];

  field(field: FieldDef<Record<string, unknown>>): TestFormConfigBuilder<T> {
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

    fixture.componentRef.setInput('config', config);
    if (initialValue !== undefined) {
      fixture.componentRef.setInput('value', initialValue);
    }

    fixture.detectChanges();
    return { component, fixture };
  }

  /**
   * Waits for the dynamic form to initialize
   */
  static async waitForInit(fixture: any): Promise<void> {
    await delay(0);
    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates user input on a field element
   */
  static async simulateInput(fixture: any, selector: string, value: string): Promise<void> {
    const input = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
    if (!input) {
      throw new Error(`Input element not found with selector: ${selector}`);
    }

    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates checkbox toggle
   */
  static async simulateCheckbox(fixture: any, selector: string, checked: boolean): Promise<void> {
    const checkbox = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
    if (!checkbox) {
      throw new Error(`Checkbox element not found with selector: ${selector}`);
    }

    checkbox.checked = checked;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Gets the current form value from the component
   */
  static getFormValue(component: any): Record<string, unknown> | undefined {
    return component.formValue();
  }

  /**
   * Checks if the form is valid
   */
  static isFormValid(component: any): boolean {
    return component.valid();
  }

  /**
   * Asserts that the form has a specific value
   */
  static assertFormValue(component: any, expectedValue: Record<string, unknown>): void {
    const actualValue = component.formValue();
    if (JSON.stringify(actualValue) !== JSON.stringify(expectedValue)) {
      throw new Error(`Expected form value to be ${JSON.stringify(expectedValue)}, but got ${JSON.stringify(actualValue)}`);
    }
  }
}

// Mock field component for testing
@Component({
  selector: 'df-test-field',
  template: '<div>Test Field: {{ value() }}</div>',
})
export class TestFieldComponent {
  value = signal('test');
}

/**
 * Configuration for setting up a simple component test
 */
export interface SimpleComponentTestConfig<T = any> {
  field: FieldDef<Record<string, unknown>>;
  value?: T;
}

/**
 * Result of setting up a simple component test
 */
export interface SimpleComponentTestResult<T = any> {
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
    mapper: () => [], // Simple mapper that returns empty bindings for testing
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
    ],
  });

  const fixture = TestBed.createComponent(componentType);
  const component = fixture.componentInstance;

  fixture.componentRef.setInput('field', config.field);
  fixture.componentRef.setInput('key', config.field.key);
  if (config.value !== undefined) {
    fixture.componentRef.setInput('value', config.value);
  }

  fixture.detectChanges();

  return { component, fixture };
}

/**
 * Creates a simple test field definition
 */
export function createSimpleTestField(key: string, label: string): FieldDef<Record<string, unknown>> {
  return {
    key,
    type: 'test',
    label,
  };
}
