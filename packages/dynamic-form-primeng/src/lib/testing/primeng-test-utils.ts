import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { DynamicForm, FormConfig, FormEvent, provideDynamicForm, RegisteredFieldTypes } from '@ng-forge/dynamic-form';
import { delay } from './delay';
import { waitForDFInit } from './wait-for-df';
import { withPrimeNGFields } from '../providers/primeng-providers';
import { PrimeField } from '../types/types';
import {
  PrimeInputField,
  PrimeSelectField,
  PrimeCheckboxField,
  PrimeRadioField,
  PrimeToggleField,
  PrimeDatepickerField,
  PrimeSliderField,
  PrimeButtonField,
  PrimeMultiCheckboxField,
  PrimeTextareaField,
} from '../types/field-types';

/**
 * Configuration for creating a PrimeNG dynamic form test
 */
export interface PrimeNGFormTestConfig {
  config: FormConfig;
  initialValue?: Record<string, unknown>;
  providers?: unknown[];
}

/**
 * Result of creating a PrimeNG dynamic form test
 */
export interface PrimeNGFormTestResult {
  component: DynamicForm;
  fixture: ComponentFixture<DynamicForm>;
}

/**
 * Fluent API for building PrimeNG form configurations
 */
export class PrimeNGFormConfigBuilder {
  private fields: any[] = [];

  field(field: any): PrimeNGFormConfigBuilder {
    this.fields.push(field);
    return this;
  }

  primeInputField(input: Omit<PrimeInputField, 'type'>): PrimeNGFormConfigBuilder {
    return this.field({
      type: PrimeField.Input,
      ...input,
    });
  }

  primeSelectField<T>(input: Omit<PrimeSelectField<T>, 'type'>): PrimeNGFormConfigBuilder {
    return this.field({
      type: PrimeField.Select,
      ...input,
    });
  }

  primeCheckboxField(input: Omit<PrimeCheckboxField, 'type'>): PrimeNGFormConfigBuilder {
    return this.field({
      type: PrimeField.Checkbox,
      ...input,
    });
  }

  primeRadioField<T>(input: Omit<PrimeRadioField<T>, 'type'>): PrimeNGFormConfigBuilder {
    return this.field({
      type: PrimeField.Radio,
      ...input,
    });
  }

  primeToggleField(input: Omit<PrimeToggleField, 'type'>): PrimeNGFormConfigBuilder {
    return this.field({
      type: PrimeField.Toggle,
      ...input,
    });
  }

  primeTextareaField(input: Omit<PrimeTextareaField, 'type'>): PrimeNGFormConfigBuilder {
    return this.field({
      type: PrimeField.Textarea,
      ...input,
    });
  }

  primeDatepickerField(input: Omit<PrimeDatepickerField, 'type'>): PrimeNGFormConfigBuilder {
    return this.field({
      type: PrimeField.Datepicker,
      ...input,
    });
  }

  primeSliderField(input: Omit<PrimeSliderField, 'type'>): PrimeNGFormConfigBuilder {
    return this.field({
      type: PrimeField.Slider,
      ...input,
    });
  }

  primeButtonField<T extends FormEvent>(input: Omit<PrimeButtonField<T>, 'type'>): PrimeNGFormConfigBuilder {
    return this.field({
      type: PrimeField.Button,
      ...input,
    });
  }

  primeMultiCheckboxField<T>(input: Omit<PrimeMultiCheckboxField<T>, 'type'>): PrimeNGFormConfigBuilder {
    return this.field({
      type: PrimeField.MultiCheckbox,
      ...input,
    });
  }

  build(): FormConfig {
    return { fields: this.fields } as unknown as FormConfig;
  }
}

/**
 * Utility class for testing PrimeNG dynamic forms
 */
export class PrimeNGFormTestUtils {
  /**
   * Creates a new PrimeNG form config builder
   */
  static builder(): PrimeNGFormConfigBuilder {
    return new PrimeNGFormConfigBuilder();
  }

  /**
   * Creates a PrimeNG dynamic form test setup with proper providers
   */
  static async createTest(testConfig: PrimeNGFormTestConfig): Promise<PrimeNGFormTestResult> {
    await TestBed.configureTestingModule({
      imports: [DynamicForm],
      providers: [provideAnimations(), provideDynamicForm(...withPrimeNGFields()), ...(testConfig.providers || [])],
    }).compileComponents();

    const fixture = TestBed.createComponent(DynamicForm<RegisteredFieldTypes[]>);
    const component = fixture.componentInstance;

    // Set up the component
    fixture.componentRef.setInput('config', testConfig.config);

    // Set initial value if provided
    if (testConfig.initialValue !== undefined) {
      fixture.componentRef.setInput('value', testConfig.initialValue);
    }

    fixture.detectChanges();
    await PrimeNGFormTestUtils.waitForInit(fixture);

    return {
      component,
      fixture,
    };
  }

