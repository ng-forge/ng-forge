import { ComponentFixture, TestBed } from '@angular/core/testing';
import { inputBinding } from '@angular/core';
import { ValidationError } from '@angular/forms/signals';
import { DynamicForm } from '../dynamic-form.component';
import { FormConfig } from '../models';
import { FieldDef, InputField, SelectField } from '../definitions';
import { injectFieldRegistry } from '../utils/inject-field-registry/inject-field-registry';
import { delay } from './delay';
import { checkboxFieldMapper, valueFieldMapper } from '../mappers';
import { FieldMapperOptions } from '../mappers/types';
import { BUILT_IN_FIELDS } from '../providers/built-in-fields';

/**
 * Configuration for creating a dynamic form test
 */
export interface DynamicFormTestConfig {
  config: FormConfig;
  initialValue?: Record<string, unknown>;
  registerTestFields?: boolean;
}

/**
 * Result of creating a dynamic form test
 */
export interface DynamicFormTestResult {
  component: DynamicForm;
  fixture: ComponentFixture<DynamicForm>;
  fieldRegistry: ReturnType<typeof injectFieldRegistry>;
}

/**
 * Fluent API for building form configurations
 */
export class FormConfigBuilder {
  private fields: FieldDef<any>[] = [];

  field(field: FieldDef<any>): FormConfigBuilder {
    this.fields.push(field);
    return this;
  }

  inputField(key: string, props?: Record<string, unknown>): FormConfigBuilder {
    return this.field({
      key,
      type: 'input',
      label: key.charAt(0).toUpperCase() + key.slice(1),
      props: { placeholder: `Enter ${key}`, ...props },
    });
  }

  requiredInputField(key: string, props?: Record<string, unknown>): FormConfigBuilder {
    const inputField: InputField<Record<string, unknown>> = {
      key,
      type: 'input',
      label: key.charAt(0).toUpperCase() + key.slice(1),
      required: true,
      props: { placeholder: `Enter ${key}`, ...props },
    };
    return this.field(inputField);
  }

  selectField(key: string, options: Array<{ value: string; label: string }>, props?: Record<string, unknown>): FormConfigBuilder {
    const selectField: SelectField<string, Record<string, unknown>> = {
      key,
      type: 'select',
      label: key.charAt(0).toUpperCase() + key.slice(1),
      options,
      props: props || {},
    };
    return this.field(selectField);
  }

  checkboxField(key: string, props?: Record<string, unknown>): FormConfigBuilder {
    return this.field({
      key,
      type: 'checkbox',
      label: key.charAt(0).toUpperCase() + key.slice(1),
      props: props || {},
    });
  }

  rowField(key: string, fields: FieldDef<Record<string, unknown>>[]): FormConfigBuilder {
    return this.field({
      key,
      type: 'row',
      fields,
    } as FieldDef<Record<string, unknown>>);
  }

  groupField(key: string, fields: FieldDef<Record<string, unknown>>[]): FormConfigBuilder {
    return this.field({
      key,
      type: 'group',
      fields,
    } as FieldDef<Record<string, unknown>>);
  }

  buttonField(key: string, props?: Record<string, unknown>): FormConfigBuilder {
    return this.field({
      key,
      type: 'button',
      label: key.charAt(0).toUpperCase() + key.slice(1),
      props: props || {},
    });
  }

  pageField(key: string, fields: FieldDef<Record<string, unknown>>[], title?: string): FormConfigBuilder {
    return this.field({
      key,
      type: 'page',
      title,
      fields,
    } as FieldDef<Record<string, unknown>>);
  }

  build(): FormConfig {
    return { fields: this.fields } as unknown as FormConfig;
  }
}

/**
 * Utility class for testing dynamic forms
 */
export class DynamicFormTestUtils {
  /**
   * Creates a new form config builder
   */
  static builder(): FormConfigBuilder {
    return new FormConfigBuilder();
  }

  /**
   * Creates a dynamic form test setup with optional test field registration
   */
  static async createTest(testConfig: DynamicFormTestConfig): Promise<DynamicFormTestResult> {
    const fixture = TestBed.createComponent(DynamicForm);
    const component = fixture.componentInstance;
    const fieldRegistry = component['fieldRegistry'] || TestBed.inject(injectFieldRegistry);

    // Register test fields if requested
    if (testConfig.registerTestFields !== false) {
      DynamicFormTestUtils.registerTestFields(fieldRegistry);
    }

    // Set up the component
    fixture.componentRef.setInput('config', testConfig.config);
    if (testConfig.initialValue !== undefined) {
      fixture.componentRef.setInput('value', testConfig.initialValue);
    }

    fixture.detectChanges();
    await DynamicFormTestUtils.waitForInit(fixture as ComponentFixture<DynamicForm>);

    return {
      component: component as DynamicForm,
      fixture: fixture as ComponentFixture<DynamicForm>,
      fieldRegistry,
    };
  }

