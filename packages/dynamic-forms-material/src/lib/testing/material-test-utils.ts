import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { DynamicForm, FormConfig, FormEvent, provideDynamicForm } from '@ng-forge/dynamic-forms';
import { TextareaField } from '@ng-forge/dynamic-forms/integration';
import { delay } from '@ng-forge/utils';
import { waitForDFInit } from './wait-for-df';
import { withMaterialFields } from '../providers/material-providers';
import { MatInputField } from '../fields/input/mat-input.type';
import { MatSelectField } from '../fields/select/mat-select.type';
import { MatCheckboxField } from '../fields/checkbox/mat-checkbox.type';
import { MatRadioField } from '../fields/radio/mat-radio.type';
import { MatToggleField } from '../fields/toggle/mat-toggle.type';
import { MatDatepickerField } from '../fields/datepicker/mat-datepicker.type';
import { MatSliderField } from '../fields/slider/mat-slider.type';
import { MatButtonField } from '../fields/button/mat-button.type';
import { MatMultiCheckboxField } from '../fields/multi-checkbox/mat-multi-checkbox.type';
import { MatField } from '../types/types';

/**
 * Configuration for creating a material dynamic form test
 */
export interface MaterialFormTestConfig {
  config: FormConfig;
  initialValue?: Record<string, unknown>;
  providers?: unknown[];
}

/**
 * Result of creating a material dynamic form test
 */
export interface MaterialFormTestResult {
  component: DynamicForm;
  fixture: ComponentFixture<DynamicForm>;
}

/**
 * Fluent API for building material form configurations
 */
export class MaterialFormConfigBuilder {
  private fields: any[] = [];

  field(field: any): MaterialFormConfigBuilder {
    this.fields.push(field);
    return this;
  }

  matInputField(input: Omit<MatInputField, 'type'>): MaterialFormConfigBuilder {
    return this.field({
      type: MatField.Input,
      ...input,
    });
  }

  matSelectField<T>(input: Omit<MatSelectField<T>, 'type'>): MaterialFormConfigBuilder {
    return this.field({
      type: MatField.Select,
      ...input,
    });
  }

  matCheckboxField(input: Omit<MatCheckboxField, 'type'>): MaterialFormConfigBuilder {
    return this.field({
      type: MatField.Checkbox,
      ...input,
    });
  }

  matRadioField<T>(input: Omit<MatRadioField<T>, 'type'>): MaterialFormConfigBuilder {
    return this.field({
      type: MatField.Radio,
      ...input,
    });
  }

  matToggleField(input: Omit<MatToggleField, 'type'>): MaterialFormConfigBuilder {
    return this.field({
      type: MatField.Toggle,
      ...input,
    });
  }

  matTextareaField(input: Omit<TextareaField, 'type'>): MaterialFormConfigBuilder {
    return this.field({
      type: MatField.Textarea,
      ...input,
    });
  }

  matDatepickerField(input: Omit<MatDatepickerField, 'type'>): MaterialFormConfigBuilder {
    return this.field({
      type: MatField.Datepicker,
      ...input,
    });
  }

  matSliderField(input: Omit<MatSliderField, 'type'>): MaterialFormConfigBuilder {
    return this.field({
      type: MatField.Slider,
      ...input,
    });
  }

  matButtonField<T extends FormEvent>(input: Omit<MatButtonField<T>, 'type'>): MaterialFormConfigBuilder {
    return this.field({
      type: MatField.Button,
      ...input,
    });
  }

  matMultiCheckboxField<T>(input: Omit<MatMultiCheckboxField<T>, 'type'>): MaterialFormConfigBuilder {
    return this.field({
      type: MatField.MultiCheckbox,
      ...input,
    });
  }

  build(): FormConfig {
    return { fields: this.fields } as unknown as FormConfig;
  }
}

/**
 * Utility class for testing material dynamic forms
 */
export class MaterialFormTestUtils {
  /**
   * Creates a new material form config builder
   */
  static builder(): MaterialFormConfigBuilder {
    return new MaterialFormConfigBuilder();
  }

  /**
   * Creates a material dynamic form test setup with proper providers
   */
  static async createTest(testConfig: MaterialFormTestConfig): Promise<MaterialFormTestResult> {
    await TestBed.configureTestingModule({
      imports: [DynamicForm],
      providers: [provideAnimations(), provideDynamicForm(...withMaterialFields()), ...(testConfig.providers || [])],
    }).compileComponents();

    const fixture = TestBed.createComponent(DynamicForm);
    const component = fixture.componentInstance;

    // Set up the component - use 'dynamic-form' as the input name since config uses alias: 'dynamic-form'
    fixture.componentRef.setInput('dynamic-form', testConfig.config);

    // Set initial value if provided
    if (testConfig.initialValue !== undefined) {
      fixture.componentRef.setInput('value', testConfig.initialValue);
    }

    fixture.detectChanges();
    await MaterialFormTestUtils.waitForInit(fixture);

    return {
      component,
      fixture,
    };
  }

