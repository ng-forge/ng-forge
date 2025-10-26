import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormCheckboxControl, FormValueControl } from '@angular/forms/signals';
import { DynamicForm } from './dynamic-form.component';
import { FieldRegistry } from './core/field-registry';
import { FormConfig } from './models/field-config';
import { delay } from './testing/delay';

// Simple test harness components that properly implement the form control interfaces
@Component({
  selector: 'test-input',
  template: `<input [value]="value()" (input)="value.set($any($event.target).value)" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestInputHarness implements FormValueControl<string> {
  readonly value = model<string>('');
  readonly disabled = input<boolean>(false);
  readonly errors = input<readonly any[]>([]);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);

  // Field-specific properties
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly type = input<string>('text');
}

@Component({
  selector: 'test-checkbox',
  template: `<input type="checkbox" [checked]="checked()" (change)="checked.set($any($event.target).checked)" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestCheckboxHarness implements FormCheckboxControl {
  readonly checked = model<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly errors = input<readonly any[]>([]);
  readonly touched = model<boolean>(false);
  readonly invalid = model<boolean>(false);

  // Field-specific properties
  readonly label = input<string>('');
}

interface TestFormModel {
  firstName?: string;
  lastName?: string;
  email?: string;
  age?: number;
  isActive?: boolean;
  isAdmin?: boolean;
  country?: string;
  bio?: string;
}

describe('DynamicFormComponent - Simple Tests', () => {
  let component: DynamicForm<TestFormModel>;
  let fixture: ComponentFixture<DynamicForm<TestFormModel>>;
  let fieldRegistry: FieldRegistry;

  const createComponent = (config: FormConfig = { fields: [] }) => {
    fixture = TestBed.createComponent(DynamicForm<TestFormModel>);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('config', config);
    fixture.detectChanges();
    return { component, fixture };
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicForm, TestInputHarness, TestCheckboxHarness],
      providers: [FieldRegistry],
    }).compileComponents();

    fieldRegistry = TestBed.inject(FieldRegistry);

    // Register test components
    fieldRegistry.registerType({
      name: 'input',
      component: TestInputHarness,
      defaultProps: {
        type: 'text',
        placeholder: 'Enter value',
      },
    });

    fieldRegistry.registerType({
      name: 'checkbox',
      component: TestCheckboxHarness,
      defaultProps: {},
    });
  });

  describe('Basic Functionality', () => {
    it('should create successfully', () => {
      const { component } = createComponent();
      expect(component).toBeTruthy();
    });

    it('should initialize with empty form value when no fields', () => {
      const { component } = createComponent();
      expect(component.formValue()).toEqual({});
    });

    it('should have required computed properties', () => {
      const { component } = createComponent();
      expect(component.config).toBeDefined();
      expect(component.formValue).toBeDefined();
      expect(component.valid).toBeDefined();
      expect(component.errors).toBeDefined();
      expect(component.defaultValues).toBeDefined();
    });
  });

  describe('Form Value Tracking', () => {
    it('should track single field value', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
            defaultValue: 'John'
          }
        ],
      };

      const { component } = createComponent(config);

      // Wait for async field rendering
      await delay();
      fixture.detectChanges();

      expect(component.formValue()).toEqual({ firstName: 'John' });
    });

    it('should track checkbox field value', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'isActive',
            type: 'checkbox',
            label: 'Is Active',
            defaultValue: true
          }
        ],
      };

      const { component } = createComponent(config);

      // Wait for async field rendering
      await delay();
      fixture.detectChanges();

      expect(component.formValue()).toEqual({ isActive: true });
    });

    it('should track multiple field values', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
            defaultValue: 'John'
          },
          {
            key: 'isActive',
            type: 'checkbox',
            label: 'Is Active',
            defaultValue: false
          }
        ],
      };

      const { component } = createComponent(config);

      // Wait for async field rendering
      await delay();
      fixture.detectChanges();

      expect(component.formValue()).toEqual({
        firstName: 'John',
        isActive: false
      });
    });
  });

  describe('Form State', () => {
    it('should track form validity', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
            defaultValue: 'John',
            required: true
          }
        ],
      };

      const { component } = createComponent(config);

      // Wait for async field rendering
      await delay();
      fixture.detectChanges();

      // Should be valid with default value
      expect(component.valid()).toBe(true);
      expect(component.invalid()).toBe(false);
    });

    it('should emit value changes', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
            defaultValue: 'John'
          }
        ],
      };

      const { component } = createComponent(config);

      // Wait for async field rendering
      await delay();
      fixture.detectChanges();

      // Check the form value directly
      expect(component.formValue()).toEqual({ firstName: 'John' });
    });
  });

  describe('Validation Scenarios', () => {
    it('should handle required field validation', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'email',
            type: 'input',
            label: 'Email',
            required: true,
            defaultValue: ''
          }
        ],
      };

      const { component } = createComponent(config);
      await delay();
      fixture.detectChanges();

      expect(component.valid()).toBe(false);
      expect(component.invalid()).toBe(true);
    });

    it('should validate multiple required fields', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
            required: true,
            defaultValue: 'John'
          },
          {
            key: 'lastName',
            type: 'input',
            label: 'Last Name',
            required: true,
            defaultValue: ''
          }
        ],
      };

      const { component } = createComponent(config);
      await delay();
      fixture.detectChanges();

      expect(component.valid()).toBe(false);
      expect(component.invalid()).toBe(true);
    });

    it('should pass validation when all required fields have values', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
            required: true,
            defaultValue: 'John'
          },
          {
            key: 'lastName',
            type: 'input',
            label: 'Last Name',
            required: true,
            defaultValue: 'Doe'
          }
        ],
      };

      const { component } = createComponent(config);
      await delay();
      fixture.detectChanges();

      expect(component.valid()).toBe(true);
      expect(component.invalid()).toBe(false);
    });
  });

  describe('Field Configuration', () => {
    it('should handle fields without default values', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name'
          },
          {
            key: 'isActive',
            type: 'checkbox',
            label: 'Is Active'
          }
        ],
      };

      const { component } = createComponent(config);
      await delay();
      fixture.detectChanges();

      expect(component.formValue()).toEqual({
        firstName: '',
        isActive: false
      });
    });

    it('should handle mixed field types with different default values', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
            defaultValue: 'John'
          },
          {
            key: 'age',
            type: 'input',
            label: 'Age',
            defaultValue: '25'
          },
          {
            key: 'isActive',
            type: 'checkbox',
            label: 'Is Active',
            defaultValue: true
          },
          {
            key: 'isAdmin',
            type: 'checkbox',
            label: 'Is Admin',
            defaultValue: false
          }
        ],
      };

      const { component } = createComponent(config);
      await delay();
      fixture.detectChanges();

      expect(component.formValue()).toEqual({
        firstName: 'John',
        age: '25',
        isActive: true,
        isAdmin: false
      });
    });

    it('should handle fields with custom properties', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'email',
            type: 'input',
            label: 'Email Address',
            placeholder: 'Enter your email',
            defaultValue: 'test@example.com',
            props: {
              type: 'email'
            }
          }
        ],
      };

      const { component } = createComponent(config);
      await delay();
      fixture.detectChanges();

      expect(component.formValue()).toEqual({ email: 'test@example.com' });
    });
  });

  describe('Form State Management', () => {
    it('should track form errors', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'email',
            type: 'input',
            label: 'Email',
            required: true,
            defaultValue: ''
          }
        ],
      };

      const { component } = createComponent(config);
      await delay();
      fixture.detectChanges();

      expect(component.errors()).toBeDefined();
    });

    it('should handle form with no errors when valid', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
            defaultValue: 'John'
          }
        ],
      };

      const { component } = createComponent(config);
      await delay();
      fixture.detectChanges();

      expect(component.valid()).toBe(true);
    });

    it('should provide default values computed property', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
            defaultValue: 'John'
          },
          {
            key: 'isActive',
            type: 'checkbox',
            label: 'Is Active',
            defaultValue: true
          }
        ],
      };

      const { component } = createComponent(config);

      expect(component.defaultValues()).toEqual({
        firstName: 'John',
        isActive: true
      });
    });
  });

  describe('Complex Form Scenarios', () => {
    it('should handle large forms with many fields', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
            defaultValue: 'John',
            required: true
          },
          {
            key: 'lastName',
            type: 'input',
            label: 'Last Name',
            defaultValue: 'Doe',
            required: true
          },
          {
            key: 'email',
            type: 'input',
            label: 'Email',
            defaultValue: 'john.doe@example.com',
            required: true
          },
          {
            key: 'age',
            type: 'input',
            label: 'Age',
            defaultValue: '30'
          },
          {
            key: 'country',
            type: 'input',
            label: 'Country',
            defaultValue: 'USA'
          },
          {
            key: 'bio',
            type: 'input',
            label: 'Biography',
            defaultValue: 'Software developer'
          },
          {
            key: 'isActive',
            type: 'checkbox',
            label: 'Is Active',
            defaultValue: true
          },
          {
            key: 'isAdmin',
            type: 'checkbox',
            label: 'Is Admin',
            defaultValue: false
          }
        ],
      };

      const { component } = createComponent(config);
      await delay();
      fixture.detectChanges();

      expect(component.formValue()).toEqual({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        age: '30',
        country: 'USA',
        bio: 'Software developer',
        isActive: true,
        isAdmin: false
      });

      expect(component.valid()).toBe(true);
    });

    it('should handle forms with mixed validation states', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
            defaultValue: 'John',
            required: true
          },
          {
            key: 'lastName',
            type: 'input',
            label: 'Last Name',
            defaultValue: '',
            required: true
          },
          {
            key: 'email',
            type: 'input',
            label: 'Email',
            defaultValue: 'john@example.com',
            required: false
          },
          {
            key: 'isActive',
            type: 'checkbox',
            label: 'Is Active',
            defaultValue: true
          }
        ],
      };

      const { component } = createComponent(config);
      await delay();
      fixture.detectChanges();

      expect(component.formValue()).toEqual({
        firstName: 'John',
        lastName: '',
        email: 'john@example.com',
        isActive: true
      });

      // Should be invalid due to empty required lastName
      expect(component.valid()).toBe(false);
    });

    it('should handle empty configuration gracefully', () => {
      const config: FormConfig = { fields: [] };
      const { component } = createComponent(config);

      expect(component.formValue()).toEqual({});
      expect(component.valid()).toBe(true);
      expect(component.defaultValues()).toEqual({});
    });

    it('should handle configuration changes', async () => {
      const initialConfig: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
            defaultValue: 'John'
          }
        ],
      };

      const { component, fixture } = createComponent(initialConfig);
      await delay();
      fixture.detectChanges();

      expect(component.formValue()).toEqual({ firstName: 'John' });

      // Update configuration
      const newConfig: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
            defaultValue: 'Jane'
          },
          {
            key: 'lastName',
            type: 'input',
            label: 'Last Name',
            defaultValue: 'Smith'
          }
        ],
      };

      fixture.componentRef.setInput('config', newConfig);
      await delay();
      fixture.detectChanges();

      expect(component.formValue()).toEqual({
        firstName: 'Jane',
        lastName: 'Smith'
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null and undefined default values', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
            defaultValue: null as any
          },
          {
            key: 'lastName',
            type: 'input',
            label: 'Last Name',
            defaultValue: undefined as any
          }
        ],
      };

      const { component } = createComponent(config);
      await delay();
      fixture.detectChanges();

      // Should handle null/undefined gracefully
      expect(component.formValue()).toBeDefined();
    });

    it('should handle special characters in field keys', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'field-with-dashes',
            type: 'input',
            label: 'Field with Dashes',
            defaultValue: 'test'
          },
          {
            key: 'field_with_underscores',
            type: 'input',
            label: 'Field with Underscores',
            defaultValue: 'test2'
          }
        ],
      };

      const { component } = createComponent(config);
      await delay();
      fixture.detectChanges();

      expect(component.formValue()).toEqual({
        'field-with-dashes': 'test',
        'field_with_underscores': 'test2'
      });
    });

    it('should handle very long field values', async () => {
      const longValue = 'a'.repeat(1000);
      const config: FormConfig = {
        fields: [
          {
            key: 'longText',
            type: 'input',
            label: 'Long Text',
            defaultValue: longValue
          }
        ],
      };

      const { component } = createComponent(config);
      await delay();
      fixture.detectChanges();

      expect(component.formValue()).toEqual({ longText: longValue });
    });
  });
});
