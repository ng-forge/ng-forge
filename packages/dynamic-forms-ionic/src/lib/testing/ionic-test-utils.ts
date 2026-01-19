import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { DynamicForm, FormConfig, FormEvent, provideDynamicForm, RegisteredFieldTypes } from '@ng-forge/dynamic-forms';
import { delay } from './delay';
import { waitForDFInit } from './wait-for-df';
import { withIonicFields } from '../providers/ionic-providers';
import {
  IonicButtonField,
  IonicCheckboxField,
  IonicDatepickerField,
  IonicInputField,
  IonicMultiCheckboxField,
  IonicRadioField,
  IonicSelectField,
  IonicSliderField,
  IonicTextareaField,
  IonicToggleField,
} from '../fields';
import { IonicField } from '../types/types';

/**
 * Configuration for creating an Ionic dynamic form test
 */
export interface IonicFormTestConfig {
  config: FormConfig;
  initialValue?: Record<string, unknown>;
  providers?: unknown[];
}

/**
 * Result of creating an Ionic dynamic form test
 */
export interface IonicFormTestResult {
  component: DynamicForm;
  fixture: ComponentFixture<DynamicForm<readonly RegisteredFieldTypes[]>>;
}

/**
 * Fluent API for building Ionic form configurations
 */
export class IonicFormConfigBuilder {
  private fields: any[] = [];

  field(field: any): IonicFormConfigBuilder {
    this.fields.push(field);
    return this;
  }

  ionicInputField(input: Omit<IonicInputField, 'type'>): IonicFormConfigBuilder {
    return this.field({
      type: IonicField.Input,
      ...input,
    });
  }

  ionicSelectField<T>(input: Omit<IonicSelectField<T>, 'type'>): IonicFormConfigBuilder {
    return this.field({
      type: IonicField.Select,
      ...input,
    });
  }

  ionicCheckboxField(input: Omit<IonicCheckboxField, 'type'>): IonicFormConfigBuilder {
    return this.field({
      type: IonicField.Checkbox,
      ...input,
    });
  }

  ionicRadioField<T>(input: Omit<IonicRadioField<T>, 'type'>): IonicFormConfigBuilder {
    return this.field({
      type: IonicField.Radio,
      ...input,
    });
  }

  ionicToggleField(input: Omit<IonicToggleField, 'type'>): IonicFormConfigBuilder {
    return this.field({
      type: IonicField.Toggle,
      ...input,
    });
  }

  ionicTextareaField(input: Omit<IonicTextareaField, 'type'>): IonicFormConfigBuilder {
    return this.field({
      type: IonicField.Textarea,
      ...input,
    });
  }

  ionicDatepickerField(input: Omit<IonicDatepickerField, 'type'>): IonicFormConfigBuilder {
    return this.field({
      type: IonicField.Datepicker,
      ...input,
    });
  }

  ionicSliderField(input: Omit<IonicSliderField, 'type'>): IonicFormConfigBuilder {
    return this.field({
      type: IonicField.Slider,
      ...input,
    });
  }

  ionicButtonField<T extends FormEvent>(input: Omit<IonicButtonField<T>, 'type'>): IonicFormConfigBuilder {
    return this.field({
      type: IonicField.Button,
      ...input,
    });
  }

  ionicMultiCheckboxField<T>(input: Omit<IonicMultiCheckboxField<T>, 'type'>): IonicFormConfigBuilder {
    return this.field({
      type: IonicField.MultiCheckbox,
      ...input,
    });
  }

  build(): FormConfig {
    return { fields: this.fields } as unknown as FormConfig;
  }
}

/**
 * Utility class for testing Ionic dynamic forms
 */
export class IonicFormTestUtils {
  /**
   * Creates a new Ionic form config builder
   */
  static builder(): IonicFormConfigBuilder {
    return new IonicFormConfigBuilder();
  }