  /**
   * Waits for the PrimeNG dynamic form to initialize
   */
  static async waitForInit(fixture: ComponentFixture<DynamicForm>): Promise<void> {
    await waitForDFInit(fixture.componentInstance, fixture);
    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates user input on a PrimeNG input field
   */
  static async simulatePrimeInput(fixture: ComponentFixture<DynamicForm>, selector: string, value: string): Promise<void> {
    const input = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
    if (!input) {
      throw new Error(`PrimeNG input element not found with selector: ${selector}`);
    }

    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates user selection on a PrimeNG dropdown
   */
  static async simulatePrimeDropdown(fixture: ComponentFixture<DynamicForm>, selectSelector: string, value: string): Promise<void> {
    // Find the p-dropdown component
    const pDropdown = fixture.nativeElement.querySelector(selectSelector);
    if (!pDropdown) {
      throw new Error(`PrimeNG dropdown element not found with selector: ${selectSelector}`);
    }

    // Get the component instance and simulate selection
    const dropdownComponent = fixture.debugElement.query((el) => el.nativeElement === pDropdown)?.componentInstance;

    if (dropdownComponent) {
      dropdownComponent.value = value;
      dropdownComponent.onChange?.emit({
        value,
        originalEvent: new Event('change'),
      });
    }

    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates PrimeNG checkbox toggle
   */
  static async simulatePrimeCheckbox(fixture: ComponentFixture<DynamicForm>, selector: string, checked: boolean): Promise<void> {
    let checkboxElement: Element | null = null;

    // Handle complex selectors with multi-checkbox components
    if (selector.includes('df-prime-multi-checkbox') && selector.includes('p-checkbox:last-of-type')) {
      // Extract the multi-checkbox selector and the p-checkbox selector
      const parts = selector.split(' ');
      const multiCheckboxSelector = parts[0];
      const pCheckboxSelector = parts[1];

      const multiCheckboxElement = fixture.nativeElement.querySelector(multiCheckboxSelector);
      if (multiCheckboxElement && pCheckboxSelector.includes(':last-of-type')) {
        const checkboxes = multiCheckboxElement.querySelectorAll('p-checkbox');
        checkboxElement = checkboxes[checkboxes.length - 1];
      }
    }
    // Handle simple selectors that might not work in test environment
    else if (selector.includes(':nth-of-type(3)') || selector.includes(':last-of-type')) {
      const allCheckboxes = fixture.nativeElement.querySelectorAll('p-checkbox');
      if (selector.includes(':nth-of-type(3)')) {
        checkboxElement = allCheckboxes[2]; // 0-indexed
      } else if (selector.includes(':last-of-type')) {
        checkboxElement = allCheckboxes[allCheckboxes.length - 1];
      }
    } else {
      checkboxElement = fixture.nativeElement.querySelector(selector);
    }

    if (!checkboxElement) {
      throw new Error(`PrimeNG checkbox element not found with selector: ${selector}`);
    }

    // Use the more direct input element approach with click simulation
    const input = checkboxElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
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
   * Simulates PrimeNG toggle switch (InputSwitch)
   */
  static async simulatePrimeToggle(fixture: ComponentFixture<DynamicForm>, selector: string, checked: boolean): Promise<void> {
    const toggle = fixture.nativeElement.querySelector(selector);
    if (!toggle) {
      throw new Error(`PrimeNG toggle element not found with selector: ${selector}`);
    }

    // Find the input element within the PrimeNG InputSwitch
    const input = toggle.querySelector('input[type="checkbox"]') as HTMLInputElement;
    if (input) {
      // Only click if the current state doesn't match the desired state
      const currentChecked = input.checked;
      if (currentChecked !== checked) {
        input.click();
      }
    }

    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates PrimeNG button click
   */
  static async simulatePrimeButtonClick(fixture: ComponentFixture<DynamicForm>, selector: string): Promise<void> {
    const button = fixture.nativeElement.querySelector(selector) as HTMLButtonElement;
    if (!button) {
      throw new Error(`PrimeNG button element not found with selector: ${selector}`);
    }

    button.click();
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
  static getFormErrors(component: DynamicForm): any[] {
    return component.errors();
  }

  /**
   * Checks if the form is valid
   */
  static isFormValid(component: DynamicForm): boolean {
    return component.valid();
  }

  /**
   * Gets all PrimeNG field elements from the fixture
   */
  static getPrimeFieldElements(fixture: ComponentFixture<DynamicForm>, fieldType: string): NodeListOf<Element> {
    return fixture.nativeElement.querySelectorAll(`df-prime-${fieldType}`);
  }

  /**
   * Asserts that a PrimeNG field has a specific value
   */
  static assertPrimeFieldValue(fixture: ComponentFixture<DynamicForm>, fieldSelector: string, expectedValue: string): void {
    // Try to find the input element directly first
    let element = fixture.nativeElement.querySelector(fieldSelector);
    if (!element) {
      // Try to find within field wrapper
      element = fixture.nativeElement.querySelector(`df-prime-input ${fieldSelector}`);
    }
    if (!element) {
      throw new Error(`PrimeNG field element not found with selector: ${fieldSelector}`);
    }

    // Handle different PrimeNG component types
    let actualValue: string;
    const input = element as HTMLInputElement;
    const textarea = element as HTMLTextAreaElement;

    if (input && input.tagName === 'INPUT') {
      actualValue = input.type === 'checkbox' ? input.checked.toString() : input.value;
    } else if (textarea && textarea.tagName === 'TEXTAREA') {
      actualValue = textarea.value;
    } else {
      throw new Error(`Could not determine value for field element: ${fieldSelector}. Element type: ${element.tagName}`);
    }

    if (actualValue !== expectedValue) {
      throw new Error(`Expected PrimeNG field value to be "${expectedValue}", but got "${actualValue}"`);
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
   * Asserts that a PrimeNG field shows an error message
   */
  static assertPrimeFieldError(fixture: ComponentFixture<DynamicForm>, fieldSelector: string, expectedError?: string): void {
    const fieldWrapper = fixture.nativeElement.querySelector(fieldSelector);
    if (!fieldWrapper) {
      throw new Error(`PrimeNG field wrapper not found for selector: ${fieldSelector}`);
    }

    // PrimeNG uses <small> tags with p-error class for error messages
    const errorElement = fieldWrapper.querySelector('small.p-error');
    if (!errorElement) {
      throw new Error(`Expected PrimeNG field to show an error message`);
    }

    if (expectedError && errorElement.textContent?.trim() !== expectedError) {
      throw new Error(`Expected error message "${expectedError}", but got "${errorElement.textContent?.trim()}"`);
    }
  }

  /**
   * Gets a PrimeNG input text element
   */
  static getPInputText(fixture: ComponentFixture<DynamicForm>, selector: string): HTMLInputElement {
    const input = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
    if (!input) {
      throw new Error(`PrimeNG input text element not found with selector: ${selector}`);
    }
    return input;
  }

  /**
   * Gets a PrimeNG dropdown element
   */
  static getPDropdown(fixture: ComponentFixture<DynamicForm>, selector: string): Element {
    const dropdown = fixture.nativeElement.querySelector(selector);
    if (!dropdown) {
      throw new Error(`PrimeNG dropdown element not found with selector: ${selector}`);
    }
    return dropdown;
  }

  /**
   * Gets a PrimeNG checkbox element
   */
  static getPCheckbox(fixture: ComponentFixture<DynamicForm>, selector: string): Element {
    const checkbox = fixture.nativeElement.querySelector(selector);
    if (!checkbox) {
      throw new Error(`PrimeNG checkbox element not found with selector: ${selector}`);
    }
    return checkbox;
  }

  /**
   * Gets a PrimeNG radio button element
   */
  static getPRadioButton(fixture: ComponentFixture<DynamicForm>, selector: string): Element {
    const radio = fixture.nativeElement.querySelector(selector);
    if (!radio) {
      throw new Error(`PrimeNG radio button element not found with selector: ${selector}`);
    }
    return radio;
  }

  /**
   * Gets a PrimeNG InputSwitch (toggle) element
   */
  static getPInputSwitch(fixture: ComponentFixture<DynamicForm>, selector: string): Element {
    const toggle = fixture.nativeElement.querySelector(selector);
    if (!toggle) {
      throw new Error(`PrimeNG InputSwitch element not found with selector: ${selector}`);
    }
    return toggle;
  }

  /**
   * Gets a PrimeNG textarea element
   */
  static getPTextarea(fixture: ComponentFixture<DynamicForm>, selector: string): HTMLTextAreaElement {
    const textarea = fixture.nativeElement.querySelector(selector) as HTMLTextAreaElement;
    if (!textarea) {
      throw new Error(`PrimeNG textarea element not found with selector: ${selector}`);
    }
    return textarea;
  }

  /**
   * Gets a PrimeNG calendar (datepicker) element
   */
  static getPCalendar(fixture: ComponentFixture<DynamicForm>, selector: string): Element {
    const calendar = fixture.nativeElement.querySelector(selector);
    if (!calendar) {
      throw new Error(`PrimeNG calendar element not found with selector: ${selector}`);
    }
    return calendar;
  }

  /**
   * Gets a PrimeNG slider element
   */
  static getPSlider(fixture: ComponentFixture<DynamicForm>, selector: string): Element {
    const slider = fixture.nativeElement.querySelector(selector);
    if (!slider) {
      throw new Error(`PrimeNG slider element not found with selector: ${selector}`);
    }
    return slider;
  }

  /**
   * Gets a PrimeNG button element
   */
  static getPButton(fixture: ComponentFixture<DynamicForm>, selector: string): HTMLButtonElement {
    const button = fixture.nativeElement.querySelector(selector) as HTMLButtonElement;
    if (!button) {
      throw new Error(`PrimeNG button element not found with selector: ${selector}`);
    }
    return button;
  }
}
