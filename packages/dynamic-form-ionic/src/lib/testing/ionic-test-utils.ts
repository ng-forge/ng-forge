import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  DynamicForm,
  FormConfig,
  FormEvent,
  provideDynamicForm,
  RegisteredFieldTypes,
} from '@ng-forge/dynamic-form';
import { delay } from './delay';
import { waitForDFInit } from './wait-for-df';
import { withIonicFields } from '../providers/ionic-providers';
import {
  IonicButtonField,
  IonicCheckboxField,
  IonicDatepickerField,
  IonicInputField,
  IonicMultiCheckboxField,
  IonicNextButtonField,
  IonicPreviousButtonField,
  IonicRadioField,
  IonicSelectField,
  IonicSliderField,
  IonicSubmitButtonField,
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

    // Set up the component
    fixture.componentRef.setInput('config', testConfig.config);

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
    fixture.detectChanges();
    await delay(0);
  }

  /**
   * Simulates user input on an Ionic input field
   */
  static async simulateIonicInput(fixture: ComponentFixture<DynamicForm>, selector: string, value: string): Promise<void> {
    const input = fixture.nativeElement.querySelector(selector) as HTMLInputElement;
    if (!input) {
      throw new Error(`Ionic input element not found with selector: ${selector}`);
    }

    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
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
   */
  static async simulateIonicCheckbox(fixture: ComponentFixture<DynamicForm>, selector: string, checked: boolean): Promise<void> {
    let checkboxElement: Element | null = null;

    // Handle complex selectors with multi-checkbox components
    if (selector.includes('df-ionic-multi-checkbox') && selector.includes('ion-checkbox:last-of-type')) {
      // Extract the multi-checkbox selector and the ion-checkbox selector
      const parts = selector.split(' ');
      const multiCheckboxSelector = parts[0];
      const ionCheckboxSelector = parts[1];

      const multiCheckboxElement = fixture.nativeElement.querySelector(multiCheckboxSelector);
      if (multiCheckboxElement && ionCheckboxSelector.includes(':last-of-type')) {
        const checkboxes = multiCheckboxElement.querySelectorAll('ion-checkbox');
        checkboxElement = checkboxes[checkboxes.length - 1];
      }
    }
    // Handle simple selectors that might not work in test environment
    else if (selector.includes(':nth-of-type(3)') || selector.includes(':last-of-type')) {
      const allCheckboxes = fixture.nativeElement.querySelectorAll('ion-checkbox');
      if (selector.includes(':nth-of-type(3)')) {
        checkboxElement = allCheckboxes[2]; // 0-indexed
      } else if (selector.includes(':last-of-type')) {
        checkboxElement = allCheckboxes[allCheckboxes.length - 1];
      }
    } else {
      checkboxElement = fixture.nativeElement.querySelector(selector);
    }

    if (!checkboxElement) {
      throw new Error(`Ionic checkbox element not found with selector: ${selector}`);
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
   * Simulates Ionic toggle switch
   */
  static async simulateIonicToggle(fixture: ComponentFixture<DynamicForm>, selector: string, checked: boolean): Promise<void> {
    const toggle = fixture.nativeElement.querySelector(selector);
    if (!toggle) {
      throw new Error(`Ionic toggle element not found with selector: ${selector}`);
    }

    // Find the button element within the Ionic toggle
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
   * Simulates Ionic button click
   */
  static async simulateIonicButtonClick(fixture: ComponentFixture<DynamicForm>, selector: string): Promise<void> {
    const button = fixture.nativeElement.querySelector(selector) as HTMLButtonElement;
    if (!button) {
      throw new Error(`Ionic button element not found with selector: ${selector}`);
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
   * Gets all Ionic field elements from the fixture
   */
  static getIonicFieldElements(fixture: ComponentFixture<DynamicForm>, fieldType: string): NodeListOf<Element> {
    return fixture.nativeElement.querySelectorAll(`df-ionic-${fieldType}`);
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
