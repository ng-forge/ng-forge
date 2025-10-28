import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterial } from '../../providers/material-providers';
import { delay, waitForDFInit } from '../../testing';

interface TestFormModel {
  email: string;
  password: string;
  firstName: string;
  age: number;
  website: string;
  phone: string;
}

describe('MatInputFieldComponent - Dynamic Form Integration', () => {
  let component: DynamicForm;
  let fixture: ComponentFixture<DynamicForm>;
  let debugElement: DebugElement;

  const createComponent = (config: FormConfig, initialValue?: Partial<TestFormModel>) => {
    fixture = TestBed.createComponent(DynamicForm<any>);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;

    fixture.componentRef.setInput('config', config);
    if (initialValue !== undefined) {
      fixture.componentRef.setInput('value', initialValue);
    }
    fixture.detectChanges();

    return { component, fixture, debugElement };
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicForm],
      providers: [provideAnimations(), provideDynamicForm(withMaterial())],
    }).compileComponents();
  });

  describe('Basic Material Input Integration', () => {
    it('should render email input with full configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'email',
            type: 'input',
            label: 'Email Address',
            props: {
              placeholder: 'Enter your email',
              hint: 'We will never share your email',
              required: true,
              type: 'email',
              autocomplete: 'email',
              tabIndex: 1,
              className: 'email-input',
              appearance: 'outline',
            },
          },
        ],
      };

      createComponent(config, {
        email: '',
        password: '',
        firstName: '',
        age: 0,
        website: '',
        phone: '',
      });

      await waitForDFInit(component, fixture);

      const input = debugElement.query(By.directive(MatInput));
      const formField = debugElement.query(By.css('mat-form-field'));
      const label = debugElement.query(By.css('mat-label'));
      const hint = debugElement.query(By.css('mat-hint'));

      expect(input).toBeTruthy();
      expect(input.nativeElement.getAttribute('type')).toBe('email');
      expect(input.nativeElement.getAttribute('placeholder')).toBe('Enter your email');
      expect(input.nativeElement.getAttribute('autocomplete')).toBe('email');
      expect(input.nativeElement.getAttribute('tabindex')).toBe('1');
      expect(formField.nativeElement.className).toContain('email-input');
      // Appearance should be passed through correctly from props
      expect(formField.nativeElement.className).toContain('mat-form-field-appearance-outline');
      expect(label.nativeElement.textContent.trim()).toBe('Email Address');
      expect(hint.nativeElement.textContent.trim()).toBe('We will never share your email');
    });

    it('should handle user input and update form value', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'email',
            type: 'input',
            label: 'Email Address',
            props: { type: 'email' },
          },
        ],
      };

      const { component } = createComponent(config, {
        email: '',
        password: '',
        firstName: '',
        age: 0,
        website: '',
        phone: '',
      });

      await waitForDFInit(component, fixture);

      // Initial value check
      expect(component.formValue().email).toBe('');

      // Simulate user typing
      const input = debugElement.query(By.directive(MatInput));
      input.nativeElement.value = 'test@example.com';
      input.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      // Verify form value updated
      expect(component.formValue().email).toBe('test@example.com');
    });

    it('should reflect external value changes in input field', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'email',
            type: 'input',
            label: 'Email Address',
            props: { type: 'email' },
          },
        ],
      };

      const { component } = createComponent(config, {
        email: '',
        password: '',
        firstName: '',
        age: 0,
        website: '',
        phone: '',
      });

      await waitForDFInit(component, fixture);

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        email: 'user@domain.com',
        password: '',
        firstName: '',
        age: 0,
        website: '',
        phone: '',
      });
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(component.formValue().email).toBe('user@domain.com');
    });
  });

  describe('Different Input Types Integration', () => {
    it('should render various input types with correct attributes', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
            props: { type: 'text' },
          },
          {
            key: 'password',
            type: 'input',
            label: 'Password',
            props: { type: 'password' },
          },
          {
            key: 'age',
            type: 'input',
            label: 'Age',
            props: { type: 'number' },
          },
          {
            key: 'website',
            type: 'input',
            label: 'Website',
            props: { type: 'url' },
          },
          {
            key: 'phone',
            type: 'input',
            label: 'Phone Number',
            props: { type: 'tel' },
          },
        ],
      };

      const { component } = createComponent(config, {
        email: '',
        password: '',
        firstName: '',
        age: 0,
        website: '',
        phone: '',
      });

      await waitForDFInit(component, fixture);

      const inputs = debugElement.queryAll(By.directive(MatInput));

      expect(inputs.length).toBe(5);
      expect(inputs[0].nativeElement.getAttribute('type')).toBe('text');
      expect(inputs[1].nativeElement.getAttribute('type')).toBe('password');
      expect(inputs[2].nativeElement.getAttribute('type')).toBe('number');
      expect(inputs[3].nativeElement.getAttribute('type')).toBe('url');
      expect(inputs[4].nativeElement.getAttribute('type')).toBe('tel');
    });

    it('should apply default autocomplete for password field', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'password',
            type: 'input',
            label: 'Password',
            props: { type: 'password', autocomplete: 'current-password' },
          },
        ],
      };

      createComponent(config, { password: '' });

      await waitForDFInit(component, fixture);

      const passwordInput = debugElement.query(By.directive(MatInput));
      expect(passwordInput.nativeElement.getAttribute('autocomplete')).toBe('current-password');
    });

    it('should handle number input value changes', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'age',
            type: 'input',
            label: 'Age',
            props: { type: 'number' },
          },
        ],
      };

      const { component } = createComponent(config, { age: 0 });

      await waitForDFInit(component, fixture);

      // Initial value
      expect(component.formValue().age).toBe(0);

      // Simulate typing a number
      const numberInput = debugElement.query(By.directive(MatInput));
      numberInput.nativeElement.value = '25';
      numberInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      // Note: HTML input returns string, form should handle conversion
      expect(component.formValue().age).toBe('25');
    });

    it('should reflect external value changes for all input types', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
          },
          {
            key: 'password',
            type: 'input',
            label: 'Password',
            props: { type: 'password' },
          },
          {
            key: 'age',
            type: 'input',
            label: 'Age',
            props: { type: 'number' },
          },
          {
            key: 'website',
            type: 'input',
            label: 'Website',
            props: { type: 'url' },
          },
          {
            key: 'phone',
            type: 'input',
            label: 'Phone',
          },
        ],
      };

      const { component } = createComponent(config, {
        email: '',
        password: '',
        firstName: '',
        age: 0,
        website: '',
        phone: '',
      });

      await waitForDFInit(component, fixture);

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        email: '',
        password: 'secret123',
        firstName: 'John',
        age: 30,
        website: 'https://example.com',
        phone: '555-0123',
      });
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      const formValue = component.formValue();
      expect(formValue.firstName).toBe('John');
      expect(formValue.password).toBe('secret123');
      expect(formValue.age).toBe(30);
      expect(formValue.website).toBe('https://example.com');
      expect(formValue.phone).toBe('555-0123');
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default Material configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'Name',
          },
        ],
      };

      createComponent(config, { firstName: '' });

      await delay();
      fixture.detectChanges();

      const input = debugElement.query(By.directive(MatInput));
      const formField = debugElement.query(By.css('mat-form-field'));

      expect(input.nativeElement.getAttribute('type')).toBe('text');
      expect(formField.nativeElement.className).toContain('mat-form-field-appearance-fill');
    });

    it('should not display hint when not provided', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'Name',
          },
        ],
      };

      createComponent(config, { firstName: '' });

      await delay();
      fixture.detectChanges();

      const hint = debugElement.query(By.css('mat-hint'));
      expect(hint).toBeNull();
    });
  });

  describe('Field State and Configuration Tests', () => {
    it('should handle disabled state correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'Disabled Input',
            disabled: true,
          },
        ],
      };

      createComponent(config, { firstName: '' });

      await delay();
      fixture.detectChanges();
      await delay();
      fixture.detectChanges();

      const input = debugElement.query(By.css('input'));
      expect(input.nativeElement.disabled).toBe(true);
    });

    it('should apply different Material appearance styles', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'Fill Input',
            props: {
              appearance: 'fill',
            },
          },
          {
            key: 'email',
            type: 'input',
            label: 'Outline Input',
            props: {
              appearance: 'outline',
            },
          },
        ],
      };

      createComponent(config, { firstName: '', email: '' });

      await delay();
      fixture.detectChanges();

      const formFields = debugElement.queryAll(By.css('mat-form-field'));
      expect(formFields[0].nativeElement.className).toContain('mat-form-field-appearance-fill');
      expect(formFields[1].nativeElement.className).toContain('mat-form-field-appearance-outline');
    });

    it('should handle multiple inputs with independent value changes', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
          },
          {
            key: 'email',
            type: 'input',
            label: 'Email',
            props: { type: 'email' },
          },
        ],
      };

      const { component } = createComponent(config, {
        email: 'initial@email.com',
        firstName: 'Initial Name',
      });

      await delay();
      fixture.detectChanges();

      // Initial values
      expect(component.formValue().firstName).toBe('Initial Name');
      expect(component.formValue().email).toBe('initial@email.com');

      const inputs = debugElement.queryAll(By.directive(MatInput));

      // Change first input
      inputs[0].nativeElement.value = 'Updated Name';
      inputs[0].nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      let formValue = component.formValue();
      expect(formValue.firstName).toBe('Updated Name');
      expect(formValue.email).toBe('initial@email.com');

      // Change second input
      inputs[1].nativeElement.value = 'updated@email.com';
      inputs[1].nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      formValue = component.formValue();
      expect(formValue.firstName).toBe('Updated Name');
      expect(formValue.email).toBe('updated@email.com');
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined form values gracefully', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'Name',
          },
        ],
      };

      createComponent(config); // No initial value provided

      await delay();
      fixture.detectChanges();

      const input = debugElement.query(By.directive(MatInput));
      expect(input).toBeTruthy();
    });

    it('should handle null form values gracefully', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'Name',
          },
        ],
      };

      createComponent(config, null as unknown as TestFormModel);

      await delay();
      fixture.detectChanges();

      const input = debugElement.query(By.directive(MatInput));
      expect(input).toBeTruthy();
    });

    it('should handle empty string values correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'Name',
          },
        ],
      };

      const { component } = createComponent(config, { firstName: '' });

      await delay();
      fixture.detectChanges();

      expect(component.formValue().firstName).toBe('');
    });

    it('should apply default Material Design configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'Test Input',
          },
        ],
      };

      createComponent(config, { firstName: '' });

      await delay();
      fixture.detectChanges();

      const input = debugElement.query(By.directive(MatInput));
      const formField = debugElement.query(By.css('mat-form-field'));

      // Verify default Material configuration is applied
      expect(input.nativeElement.getAttribute('type')).toBe('text');
      expect(formField.nativeElement.className).toContain('mat-form-field-appearance-fill');
    });

    it('should handle special characters and unicode input', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'Name with Special Characters',
          },
        ],
      };

      const { component } = createComponent(config, { firstName: '' });

      await delay();
      fixture.detectChanges();

      const input = debugElement.query(By.directive(MatInput));
      const specialText = 'José María 🌟 @#$%^&*()';

      // Simulate typing special characters
      input.nativeElement.value = specialText;
      input.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(component.formValue().firstName).toBe(specialText);
    });

    it('should handle rapid value changes correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'Name',
          },
        ],
      };

      const { component } = createComponent(config, { firstName: '' });

      await delay();
      fixture.detectChanges();

      const input = debugElement.query(By.directive(MatInput));
      const testValues = ['A', 'Ab', 'Abc', 'Abcd', 'Alice'];

      // Simulate rapid typing
      for (const value of testValues) {
        input.nativeElement.value = value;
        input.nativeElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();
      }

      await delay();
      fixture.detectChanges();

      // Should have the final value
      expect(component.formValue().firstName).toBe('Alice');
    });
  });
});