  /**
   * Waits for the material dynamic form to initialize
   */
  static async waitForInit(fixture: ComponentFixture<DynamicForm>): Promise<void> {
    await waitForDFInit(fixture.componentInstance, fixture);

    // Flush effects critical for zoneless change detection
    TestBed.flushEffects();
    fixture.detectChanges();
    await fixture.whenStable();

    // Additional cycles for Material components to fully initialize
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
   * Simulates user input on a material input field
   */
  static async simulateMatInput(fixture: ComponentFixture<DynamicForm>, selector: string, value: string): Promise<void> {
    const input = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
    if (!input) {
      throw new Error(`Material input element not found with selector: ${selector}`);
    }

    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates user selection on a material select
   */
  static async simulateMatSelect(fixture: ComponentFixture<DynamicForm>, selectSelector: string, value: string): Promise<void> {
    // Find the mat-select component
    const matSelect = fixture.nativeElement.querySelector(selectSelector);
    if (!matSelect) {
      throw new Error(`Material select element not found with selector: ${selectSelector}`);
    }

    // Get the component instance and simulate selection
    const selectComponent = fixture.debugElement.query((el) => el.nativeElement === matSelect)?.componentInstance;

    if (selectComponent) {
      selectComponent.value = value;
      selectComponent.selectionChange.emit({
        value,
        source: selectComponent,
      });
    }

    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates material checkbox toggle
   */
  static async simulateMatCheckbox(fixture: ComponentFixture<DynamicForm>, selector: string, checked: boolean): Promise<void> {
    let checkboxElement: Element | null = null;

    // Handle complex selectors with multi-checkbox components
    if (selector.includes('df-mat-multi-checkbox') && selector.includes('mat-checkbox:last-of-type')) {
      // Extract the multi-checkbox selector and the mat-checkbox selector
      const parts = selector.split(' ');
      const multiCheckboxSelector = parts[0];
      const matCheckboxSelector = parts[1];

      const multiCheckboxElement = fixture.nativeElement.querySelector(multiCheckboxSelector);
      if (multiCheckboxElement && matCheckboxSelector.includes(':last-of-type')) {
        const checkboxes = multiCheckboxElement.querySelectorAll('mat-checkbox');
        checkboxElement = checkboxes[checkboxes.length - 1];
      }
    }
    // Handle simple selectors that might not work in test environment
    else if (selector.includes(':nth-of-type(3)') || selector.includes(':last-of-type')) {
      const allCheckboxes = fixture.nativeElement.querySelectorAll('mat-checkbox');
      if (selector.includes(':nth-of-type(3)')) {
        checkboxElement = allCheckboxes[2]; // 0-indexed
      } else if (selector.includes(':last-of-type')) {
        checkboxElement = allCheckboxes[allCheckboxes.length - 1];
      }
    } else {
      checkboxElement = fixture.nativeElement.querySelector(selector);
    }

    if (!checkboxElement) {
      throw new Error(`Material checkbox element not found with selector: ${selector}`);
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
   * Simulates material toggle switch
   */
  static async simulateMatToggle(fixture: ComponentFixture<DynamicForm>, selector: string, checked: boolean): Promise<void> {
    const toggle = fixture.nativeElement.querySelector(selector);
    if (!toggle) {
      throw new Error(`Material toggle element not found with selector: ${selector}`);
    }

    // Find the button element within the material toggle (mat-slide-toggle uses a button, not input)
    const button = toggle.querySelector('button[role="switch"]') as HTMLButtonElement;
    if (button) {
      // Only click if the current state doesn't match the desired state
      const currentChecked = button.getAttribute('aria-checked') === 'true';
      if (currentChecked !== checked) {
        button.click();
      }
    }

    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates material button click
   */
  static async simulateMatButtonClick(fixture: ComponentFixture<DynamicForm>, selector: string): Promise<void> {
    const button = fixture.nativeElement.querySelector(selector) as HTMLButtonElement;
    if (!button) {
      throw new Error(`Material button element not found with selector: ${selector}`);
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
   * Gets all material field elements from the fixture
   */
  static getMatFieldElements(fixture: ComponentFixture<DynamicForm>, fieldType: string): NodeListOf<Element> {
    return fixture.nativeElement.querySelectorAll(`df-mat-${fieldType}`);
  }

  /**
   * Asserts that a material field has a specific value
   */
  static assertMatFieldValue(fixture: ComponentFixture<DynamicForm>, fieldSelector: string, expectedValue: string): void {
    // Try to find the input element directly first
    let element = fixture.nativeElement.querySelector(fieldSelector);
    if (!element) {
      // Try to find within mat-form-field
      element = fixture.nativeElement.querySelector(`mat-form-field ${fieldSelector}`);
    }
    if (!element) {
      throw new Error(`Material field element not found with selector: ${fieldSelector}`);
    }

    // Handle different material component types
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
      throw new Error(`Expected material field value to be "${expectedValue}", but got "${actualValue}"`);
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
   * Asserts that a material form field has the correct appearance
   */
  static assertMatFormFieldAppearance(fixture: ComponentFixture<DynamicForm>, fieldSelector: string, appearance: string): void {
    // Try both new and legacy selectors
    let formField = fixture.nativeElement.querySelector(`${fieldSelector} mat-form-field`);
    if (!formField) {
      formField = fixture.nativeElement.querySelector(`mat-form-field`);
    }
    if (!formField) {
      throw new Error(`Material form field not found for selector: ${fieldSelector}`);
    }

    const hasAppearance = formField.classList.contains(`mat-form-field-appearance-${appearance}`);
    if (!hasAppearance) {
      throw new Error(`Expected material form field to have appearance "${appearance}". Found classes: ${formField.className}`);
    }
  }

  /**
   * Asserts that a material field shows an error message
   */
  static assertMatFieldError(fixture: ComponentFixture<DynamicForm>, fieldSelector: string, expectedError?: string): void {
    const formField = fixture.nativeElement.querySelector(`${fieldSelector} mat-form-field`);
    if (!formField) {
      throw new Error(`Material form field not found for selector: ${fieldSelector}`);
    }

    const errorElement = formField.querySelector('mat-error');
    if (!errorElement) {
      throw new Error(`Expected material field to show an error message`);
    }

    if (expectedError && errorElement.textContent?.trim() !== expectedError) {
      throw new Error(`Expected error message "${expectedError}", but got "${errorElement.textContent?.trim()}"`);
    }
  }
}
