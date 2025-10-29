import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicForm } from '../dynamic-form.component';
import { FieldDef, FormConfig } from '../models/global-types';
import { delay } from './delay';

/**
 * Configuration for creating a dynamic form test
 */
export interface SimpleTestConfig<T = any> {
  config: FormConfig<T>;
  initialValue?: T;
}

/**
 * Result of creating a dynamic form test
 */
export interface SimpleTestResult<T = any> {
  component: DynamicForm<T>;
  fixture: ComponentFixture<DynamicForm<T>>;
}

/**
 * Fluent API for building form configurations using existing field structure
 */
export class FormConfigBuilder<T = any> {
  private config: FormConfig<T> = { fields: [] };

  field(field: FieldDef): FormConfigBuilder<T> {
    this.config.fields.push(field);
    return this;
  }

  inputField(key: string, props?: Record<string, any>): FormConfigBuilder<T> {
    return this.field({
      key,
      type: 'input',
      label: key.charAt(0).toUpperCase() + key.slice(1),
      ...props,
    });
  }

  requiredInputField(key: string, props?: Record<string, any>): FormConfigBuilder<T> {
    return this.inputField(key, { required: true, ...props });
  }

  checkboxField(key: string, props?: Record<string, any>): FormConfigBuilder<T> {
    return this.field({
      key,
      type: 'checkbox',
      label: key.charAt(0).toUpperCase() + key.slice(1),
      ...props,
    });
  }

  build(): FormConfig<T> {
    return this.config;
  }
}

/**
 * Simple utility class for testing dynamic forms
 */
export class SimpleTestUtils {
  /**
   * Creates a new form config builder
   */
  static builder<T = any>(): FormConfigBuilder<T> {
    return new FormConfigBuilder<T>();
  }

  /**
   * Creates a simple test component - assumes TestBed is already configured
   */
  static createComponent<T = any>(config: FormConfig<T> = { fields: [] }, initialValue?: T): SimpleTestResult<T> {
    const fixture = TestBed.createComponent(DynamicForm<T>);
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
  static async waitForInit(fixture: ComponentFixture<any>): Promise<void> {
    await delay(0);
    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates user input on a field element
   */
  static async simulateInput(fixture: ComponentFixture<any>, selector: string, value: string): Promise<void> {
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
  static async simulateCheckbox(fixture: ComponentFixture<any>, selector: string, checked: boolean): Promise<void> {
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
  static getFormValue<T>(component: DynamicForm<T>): T | undefined {
    return component.formValue();
  }

  /**
   * Checks if the form is valid
   */
  static isFormValid<T>(component: DynamicForm<T>): boolean {
    return component.valid();
  }

  /**
   * Asserts that the form has a specific value
   */
  static assertFormValue<T>(component: DynamicForm<T>, expectedValue: T): void {
    const actualValue = component.formValue();
    if (JSON.stringify(actualValue) !== JSON.stringify(expectedValue)) {
      throw new Error(`Expected form value to be ${JSON.stringify(expectedValue)}, but got ${JSON.stringify(actualValue)}`);
    }
  }
}