  /**
   * Creates an Ionic dynamic form test setup with proper providers
   */
  static async createTest(testConfig: IonicFormTestConfig): Promise<IonicFormTestResult> {
    await TestBed.configureTestingModule({
      imports: [DynamicForm],
      providers: [provideAnimations(), provideDynamicForm(...withIonicFields()), ...(testConfig.providers || [])],
    }).compileComponents();

    const fixture = TestBed.createComponent(DynamicForm<readonly RegisteredFieldTypes[]>);
    const component = fixture.componentInstance;

    // Set up the component - use 'dynamic-form' as the input name since config uses alias: 'dynamic-form'
    fixture.componentRef.setInput('dynamic-form', testConfig.config);

    // Set initial value if provided
    if (testConfig.initialValue !== undefined) {
      fixture.componentRef.setInput('value', testConfig.initialValue);
    }

    fixture.detectChanges();
    await IonicFormTestUtils.waitForInit(fixture);

    return {
      component,
      fixture,
    };
  }

  /**
   * Waits for the Ionic dynamic form to initialize
   */
  static async waitForInit(fixture: ComponentFixture<DynamicForm>): Promise<void> {
    await waitForDFInit(fixture.componentInstance, fixture);

    // Flush effects critical for zoneless change detection
    TestBed.flushEffects();
    fixture.detectChanges();
    await fixture.whenStable();

    // Additional cycles for Ionic components to fully initialize
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
   * Helper to query into Shadow DOM
   */
  private static queryShadowDom(element: Element, selector: string): Element | null {
    // Try to find in shadow root first
    if (element.shadowRoot) {
      const found = element.shadowRoot.querySelector(selector);
      if (found) return found;
    }
    // Fallback to regular query
    return element.querySelector(selector);
  }

  /**
   * Simulates user input on an Ionic input field
   * Works by finding the ion-input component and using its public API
   */
  static async simulateIonicInput(fixture: ComponentFixture<DynamicForm>, selector: string, value: string): Promise<void> {
    const ionInput = fixture.nativeElement.querySelector(selector.replace(' input', '').replace(' textarea', ''));
    if (!ionInput) {
      throw new Error(`Ionic input element not found with selector: ${selector}`);
    }

    // Try to access the input through shadow DOM
    const input = this.queryShadowDom(ionInput, 'input, textarea') as HTMLInputElement | HTMLTextAreaElement;

    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      input.dispatchEvent(new Event('blur', { bubbles: true, composed: true }));
    } else {
      // Fallback: dispatch event on the ion-input itself
      ionInput.dispatchEvent(
        new CustomEvent('ionInput', {
          detail: { value },
          bubbles: true,
          composed: true,
        }),
      );
    }

    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates user selection on an Ionic select
   */
  static async simulateIonicSelect(fixture: ComponentFixture<DynamicForm>, selectSelector: string, value: string): Promise<void> {
    // Find the ion-select component
    const ionSelect = fixture.nativeElement.querySelector(selectSelector);
    if (!ionSelect) {
      throw new Error(`Ionic select element not found with selector: ${selectSelector}`);
    }

    // Get the component instance and simulate selection
    const selectComponent = fixture.debugElement.query((el) => el.nativeElement === ionSelect)?.componentInstance;

    if (selectComponent) {
      selectComponent.value = value;
      selectComponent.ionChange.emit({
        detail: { value },
        target: selectComponent,
      });
    }

    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates Ionic checkbox toggle
   * Works by finding the checkbox through shadow DOM and toggling it
   */
  static async simulateIonicCheckbox(fixture: ComponentFixture<DynamicForm>, selector: string, checked: boolean): Promise<void> {
    let checkboxElement: Element | null = null;

    // Handle complex selectors with multi-checkbox components
    if (selector.includes('df-ion-multi-checkbox') && selector.includes('ion-checkbox:last-of-type')) {
      const parts = selector.split(' ');
      const multiCheckboxSelector = parts[0];
      const multiCheckboxElement = fixture.nativeElement.querySelector(multiCheckboxSelector);
      if (multiCheckboxElement) {
        const checkboxes = multiCheckboxElement.querySelectorAll('ion-checkbox');
        checkboxElement = checkboxes[checkboxes.length - 1];
      }
    }
    // Handle simple selectors that might not work in test environment
    else if (selector.includes(':nth-of-type(3)') || selector.includes(':last-of-type')) {
      const allCheckboxes = fixture.nativeElement.querySelectorAll('ion-checkbox');
      if (selector.includes(':nth-of-type(3)')) {
        checkboxElement = allCheckboxes[2];
      } else if (selector.includes(':last-of-type')) {
        checkboxElement = allCheckboxes[allCheckboxes.length - 1];
      }
    } else {
      checkboxElement = fixture.nativeElement.querySelector(selector);
    }

    if (!checkboxElement) {
      throw new Error(`Ionic checkbox element not found with selector: ${selector}`);
    }

    // Try to access the input through shadow DOM
    const input = this.queryShadowDom(checkboxElement, 'input[type="checkbox"]') as HTMLInputElement;

    if (input && input.checked !== checked) {
      input.click();
    } else {
      // Fallback: dispatch event on the ion-checkbox itself
      checkboxElement.dispatchEvent(
        new CustomEvent('ionChange', {
          detail: { checked },
          bubbles: true,
          composed: true,
        }),
      );
    }

    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates Ionic toggle switch
   * Works by finding the toggle through shadow DOM and toggling it
   */
  static async simulateIonicToggle(fixture: ComponentFixture<DynamicForm>, selector: string, checked: boolean): Promise<void> {
    const toggle = fixture.nativeElement.querySelector(selector);
    if (!toggle) {
      throw new Error(`Ionic toggle element not found with selector: ${selector}`);
    }

    // Try to access the button through shadow DOM
    const button = this.queryShadowDom(toggle, 'button[role="switch"]') as HTMLButtonElement;

    if (button) {
      const currentChecked = button.getAttribute('aria-checked') === 'true';
      if (currentChecked !== checked) {
        button.click();
      }
    } else {
      // Fallback: dispatch event on the ion-toggle itself
      toggle.dispatchEvent(
        new CustomEvent('ionChange', {
          detail: { checked },
          bubbles: true,
          composed: true,
        }),
      );
    }

    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates Ionic button click
   * Works by finding the button (either in shadow DOM or directly) and clicking it
   */
  static async simulateIonicButtonClick(fixture: ComponentFixture<DynamicForm>, selector: string): Promise<void> {
    // If selector includes 'button', it's trying to access shadow DOM
    const isInnerButton = selector.includes('button');
    const ionButtonSelector = isInnerButton ? selector.split(' button')[0] : selector;

    const ionButton = fixture.nativeElement.querySelector(ionButtonSelector);
    if (!ionButton) {
      throw new Error(`Ionic button element not found with selector: ${selector}`);
    }

    if (isInnerButton) {
      // Try to access the button through shadow DOM
      const button = this.queryShadowDom(ionButton, 'button') as HTMLButtonElement;
      if (button) {
        button.click();
      } else {
        // Fallback: click the ion-button itself
        ionButton.click();
      }
    } else {
      ionButton.click();
    }

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
   * Gets all Ionic field elements from the fixture
   */
  static getIonicFieldElements(fixture: ComponentFixture<DynamicForm>, fieldType: string): NodeListOf<Element> {
    return fixture.nativeElement.querySelectorAll(`df-ion-${fieldType}`);
  }

  /**
   * Asserts that an Ionic field has a specific value
   */
  static assertIonicFieldValue(fixture: ComponentFixture<DynamicForm>, fieldSelector: string, expectedValue: string): void {
    // Try to find the input element directly first
    let element = fixture.nativeElement.querySelector(fieldSelector);
    if (!element) {
      // Try to find within ion-item
      element = fixture.nativeElement.querySelector(`ion-item ${fieldSelector}`);
    }
    if (!element) {
      throw new Error(`Ionic field element not found with selector: ${fieldSelector}`);
    }

    // Handle different Ionic component types
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
      throw new Error(`Expected Ionic field value to be "${expectedValue}", but got "${actualValue}"`);
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
   * Asserts that an Ionic field shows an error message
   */
  static assertIonicFieldError(fixture: ComponentFixture<DynamicForm>, fieldSelector: string, expectedError?: string): void {
    const ionItem = fixture.nativeElement.querySelector(`${fieldSelector} ion-item`);
    if (!ionItem) {
      throw new Error(`Ionic item not found for selector: ${fieldSelector}`);
    }

    const errorElement = ionItem.querySelector('ion-note[color="danger"]') || ionItem.querySelector('.error-text');
    if (!errorElement) {
      throw new Error(`Expected Ionic field to show an error message`);
    }

    if (expectedError && errorElement.textContent?.trim() !== expectedError) {
      throw new Error(`Expected error message "${expectedError}", but got "${errorElement.textContent?.trim()}"`);
    }
  }
}
