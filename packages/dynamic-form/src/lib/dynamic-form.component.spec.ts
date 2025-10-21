import { ChangeDetectionStrategy, Component, DebugElement, input, output, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { DynamicForm } from './dynamic-form.component';
import { FieldRegistry } from './core/field-registry';
import { FieldConfig } from './models/field-config';
import { FormOptions } from './models/form-options';

interface TestFormModel {
  firstName?: string;
  lastName?: string;
  age?: number;
  email?: string;
  isActive?: boolean;
  country?: string;
  nested?: {
    field?: string;
  };
}

@Component({
  selector: 'df-test-input',
  template: `
    <input
      [value]="value() || ''"
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
  value = input<string>('');
  type = input<string>('text');
  placeholder = input<string>('');
  required = input<boolean>(false);
  label = input<string>('');
  id = input<string>('');
  testId = input<string>('');
  valueChange = output<string>();

  onChange(e: EventTarget | null) {
    this.valueChange.emit((e as HTMLInputElement).value);
  }
}

@Component({
  selector: 'df-test-select',
  template: `
    <select
      [value]="value() || ''"
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
  value = input<string>('');
  multiple = input<boolean>(false);
  options = input<string[]>([]);
  label = input<string>('');
  id = input<string>('');
  testId = input<string>('');
  valueChange = output<string>();

  onChange(e: EventTarget | null) {
    this.valueChange.emit((e as HTMLInputElement).value);
  }
}

@Component({
  selector: 'df-test-checkbox',
  template: `
    <input
      type="checkbox"
      [checked]="checked() || false"
      (change)="onChange($event.target)"
      [id]="id() || ''"
      [attr.data-testid]="testId() || ''"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestCheckboxComponent {
  checked = input<boolean>(false);
  label = input<string>('');
  id = input<string>('');
  testId = input<string>('');
  checkedChange = output<boolean>();

  onChange(e: EventTarget | null) {
    this.checkedChange.emit((e as HTMLInputElement).checked);
  }
}

@Component({
  selector: 'df-test-submit',
  template: `
    <button type="submit" [disabled]="disabled() || false" [id]="id() || ''" [attr.data-testid]="testId() || ''">
      {{ label() || 'Submit' }}
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestSubmitComponent {
  label = input<string>('Submit');
  disabled = input<boolean>(false);
  id = input<string>('');
  testId = input<string>('');
}

describe('DynamicFormComponent', () => {
  let component: DynamicForm<TestFormModel>;
  let fixture: ComponentFixture<DynamicForm<TestFormModel>>;
  let fieldRegistry: FieldRegistry;

  const createComponent = (fields: FieldConfig<TestFormModel>[] = []) => {
    fixture = TestBed.createComponent(DynamicForm<TestFormModel> as Type<DynamicForm<TestFormModel>>);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('fields', fields);
    fixture.detectChanges();
    return { component, fixture };
  };

  const setupFieldRegistry = () => {
    fieldRegistry = TestBed.inject(FieldRegistry);

    // Register test field types with realistic defaults
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

    fieldRegistry.registerType({
      name: 'submit',
      component: TestSubmitComponent,
      defaultProps: {
        label: 'Submit',
        disabled: false,
      },
    });
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicForm, TestInputComponent, TestSelectComponent, TestCheckboxComponent, TestSubmitComponent],
      providers: [FieldRegistry],
    }).compileComponents();

    setupFieldRegistry();
  });

  describe('Component Initialization', () => {
    it('should create successfully', () => {
      const { component } = createComponent();
      expect(component).toBeTruthy();
    });

    it('should have required inputs defined', () => {
      const { component } = createComponent();
      expect(component.fields).toBeDefined();
      expect(component.value).toBeDefined();
      expect(component.options).toBeDefined();
    });

    it('should initialize with empty processed fields when no fields provided', () => {
      const { component } = createComponent([]);

      expect(component.processedFields()).toEqual([]);
    });

    it('should initialize currentFormValue as empty object when no value provided', () => {
      const { component } = createComponent([]);

      expect(component.currentFormValue()).toEqual({});
    });
  });

  describe('Field Processing', () => {
    it('should process empty field array', () => {
      const { component } = createComponent([]);

      const result = component.processedFields();

      expect(result).toEqual([]);
    });

    it('should generate unique field IDs when not provided', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        { key: 'firstName', type: 'input' },
        { key: 'lastName', type: 'input' },
      ];
      const { component } = createComponent(fields);

      const result = component.processedFields();

      expect(result[0].id).toMatch(/^dynamic-field-firstName-\w{7}$/);
      expect(result[1].id).toMatch(/^dynamic-field-lastName-\w{7}$/);
      expect(result[0].id).not.toBe(result[1].id);
    });

    it('should preserve existing field IDs', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        { key: 'firstName', type: 'input', id: 'custom-first-name' },
        { key: 'lastName', type: 'input', id: 'custom-last-name' },
      ];
      const { component } = createComponent(fields);

      const result = component.processedFields();

      expect(result[0].id).toBe('custom-first-name');
      expect(result[1].id).toBe('custom-last-name');
    });

    it('should merge field props with registered type defaults', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'firstName',
          type: 'input',
          props: { label: 'First Name', testId: 'first-name-input' },
        },
      ];
      const { component } = createComponent(fields);

      const result = component.processedFields();

      expect(result[0].props).toEqual({
        type: 'text',
        placeholder: 'Enter value',
        required: false,
        label: 'First Name',
        testId: 'first-name-input',
      });
    });

    it('should allow field props to override type defaults', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'email',
          type: 'email',
          props: {
            placeholder: 'Your email address',
            required: false,
          },
        },
      ];
      const { component } = createComponent(fields);

      const result = component.processedFields();

      expect(result[0].props).toEqual({
        type: 'email',
        placeholder: 'Your email address',
        required: false,
      });
    });

    it('should execute onInit hooks during field processing', () => {
      const onInitSpy = vi.fn();
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'firstName',
          type: 'input',
          hooks: { onInit: onInitSpy },
          props: { label: 'First Name' },
        },
      ];
      const { component } = createComponent(fields);

      component.processedFields();

      expect(onInitSpy).toHaveBeenCalledTimes(1);
      expect(onInitSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'firstName',
          type: 'input',
          props: expect.objectContaining({ label: 'First Name' }),
        })
      );
    });

    it('should handle fields with unregistered types gracefully', () => {
      const fields: FieldConfig<TestFormModel>[] = [{ key: 'unknownField', type: 'unknown-type', props: { custom: 'value' } }];
      const { component } = createComponent(fields);

      const result = component.processedFields();

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('unknown-type');
      expect(result[0].props).toEqual({ custom: 'value' });
    });

    it('should generate field ID using type when key is not provided', () => {
      const fields: FieldConfig<TestFormModel>[] = [{ type: 'submit', props: { label: 'Save' } }];
      const { component } = createComponent(fields);

      const result = component.processedFields();

      expect(result[0].id).toMatch(/^dynamic-field-submit-\w{7}$/);
    });
  });

  describe('Form Value Management', () => {
    it('should return provided input value', () => {
      const inputValue: TestFormModel = { firstName: 'John', lastName: 'Doe', age: 30 };
      const { component, fixture } = createComponent([]);
      fixture.componentRef.setInput('value', inputValue);
      fixture.detectChanges();

      const result = component.currentFormValue();

      expect(result).toBe(inputValue);
      expect(result).toEqual({ firstName: 'John', lastName: 'Doe', age: 30 });
    });

    it('should return empty object when no input value provided', () => {
      const { component, fixture } = createComponent([]);
      fixture.componentRef.setInput('value', undefined);
      fixture.detectChanges();

      const result = component.currentFormValue();

      expect(result).toEqual({});
    });

    it('should prioritize input value over internal form state', () => {
      const inputValue: TestFormModel = { firstName: 'John From Input' };
      const { component, fixture } = createComponent([]);

      fixture.componentRef.setInput('value', inputValue);
      fixture.detectChanges();

      const result = component.currentFormValue();

      expect(result).toBe(inputValue);
      expect(result.firstName).toBe('John From Input');
    });

    it('should handle null input value', () => {
      const { component, fixture } = createComponent([]);
      fixture.componentRef.setInput('value', null);
      fixture.detectChanges();

      const result = component.currentFormValue();

      expect(result).toEqual({});
    });
  });

  describe('Field Rendering', () => {
    it('should render single input field', async () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'firstName',
          type: 'input',
          props: {
            placeholder: 'Enter your first name',
            testId: 'first-name-input',
          },
        },
      ];
      const { fixture } = createComponent(fields);
      fixture.detectChanges();

      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();

      const inputElement: DebugElement | null = fixture.debugElement.query(By.css('[data-testid="first-name-input"]'));
      expect(inputElement).toBeTruthy();
      expect(inputElement!.nativeElement.placeholder).toBe('Enter your first name');
    });

    it('should render multiple fields of different types', async () => {
      const fields: FieldConfig<TestFormModel>[] = [
        { key: 'firstName', type: 'input', props: { testId: 'first-name' } },
        { key: 'country', type: 'select', props: { testId: 'country-select', options: ['US', 'CA'] } },
        { key: 'isActive', type: 'checkbox', props: { testId: 'active-checkbox' } },
      ];
      const { fixture } = createComponent(fields);
      fixture.detectChanges();

      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('[data-testid="first-name"]'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('[data-testid="country-select"]'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('[data-testid="active-checkbox"]'))).toBeTruthy();
    });

    it('should handle rendering when field type is not registered', async () => {
      const consoleSpy = vi.spyOn(console, 'error');
      const fields: FieldConfig<TestFormModel>[] = [{ key: 'unknownField', type: 'non-existent-type' }];
      const { fixture } = createComponent(fields);
      fixture.detectChanges();

      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();

      expect(consoleSpy).toHaveBeenCalledWith('Failed to render field type "non-existent-type":', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('Form Value Changes', () => {
    it('should emit value changes when field value updates', async () => {
      const fields: FieldConfig<TestFormModel>[] = [{ key: 'firstName', type: 'input', props: { testId: 'first-name' } }];
      const { component, fixture } = createComponent(fields);

      fixture.detectChanges();

      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();

      const valueChangePromise = firstValueFrom((component as any).valueChange$);

      const inputElement = fixture.debugElement.query(By.css('[data-testid="first-name"]'))!.nativeElement as HTMLInputElement;
      inputElement.value = 'John';
      inputElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const emittedValue = await valueChangePromise;
      expect(emittedValue).toEqual({ firstName: 'John' });
    });

    it('should handle nested field paths', async () => {
      const fields: FieldConfig<TestFormModel>[] = [{ key: 'nested.field', type: 'input', props: { testId: 'nested-field' } }];
      const { component, fixture } = createComponent(fields);

      fixture.detectChanges();

      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();

      const valueChangePromise = firstValueFrom((component as any).valueChange$);

      const inputElement = fixture.debugElement.query(By.css('[data-testid="nested-field"]'))!.nativeElement as HTMLInputElement;
      inputElement.value = 'nested value';
      inputElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const emittedValue = await valueChangePromise;
      expect(emittedValue).toEqual({ nested: { field: 'nested value' } });
    });

    it('should preserve existing values when updating single field', async () => {
      const initialValue: TestFormModel = { firstName: 'John', lastName: 'Doe' };
      const fields: FieldConfig<TestFormModel>[] = [
        { key: 'firstName', type: 'input', props: { testId: 'first-name' } },
        { key: 'lastName', type: 'input', props: { testId: 'last-name' } },
      ];
      const { component, fixture } = createComponent(fields);

      fixture.componentRef.setInput('value', initialValue);
      fixture.detectChanges();

      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();

      const valueChangePromise = firstValueFrom((component as any).valueChange$);

      const firstNameInput = fixture.debugElement.query(By.css('[data-testid="first-name"]'))!.nativeElement as HTMLInputElement;
      firstNameInput.value = 'Jane';
      firstNameInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const emittedValue = await valueChangePromise;
      expect(emittedValue).toEqual({ firstName: 'Jane', lastName: 'Doe' });
    });
  });

  describe('Form Options', () => {
    it('should accept and store form options', () => {
      const { component, fixture } = createComponent([]);
      const options: FormOptions = {
        showError: false,
        validationStrategy: 'onSubmit',
      };

      fixture.componentRef.setInput('options', options);
      fixture.detectChanges();

      expect(component.options()).toBe(options);
      expect(component.options()).toEqual({
        showError: false,
        validationStrategy: 'onSubmit',
      });
    });

    it('should handle undefined form options gracefully', () => {
      const { component, fixture } = createComponent([]);
      fixture.componentRef.setInput('options', undefined);
      fixture.detectChanges();

      expect(component.options()).toBeUndefined();
    });

    it('should handle null form options gracefully', () => {
      const { component, fixture } = createComponent([]);
      fixture.componentRef.setInput('options', null);
      fixture.detectChanges();

      expect(component.options()).toBeNull();
    });
  });

  describe('Component Lifecycle', () => {
    it('should clean up component references on destroy', async () => {
      const fields: FieldConfig<TestFormModel>[] = [{ key: 'firstName', type: 'input', props: { testId: 'first-name' } }];
      const { fixture } = createComponent(fields);
      fixture.detectChanges();

      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('[data-testid="first-name"]'))).toBeTruthy();

      fixture.destroy();

      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle re-rendering when fields change', async () => {
      const initialFields: FieldConfig<TestFormModel>[] = [{ key: 'firstName', type: 'input', props: { testId: 'first-name' } }];
      const { fixture } = createComponent(initialFields);

      fixture.detectChanges();

      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('[data-testid="first-name"]'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('[data-testid="last-name"]'))).toBeFalsy();

      const updatedFields: FieldConfig<TestFormModel>[] = [
        { key: 'firstName', type: 'input', props: { testId: 'first-name' } },
        { key: 'lastName', type: 'input', props: { testId: 'last-name' } },
      ];

      fixture.componentRef.setInput('fields', updatedFields);
      fixture.detectChanges();

      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('[data-testid="first-name"]'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('[data-testid="last-name"]'))).toBeTruthy();
    });
  });
});
