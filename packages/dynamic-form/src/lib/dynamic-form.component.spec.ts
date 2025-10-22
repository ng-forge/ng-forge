import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DynamicFormComponent } from './dynamic-form.component';
import { FieldRegistry } from './core/field-registry';
import { FormConfig } from './models/field-config';

interface TestFormModel {
  firstName?: string;
  lastName?: string;
  age?: number;
  email?: string;
  isActive?: boolean;
  country?: string;
}

@Component({
  selector: 'df-test-input',
  template: `
    <input
      [value]="field()?.value() || ''"
      (input)="onChange($event.target)"
      [type]="type() || 'text'"
      [placeholder]="placeholder() || ''"
      [required]="required() || false"
      [id]="id() || ''"
      [attr.data-testid]="testId() || ''"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestInputComponent {
  field = input<any>();
  type = input<string>('text');
  placeholder = input<string>('');
  required = input<boolean>(false);
  label = input<string>('');
  id = input<string>('');
  testId = input<string>('');
  fieldChange = output<string>();

  constructor() {
    // Set up effect to sync field value changes
    effect(() => {
      const fieldValue = this.field()?.value();
      if (fieldValue !== undefined) {
        this.fieldChange.emit(fieldValue);
      }
    });
  }

  onChange(e: EventTarget | null) {
    const value = (e as HTMLInputElement).value;
    const fieldState = this.field();
    if (fieldState) {
      fieldState.value.set(value);
    }
    this.fieldChange.emit(value);
  }
}

@Component({
  selector: 'df-test-select',
  template: `
    <select
      [value]="field()?.value() || ''"
      (change)="onChange($event.target)"
      [multiple]="multiple() || false"
      [id]="id() || ''"
      [attr.data-testid]="testId() || ''"
    >
      @for (option of options() || []; track option) {
      <option [value]="option">{{ option }}</option>
      }
    </select>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestSelectComponent {
  field = input<any>();
  multiple = input<boolean>(false);
  options = input<string[]>([]);
  label = input<string>('');
  id = input<string>('');
  testId = input<string>('');
  fieldChange = output<string>();

  constructor() {
    // Set up effect to sync field value changes
    effect(() => {
      const fieldValue = this.field()?.value();
      if (fieldValue !== undefined) {
        this.fieldChange.emit(fieldValue);
      }
    });
  }

  onChange(e: EventTarget | null) {
    const value = (e as HTMLInputElement).value;
    const fieldState = this.field();
    if (fieldState) {
      fieldState.value.set(value);
    }
    this.fieldChange.emit(value);
  }
}

@Component({
  selector: 'df-test-checkbox',
  template: `
    <input
      type="checkbox"
      [checked]="field()?.value() || false"
      (change)="onChange($event.target)"
      [id]="id() || ''"
      [attr.data-testid]="testId() || ''"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestCheckboxComponent {
  field = input<any>();
  label = input<string>('');
  id = input<string>('');
  testId = input<string>('');
  fieldChange = output<boolean>();

  constructor() {
    // Set up effect to sync field value changes
    effect(() => {
      const fieldValue = this.field()?.value();
      if (fieldValue !== undefined) {
        this.fieldChange.emit(fieldValue);
      }
    });
  }

  onChange(e: EventTarget | null) {
    const checked = (e as HTMLInputElement).checked;
    const fieldState = this.field();
    if (fieldState) {
      fieldState.value.set(checked);
    }
    this.fieldChange.emit(checked);
  }
}

describe('DynamicFormComponent (df.component)', () => {
  let component: DynamicFormComponent<TestFormModel>;
  let fixture: ComponentFixture<DynamicFormComponent<TestFormModel>>;
  let fieldRegistry: FieldRegistry;

  const createComponent = (config: FormConfig = { fields: [] }, initialValue?: TestFormModel) => {
    fixture = TestBed.createComponent(DynamicFormComponent<TestFormModel>);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('config', config);
    if (initialValue !== undefined) {
      fixture.componentRef.setInput('value', initialValue);
    }
    fixture.detectChanges();
    return { component, fixture };
  };

  const setupFieldRegistry = () => {
    fieldRegistry = TestBed.inject(FieldRegistry);

    fieldRegistry.registerType({
      name: 'input',
      component: TestInputComponent,
      defaultProps: {
        type: 'text',
        placeholder: 'Enter value',
        required: false,
      },
    });

    fieldRegistry.registerType({
      name: 'email',
      component: TestInputComponent,
      defaultProps: {
        type: 'email',
        placeholder: 'Enter email',
        required: true,
      },
    });

    fieldRegistry.registerType({
      name: 'select',
      component: TestSelectComponent,
      defaultProps: {
        multiple: false,
        options: [],
      },
    });

    fieldRegistry.registerType({
      name: 'checkbox',
      component: TestCheckboxComponent,
      defaultProps: {
        checked: false,
      },
    });
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicFormComponent, TestInputComponent, TestSelectComponent, TestCheckboxComponent],
      providers: [FieldRegistry],
    }).compileComponents();

    setupFieldRegistry();
  });

  describe('Component Initialization', () => {
    it('should create successfully', () => {
      const { component } = createComponent();
      expect(component).toBeTruthy();
    });

    it('should have required inputs and computed properties defined', () => {
      const { component } = createComponent();
      expect(component.config).toBeDefined();
      expect(component.value).toBeDefined();
      expect(component.valid).toBeDefined();
      expect(component.errors).toBeDefined();
      expect(component.defaultValues).toBeDefined();
    });

    it('should initialize value with default values when no fields provided', () => {
      const { component } = createComponent();
      expect(component.value()).toEqual({});
    });
  });

  describe('Form Value - Basic Functionality', () => {
    it('should initialize form value as empty object with no fields', () => {
      const config: FormConfig = { fields: [] };
      const { component } = createComponent(config);

      expect(component.value()).toEqual({});
    });

    it('should track single field value in form', async () => {
      const config: FormConfig = {
        fields: [{ key: 'firstName', type: 'input', label: 'First Name', props: { testId: 'first-name' }, defaultValue: 'John' }],
      };
      const { component, fixture } = createComponent(config);

      // Wait for async field rendering
      await new Promise((resolve) => setTimeout(resolve, 10));
      fixture.detectChanges();

      expect(component.value()).toEqual({ firstName: 'John' });
    });

    it('should track multiple field values in form', async () => {
      const config: FormConfig = {
        fields: [
          { key: 'firstName', type: 'input', label: 'First Name', props: { testId: 'first-name' }, defaultValue: 'John' },
          { key: 'lastName', type: 'input', label: 'Last Name', props: { testId: 'last-name' }, defaultValue: 'Doe' },
          { key: 'age', type: 'input', label: 'Age', props: { testId: 'age' }, defaultValue: 30 },
        ],
      };
      const { component, fixture } = createComponent(config);

      await new Promise((resolve) => setTimeout(resolve, 10));
      fixture.detectChanges();

      expect(component.value()).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        age: 30,
      });
    });

    it('should exclude undefined values from form value', async () => {
      const config: FormConfig = {
        fields: [
          { key: 'firstName', type: 'input', label: 'First Name', props: { testId: 'first-name' }, defaultValue: 'John' },
          { key: 'lastName', type: 'input', label: 'Last Name', props: { testId: 'last-name' } }, // no defaultValue
          { key: 'age', type: 'input', label: 'Age', props: { testId: 'age' }, defaultValue: 25 },
        ],
      };
      const { component, fixture } = createComponent(config);

      await new Promise((resolve) => setTimeout(resolve, 10));
      fixture.detectChanges();

      expect(component.value()).toEqual({
        firstName: 'John',
        age: 25,
      });
    });
  });

  describe('Form Value - Field Type Handling', () => {
    it('should handle checkbox fields with checked property', async () => {
      const config: FormConfig = {
        fields: [
          { key: 'isActive', type: 'checkbox', label: 'Is Active', props: { testId: 'active-checkbox' }, defaultValue: true },
          { key: 'isVerified', type: 'checkbox', label: 'Is Verified', props: { testId: 'verified-checkbox' }, defaultValue: false },
        ],
      };
      const { component, fixture } = createComponent(config);

      await new Promise((resolve) => setTimeout(resolve, 10));
      fixture.detectChanges();

      expect(component.value()).toEqual({
        isActive: true,
        isVerified: false,
      });
    });

    it('should handle mixed field types correctly', async () => {
      const config: FormConfig = {
        fields: [
          { key: 'name', type: 'input', label: 'Name', props: { testId: 'name' }, defaultValue: 'John Doe' },
          { key: 'country', type: 'select', label: 'Country', props: { testId: 'country', options: ['US', 'CA'] }, defaultValue: 'US' },
          { key: 'subscribe', type: 'checkbox', label: 'Subscribe', props: { testId: 'subscribe' }, defaultValue: true },
        ],
      };
      const { component, fixture } = createComponent(config);

      await new Promise((resolve) => setTimeout(resolve, 10));
      fixture.detectChanges();

      expect(component.value()).toEqual({
        name: 'John Doe',
        country: 'US',
        subscribe: true,
      });
    });
  });

  describe('Form Value - Dynamic Updates', () => {
    it('should update form value when field value changes', async () => {
      const config: FormConfig = {
        fields: [{ key: 'firstName', type: 'input', label: 'First Name', props: { testId: 'first-name' }, defaultValue: 'John' }],
      };
      const { component, fixture } = createComponent(config);

      await new Promise((resolve) => setTimeout(resolve, 10));
      fixture.detectChanges();

      expect(component.value()).toEqual({ firstName: 'John' });

      // Simulate field value change
      const inputElement = fixture.debugElement.query(By.css('[data-testid="first-name"]'))!.nativeElement as HTMLInputElement;
      inputElement.value = 'Jane';
      inputElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Wait for signal update
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(component.value()).toEqual({ firstName: 'Jane' });
    });

    it('should update form value when multiple field values change', async () => {
      const config: FormConfig = {
        fields: [
          { key: 'firstName', type: 'input', label: 'First Name', props: { testId: 'first-name' }, defaultValue: 'John' },
          { key: 'lastName', type: 'input', label: 'Last Name', props: { testId: 'last-name' }, defaultValue: 'Doe' },
        ],
      };
      const { component, fixture } = createComponent(config);

      await new Promise((resolve) => setTimeout(resolve, 10));
      fixture.detectChanges();

      expect(component.value()).toEqual({ firstName: 'John', lastName: 'Doe' });

      // Change first name
      const firstNameInput = fixture.debugElement.query(By.css('[data-testid="first-name"]'))!.nativeElement as HTMLInputElement;
      firstNameInput.value = 'Jane';
      firstNameInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(component.value()).toEqual({ firstName: 'Jane', lastName: 'Doe' });

      // Change last name
      const lastNameInput = fixture.debugElement.query(By.css('[data-testid="last-name"]'))!.nativeElement as HTMLInputElement;
      lastNameInput.value = 'Smith';
      lastNameInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(component.value()).toEqual({ firstName: 'Jane', lastName: 'Smith' });
    });

    it('should update form value when checkbox changes', async () => {
      const config: FormConfig = {
        fields: [{ key: 'isActive', type: 'checkbox', label: 'Is Active', props: { testId: 'active-checkbox' }, defaultValue: false }],
      };
      const { component, fixture } = createComponent(config);

      await new Promise((resolve) => setTimeout(resolve, 10));
      fixture.detectChanges();

      expect(component.value()).toEqual({ isActive: false });

      // Toggle checkbox
      const checkboxElement = fixture.debugElement.query(By.css('[data-testid="active-checkbox"]'))!.nativeElement as HTMLInputElement;
      checkboxElement.checked = true;
      checkboxElement.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(component.value()).toEqual({ isActive: true });
    });
  });

  describe('Form Value - Reactivity to Configuration Changes', () => {
    it('should update form value when fields are added', async () => {
      const initialConfig: FormConfig = {
        fields: [{ key: 'firstName', type: 'input', label: 'First Name', props: { testId: 'first-name' }, defaultValue: 'John' }],
      };
      const { component, fixture } = createComponent(initialConfig);

      await new Promise((resolve) => setTimeout(resolve, 10));
      fixture.detectChanges();

      expect(component.value()).toEqual({ firstName: 'John' });

      // Add more fields
      const updatedConfig: FormConfig = {
        fields: [
          { key: 'firstName', type: 'input', label: 'First Name', props: { testId: 'first-name' }, defaultValue: 'John' },
          { key: 'lastName', type: 'input', label: 'Last Name', props: { testId: 'last-name' }, defaultValue: 'Doe' },
          { key: 'age', type: 'input', label: 'Age', props: { testId: 'age' }, defaultValue: 30 },
        ],
      };

      fixture.componentRef.setInput('config', updatedConfig);
      fixture.detectChanges();

      await new Promise((resolve) => setTimeout(resolve, 10));
      fixture.detectChanges();

      expect(component.value()).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        age: 30,
      });
    });

    it('should update form value when fields are removed', async () => {
      const initialConfig: FormConfig = {
        fields: [
          { key: 'firstName', type: 'input', label: 'First Name', props: { testId: 'first-name' }, defaultValue: 'John' },
          { key: 'lastName', type: 'input', label: 'Last Name', props: { testId: 'last-name' }, defaultValue: 'Doe' },
          { key: 'age', type: 'input', label: 'Age', props: { testId: 'age' }, defaultValue: 30 },
        ],
      };
      const { component, fixture } = createComponent(initialConfig);

      await new Promise((resolve) => setTimeout(resolve, 10));
      fixture.detectChanges();

      expect(component.value()).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        age: 30,
      });

      // Remove some fields
      const updatedConfig: FormConfig = {
        fields: [{ key: 'firstName', type: 'input', label: 'First Name', props: { testId: 'first-name' }, defaultValue: 'John' }],
      };

      fixture.componentRef.setInput('config', updatedConfig);
      fixture.detectChanges();

      await new Promise((resolve) => setTimeout(resolve, 10));
      fixture.detectChanges();

      expect(component.value()).toEqual({ firstName: 'John' });
    });

    it('should clear form value when all fields are removed', async () => {
      const initialConfig: FormConfig = {
        fields: [
          { key: 'firstName', type: 'input', label: 'First Name', props: { testId: 'first-name' }, defaultValue: 'John' },
          { key: 'lastName', type: 'input', label: 'Last Name', props: { testId: 'last-name' }, defaultValue: 'Doe' },
        ],
      };
      const { component, fixture } = createComponent(initialConfig);

      await new Promise((resolve) => setTimeout(resolve, 10));
      fixture.detectChanges();

      expect(component.value()).toEqual({
        firstName: 'John',
        lastName: 'Doe',
      });

      // Remove all fields
      const emptyConfig: FormConfig = { fields: [] };
      fixture.componentRef.setInput('config', emptyConfig);
      fixture.detectChanges();

      await new Promise((resolve) => setTimeout(resolve, 10));
      fixture.detectChanges();

      expect(component.value()).toEqual({});
    });
  });

  describe('Form Value - Integration with Input Value', () => {
    it('should work independently of input value prop', async () => {
      const initialInputValue: TestFormModel = { firstName: 'InputValue' };
      const config: FormConfig = {
        fields: [{ key: 'firstName', type: 'input', label: 'First Name', props: { testId: 'first-name' }, defaultValue: 'DefaultValue' }],
      };

      const { component, fixture } = createComponent(config, initialInputValue);

      await new Promise((resolve) => setTimeout(resolve, 10));
      fixture.detectChanges();

      // form value should track field state with defaults, and defaultValues should show the defaults
      expect(component.value()).toEqual({ firstName: 'DefaultValue' });
      expect(component.defaultValues()).toEqual({ firstName: 'DefaultValue' });
    });

    it('should maintain its own state when input value changes', async () => {
      const config: FormConfig = {
        fields: [{ key: 'firstName', type: 'input', label: 'First Name', props: { testId: 'first-name' }, defaultValue: 'FieldDefault' }],
      };

      const { component, fixture } = createComponent(config);

      await new Promise((resolve) => setTimeout(resolve, 10));
      fixture.detectChanges();

      expect(component.value()).toEqual({ firstName: 'FieldDefault' });

      // Change input value prop
      fixture.componentRef.setInput('value', { firstName: 'NewInputValue' });
      fixture.detectChanges();

      // form value should maintain its own state based on defaults
      expect(component.value()).toEqual({ firstName: 'FieldDefault' });
      expect(component.defaultValues()).toEqual({ firstName: 'FieldDefault' });
    });
  });
});
