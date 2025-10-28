import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterial } from '../../providers/material-providers';
import { delay, waitForDFInit } from '../../testing';

interface TestFormModel {
  email: string;
  firstName: string;
}

describe('MatSubmitFieldComponent - Dynamic Form Integration', () => {
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

  describe('Basic Material Submit Button Integration', () => {
    it('should render submit button with full configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'submit',
            type: 'submit',
            label: 'Submit Form',
            props: {
              color: 'primary',
              className: 'submit-button',
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

    it('should handle click events', async () => {
      let clickCount = 0;
      const handleClick = () => {
        clickCount++;
      };

      const config: FormConfig = {
        fields: [
          {
            key: 'submit',
            type: 'submit',
            label: 'Click Me',
            props: {
              onClick: handleClick,
            },
          },
        ],
      };

      createComponent(config);

      await waitForDFInit(component, fixture);

      const buttonElement = debugElement.query(By.css('button'));

      // Initial state
      expect(clickCount).toBe(0);

      // Simulate button click
      buttonElement.nativeElement.click();
      fixture.detectChanges();

      expect(clickCount).toBe(1);

      // Click again
      buttonElement.nativeElement.click();
      fixture.detectChanges();

      expect(clickCount).toBe(2);
    });

    it('should handle disabled state correctly', async () => {
      let clickCount = 0;
      const handleClick = () => {
        clickCount++;
      };

      const config: FormConfig = {
        fields: [
          {
            key: 'submit',
            type: 'submit',
            label: 'Disabled Button',
            disabled: true,
            props: {
              onClick: handleClick,
            },
          },
        ],
      };

      createComponent(config);

      await waitForDFInit(component, fixture);

      const buttonElement = debugElement.query(By.css('button'));

      expect(buttonElement.nativeElement.disabled).toBe(true);

      // Try to click disabled button
      buttonElement.nativeElement.click();
      fixture.detectChanges();

      // Click handler should not be called for disabled button
      expect(clickCount).toBe(0);
    });
  });

  describe('Material Design Color Variants', () => {
    it('should render different Material color variants', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'primarySubmit',
            type: 'submit',
            label: 'Primary',
            props: {
              color: 'primary',
            },
          },
          {
            key: 'accentSubmit',
            type: 'submit',
            label: 'Accent',
            props: {
              color: 'accent',
            },
          },
          {
            key: 'warnSubmit',
            type: 'submit',
            label: 'Warn',
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
            key: 'submit',
            type: 'submit',
            label: 'Default Color',
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
    it('should work alongside form inputs', async () => {
      let submittedData: any = null;
      const handleSubmit = () => {
        submittedData = component.formValue();
      };

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
            key: 'submit',
            type: 'submit',
            label: 'Submit Form',
            props: {
              onClick: handleSubmit,
            },
          },
        ],
      };

      createComponent(config, {
        email: 'test@example.com',
        firstName: 'John',
      });

      await waitForDFInit(component, fixture);

      const submitButton = debugElement.query(By.css('button'));

      // Click submit button
      submitButton.nativeElement.click();
      fixture.detectChanges();

      expect(submittedData).toEqual({
        email: 'test@example.com',
        firstName: 'John',
        submit: '',
      });
    });

    it('should handle form validation state', async () => {
      let submitAttempts = 0;
      const handleSubmit = () => {
        submitAttempts++;
      };

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
            key: 'submit',
            type: 'submit',
            label: 'Submit',
            props: {
              onClick: handleSubmit,
            },
          },
        ],
      };

      createComponent(config, { email: '' });

      await waitForDFInit(component, fixture);

      const submitButton = debugElement.query(By.css('button'));

      // Submit with empty required field
      submitButton.nativeElement.click();
      fixture.detectChanges();

      // Submit handler should still be called (validation is form-level responsibility)
      expect(submitAttempts).toBe(1);
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
            key: 'submit',
            type: 'submit',
            label: 'Save Changes',
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
    it('should handle submit button without click handler', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'submit',
            type: 'submit',
            label: 'No Handler',
          },
        ],
      };

      createComponent(config);

      await waitForDFInit(component, fixture);

      const buttonElement = debugElement.query(By.css('button'));

      // Should not throw error when clicked without handler
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
            key: 'submit',
            type: 'submit',
            label: longLabel,
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
            key: 'submit',
            type: 'submit',
            label: specialLabel,
          },
        ],
      };

      createComponent(config);

      await waitForDFInit(component, fixture);

      const buttonElement = debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.textContent.trim()).toBe(specialLabel);
    });

    it('should handle multiple submit buttons', async () => {
      let primaryClicks = 0;
      let secondaryClicks = 0;

      const config: FormConfig = {
        fields: [
          {
            key: 'primarySubmit',
            type: 'submit',
            label: 'Save',
            props: {
              color: 'primary',
              onClick: () => primaryClicks++,
            },
          },
          {
            key: 'secondarySubmit',
            type: 'submit',
            label: 'Cancel',
            props: {
              color: 'warn',
              onClick: () => secondaryClicks++,
            },
          },
        ],
      };

      createComponent(config);

      await waitForDFInit(component, fixture);

      const buttons = debugElement.queryAll(By.css('button'));

      expect(buttons.length).toBe(2);

      // Click first button
      buttons[0].nativeElement.click();
      fixture.detectChanges();

      expect(primaryClicks).toBe(1);
      expect(secondaryClicks).toBe(0);

      // Click second button
      buttons[1].nativeElement.click();
      fixture.detectChanges();

      expect(primaryClicks).toBe(1);
      expect(secondaryClicks).toBe(1);
    });

    it('should apply custom CSS classes correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'submit',
            type: 'submit',
            label: 'Custom Button',
            props: {
              className: 'custom-class another-class',
            },
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
      let clickCount = 0;
      const handleClick = () => {
        clickCount++;
      };

      const config: FormConfig = {
        fields: [
          {
            key: 'submit',
            type: 'submit',
            label: 'Rapid Click Test',
            props: {
              onClick: handleClick,
            },
          },
        ],
      };

      createComponent(config);

      await waitForDFInit(component, fixture);

      const buttonElement = debugElement.query(By.css('button'));

      // Simulate rapid clicks
      for (let i = 0; i < 5; i++) {
        buttonElement.nativeElement.click();
        fixture.detectChanges();
      }

      expect(clickCount).toBe(5);
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with minimal configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'submit',
            type: 'submit',
            label: 'Submit',
          },
        ],
      };

      createComponent(config);

      await delay();
      fixture.detectChanges();

      const button = debugElement.query(By.directive(MatButton));
      const buttonElement = debugElement.query(By.css('button'));

      expect(button).toBeTruthy();
      expect(buttonElement.nativeElement.textContent.trim()).toBe('Submit');
      expect(buttonElement.nativeElement.getAttribute('type')).toBe('button');
      expect(buttonElement.nativeElement.disabled).toBe(false);
      expect(buttonElement.nativeElement.className).toContain('mat-primary');
    });

    it('should not apply className when not provided', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'submit',
            type: 'submit',
            label: 'Simple Button',
          },
        ],
      };

      createComponent(config);

      await delay();
      fixture.detectChanges();

      const buttonElement = debugElement.query(By.css('button'));
      // Should not have custom classes, only Material Design classes
      expect(buttonElement.nativeElement.className).not.toContain('undefined');
      expect(buttonElement.nativeElement.className).not.toContain('null');
    });
  });
});
