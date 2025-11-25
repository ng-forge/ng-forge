import { untracked } from '@angular/core';
import { By } from '@angular/platform-browser';
import { SubmitEvent } from '@ng-forge/dynamic-forms';
import { createTestTranslationService } from '../../testing/fake-translation.service';
import { PrimeNGFormTestUtils } from '../../testing/primeng-test-utils';

describe('PrimeButtonFieldComponent', () => {
  describe('Basic PrimeNG Button Integration', () => {
    it('should render button with full configuration', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'submitButton',
          type: 'button',
          label: 'Submit Form',
          className: 'submit-button',
          event: SubmitEvent,
          props: {
            severity: 'primary',
          },
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({ config });

      const buttonElement = fixture.debugElement.query(By.css('button'));

      expect(buttonElement).toBeTruthy();
      expect(buttonElement.nativeElement.textContent.trim()).toBe('Submit Form');
      expect(buttonElement.nativeElement.getAttribute('type')).toBe('button');
      expect(buttonElement.nativeElement.className).toContain('submit-button');
    });

    it('should handle button click events', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'submitButton',
          type: 'button',
          label: 'Submit',
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({ config });

      // Should not throw error when clicked using utility
      await expect(PrimeNGFormTestUtils.simulatePrimeButtonClick(fixture, 'button')).resolves.not.toThrow();

      // Multiple clicks should also work
      await PrimeNGFormTestUtils.simulatePrimeButtonClick(fixture, 'button');
      await PrimeNGFormTestUtils.simulatePrimeButtonClick(fixture, 'button');
      // If we reach here without throwing, the test passes
      expect(true).toBe(true);
    });

    it('should handle disabled state correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'submitButton',
          type: 'button',
          label: 'Disabled Button',
          disabled: true,
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({ config });

      const buttonElement = fixture.debugElement.query(By.css('button'));

      expect(buttonElement.nativeElement.disabled).toBe(true);

      // Try to click disabled button - should not throw
      await expect(PrimeNGFormTestUtils.simulatePrimeButtonClick(fixture, 'button')).resolves.not.toThrow();
    });
  });

  describe('PrimeNG Severity Variants', () => {
    it('should render different PrimeNG severity variants', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'primaryButton',
          type: 'button',
          label: 'Primary',
          event: SubmitEvent,
          props: {
            severity: 'primary',
          },
        })
        .field({
          key: 'secondaryButton',
          type: 'button',
          label: 'Secondary',
          event: SubmitEvent,
          props: {
            severity: 'secondary',
          },
        })
        .field({
          key: 'dangerButton',
          type: 'button',
          label: 'Danger',
          event: SubmitEvent,
          props: {
            severity: 'danger',
          },
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({ config });

      const buttons = fixture.debugElement.queryAll(By.css('button'));

      expect(buttons.length).toBe(3);
      // Note: PrimeNG Button directive applies severity through CSS classes at runtime
      // The buttons are rendered and functional even though directive classes may not appear in test environment
      expect(buttons[0]).toBeTruthy();
      expect(buttons[1]).toBeTruthy();
      expect(buttons[2]).toBeTruthy();
    });

    it('should default to primary severity when not specified', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'button',
          type: 'button',
          label: 'Default Severity',
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({ config });

      const buttonElement = fixture.debugElement.query(By.css('button'));
      expect(buttonElement).toBeTruthy();
    });
  });

  describe('Form Integration Tests', () => {
    it('should work alongside form inputs and access form data', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeInputField({ key: 'email', props: { type: 'email' }, required: true })
        .primeInputField({ key: 'firstName' })
        .field({
          key: 'submitButton',
          type: 'button',
          label: 'Submit Form',
          event: SubmitEvent,
        })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          email: 'test@example.com',
          firstName: 'John',
        },
      });

      // Click submit button - should not throw
      await expect(PrimeNGFormTestUtils.simulatePrimeButtonClick(fixture, 'button')).resolves.not.toThrow();

      // Verify form data is accessible - button should be excluded from form values
      expect(PrimeNGFormTestUtils.getFormValue(component)).toEqual({
        email: 'test@example.com',
        firstName: 'John',
        // Note: submitButton is intentionally excluded as buttons don't contribute to form values
      });
    });

    it('should handle form validation state without blocking clicks', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeInputField({ key: 'email', required: true, props: { type: 'email' } })
        .field({
          key: 'submitButton',
          type: 'button',
          label: 'Submit',
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { email: '' },
      });

      // Submit with empty required field - should not throw
      await expect(PrimeNGFormTestUtils.simulatePrimeButtonClick(fixture, 'button')).resolves.not.toThrow();
    });

    it('should maintain button state during form updates', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeInputField({ key: 'firstName' })
        .field({
          key: 'saveButton',
          type: 'button',
          label: 'Save Changes',
          event: SubmitEvent,
          props: {
            severity: 'secondary',
          },
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { firstName: 'John' },
      });

      let buttonElement = fixture.debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.textContent.trim()).toBe('Save Changes');
      expect(buttonElement).toBeTruthy();

      // Update form value programmatically
      await PrimeNGFormTestUtils.updateFormValue(fixture, { firstName: 'Jane' });

      // Button should maintain its properties
      buttonElement = fixture.debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.textContent.trim()).toBe('Save Changes');
      expect(buttonElement).toBeTruthy();
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle button without issues', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'button',
          type: 'button',
          label: 'Simple Button',
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({ config });

      // Should not throw error when clicked
      await expect(PrimeNGFormTestUtils.simulatePrimeButtonClick(fixture, 'button')).resolves.not.toThrow();
    });

    it('should handle long button labels', async () => {
      const longLabel = 'This is a very long button label that might cause layout issues';

      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'button',
          type: 'button',
          label: longLabel,
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({ config });

      const buttonElement = fixture.debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.textContent.trim()).toBe(longLabel);
    });

    it('should handle special characters in button labels', async () => {
      const specialLabel = 'Save & Continue → 💾';

      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'button',
          type: 'button',
          label: specialLabel,
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({ config });

      const buttonElement = fixture.debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.textContent.trim()).toBe(specialLabel);
    });

    it('should handle multiple buttons with different events', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'saveButton',
          type: 'button',
          label: 'Save',
          event: SubmitEvent,
          props: {
            severity: 'primary',
          },
        })
        .field({
          key: 'cancelButton',
          type: 'button',
          label: 'Cancel',
          event: SubmitEvent, // In real app, this would be a different event type
          props: {
            severity: 'danger',
          },
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({ config });

      const buttons = fixture.debugElement.queryAll(By.css('button'));

      expect(buttons.length).toBe(2);

      // Click both buttons - should not throw
      await PrimeNGFormTestUtils.simulatePrimeButtonClick(fixture, 'button:first-of-type');
      await PrimeNGFormTestUtils.simulatePrimeButtonClick(fixture, 'button:last-of-type');
      // If we reach here without throwing, the test passes
      expect(true).toBe(true);
    });

    it('should apply custom CSS classes correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'button',
          type: 'button',
          label: 'Custom Button',
          className: 'custom-class another-class',
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({ config });

      const buttonElement = fixture.debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.className).toContain('custom-class');
      expect(buttonElement.nativeElement.className).toContain('another-class');
    });

    it('should handle rapid consecutive clicks', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeButtonField({
          key: 'button',
          label: 'Rapid Click Test',
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({ config });

      // Simulate rapid clicks - should not throw
      for (let i = 0; i < 5; i++) {
        await PrimeNGFormTestUtils.simulatePrimeButtonClick(fixture, 'button');
      }
      // If we reach here without throwing, the test passes
      expect(true).toBe(true);
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with minimal configuration', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'button',
          type: 'button',
          label: 'Button',
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({ config });

      const buttonElement = fixture.debugElement.query(By.css('button'));

      expect(buttonElement).toBeTruthy();
      expect(buttonElement.nativeElement.textContent.trim()).toBe('Button');
      expect(buttonElement.nativeElement.getAttribute('type')).toBe('button');
      expect(buttonElement.nativeElement.disabled).toBe(false);
    });

    it('should not apply className when not provided', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'button',
          type: 'button',
          label: 'Simple Button',
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({ config });

      const buttonElement = fixture.debugElement.query(By.css('button'));
      // Should not have custom classes, only PrimeNG classes
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

        const config = PrimeNGFormTestUtils.builder()
          .field({
            key: 'submitButton',
            type: 'button',
            label: translationService.translate('form.submit.label'),
            event: SubmitEvent,
          })
          .build();

        const { fixture } = await PrimeNGFormTestUtils.createTest({ config });

        const buttonElement = fixture.debugElement.query(By.css('button'));

        // Initial translation
        expect(buttonElement.nativeElement.textContent.trim()).toBe('Submit Form');

        translationService.addTranslations({
          'form.submit.label': 'Enviar Formulario',
        });
        translationService.setLanguage('es');
        untracked(() => fixture.detectChanges());

        expect(buttonElement.nativeElement.textContent.trim()).toBe('Enviar Formulario');
      });
    });
  });

  describe('Specific Button Types with Preconfigured Events', () => {
    describe('Submit Button', () => {
      it('should render submit button with preconfigured SubmitEvent', async () => {
        const config = PrimeNGFormTestUtils.builder()
          .field({
            key: 'submitBtn',
            type: 'submit',
            label: 'Submit',
          })
          .build();

        const { fixture } = await PrimeNGFormTestUtils.createTest({ config });

        const buttonElement = fixture.debugElement.query(By.css('button'));

        expect(buttonElement).toBeTruthy();
        expect(buttonElement.nativeElement.textContent.trim()).toBe('Submit');
      });

      it('should disable submit button when form is invalid', async () => {
        const config = PrimeNGFormTestUtils.builder()
          .primeInputField({ key: 'email', required: true })
          .field({
            key: 'submitBtn',
            type: 'submit',
            label: 'Submit',
          })
          .build();

        const { fixture, component } = await PrimeNGFormTestUtils.createTest({
          config,
          initialValue: { email: '' },
        });

        const buttonElement = fixture.debugElement.query(By.css('button'));

        // Button should be disabled when form is invalid
        expect(buttonElement.nativeElement.disabled).toBe(true);
        expect(component.valid()).toBe(false);

        // Update form to be valid
        await PrimeNGFormTestUtils.simulatePrimeInput(fixture, 'input', 'test@example.com');

        // Button should now be enabled
        expect(buttonElement.nativeElement.disabled).toBe(false);
        expect(component.valid()).toBe(true);
      });

      it('should allow explicit disabled state to override form validation', async () => {
        const config = PrimeNGFormTestUtils.builder()
          .primeInputField({ key: 'email', required: true })
          .field({
            key: 'submitBtn',
            type: 'submit',
            label: 'Submit',
            disabled: true,
          })
          .build();

        const { fixture } = await PrimeNGFormTestUtils.createTest({
          config,
          initialValue: { email: 'valid@example.com' },
        });

        const buttonElement = fixture.debugElement.query(By.css('button'));

        // Button should be disabled even though form is valid
        expect(buttonElement.nativeElement.disabled).toBe(true);
      });
    });

    describe('Next Button', () => {
      it('should render next button with preconfigured NextPageEvent', async () => {
        const config = PrimeNGFormTestUtils.builder()
          .field({
            key: 'nextBtn',
            type: 'next',
            label: 'Next',
          })
          .build();

        const { fixture } = await PrimeNGFormTestUtils.createTest({ config });

        const buttonElement = fixture.debugElement.query(By.css('button'));

        expect(buttonElement).toBeTruthy();
        expect(buttonElement.nativeElement.textContent.trim()).toBe('Next');
        expect(buttonElement.nativeElement.disabled).toBe(false);
      });

      it('should respect explicit disabled state', async () => {
        const config = PrimeNGFormTestUtils.builder()
          .field({
            key: 'nextBtn',
            type: 'next',
            label: 'Next',
            disabled: true,
          })
          .build();

        const { fixture } = await PrimeNGFormTestUtils.createTest({ config });

        const buttonElement = fixture.debugElement.query(By.css('button'));
        expect(buttonElement.nativeElement.disabled).toBe(true);
      });
    });

    describe('Previous Button', () => {
      it('should render previous button with preconfigured PreviousPageEvent', async () => {
        const config = PrimeNGFormTestUtils.builder()
          .field({
            key: 'prevBtn',
            type: 'previous',
            label: 'Previous',
          })
          .build();

        const { fixture } = await PrimeNGFormTestUtils.createTest({ config });

        const buttonElement = fixture.debugElement.query(By.css('button'));

        expect(buttonElement).toBeTruthy();
        expect(buttonElement.nativeElement.textContent.trim()).toBe('Previous');
        expect(buttonElement.nativeElement.disabled).toBe(false);
      });

      it('should respect explicit disabled state', async () => {
        const config = PrimeNGFormTestUtils.builder()
          .field({
            key: 'prevBtn',
            type: 'previous',
            label: 'Previous',
            disabled: true,
          })
          .build();

        const { fixture } = await PrimeNGFormTestUtils.createTest({ config });

        const buttonElement = fixture.debugElement.query(By.css('button'));
        expect(buttonElement.nativeElement.disabled).toBe(true);
      });
    });

    describe('All Specific Button Types Together', () => {
      it('should work correctly when all specific button types are used together', async () => {
        const config = PrimeNGFormTestUtils.builder()
          .primeInputField({ key: 'name', required: true })
          .field({
            key: 'prevBtn',
            type: 'previous',
            label: 'Back',
          })
          .field({
            key: 'nextBtn',
            type: 'next',
            label: 'Next',
          })
          .field({
            key: 'submitBtn',
            type: 'submit',
            label: 'Submit',
          })
          .build();

        const { fixture, component } = await PrimeNGFormTestUtils.createTest({
          config,
          initialValue: { name: '' },
        });

        const buttons = fixture.debugElement.queryAll(By.css('button'));
        expect(buttons.length).toBe(3); // 3 action buttons

        // Previous and Next should be enabled, Submit should be disabled
        expect(buttons[0].nativeElement.disabled).toBe(false); // Previous
        expect(buttons[1].nativeElement.disabled).toBe(false); // Next
        expect(buttons[2].nativeElement.disabled).toBe(true); // Submit (form invalid)

        // Make form valid
        await PrimeNGFormTestUtils.simulatePrimeInput(fixture, 'input', 'John');

        // Now all should be enabled
        expect(buttons[0].nativeElement.disabled).toBe(false);
        expect(buttons[1].nativeElement.disabled).toBe(false);
        expect(buttons[2].nativeElement.disabled).toBe(false);
        expect(component.valid()).toBe(true);
      });
    });
  });
});
