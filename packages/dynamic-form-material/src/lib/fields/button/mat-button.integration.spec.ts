import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { DynamicForm, FormConfig, provideDynamicForm, SubmitEvent, EventBus } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '../../providers/material-providers';
import { delay, waitForDFInit } from '../../testing';

interface TestFormModel {
  email: string;
  firstName: string;
}

describe('MatButtonFieldComponent - Dynamic Form Integration', () => {
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
      providers: [provideAnimations(), provideDynamicForm(...withMaterialFields())],
    }).compileComponents();
  });

  describe('Basic Material Button Integration', () => {
    it('should render button with full configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'submitButton',
            type: 'button',
            label: 'Submit Form',
            className: 'submit-button',
            event: SubmitEvent,
            props: {
              color: 'primary',
            },
          },
        ],
      };

      createComponent(config);

      await waitForDFInit(component, fixture);

      const button = debugElement.query(By.directive(MatButton));
      const buttonElement = debugElement.query(By.css('button'));

      expect(button).toBeTruthy();
      expect(buttonElement.nativeElement.textContent.trim()).toBe('Submit Form');
      expect(buttonElement.nativeElement.getAttribute('type')).toBe('button');
      expect(buttonElement.nativeElement.className).toContain('submit-button');
      expect(buttonElement.nativeElement.className).toContain('mat-mdc-raised-button');
      expect(buttonElement.nativeElement.className).toContain('mat-primary');
    });

    it('should handle button click events', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'submitButton',
            type: 'button',
            label: 'Submit',
            event: SubmitEvent,
          },
        ],
      };

      createComponent(config);

      await waitForDFInit(component, fixture);

      const buttonElement = debugElement.query(By.css('button'));

      // Should not throw error when clicked
      expect(() => {
        buttonElement.nativeElement.click();
        fixture.detectChanges();
      }).not.toThrow();

      // Multiple clicks should also work
      expect(() => {
        buttonElement.nativeElement.click();
        buttonElement.nativeElement.click();
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should handle disabled state correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'submitButton',
            type: 'button',
            label: 'Disabled Button',
            disabled: true,
            event: SubmitEvent,
          },
        ],
      };

      createComponent(config);

      await waitForDFInit(component, fixture);

      const buttonElement = debugElement.query(By.css('button'));

      expect(buttonElement.nativeElement.disabled).toBe(true);

      // Try to click disabled button - should not throw
      expect(() => {
        buttonElement.nativeElement.click();
        fixture.detectChanges();
      }).not.toThrow();
    });
  });

  describe('Material Design Color Variants', () => {
    it('should render different Material color variants', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'primaryButton',
            type: 'button',
            label: 'Primary',
            event: SubmitEvent,
            props: {
              color: 'primary',
            },
          },
          {
            key: 'accentButton',
            type: 'button',
            label: 'Accent',
            event: SubmitEvent,
            props: {
              color: 'accent',
            },
          },
          {
            key: 'warnButton',
            type: 'button',
            label: 'Warn',
            event: SubmitEvent,
            props: {
              color: 'warn',
            },
          },
        ],
      };

      createComponent(config);

      await waitForDFInit(component, fixture);

      const buttons = debugElement.queryAll(By.css('button'));

      expect(buttons.length).toBe(3);
      expect(buttons[0].nativeElement.className).toContain('mat-primary');
      expect(buttons[1].nativeElement.className).toContain('mat-accent');
      expect(buttons[2].nativeElement.className).toContain('mat-warn');
    });

    it('should default to primary color when not specified', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'button',
            type: 'button',
            label: 'Default Color',
            event: SubmitEvent,
          },
        ],
      };

      createComponent(config);

      await waitForDFInit(component, fixture);

      const buttonElement = debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.className).toContain('mat-primary');
    });
  });

  describe('Form Integration Tests', () => {
    it('should work alongside form inputs and access form data', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'email',
            type: 'input',
            label: 'Email',
            props: {
              type: 'email',
              required: true,
            },
          },
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
          },
          {
            key: 'submitButton',
            type: 'button',
            label: 'Submit Form',
            event: SubmitEvent,
          },
        ],
      };

      createComponent(config, {
        email: 'test@example.com',
        firstName: 'John',
      });

      await waitForDFInit(component, fixture);

      const submitButton = debugElement.query(By.css('button'));

      // Click submit button - should not throw
      expect(() => {
        submitButton.nativeElement.click();
        fixture.detectChanges();
      }).not.toThrow();
      
      // Verify form data is accessible
      expect(component.formValue()).toEqual({
        email: 'test@example.com',
        firstName: 'John',
        submitButton: '',
      });
    });

    it('should handle form validation state without blocking clicks', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'email',
            type: 'input',
            label: 'Email',
            props: {
              type: 'email',
              required: true,
            },
          },
          {
            key: 'submitButton',
            type: 'button',
            label: 'Submit',
            event: SubmitEvent,
          },
        ],
      };

      createComponent(config, { email: '' });

      await waitForDFInit(component, fixture);

      const submitButton = debugElement.query(By.css('button'));

      // Submit with empty required field - should not throw
      expect(() => {
        submitButton.nativeElement.click();
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should maintain button state during form updates', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'firstName',
            type: 'input',
            label: 'First Name',
          },
          {
            key: 'saveButton',
            type: 'button',
            label: 'Save Changes',
            event: SubmitEvent,
            props: {
              color: 'accent',
            },
          },
        ],
      };

      createComponent(config, { firstName: 'John' });

      await waitForDFInit(component, fixture);

      let buttonElement = debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.textContent.trim()).toBe('Save Changes');
      expect(buttonElement.nativeElement.className).toContain('mat-accent');

      // Update form value programmatically
      fixture.componentRef.setInput('value', { firstName: 'Jane' });
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      // Button should maintain its properties
      buttonElement = debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.textContent.trim()).toBe('Save Changes');
      expect(buttonElement.nativeElement.className).toContain('mat-accent');
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle button without issues', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'button',
            type: 'button',
            label: 'Simple Button',
            event: SubmitEvent,
          },
        ],
      };

      createComponent(config);

      await waitForDFInit(component, fixture);

      const buttonElement = debugElement.query(By.css('button'));

      // Should not throw error when clicked
      expect(() => {
        buttonElement.nativeElement.click();
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should handle long button labels', async () => {
      const longLabel = 'This is a very long button label that might cause layout issues';

      const config: FormConfig = {
        fields: [
          {
            key: 'button',
            type: 'button',
            label: longLabel,
            event: SubmitEvent,
          },
        ],
      };

      createComponent(config);

      await waitForDFInit(component, fixture);

      const buttonElement = debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.textContent.trim()).toBe(longLabel);
    });

    it('should handle special characters in button labels', async () => {
      const specialLabel = 'Save & Continue → 💾';

      const config: FormConfig = {
        fields: [
          {
            key: 'button',
            type: 'button',
            label: specialLabel,
            event: SubmitEvent,
          },
        ],
      };

      createComponent(config);

      await waitForDFInit(component, fixture);

      const buttonElement = debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.textContent.trim()).toBe(specialLabel);
    });

    it('should handle multiple buttons with different events', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'saveButton',
            type: 'button',
            label: 'Save',
            event: SubmitEvent,
            props: {
              color: 'primary',
            },
          },
          {
            key: 'cancelButton',
            type: 'button',
            label: 'Cancel',
            event: SubmitEvent, // In real app, this would be a different event type
            props: {
              color: 'warn',
            },
          },
        ],
      };

      createComponent(config);

      await waitForDFInit(component, fixture);

      const buttons = debugElement.queryAll(By.css('button'));

      expect(buttons.length).toBe(2);

      // Click both buttons - should not throw
      expect(() => {
        buttons[0].nativeElement.click();
        buttons[1].nativeElement.click();
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should apply custom CSS classes correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'button',
            type: 'button',
            label: 'Custom Button',
            className: 'custom-class another-class',
            event: SubmitEvent,
          },
        ],
      };

      createComponent(config);

      await waitForDFInit(component, fixture);

      const buttonElement = debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.className).toContain('custom-class');
      expect(buttonElement.nativeElement.className).toContain('another-class');
    });

    it('should handle rapid consecutive clicks', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'button',
            type: 'button',
            label: 'Rapid Click Test',
            event: SubmitEvent,
          },
        ],
      };

      createComponent(config);

      await waitForDFInit(component, fixture);

      const buttonElement = debugElement.query(By.css('button'));

      // Simulate rapid clicks - should not throw
      expect(() => {
        for (let i = 0; i < 5; i++) {
          buttonElement.nativeElement.click();
          fixture.detectChanges();
        }
      }).not.toThrow();
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with minimal configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'button',
            type: 'button',
            label: 'Button',
            event: SubmitEvent,
          },
        ],
      };

      createComponent(config);

      await waitForDFInit(component, fixture);

      const button = debugElement.query(By.directive(MatButton));
      const buttonElement = debugElement.query(By.css('button'));

      expect(button).toBeTruthy();
      expect(buttonElement.nativeElement.textContent.trim()).toBe('Button');
      expect(buttonElement.nativeElement.getAttribute('type')).toBe('button');
      expect(buttonElement.nativeElement.disabled).toBe(false);
      expect(buttonElement.nativeElement.className).toContain('mat-primary');
    });

    it('should not apply className when not provided', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'button',
            type: 'button',
            label: 'Simple Button',
            event: SubmitEvent,
          },
        ],
      };

      createComponent(config);

      await waitForDFInit(component, fixture);

      const buttonElement = debugElement.query(By.css('button'));
      // Should not have custom classes, only Material Design classes
      expect(buttonElement.nativeElement.className).not.toContain('undefined');
      expect(buttonElement.nativeElement.className).not.toContain('null');
    });
  });
});