  /**
   * Registers common test field types including built-in types like page, row, group
   */
  static registerTestFields(fieldRegistry: ReturnType<typeof injectFieldRegistry>): void {
    // Input field mapper that extends value field mapper
    const inputMapper = (fieldDef: FieldDef<Record<string, unknown>>, options: Omit<FieldMapperOptions, 'fieldRegistry'>) => {
      const bindings = valueFieldMapper(fieldDef, options);

      // Add input-specific bindings
      bindings.push(
        inputBinding('type', () => (fieldDef.props as Record<string, unknown>)?.['type'] || 'text'),
        inputBinding('placeholder', () => (fieldDef.props as Record<string, unknown>)?.['placeholder'] || '')
      );

      return bindings;
    };

    // Select field mapper that extends value field mapper
    const selectMapper = (fieldDef: FieldDef<Record<string, unknown>>, options: Omit<FieldMapperOptions, 'fieldRegistry'>) => {
      const bindings = valueFieldMapper(fieldDef, options);

      // Add select-specific bindings - options should be at root level
      bindings.push(inputBinding('options', () => (fieldDef as any).options || []));

      return bindings;
    };

    // Checkbox field mapper - uses checked instead of value
    const checkboxMapper = (fieldDef: FieldDef<Record<string, unknown>>, options: Omit<FieldMapperOptions, 'fieldRegistry'>) => {
      return checkboxFieldMapper(fieldDef, options);
    };

    // Button field mapper that extends value field mapper
    const buttonMapper = (fieldDef: FieldDef<Record<string, unknown>>, options: Omit<FieldMapperOptions, 'fieldRegistry'>) => {
      return valueFieldMapper(fieldDef, options);
    };

    // Register built-in fields first (page, row, group)
    fieldRegistry.registerTypes(BUILT_IN_FIELDS);

    // Then register test field types
    fieldRegistry.registerTypes([
      {
        name: 'input',
        loadComponent: () => import('./harnesses/test-input.harness'),
        mapper: inputMapper,
      },
      {
        name: 'select',
        loadComponent: () => import('./harnesses/test-select.harness'),
        mapper: selectMapper,
      },
      {
        name: 'checkbox',
        loadComponent: () => import('./harnesses/test-checkbox.harness'),
        mapper: checkboxMapper,
      },
      {
        name: 'button',
        loadComponent: () => import('./harnesses/test-button.harness'),
        mapper: buttonMapper,
      },
    ]);
  }

  /**
   * Waits for the dynamic form to initialize
   */
  static async waitForInit(fixture: ComponentFixture<DynamicForm>): Promise<void> {
    await delay(0);
    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates user input on a field element
   */
  static async simulateInput(fixture: ComponentFixture<DynamicForm>, selector: string, value: string): Promise<void> {
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
   * Simulates user blur on a field element
   */
  static async simulateBlur(fixture: ComponentFixture<DynamicForm>, selector: string): Promise<void> {
    const element = fixture.nativeElement.querySelector(selector);
    if (!element) {
      throw new Error(`Element not found with selector: ${selector}`);
    }

    element.dispatchEvent(new Event('blur', { bubbles: true }));
    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates user selection on a select element
   */
  static async simulateSelect(fixture: ComponentFixture<DynamicForm>, selector: string, value: string): Promise<void> {
    const select = fixture.nativeElement.querySelector(selector) as HTMLSelectElement;
    if (!select) {
      throw new Error(`Select element not found with selector: ${selector}`);
    }

    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates checkbox toggle
   */
  static async simulateCheckbox(fixture: ComponentFixture<DynamicForm>, selector: string, checked: boolean): Promise<void> {
    const checkbox = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
    if (!checkbox) {
      throw new Error(`Checkbox element not found with selector: ${selector}`);
    }

    checkbox.checked = checked;
    checkbox.dispatchEvent(new Event('input', { bubbles: true }));
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates button click
   */
  static async simulateButtonClick(fixture: ComponentFixture<DynamicForm>, selector: string): Promise<void> {
    const button = fixture.nativeElement.querySelector(selector) as HTMLButtonElement;
    if (!button) {
      throw new Error(`Button element not found with selector: ${selector}`);
    }

    button.click();
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
   * Gets validation errors from the component
   */
  static getFormErrors(component: DynamicForm): ValidationError[] {
    return component.errors();
  }

  /**
   * Checks if the form is valid
   */
  static isFormValid(component: DynamicForm): boolean {
    return component.valid();
  }

  /**
   * Gets all field elements from the fixture
   */
  static getFieldElements(fixture: ComponentFixture<DynamicForm>, fieldType: string): NodeListOf<Element> {
    return fixture.nativeElement.querySelectorAll(`df-test-${fieldType}`);
  }

  /**
   * Asserts that a field has a specific value
   */
  static assertFieldValue(fixture: ComponentFixture<DynamicForm>, fieldSelector: string, expectedValue: string): void {
    const element = fixture.nativeElement.querySelector(fieldSelector) as HTMLInputElement;
    if (!element) {
      throw new Error(`Field element not found with selector: ${fieldSelector}`);
    }

    const actualValue = element.type === 'checkbox' ? element.checked.toString() : element.value;
    if (actualValue !== expectedValue) {
      throw new Error(`Expected field value to be "${expectedValue}", but got "${actualValue}"`);
    }
  }

  /**
   * Asserts that the form has a specific value
   */
  static assertFormValue(component: DynamicForm, expectedValue: Record<string, unknown>): void {
    const actualValue = component.formValue();
    if (JSON.stringify(actualValue) !== JSON.stringify(expectedValue)) {
      throw new Error(`Expected form value to be ${JSON.stringify(expectedValue)}, but got ${JSON.stringify(actualValue)}`);
    }
  }
}
