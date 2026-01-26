import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { DynamicForm, FormConfig, FormEvent, provideDynamicForm, RegisteredFieldTypes } from '@ng-forge/dynamic-forms';
import { TextareaField } from '@ng-forge/dynamic-forms/integration';
import { delay } from '@ng-forge/utils';
import { waitForDFInit } from './wait-for-df';
import { withBootstrapFields } from '../providers/bootstrap-providers';
import { BsInputField } from '../fields/input/bs-input.type';
import { BsSelectField } from '../fields/select/bs-select.type';
import { BsCheckboxField } from '../fields/checkbox/bs-checkbox.type';
import { BsRadioField } from '../fields/radio/bs-radio.type';
import { BsToggleField } from '../fields/toggle/bs-toggle.type';
import { BsDatepickerField } from '../fields/datepicker/bs-datepicker.type';
import { BsSliderField } from '../fields/slider/bs-slider.type';
import { BsButtonField } from '../fields/button/bs-button.type';
import { BsMultiCheckboxField } from '../fields/multi-checkbox/bs-multi-checkbox.type';
import { BsField } from '../types/types';

/**
 * Configuration for creating a Bootstrap dynamic form test
 */
export interface BootstrapFormTestConfig {
  config: FormConfig;
  initialValue?: Record<string, unknown>;
  providers?: unknown[];
}

/**
 * Result of creating a Bootstrap dynamic form test
 */
export interface BootstrapFormTestResult {
  component: DynamicForm;
  fixture: ComponentFixture<DynamicForm<RegisteredFieldTypes[]>>;
}

/**
 * Fluent API for building Bootstrap form configurations
 */
export class BootstrapFormConfigBuilder {
  private fields: unknown[] = [];

  field(field: unknown): BootstrapFormConfigBuilder {
    this.fields.push(field);
    return this;
  }

  bsInputField(input: Omit<BsInputField, 'type'>): BootstrapFormConfigBuilder {
    return this.field({
      type: BsField.Input,
      ...input,
    });
  }

  bsSelectField<T>(input: Omit<BsSelectField<T>, 'type'>): BootstrapFormConfigBuilder {
    return this.field({
      type: BsField.Select,
      ...input,
    });
  }

  bsCheckboxField(input: Omit<BsCheckboxField, 'type'>): BootstrapFormConfigBuilder {
    return this.field({
      type: BsField.Checkbox,
      ...input,
    });
  }

  bsRadioField<T>(input: Omit<BsRadioField<T>, 'type'>): BootstrapFormConfigBuilder {
    return this.field({
      type: BsField.Radio,
      ...input,
    });
  }

  bsToggleField(input: Omit<BsToggleField, 'type'>): BootstrapFormConfigBuilder {
    return this.field({
      type: BsField.Toggle,
      ...input,
    });
  }

  bsTextareaField(input: Omit<TextareaField, 'type'>): BootstrapFormConfigBuilder {
    return this.field({
      type: BsField.Textarea,
      ...input,
    });
  }

  bsDatepickerField(input: Omit<BsDatepickerField, 'type'>): BootstrapFormConfigBuilder {
    return this.field({
      type: BsField.Datepicker,
      ...input,
    });
  }

  bsSliderField(input: Omit<BsSliderField, 'type'>): BootstrapFormConfigBuilder {
    return this.field({
      type: BsField.Slider,
      ...input,
    });
  }

  bsButtonField<T extends FormEvent>(input: Omit<BsButtonField<T>, 'type'>): BootstrapFormConfigBuilder {
    return this.field({
      type: BsField.Button,
      ...input,
    });
  }

  bsMultiCheckboxField<T>(input: Omit<BsMultiCheckboxField<T>, 'type'>): BootstrapFormConfigBuilder {
    return this.field({
      type: BsField.MultiCheckbox,
      ...input,
    });
  }

  build(): FormConfig {
    return { fields: this.fields } as unknown as FormConfig;
  }
}

/**
 * Utility class for testing Bootstrap dynamic forms
 */
export class BootstrapFormTestUtils {
  /**
   * Creates a new Bootstrap form config builder
   */
  static builder(): BootstrapFormConfigBuilder {
    return new BootstrapFormConfigBuilder();
  }

  /**
   * Creates a Bootstrap dynamic form test setup with proper providers
   */
  static async createTest(testConfig: BootstrapFormTestConfig): Promise<BootstrapFormTestResult> {
    await TestBed.configureTestingModule({
      imports: [DynamicForm],
      providers: [provideAnimations(), provideDynamicForm(...withBootstrapFields()), ...(testConfig.providers || [])],
    }).compileComponents();

    const fixture = TestBed.createComponent(DynamicForm<RegisteredFieldTypes[]>);
    const component = fixture.componentInstance;

    // Set up the component - use 'dynamic-form' as the input name since config uses alias: 'dynamic-form'
    fixture.componentRef.setInput('dynamic-form', testConfig.config);

    // Set initial value if provided
    if (testConfig.initialValue !== undefined) {
      fixture.componentRef.setInput('value', testConfig.initialValue);
    }

    // In zoneless mode, we need to trigger change detection immediately after setting inputs
    fixture.detectChanges();
    await BootstrapFormTestUtils.waitForInit(fixture);

    return {
      component,
      fixture,
    };
  }

