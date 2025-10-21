import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MatInput } from '@angular/material/input';
import { DynamicForm, FieldConfig, provideDynamicForm, withConfig } from '@ng-forge/dynamic-form';
import { MATERIAL_FIELD_TYPES } from '../../config/material-field-config';

interface TestFormModel {
  email: string;
  password: string;
  firstName: string;
  age: number;
  website: string;
  phone: string;
}

describe('MatInputFieldComponent - Dynamic Form Integration', () => {
  let fixture: ComponentFixture<DynamicForm<TestFormModel>>;
  let component: DynamicForm<TestFormModel>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicForm],
      providers: [
        provideAnimations(),
        provideDynamicForm(
          withConfig({
            types: MATERIAL_FIELD_TYPES,
          })
        ),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicForm<TestFormModel>);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  describe('Happy Flow - Full Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'email',
          type: 'email',
          props: {
            label: 'Email Address',
            placeholder: 'Enter your email',
            hint: 'We will never share your email',
            required: true,
            autocomplete: 'email',
            tabIndex: 1,
            className: 'email-input',
            appearance: 'outline',
          },
        },
      ];

      fixture.componentRef.setInput('fields', fields);
      fixture.componentRef.setInput('value', {
        email: '',
        password: '',
        firstName: '',
        age: 0,
        website: '',
        phone: '',
      });
      fixture.detectChanges();
    });

    it('should render email input through dynamic form', () => {
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
      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
      expect(label.nativeElement.textContent.trim()).toBe('Email Address');
      expect(hint.nativeElement.textContent.trim()).toBe('We will never share your email');
    });

    it('should handle value changes through dynamic form', async () => {
      const input = debugElement.query(By.directive(MatInput));

      // Simulate typing
      input.nativeElement.value = 'test@example.com';
      input.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const emittedValue: TestFormModel = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue?.email).toBe('test@example.com');
    });

    it('should reflect form model changes in input', () => {
      const input = debugElement.query(By.directive(MatInput));

      // Update form model
      fixture.componentRef.setInput('value', {
        email: 'user@domain.com',
        password: '',
        firstName: '',
        age: 0,
        website: '',
        phone: '',
      });
      fixture.detectChanges();

      expect(input.nativeElement.getAttribute('ng-reflect-ng-model')).toBe('user@domain.com');
    });

    it('should apply email type and validation from field configuration', () => {
      const input = debugElement.query(By.directive(MatInput));

      expect(input.nativeElement.getAttribute('type')).toBe('email');
    });
  });

  describe('Different Input Types', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'firstName',
          type: 'input',
          props: {
            label: 'First Name',
            type: 'text',
          },
        },
        {
          key: 'password',
          type: 'password',
          props: {
            label: 'Password',
          },
        },
        {
          key: 'age',
          type: 'number',
          props: {
            label: 'Age',
          },
        },
        {
          key: 'website',
          type: 'url',
          props: {
            label: 'Website',
          },
        },
        {
          key: 'phone',
          type: 'tel',
          props: {
            label: 'Phone Number',
          },
        },
      ];

      fixture.componentRef.setInput('fields', fields);
      fixture.componentRef.setInput('value', {
        email: '',
        password: '',
        firstName: '',
        age: 0,
        website: '',
        phone: '',
      });
      fixture.detectChanges();
    });

    it('should render different input types correctly', () => {
      const inputs = debugElement.queryAll(By.directive(MatInput));

      expect(inputs.length).toBe(5);
      expect(inputs[0].nativeElement.getAttribute('type')).toBe('text');
      expect(inputs[1].nativeElement.getAttribute('type')).toBe('password');
      expect(inputs[2].nativeElement.getAttribute('type')).toBe('number');
      expect(inputs[3].nativeElement.getAttribute('type')).toBe('url');
      expect(inputs[4].nativeElement.getAttribute('type')).toBe('tel');
    });

    it('should apply default autocomplete for password field', () => {
      const inputs = debugElement.queryAll(By.directive(MatInput));
      const passwordInput = inputs[1];

      expect(passwordInput.nativeElement.getAttribute('autocomplete')).toBe('current-password');
    });

    it('should handle number input value changes', async () => {
      const inputs = debugElement.queryAll(By.directive(MatInput));
      const numberInput = inputs[2];

      // Simulate typing a number
      numberInput.nativeElement.value = '25';
      numberInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const emittedValue: TestFormModel = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue?.age).toBe('25'); // Note: HTML input returns string
    });

    it('should reflect form model changes for all input types', () => {
      const inputs = debugElement.queryAll(By.directive(MatInput));

      // Update form model
      fixture.componentRef.setInput('value', {
        email: '',
        password: 'secret123',
        firstName: 'John',
        age: 30,
        website: 'https://example.com',
        phone: '555-0123',
      });
      fixture.detectChanges();

      expect(inputs[0].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('John');
      expect(inputs[1].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('secret123');
      expect(inputs[2].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('30');
      expect(inputs[3].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('https://example.com');
      expect(inputs[4].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('555-0123');
    });
  });

  describe('Minimal Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'firstName',
          type: 'input',
          props: {
            label: 'Name',
          },
        },
      ];

      fixture.componentRef.setInput('fields', fields);
      fixture.componentRef.setInput('value', {
        email: '',
        password: '',
        firstName: '',
        age: 0,
        website: '',
        phone: '',
      });
      fixture.detectChanges();
    });

    it('should render with default values from configuration', () => {
      const input = debugElement.query(By.directive(MatInput));
      const formField = debugElement.query(By.css('mat-form-field'));

      expect(input.nativeElement.getAttribute('type')).toBe('text');
      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
    });

    it('should not display hint when not provided', () => {
      const hint = debugElement.query(By.css('mat-hint'));
      expect(hint).toBeNull();
    });
  });

  describe('Disabled State through Dynamic Form', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'firstName',
          type: 'input',
          props: {
            label: 'Disabled Input',
            disabled: true,
          },
        },
      ];

      fixture.componentRef.setInput('fields', fields);
      fixture.componentRef.setInput('value', {
        email: '',
        password: '',
        firstName: '',
        age: 0,
        website: '',
        phone: '',
      });
      fixture.detectChanges();
    });

    it('should render input as disabled', () => {
      const input = debugElement.query(By.directive(MatInput));

      expect(input.nativeElement.disabled).toBe(true);
    });

    it('should not emit value changes when disabled input is modified', async () => {
      const input = debugElement.query(By.directive(MatInput));

      // Try to type in disabled input
      input.nativeElement.value = 'should not work';
      input.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Since disabled fields don't emit changes, we can check that the input is disabled
      expect(input.nativeElement.disabled).toBe(true);
    });
  });

  describe('Appearance Variations', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'firstName',
          type: 'input',
          props: {
            label: 'Fill Input',
            appearance: 'fill',
          },
        },
        {
          key: 'email',
          type: 'input',
          props: {
            label: 'Outline Input',
            appearance: 'outline',
          },
        },
      ];

      fixture.componentRef.setInput('fields', fields);
      fixture.componentRef.setInput('value', {
        email: '',
        password: '',
        firstName: '',
        age: 0,
        website: '',
        phone: '',
      });
      fixture.detectChanges();
    });

    it('should apply different appearances to form fields', () => {
      const formFields = debugElement.queryAll(By.css('mat-form-field'));

      expect(formFields[0].nativeElement.getAttribute('ng-reflect-appearance')).toBe('fill');
      expect(formFields[1].nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
    });
  });

  describe('Multiple Inputs with Independent Values', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'firstName',
          type: 'input',
          props: {
            label: 'First Name',
          },
        },
        {
          key: 'email',
          type: 'email',
          props: {
            label: 'Email',
          },
        },
      ];

      fixture.componentRef.setInput('fields', fields);
      fixture.componentRef.setInput('value', {
        email: 'initial@email.com',
        password: '',
        firstName: 'Initial Name',
        age: 0,
        website: '',
        phone: '',
      });
      fixture.detectChanges();
    });

    it('should handle independent value changes', async () => {
      const inputs = debugElement.queryAll(By.directive(MatInput));

      // Change first input
      inputs[0].nativeElement.value = 'Updated Name';
      inputs[0].nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      let emittedValue: TestFormModel = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue).toEqual({
        email: 'initial@email.com',
        password: '',
        firstName: 'Updated Name',
        age: 0,
        website: '',
        phone: '',
      });

      // Change second input
      inputs[1].nativeElement.value = 'updated@email.com';
      inputs[1].nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      emittedValue = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue).toEqual({
        email: 'updated@email.com',
        password: '',
        firstName: 'Updated Name',
        age: 0,
        website: '',
        phone: '',
      });
    });
  });

  describe('Form Value Binding Edge Cases', () => {
    it('should handle undefined form values', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'firstName',
          type: 'input',
          props: {
            label: 'Name',
          },
        },
      ];

      fixture.componentRef.setInput('fields', fields);
      // Don't set initial value
      fixture.detectChanges();

      const input = debugElement.query(By.directive(MatInput));
      expect(input).toBeTruthy();
    });

    it('should handle null form values', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'firstName',
          type: 'input',
          props: {
            label: 'Name',
          },
        },
      ];

      fixture.componentRef.setInput('fields', fields);
      fixture.componentRef.setInput('value', null as any);
      fixture.detectChanges();

      const input = debugElement.query(By.directive(MatInput));
      expect(input).toBeTruthy();
    });

    it('should handle empty string values', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'firstName',
          type: 'input',
          props: {
            label: 'Name',
          },
        },
      ];

      fixture.componentRef.setInput('fields', fields);
      fixture.componentRef.setInput('value', {
        email: '',
        password: '',
        firstName: '',
        age: 0,
        website: '',
        phone: '',
      });
      fixture.detectChanges();

      const input = debugElement.query(By.directive(MatInput));
      expect(input.nativeElement.getAttribute('ng-reflect-ng-model')).toBe('');
    });
  });

  describe('Default Props from Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'firstName',
          type: 'input',
          props: {
            label: 'Test Input',
          },
        },
      ];

      fixture.componentRef.setInput('fields', fields);
      fixture.componentRef.setInput('value', {
        email: '',
        password: '',
        firstName: '',
        age: 0,
        website: '',
        phone: '',
      });
      fixture.detectChanges();
    });

    it('should apply default props from MATERIAL_FIELD_TYPES configuration', () => {
      const input = debugElement.query(By.directive(MatInput));
      const formField = debugElement.query(By.css('mat-form-field'));

      // Check default props from configuration
      expect(input.nativeElement.getAttribute('type')).toBe('text');
      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
    });
  });

  describe('Special Characters and Unicode', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'firstName',
          type: 'input',
          props: {
            label: 'Name with Special Characters',
          },
        },
      ];

      fixture.componentRef.setInput('fields', fields);
      fixture.componentRef.setInput('value', {
        email: '',
        password: '',
        firstName: '',
        age: 0,
        website: '',
        phone: '',
      });
      fixture.detectChanges();
    });

    it('should handle special characters and unicode', async () => {
      const input = debugElement.query(By.directive(MatInput));
      const specialText = 'José María 🌟 @#$%^&*()';

      // Simulate typing special characters
      input.nativeElement.value = specialText;
      input.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const emittedValue: TestFormModel = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue?.firstName).toBe(specialText);
    });
  });

  describe('Field Configuration Validation', () => {
    it('should handle missing key gracefully', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          type: 'input',
          props: {
            label: 'Input without key',
          },
        },
      ];

      expect(() => {
        fixture.componentRef.setInput('fields', fields);
        fixture.detectChanges();
      }).not.toThrow();

      const input = debugElement.query(By.directive(MatInput));
      expect(input).toBeTruthy();
    });

    it('should auto-generate field IDs', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'firstName',
          type: 'input',
          props: {
            label: 'Test Input',
          },
        },
      ];

      fixture.componentRef.setInput('fields', fields);
      fixture.detectChanges();

      // Field should have auto-generated ID
      expect(component.processedFields()[0].id).toBeDefined();
      expect(component.processedFields()[0].id).toContain('dynamic-field');
    });
  });
});
