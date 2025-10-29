import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy, Component, input, inputBinding, model, twoWayBinding } from '@angular/core';
import { FormCheckboxControl, FormValueControl } from '@angular/forms/signals';
import { DynamicForm } from '../dynamic-form.component';
import { FormConfig } from '../models';
import { FieldDef } from '../definitions';
import { injectFieldRegistry } from '../utils/inject-field-registry/inject-field-registry';
import { delay } from './delay';
import { valueFieldMapper } from '../mappers/value/value-field.mapper';
import { getFieldSignal } from '../mappers/utils/field-signal-utils';

/**
 * Test harness component for input fields
 */
@Component({
  selector: 'df-test-input',
  template: `<input
    [type]="type()"
    [value]="value()"
    [disabled]="disabled()"
    [placeholder]="placeholder()"
    (input)="value.set($any($event.target).value)"
    (blur)="touched.set(true)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestInputHarness implements FormValueControl<string> {
  readonly value = model<string>('');
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly errors = input<readonly any[]>([]);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);

  // Field-specific properties
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly type = input<string>('text');
  readonly className = input<string>('');
  readonly tabIndex = input<number | undefined>(undefined);
  readonly hidden = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly props = input<Record<string, any>>({});
}

/**
 * Test harness component for select fields
 */
@Component({
  selector: 'df-test-select',
  template: `<select [value]="value()" [disabled]="disabled()" (change)="value.set($any($event.target).value)" (blur)="touched.set(true)">
    <option value="">Select...</option>
    @for (option of options(); track option.value) {
    <option [value]="option.value">{{ option.label }}</option>
    }
  </select>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestSelectHarness implements FormValueControl<string> {
  readonly value = model<string>('');
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly errors = input<readonly any[]>([]);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);

  // Field-specific properties
  readonly label = input<string>('');
  readonly options = input<Array<{ value: string; label: string }>>([]);
  readonly className = input<string>('');
  readonly tabIndex = input<number | undefined>(undefined);
  readonly hidden = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly props = input<Record<string, any>>({});
}

/**
 * Test harness component for checkbox fields
 */
@Component({
  selector: 'df-test-checkbox',
  template: `<input
    type="checkbox"
    [checked]="checked()"
    [disabled]="disabled()"
    (change)="checked.set($any($event.target).checked)"
    (blur)="touched.set(true)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestCheckboxHarness implements FormCheckboxControl {
  readonly checked = model<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly errors = input<readonly any[]>([]);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);

  // Field-specific properties
  readonly label = input<string>('');
  readonly className = input<string>('');
  readonly tabIndex = input<number | undefined>(undefined);
  readonly hidden = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly props = input<Record<string, any>>({});
}

/**
 * Configuration for creating a dynamic form test
 */
export interface DynamicFormTestConfig {
  config: FormConfig;
  initialValue?: Record<string, any>;
  registerTestFields?: boolean;
}

/**
 * Result of creating a dynamic form test
 */
export interface DynamicFormTestResult {
  component: any;
  fixture: any;
  fieldRegistry: ReturnType<typeof injectFieldRegistry>;
}

/**
 * Fluent API for building form configurations
 */
export class FormConfigBuilder {
  private config: FormConfig = { fields: [] };

  field(field: FieldDef<Record<string, unknown>>): FormConfigBuilder {
    (this.config.fields as FieldDef<Record<string, unknown>>[]).push(field);
    return this;
  }

  inputField(key: string, props?: Record<string, any>): FormConfigBuilder {
    return this.field({
      key,
      type: 'input',
      label: key.charAt(0).toUpperCase() + key.slice(1),
      props: { placeholder: `Enter ${key}`, ...props },
    });
  }

  requiredInputField(key: string, props?: Record<string, any>): FormConfigBuilder {
    return this.inputField(key, { required: true, ...props });
  }

  selectField(key: string, options: Array<{ value: string; label: string }>, props?: Record<string, any>): FormConfigBuilder {
    return this.field({
      key,
      type: 'select',
      label: key.charAt(0).toUpperCase() + key.slice(1),
      props: { options, ...props },
    });
  }

  checkboxField(key: string, props?: Record<string, any>): FormConfigBuilder {
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

  build(): FormConfig {
    return this.config;
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
    const fixture = TestBed.createComponent(DynamicForm) as any;
    const component = fixture.componentInstance as any;
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
    await DynamicFormTestUtils.waitForInit(fixture);

    return { component, fixture, fieldRegistry };
  }

  /**
   * Registers common test field types
   */
  static registerTestFields(fieldRegistry: ReturnType<typeof injectFieldRegistry>): void {
    // Input field mapper that extends value field mapper
    const inputMapper = (fieldDef: any, options: any) => {
      const bindings = valueFieldMapper(fieldDef, options);

      // Add input-specific bindings
      bindings.push(
        inputBinding('type', () => fieldDef.props?.type || 'text'),
        inputBinding('placeholder', () => fieldDef.props?.placeholder || '')
      );

      return bindings;
    };

    // Select field mapper that extends value field mapper
    const selectMapper = (fieldDef: any, options: any) => {
      const bindings = valueFieldMapper(fieldDef, options);

      // Add select-specific bindings
      bindings.push(inputBinding('options', () => fieldDef.props?.options || []));

      return bindings;
    };

    // Checkbox field mapper - uses checked instead of value
    const checkboxMapper = (fieldDef: any, options: any) => {
      const bindings = [inputBinding('required', () => fieldDef.props?.required || false)];

      // Add two-way binding for checked if options are provided
      if (options?.fieldSignalContext && options?.fieldSignals) {
        const fieldSignal = getFieldSignal(fieldDef.key, fieldDef.defaultValue ?? false, options.fieldSignalContext, options.fieldSignals);
        bindings.push(twoWayBinding('checked', fieldSignal));
      }

      return bindings;
    };

    fieldRegistry.registerTypes([
      {
        name: 'input',
        loadComponent: async () => TestInputHarness,
        mapper: inputMapper,
      },
      {
        name: 'select',
        loadComponent: async () => TestSelectHarness,
        mapper: selectMapper,
      },
      {
        name: 'checkbox',
        loadComponent: async () => TestCheckboxHarness,
        mapper: checkboxMapper,
      },
    ]);
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
   * Simulates user blur on a field element
   */
  static async simulateBlur(fixture: ComponentFixture<any>, selector: string): Promise<void> {
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
  static async simulateSelect(fixture: ComponentFixture<any>, selector: string, value: string): Promise<void> {
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
  static getFormValue(component: DynamicForm): Record<string, any> | undefined {
    return component.formValue();
  }

  /**
   * Gets validation errors from the component
   */
  static getFormErrors(component: DynamicForm): Record<string, any> | null {
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
  static getFieldElements(fixture: ComponentFixture<any>, fieldType: string): NodeListOf<Element> {
    return fixture.nativeElement.querySelectorAll(`df-test-${fieldType}`);
  }

  /**
   * Asserts that a field has a specific value
   */
  static assertFieldValue(fixture: ComponentFixture<any>, fieldSelector: string, expectedValue: string): void {
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
  static assertFormValue(component: DynamicForm, expectedValue: Record<string, any>): void {
    const actualValue = component.formValue();
    if (JSON.stringify(actualValue) !== JSON.stringify(expectedValue)) {
      throw new Error(`Expected form value to be ${JSON.stringify(expectedValue)}, but got ${JSON.stringify(actualValue)}`);
    }
  }
}