  /**
   * Waits for the Bootstrap dynamic form to initialize
   */
  static async waitForInit(fixture: ComponentFixture<DynamicForm>): Promise<void> {
    await waitForDFInit(fixture.componentInstance, fixture);

    // Flush effects critical for zoneless change detection
    TestBed.flushEffects();
    fixture.detectChanges();
    await fixture.whenStable();

    // Additional cycles for Bootstrap components to fully initialize
    for (let i = 0; i < 2; i++) {
      TestBed.flushEffects();
      fixture.detectChanges();
      await delay(0);
    }

    // Final stabilization
    await fixture.whenStable();
    TestBed.flushEffects();
    fixture.detectChanges();
  }

  /**
   * Simulates user input on a Bootstrap input field
   */
  static async simulateBsInput(fixture: ComponentFixture<DynamicForm>, selector: string, value: string): Promise<void> {
    const input = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
    if (!input) {
      throw new Error(`Bootstrap input element not found with selector: ${selector}`);
    }

    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates user selection on a Bootstrap select
   */
  static async simulateBsSelect(fixture: ComponentFixture<DynamicForm>, selectSelector: string, value: string | string[]): Promise<void> {
    const select = fixture.nativeElement.querySelector(selectSelector) as HTMLSelectElement;
    if (!select) {
      throw new Error(`Bootstrap select element not found with selector: ${selectSelector}`);
    }

    if (Array.isArray(value)) {
      // Handle multi-select
      const options = Array.from(select.options);
      options.forEach((option) => {
        option.selected = value.includes(option.value);
      });
    } else {
      select.value = value;
    }

    select.dispatchEvent(new Event('input', { bubbles: true }));
    select.dispatchEvent(new Event('change', { bubbles: true }));
    select.dispatchEvent(new Event('blur', { bubbles: true }));
    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates Bootstrap checkbox toggle
   */
  static async simulateBsCheckbox(fixture: ComponentFixture<DynamicForm>, selector: string, checked: boolean): Promise<void> {
    let checkboxElement: Element | null = null;

    // Handle complex selectors with multi-checkbox components
    if (selector.includes('df-bs-multi-checkbox') && selector.includes('.form-check-input:last-of-type')) {
      // Extract the multi-checkbox selector and the checkbox selector
      const parts = selector.split(' ');
      const multiCheckboxSelector = parts[0];
      const checkboxSelector = parts[1];

      const multiCheckboxElement = fixture.nativeElement.querySelector(multiCheckboxSelector);
      if (multiCheckboxElement && checkboxSelector.includes(':last-of-type')) {
        const checkboxes = multiCheckboxElement.querySelectorAll('.form-check-input[type="checkbox"]');
        checkboxElement = checkboxes[checkboxes.length - 1];
      }
    }
    // Handle simple selectors that might not work in test environment
    else if (selector.includes(':nth-of-type(') || selector.includes(':last-of-type') || selector.includes(':first-of-type')) {
      const allCheckboxes = fixture.nativeElement.querySelectorAll('.form-check-input[type="checkbox"]');

      if (selector.includes(':first-of-type')) {
        checkboxElement = allCheckboxes[0];
      } else if (selector.includes(':last-of-type')) {
        checkboxElement = allCheckboxes[allCheckboxes.length - 1];
      } else {
        // Extract the number from :nth-of-type(N)
        const match = selector.match(/:nth-of-type\((\d+)\)/);
        if (match) {
          const index = parseInt(match[1], 10) - 1; // Convert to 0-indexed
          checkboxElement = allCheckboxes[index];
        }
      }
    } else {
      checkboxElement = fixture.nativeElement.querySelector(selector);
    }

    if (!checkboxElement) {
      throw new Error(`Bootstrap checkbox element not found with selector: ${selector}`);
    }

    const input = checkboxElement as HTMLInputElement;
    if (!input) {
      throw new Error(`Input element not found within checkbox for selector: ${selector}`);
    }

    if (input.checked !== checked) {
      // Simulate actual user click on the input element
      input.click();
    } else {
      // Ensure the state is set and events are dispatched
      input.checked = checked;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates Bootstrap toggle switch
   */
  static async simulateBsToggle(fixture: ComponentFixture<DynamicForm>, selector: string, checked: boolean): Promise<void> {
    const toggle = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
    if (!toggle) {
      throw new Error(`Bootstrap toggle element not found with selector: ${selector}`);
    }

    if (toggle.checked !== checked) {
      toggle.click();
    } else {
      toggle.checked = checked;
      toggle.dispatchEvent(new Event('input', { bubbles: true }));
      toggle.dispatchEvent(new Event('change', { bubbles: true }));
    }

    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates Bootstrap button click
   */
  static async simulateBsButtonClick(fixture: ComponentFixture<DynamicForm>, selector: string): Promise<void> {
    const button = fixture.nativeElement.querySelector(selector) as HTMLButtonElement;
    if (!button) {
      throw new Error(`Bootstrap button element not found with selector: ${selector}`);
    }

    button.click();
    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates Bootstrap radio button selection
   */
  static async simulateBsRadio(fixture: ComponentFixture<DynamicForm>, selector: string, value: string): Promise<void> {
    // Find all radio buttons in the group
    const radios = fixture.nativeElement.querySelectorAll(selector) as NodeListOf<HTMLInputElement>;
    if (!radios || radios.length === 0) {
      throw new Error(`Bootstrap radio buttons not found with selector: ${selector}`);
    }

    // Find the radio with the matching value
    let targetRadio: HTMLInputElement | null = null;
    radios.forEach((radio) => {
      if (radio.value === value) {
        targetRadio = radio;
      }
    });

    if (!targetRadio) {
      throw new Error(`Bootstrap radio button with value "${value}" not found`);
    }

    // if (!targetRadio.checked) {
    //   targetRadio.click();
    // }

    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates Bootstrap slider (range) input (.form-range)
   */
  static async simulateBsSlider(fixture: ComponentFixture<DynamicForm>, selector: string, value: number): Promise<void> {
    const slider = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
    if (!slider) {
      throw new Error(`Bootstrap slider element not found with selector: ${selector}`);
    }

    slider.value = value.toString();
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    slider.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Gets the current form value from the component
   */
  static getFormValue(component: DynamicForm): Record<string, unknown> {
    return component.formValue();
  }

  /**
   * Gets validation errors from the component
   */
  static getFormErrors(component: DynamicForm): unknown[] {
    return component.errors();
  }

  /**
   * Checks if the form is valid
   */
  static isFormValid(component: DynamicForm): boolean {
    return component.valid();
  }

  /**
   * Gets all Bootstrap field elements from the fixture
   */
  static getBsFieldElements(fixture: ComponentFixture<DynamicForm>, fieldType: string): NodeListOf<Element> {
    return fixture.nativeElement.querySelectorAll(`df-bs-${fieldType}`);
  }

  /**
   * Asserts that a Bootstrap field has a specific value
   */
  static assertBsFieldValue(fixture: ComponentFixture<DynamicForm>, fieldSelector: string, expectedValue: string): void {
    const element = fixture.nativeElement.querySelector(fieldSelector);
    if (!element) {
      throw new Error(`Bootstrap field element not found with selector: ${fieldSelector}`);
    }

    // Handle different Bootstrap component types
    let actualValue: string;
    const input = element as HTMLInputElement;
    const textarea = element as HTMLTextAreaElement;
    const select = element as HTMLSelectElement;

    if (input && input.tagName === 'INPUT') {
      actualValue = input.type === 'checkbox' ? input.checked.toString() : input.value;
    } else if (textarea && textarea.tagName === 'TEXTAREA') {
      actualValue = textarea.value;
    } else if (select && select.tagName === 'SELECT') {
      actualValue = select.value;
    } else {
      throw new Error(`Could not determine value for field element: ${fieldSelector}. Element type: ${element.tagName}`);
    }

    if (actualValue !== expectedValue) {
      throw new Error(`Expected Bootstrap field value to be "${expectedValue}", but got "${actualValue}"`);
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

  /**
   * Asserts that a Bootstrap field shows an error message
   */
  static assertBsFieldError(fixture: ComponentFixture<DynamicForm>, fieldSelector: string, expectedError?: string): void {
    const fieldContainer = fixture.nativeElement.querySelector(fieldSelector);
    if (!fieldContainer) {
      throw new Error(`Bootstrap field container not found for selector: ${fieldSelector}`);
    }

    const errorElement = fieldContainer.querySelector('.invalid-feedback');
    if (!errorElement) {
      throw new Error(`Expected Bootstrap field to show an error message`);
    }

    if (expectedError && errorElement.textContent?.trim() !== expectedError) {
      throw new Error(`Expected error message "${expectedError}", but got "${errorElement.textContent?.trim()}"`);
    }
  }

  /**
   * Asserts that an element has a specific Bootstrap class
   */
  static assertHasClass(fixture: ComponentFixture<DynamicForm>, selector: string, className: string): void {
    const element = fixture.nativeElement.querySelector(selector);
    if (!element) {
      throw new Error(`Element not found with selector: ${selector}`);
    }

    if (!element.classList.contains(className)) {
      throw new Error(`Expected element to have class "${className}". Found classes: ${element.className}`);
    }
  }
}
