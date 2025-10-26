import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { DynamicForm, FieldConfig, provideDynamicForm, withConfig } from '@ng-forge/dynamic-form';
import { MATERIAL_FIELD_TYPES } from '../../config/material-field-config';

interface TestFormModel {
  email: string;
  password: string;
}

describe('MatSubmitFieldComponent - Dynamic Form Integration', () => {
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
    let onClickSpy: any;

    beforeEach(() => {
      onClickSpy = vi.fn();

      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'submit',
          type: 'submit',
          props: {
            label: 'Submit Form',
            color: 'primary',
            disabled: false,
            className: 'submit-button',
            onClick: onClickSpy,
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        email: '',
        password: '',
      });
      fixture.detectChanges();
    });

    it('should render submit button through dynamic form', () => {
      const button = debugElement.query(By.directive(MatButton));

      expect(button).toBeTruthy();
      expect(button.nativeElement.textContent.trim()).toBe('Submit Form');
      expect(button.nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      expect(button.nativeElement.getAttribute('ng-reflect-disabled')).toBe('false');
      expect(button.nativeElement.className).toContain('submit-button');
    });

    it('should handle button clicks', () => {
      const button = debugElement.query(By.directive(MatButton));

      button.nativeElement.click();
      fixture.detectChanges();

      expect(onClickSpy).toHaveBeenCalled();
    });

    it('should apply all submit button-specific properties', () => {
      const button = debugElement.query(By.directive(MatButton));

      expect(button.nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      expect(button.nativeElement.getAttribute('ng-reflect-disabled')).toBe('false');
    });
  });

  describe('Minimal Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'submit',
          type: 'submit',
          props: {
            label: 'Submit',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        email: '',
        password: '',
      });
      fixture.detectChanges();
    });

    it('should render with default values from configuration', () => {
      const button = debugElement.query(By.directive(MatButton));

      expect(button).toBeTruthy();
      expect(button.nativeElement.textContent.trim()).toBe('Submit');
      expect(button.nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      expect(button.nativeElement.getAttribute('ng-reflect-disabled')).toBe('false');
    });

    it('should handle clicks without onClick handler', () => {
      const button = debugElement.query(By.directive(MatButton));

      expect(() => {
        button.nativeElement.click();
        fixture.detectChanges();
      }).not.toThrow();
    });
  });

  describe('Multiple Submit Buttons', () => {
    let onSaveSpy: any;
    let onCancelSpy: any;

    beforeEach(() => {
      onSaveSpy = vi.fn();
      onCancelSpy = vi.fn();

      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'save',
          type: 'submit',
          props: {
            label: 'Save',
            color: 'primary',
            onClick: onSaveSpy,
          },
        },
        {
          key: 'cancel',
          type: 'submit',
          props: {
            label: 'Cancel',
            color: 'warn',
            onClick: onCancelSpy,
          },
        },
        {
          key: 'draft',
          type: 'submit',
          props: {
            label: 'Save as Draft',
            color: 'accent',
            disabled: true,
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        email: '',
        password: '',
      });
      fixture.detectChanges();
    });

    it('should render multiple submit buttons correctly', () => {
      const buttons = debugElement.queryAll(By.directive(MatButton));

      expect(buttons.length).toBe(3);
      expect(buttons[0].nativeElement.textContent.trim()).toBe('Save');
      expect(buttons[1].nativeElement.textContent.trim()).toBe('Cancel');
      expect(buttons[2].nativeElement.textContent.trim()).toBe('Save as Draft');
    });

    it('should handle independent button interactions', () => {
      const buttons = debugElement.queryAll(By.directive(MatButton));

      // Click Save button
      buttons[0].nativeElement.click();
      fixture.detectChanges();

      expect(onSaveSpy).toHaveBeenCalled();
      expect(onCancelSpy).not.toHaveBeenCalled();

      // Click Cancel button
      buttons[1].nativeElement.click();
      fixture.detectChanges();

      expect(onCancelSpy).toHaveBeenCalled();
    });

    it('should apply different colors to buttons', () => {
      const buttons = debugElement.queryAll(By.directive(MatButton));

      expect(buttons[0].nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      expect(buttons[1].nativeElement.getAttribute('ng-reflect-color')).toBe('warn');
      expect(buttons[2].nativeElement.getAttribute('ng-reflect-color')).toBe('accent');
    });

    it('should handle disabled state correctly', () => {
      const buttons = debugElement.queryAll(By.directive(MatButton));

      expect(buttons[0].nativeElement.getAttribute('ng-reflect-disabled')).toBe('false');
      expect(buttons[1].nativeElement.getAttribute('ng-reflect-disabled')).toBe('false');
      expect(buttons[2].nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
    });
  });

  describe('Disabled State through Dynamic Form', () => {
    let onClickSpy: any;

    beforeEach(() => {
      onClickSpy = vi.fn();

      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'submit',
          type: 'submit',
          props: {
            label: 'Disabled Submit',
            disabled: true,
            onClick: onClickSpy,
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        email: '',
        password: '',
      });
      fixture.detectChanges();
    });

    it('should render button as disabled', () => {
      const button = debugElement.query(By.directive(MatButton));

      expect(button.nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
      expect(button.nativeElement.disabled).toBe(true);
    });

    it('should not execute onClick when disabled button is clicked', () => {
      const button = debugElement.query(By.directive(MatButton));

      // Try to click disabled button
      button.nativeElement.click();
      fixture.detectChanges();

      // Should not execute onClick
      expect(onClickSpy).not.toHaveBeenCalled();
    });
  });

  describe('Button Colors', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'primary',
          type: 'submit',
          props: {
            label: 'Primary Button',
            color: 'primary',
          },
        },
        {
          key: 'accent',
          type: 'submit',
          props: {
            label: 'Accent Button',
            color: 'accent',
          },
        },
        {
          key: 'warn',
          type: 'submit',
          props: {
            label: 'Warn Button',
            color: 'warn',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        email: '',
        password: '',
      });
      fixture.detectChanges();
    });

    it('should apply different color themes to buttons', () => {
      const buttons = debugElement.queryAll(By.directive(MatButton));

      expect(buttons[0].nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      expect(buttons[1].nativeElement.getAttribute('ng-reflect-color')).toBe('accent');
      expect(buttons[2].nativeElement.getAttribute('ng-reflect-color')).toBe('warn');
    });
  });

  describe('Custom CSS Classes', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'submit',
          type: 'submit',
          props: {
            label: 'Styled Button',
            className: 'custom-submit large-button primary-action',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        email: '',
        password: '',
      });
      fixture.detectChanges();
    });

    it('should apply custom CSS classes to button', () => {
      const button = debugElement.query(By.directive(MatButton));

      expect(button.nativeElement.className).toContain('custom-submit');
      expect(button.nativeElement.className).toContain('large-button');
      expect(button.nativeElement.className).toContain('primary-action');
    });
  });

  describe('Form Integration', () => {
    let onSubmitSpy: any;

    beforeEach(() => {
      onSubmitSpy = vi.fn();

      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'email',
          type: 'email',
          props: {
            label: 'Email',
            required: true,
          },
        },
        {
          key: 'password',
          type: 'password',
          props: {
            label: 'Password',
            required: true,
          },
        },
        {
          key: 'submit',
          type: 'submit',
          props: {
            label: 'Login',
            onClick: onSubmitSpy,
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        email: 'user@example.com',
        password: 'password123',
      });
      fixture.detectChanges();
    });

    it('should work alongside form inputs', () => {
      const button = debugElement.query(By.directive(MatButton));
      const inputs = debugElement.queryAll(By.css('input'));

      expect(inputs.length).toBe(2);
      expect(button).toBeTruthy();
      expect(button.nativeElement.textContent.trim()).toBe('Login');
    });

    it('should execute onClick with access to form data', () => {
      const button = debugElement.query(By.directive(MatButton));

      button.nativeElement.click();
      fixture.detectChanges();

      expect(onSubmitSpy).toHaveBeenCalled();

      // The current form values should be accessible through the component
      expect(component.value()).toEqual({
        email: 'user@example.com',
        password: 'password123',
      });
    });
  });

  describe('Button Type Attribute', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'submit',
          type: 'submit',
          props: {
            label: 'Submit Button',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        email: '',
        password: '',
      });
      fixture.detectChanges();
    });

    it('should have button type by default', () => {
      const button = debugElement.query(By.directive(MatButton));

      // Material buttons should be type="button" by default to prevent form submission
      expect(button.nativeElement.getAttribute('type')).toBe('button');
    });
  });

  describe('Default Props from Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'submit',
          type: 'submit',
          props: {
            label: 'Test Submit',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        email: '',
        password: '',
      });
      fixture.detectChanges();
    });

    it('should apply default props from MATERIAL_FIELD_TYPES configuration', () => {
      const button = debugElement.query(By.directive(MatButton));

      // Check default props from configuration
      expect(button.nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
    });
  });

  describe('Long Text Labels', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'submit',
          type: 'submit',
          props: {
            label: 'This is a very long button label that might wrap or truncate',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        email: '',
        password: '',
      });
      fixture.detectChanges();
    });

    it('should handle long text labels gracefully', () => {
      const button = debugElement.query(By.directive(MatButton));

      expect(button.nativeElement.textContent.trim()).toBe('This is a very long button label that might wrap or truncate');
    });
  });

  describe('Special Characters in Labels', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'submit',
          type: 'submit',
          props: {
            label: 'Submit & Save 💾 (Ctrl+S)',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        email: '',
        password: '',
      });
      fixture.detectChanges();
    });

    it('should handle special characters and emojis in labels', () => {
      const button = debugElement.query(By.directive(MatButton));

      expect(button.nativeElement.textContent.trim()).toBe('Submit & Save 💾 (Ctrl+S)');
    });
  });

  describe('onClick Callback Contexts', () => {
    it('should handle onClick callback that throws error', () => {
      const errorCallback = vi.fn().mockImplementation(() => {
        throw new Error('Test error');
      });

      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'submit',
          type: 'submit',
          props: {
            label: 'Error Button',
            onClick: errorCallback,
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        email: '',
        password: '',
      });
      fixture.detectChanges();

      const button = debugElement.query(By.directive(MatButton));

      expect(() => {
        button.nativeElement.click();
        fixture.detectChanges();
      }).toThrow();

      expect(errorCallback).toHaveBeenCalled();
    });
  });

  describe('Field Configuration Validation', () => {
    it('should handle missing key gracefully', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          type: 'submit',
          props: {
            label: 'Submit without key',
          },
        },
      ];

      expect(() => {
        fixture.componentRef.setInput('config', { fields });
        fixture.detectChanges();
      }).not.toThrow();

      const button = debugElement.query(By.directive(MatButton));
      expect(button).toBeTruthy();
    });

    it('should auto-generate field IDs', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'submit',
          type: 'submit',
          props: {
            label: 'Test Submit',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.detectChanges();

      // Field should have auto-generated ID
      expect(component.processedFields()[0].id).toBeDefined();
      expect(component.processedFields()[0].id).toContain('dynamic-field');
    });
  });

  describe('Empty Label', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'submit',
          type: 'submit',
          props: {
            label: '',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        email: '',
        password: '',
      });
      fixture.detectChanges();
    });

    it('should handle empty label gracefully', () => {
      const button = debugElement.query(By.directive(MatButton));

      expect(button).toBeTruthy();
      expect(button.nativeElement.textContent.trim()).toBe('');
    });
  });
});
