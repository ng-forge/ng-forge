import { By } from '@angular/platform-browser';
import { MatButton } from '@angular/material/button';
import { SubmitEvent } from '@ng-forge/dynamic-form';
import { createTestTranslationService } from '../../testing/fake-translation.service';
import { MaterialFormTestUtils } from '../../testing/material-test-utils';

describe('MatButtonFieldComponent', () => {
  describe('Basic Material Button Integration', () => {
    it('should render button with full configuration', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'submitButton',
          type: 'button',
          label: 'Submit Form',
          className: 'submit-button',
          event: SubmitEvent,
          props: {
            color: 'primary',
          },
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config });

      const button = fixture.debugElement.query(By.directive(MatButton));
      const buttonElement = fixture.debugElement.query(By.css('button'));

      expect(button).toBeTruthy();
      expect(buttonElement.nativeElement.textContent.trim()).toBe('Submit Form');
      expect(buttonElement.nativeElement.getAttribute('type')).toBe('button');
      expect(buttonElement.nativeElement.className).toContain('submit-button');
      expect(buttonElement.nativeElement.className).toContain('mat-mdc-raised-button');
      expect(buttonElement.nativeElement.className).toContain('mat-primary');
    });

    it('should handle button click events', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'submitButton',
          type: 'button',
          label: 'Submit',
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config });

      // Should not throw error when clicked using utility
      await expect(MaterialFormTestUtils.simulateMatButtonClick(fixture, 'button')).resolves.not.toThrow();

      // Multiple clicks should also work
      await MaterialFormTestUtils.simulateMatButtonClick(fixture, 'button');
      await MaterialFormTestUtils.simulateMatButtonClick(fixture, 'button');
      // If we reach here without throwing, the test passes
      expect(true).toBe(true);
    });

    it('should handle disabled state correctly', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'submitButton',
          type: 'button',
          label: 'Disabled Button',
          disabled: true,
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config });

      const buttonElement = fixture.debugElement.query(By.css('button'));

      expect(buttonElement.nativeElement.disabled).toBe(true);

      // Try to click disabled button - should not throw
      await expect(MaterialFormTestUtils.simulateMatButtonClick(fixture, 'button')).resolves.not.toThrow();
    });
  });

  describe('Material Design Color Variants', () => {
    it('should render different Material color variants', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'primaryButton',
          type: 'button',
          label: 'Primary',
          event: SubmitEvent,
          props: {
            color: 'primary',
          },
        })
        .field({
          key: 'accentButton',
          type: 'button',
          label: 'Accent',
          event: SubmitEvent,
          props: {
            color: 'accent',
          },
        })
        .field({
          key: 'warnButton',
          type: 'button',
          label: 'Warn',
          event: SubmitEvent,
          props: {
            color: 'warn',
          },
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config });

      const buttons = fixture.debugElement.queryAll(By.css('button'));

      expect(buttons.length).toBe(3);
      expect(buttons[0].nativeElement.className).toContain('mat-primary');
      expect(buttons[1].nativeElement.className).toContain('mat-accent');
      expect(buttons[2].nativeElement.className).toContain('mat-warn');
    });

    it('should default to primary color when not specified', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'button',
          type: 'button',
          label: 'Default Color',
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config });

      const buttonElement = fixture.debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.className).toContain('mat-primary');
    });
  });

  describe('Form Integration Tests', () => {
    it('should work alongside form inputs and access form data', async () => {
      const config = MaterialFormTestUtils.builder()
        .matInputField({ key: 'email', props: { type: 'email' }, required: true })
        .matInputField({ key: 'firstName' })
        .field({
          key: 'submitButton',
          type: 'button',
          label: 'Submit Form',
          event: SubmitEvent,
        })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          email: 'test@example.com',
          firstName: 'John',
        },
      });

      // Click submit button - should not throw
      await expect(MaterialFormTestUtils.simulateMatButtonClick(fixture, 'button')).resolves.not.toThrow();

      // Verify form data is accessible - button should be excluded from form values
      expect(MaterialFormTestUtils.getFormValue(component)).toEqual({
        email: 'test@example.com',
        firstName: 'John',
        // Note: submitButton is intentionally excluded as buttons don't contribute to form values
      });
    });

    it('should handle form validation state without blocking clicks', async () => {
      const config = MaterialFormTestUtils.builder()
        .matInputField({ key: 'email', required: true, props: { type: 'email' } })
        .field({
          key: 'submitButton',
          type: 'button',
          label: 'Submit',
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { email: '' },
      });

      // Submit with empty required field - should not throw
      await expect(MaterialFormTestUtils.simulateMatButtonClick(fixture, 'button')).resolves.not.toThrow();
    });

    it('should maintain button state during form updates', async () => {
      const config = MaterialFormTestUtils.builder()
        .matInputField({ key: 'firstName' })
        .field({
          key: 'saveButton',
          type: 'button',
          label: 'Save Changes',
          event: SubmitEvent,
          props: {
            color: 'accent',
          },
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { firstName: 'John' },
      });

      let buttonElement = fixture.debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.textContent.trim()).toBe('Save Changes');
      expect(buttonElement.nativeElement.className).toContain('mat-accent');

      // Update form value programmatically
      fixture.componentRef.setInput('value', { firstName: 'Jane' });
      fixture.detectChanges();

      // Button should maintain its properties
      buttonElement = fixture.debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.textContent.trim()).toBe('Save Changes');
      expect(buttonElement.nativeElement.className).toContain('mat-accent');
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle button without issues', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'button',
          type: 'button',
          label: 'Simple Button',
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config });

      // Should not throw error when clicked
      await expect(MaterialFormTestUtils.simulateMatButtonClick(fixture, 'button')).resolves.not.toThrow();
    });

    it('should handle long button labels', async () => {
      const longLabel = 'This is a very long button label that might cause layout issues';

      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'button',
          type: 'button',
          label: longLabel,
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config });

      const buttonElement = fixture.debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.textContent.trim()).toBe(longLabel);
    });

    it('should handle special characters in button labels', async () => {
      const specialLabel = 'Save & Continue → 💾';

      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'button',
          type: 'button',
          label: specialLabel,
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config });

      const buttonElement = fixture.debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.textContent.trim()).toBe(specialLabel);
    });

    it('should handle multiple buttons with different events', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'saveButton',
          type: 'button',
          label: 'Save',
          event: SubmitEvent,
          props: {
            color: 'primary',
          },
        })
        .field({
          key: 'cancelButton',
          type: 'button',
          label: 'Cancel',
          event: SubmitEvent, // In real app, this would be a different event type
          props: {
            color: 'warn',
          },
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config });

      const buttons = fixture.debugElement.queryAll(By.css('button'));

      expect(buttons.length).toBe(2);

      // Click both buttons - should not throw
      await MaterialFormTestUtils.simulateMatButtonClick(fixture, 'button:first-of-type');
      await MaterialFormTestUtils.simulateMatButtonClick(fixture, 'button:last-of-type');
      // If we reach here without throwing, the test passes
      expect(true).toBe(true);
    });

    it('should apply custom CSS classes correctly', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'button',
          type: 'button',
          label: 'Custom Button',
          className: 'custom-class another-class',
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config });

      const buttonElement = fixture.debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.className).toContain('custom-class');
      expect(buttonElement.nativeElement.className).toContain('another-class');
    });

    it('should handle rapid consecutive clicks', async () => {
      const config = MaterialFormTestUtils.builder()
        .matButtonField({
          key: 'button',
          label: 'Rapid Click Test',
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config });

      // Simulate rapid clicks - should not throw
      for (let i = 0; i < 5; i++) {
        await MaterialFormTestUtils.simulateMatButtonClick(fixture, 'button');
      }
      // If we reach here without throwing, the test passes
      expect(true).toBe(true);
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with minimal configuration', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'button',
          type: 'button',
          label: 'Button',
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config });

      const button = fixture.debugElement.query(By.directive(MatButton));
      const buttonElement = fixture.debugElement.query(By.css('button'));

      expect(button).toBeTruthy();
      expect(buttonElement.nativeElement.textContent.trim()).toBe('Button');
      expect(buttonElement.nativeElement.getAttribute('type')).toBe('button');
      expect(buttonElement.nativeElement.disabled).toBe(false);
      expect(buttonElement.nativeElement.className).toContain('mat-primary');
    });

    it('should not apply className when not provided', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'button',
          type: 'button',
          label: 'Simple Button',
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config });

      const buttonElement = fixture.debugElement.query(By.css('button'));
      // Should not have custom classes, only Material Design classes
      expect(buttonElement.nativeElement.className).not.toContain('undefined');
      expect(buttonElement.nativeElement.className).not.toContain('null');
    });
  });

  describe('Dynamic Text Support', () => {
    describe('Translation Service Integration', () => {
      it('should handle translation service with dynamic language updates for button', async () => {
        const translationService = createTestTranslationService({
          'form.submit.label': 'Submit Form',
        });

        const config = MaterialFormTestUtils.builder()
          .field({
            key: 'submitButton',
            type: 'button',
            label: translationService.translate('form.submit.label'),
            event: SubmitEvent,
          })
          .build();

        const { fixture } = await MaterialFormTestUtils.createTest({ config });

        const buttonElement = fixture.debugElement.query(By.css('button'));

        // Initial translation
        expect(buttonElement.nativeElement.textContent.trim()).toBe('Submit Form');

        // Update to Spanish
        translationService.addTranslations({
          'form.submit.label': 'Enviar Formulario',
        });
        translationService.setLanguage('es');
        fixture.detectChanges();

        expect(buttonElement.nativeElement.textContent.trim()).toBe('Enviar Formulario');
      });
    });
  });
});
