import { ComponentFixture, TestBed } from '@angular/core/testing';
import { computed, Signal } from '@angular/core';
import { ValidationError } from '@angular/forms/signals';
import { firstValueFrom, race, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { DynamicForm } from '../../src/lib/dynamic-form.component';
import { FormConfig } from '../../src/lib/models/form-config';
import { FieldDef } from '../../src/lib/definitions/base/field-def';
import { FieldTypeDefinition } from '../../src/lib/models/field-type';
import { BUILT_IN_FIELDS } from '../../src/lib/providers/built-in-fields';
import { InputField, SelectField, checkboxFieldMapper, valueFieldMapper } from '@ng-forge/dynamic-forms/integration';
import { delay } from '@ng-forge/utils';

/**
 * Internal interface for field registry operations needed by test utilities
 */
interface FieldRegistryWriter {
  registerTypes(types: FieldTypeDefinition[]): void;
}

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
}

/**
 * Fluent API for building form configurations
 */
export class FormConfigBuilder {
  private fields: FieldDef<unknown>[] = [];

  field(field: FieldDef<unknown>): FormConfigBuilder {
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

  rowField(key: string, fields: FieldDef<unknown>[]): FormConfigBuilder {
    return this.field({
      key,
      type: 'row',
      fields,
    } as FieldDef<unknown>);
  }

  groupField(key: string, fields: FieldDef<unknown>[]): FormConfigBuilder {
    return this.field({
      key,
      type: 'group',
      fields,
    } as FieldDef<unknown>);
  }

  buttonField(key: string, props?: Record<string, unknown>): FormConfigBuilder {
    return this.field({
      key,
      type: 'button',
      label: key.charAt(0).toUpperCase() + key.slice(1),
      props: props || {},
    });
  }

  pageField(key: string, fields: FieldDef<unknown>[], title?: string): FormConfigBuilder {
    const pageFields = title ? [{ key: `${key}-title`, type: 'text', label: title }, ...fields] : fields;
    return this.field({
      key,
      type: 'page',
      fields: pageFields,
    } as FieldDef<unknown>);
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
    // Access fieldRegistry from the component instance (injected by Angular DI)
    const fieldRegistry = component['fieldRegistry'] as FieldRegistryWriter;

    // Register test fields if requested
    if (testConfig.registerTestFields !== false) {
      DynamicFormTestUtils.registerTestFields(fieldRegistry);
    }

    // Set up the component - use 'dynamic-form' as the input name since config uses alias: 'dynamic-form'
    fixture.componentRef.setInput('dynamic-form', testConfig.config);
    if (testConfig.initialValue !== undefined) {
      fixture.componentRef.setInput('value', testConfig.initialValue);
    }

    fixture.detectChanges();
    await DynamicFormTestUtils.waitForInit(fixture as ComponentFixture<DynamicForm>);

    return {
      component: component as DynamicForm,
      fixture: fixture as ComponentFixture<DynamicForm>,
    };
  }

  /**
   * Registers common test field types including built-in types like page, row, group
   * @internal
   */
  private static registerTestFields(fieldRegistry: FieldRegistryWriter): void {
    // Input field mapper that extends value field mapper (returns Signal)
    const inputMapper = (fieldDef: FieldDef<unknown>): Signal<Record<string, unknown>> => {
      const baseInputsSignal = valueFieldMapper(fieldDef);

      // Return computed signal that adds input-specific inputs
      return computed(() => ({
        ...baseInputsSignal(),
        type: (fieldDef.props as Record<string, unknown>)?.['type'] || 'text',
        placeholder: (fieldDef.props as Record<string, unknown>)?.['placeholder'] || '',
      }));
    };

    // Select field mapper that extends value field mapper (returns Signal)
    const selectMapper = (fieldDef: FieldDef<unknown>): Signal<Record<string, unknown>> => {
      const baseInputsSignal = valueFieldMapper(fieldDef);

      // Return computed signal that adds select-specific inputs
      return computed(() => ({
        ...baseInputsSignal(),
        options: (fieldDef as unknown as Record<string, unknown>).options || [], // Safe cast: SelectField extends FieldDef with options property
      }));
    };

    // Checkbox field mapper - uses checked instead of value (already returns Signal)
    const checkboxMapper = (fieldDef: FieldDef<unknown>): Signal<Record<string, unknown>> => {
      return checkboxFieldMapper(fieldDef);
    };

    // Button field mapper that extends value field mapper (already returns Signal)
    const buttonMapper = (fieldDef: FieldDef<unknown>): Signal<Record<string, unknown>> => {
      return valueFieldMapper(fieldDef);
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
   * Waits for the dynamic form to initialize.
   * Uses the initialized$ observable directly which has shareReplay for late subscribers.
   * @param fixture - The component fixture
   * @param timeoutMs - Maximum time to wait for initialization (default: 100ms)
   */
  static async waitForInit(fixture: ComponentFixture<DynamicForm>, timeoutMs = 100): Promise<void> {
    const component = fixture.componentInstance;

    // Trigger initial change detection
    fixture.detectChanges();
    TestBed.flushEffects();

    // Use the initialized$ observable directly (with shareReplay) for proper replay behavior
    // Race against a timeout to prevent hanging if initialization already happened
    await firstValueFrom(race(component.initialized$.pipe(map(() => true)), timer(timeoutMs).pipe(map(() => false))));

    // Stabilization cycles for async components
    for (let i = 0; i < 2; i++) {
      TestBed.flushEffects();
      fixture.detectChanges();
      await delay(0);
    }

    await fixture.whenStable();
    TestBed.flushEffects();
    fixture.detectChanges();
  }

  /**
   * Waits for an element to appear in the DOM with retries
   */
  private static async waitForElement<T extends Element>(
    fixture: ComponentFixture<DynamicForm>,
    selector: string,
    maxAttempts = 10,
  ): Promise<T> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const element = fixture.nativeElement.querySelector(selector) as T;
      if (element) {
        return element;
      }

      // Wait and retry
      TestBed.flushEffects();
      fixture.detectChanges();
      await delay(50);
    }

    throw new Error(`[Dynamic Forms] Element not found with selector: ${selector} after ${maxAttempts} attempts`);
  }

  /**
   * Simulates user input on a field element
   */
  static async simulateInput(fixture: ComponentFixture<DynamicForm>, selector: string, value: string): Promise<void> {
    const input = await DynamicFormTestUtils.waitForElement<HTMLInputElement>(fixture, selector);

    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates user blur on a field element
   */
  static async simulateBlur(fixture: ComponentFixture<DynamicForm>, selector: string): Promise<void> {
    const element = await DynamicFormTestUtils.waitForElement<Element>(fixture, selector);

    element.dispatchEvent(new Event('blur', { bubbles: true }));
    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates user selection on a select element
   */
  static async simulateSelect(fixture: ComponentFixture<DynamicForm>, selector: string, value: string): Promise<void> {
    const select = await DynamicFormTestUtils.waitForElement<HTMLSelectElement>(fixture, selector);

    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates checkbox toggle
   */
  static async simulateCheckbox(fixture: ComponentFixture<DynamicForm>, selector: string, checked: boolean): Promise<void> {
    const checkbox = await DynamicFormTestUtils.waitForElement<HTMLInputElement>(fixture, selector);

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
    const button = await DynamicFormTestUtils.waitForElement<HTMLButtonElement>(fixture, selector);

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
  static async assertFieldValue(fixture: ComponentFixture<DynamicForm>, fieldSelector: string, expectedValue: string): Promise<void> {
    const element = await DynamicFormTestUtils.waitForElement<HTMLInputElement>(fixture, fieldSelector);

    const actualValue = element.type === 'checkbox' ? element.checked.toString() : element.value;
    if (actualValue !== expectedValue) {
      throw new Error(`[Dynamic Forms] Expected field value to be "${expectedValue}", but got "${actualValue}"`);
    }
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
