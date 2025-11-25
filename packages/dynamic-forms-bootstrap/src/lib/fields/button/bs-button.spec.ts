import { By } from '@angular/platform-browser';
import { SubmitEvent } from '@ng-forge/dynamic-forms';
import { createTestTranslationService } from '../../testing/fake-translation.service';
import { BootstrapFormTestUtils } from '../../testing/bootstrap-test-utils';

describe('BsButtonFieldComponent', () => {
  describe('Basic Bootstrap Button Integration', () => {
    it('should render button with full configuration', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'submitButton',
          type: 'button',
          label: 'Submit Form',
          className: 'submit-button',
          event: SubmitEvent,
          props: {
            variant: 'primary',
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config });

      const buttonElement = fixture.debugElement.query(By.css('button.btn'));

      expect(buttonElement).toBeTruthy();
      expect(buttonElement.nativeElement.textContent.trim()).toBe('Submit Form');
      expect(buttonElement.nativeElement.getAttribute('type')).toBe('button');
      expect(buttonElement.nativeElement.className).toContain('submit-button');
      expect(buttonElement.nativeElement.className).toContain('btn');
      expect(buttonElement.nativeElement.className).toContain('btn-primary');
    });

    it('should handle button click events', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'submitButton',
          type: 'button',
          label: 'Submit',
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config });

      // Should not throw error when clicked using utility
      await expect(BootstrapFormTestUtils.simulateBsButtonClick(fixture, 'button')).resolves.not.toThrow();

      // Multiple clicks should also work
      await BootstrapFormTestUtils.simulateBsButtonClick(fixture, 'button');
      await BootstrapFormTestUtils.simulateBsButtonClick(fixture, 'button');
      // If we reach here without throwing, the test passes
      expect(true).toBe(true);
    });

    it('should handle disabled state correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'submitButton',
          type: 'button',
          label: 'Disabled Button',
          disabled: true,
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config });

      const buttonElement = fixture.debugElement.query(By.css('button'));

      expect(buttonElement.nativeElement.disabled).toBe(true);

      // Try to click disabled button - should not throw
      await expect(BootstrapFormTestUtils.simulateBsButtonClick(fixture, 'button')).resolves.not.toThrow();
    });
  });

  describe('Bootstrap Variant Styles', () => {
    it('should render different Bootstrap variant styles', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'primaryButton',
          type: 'button',
          label: 'Primary',
          event: SubmitEvent,
          props: {
            variant: 'primary',
          },
        })
        .field({
          key: 'secondaryButton',
          type: 'button',
          label: 'Secondary',
          event: SubmitEvent,
          props: {
            variant: 'secondary',
          },
        })
        .field({
          key: 'successButton',
          type: 'button',
          label: 'Success',
          event: SubmitEvent,
          props: {
            variant: 'success',
          },
        })
        .field({
          key: 'dangerButton',
          type: 'button',
          label: 'Danger',
          event: SubmitEvent,
          props: {
            variant: 'danger',
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config });

      const buttons = fixture.debugElement.queryAll(By.css('button'));

      expect(buttons.length).toBe(4);
      expect(buttons[0].nativeElement.className).toContain('btn-primary');
      expect(buttons[1].nativeElement.className).toContain('btn-secondary');
      expect(buttons[2].nativeElement.className).toContain('btn-success');
      expect(buttons[3].nativeElement.className).toContain('btn-danger');
    });

    it('should default to primary variant when not specified', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'button',
          type: 'button',
          label: 'Default Variant',
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config });

      const buttonElement = fixture.debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.className).toContain('btn-primary');
    });

    it('should render outline variants', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'outlinePrimary',
          type: 'button',
          label: 'Outline Primary',
          event: SubmitEvent,
          props: {
            variant: 'primary',
            outline: true,
          },
        })
        .field({
          key: 'outlineSecondary',
          type: 'button',
          label: 'Outline Secondary',
          event: SubmitEvent,
          props: {
            variant: 'secondary',
            outline: true,
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config });

      const buttons = fixture.debugElement.queryAll(By.css('button'));

      expect(buttons.length).toBe(2);
      expect(buttons[0].nativeElement.className).toContain('btn-outline-primary');
      expect(buttons[1].nativeElement.className).toContain('btn-outline-secondary');
    });
  });

  describe('Bootstrap Button Sizes', () => {
    it('should apply small size class', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'button',
          type: 'button',
          label: 'Small Button',
          event: SubmitEvent,
          props: {
            size: 'sm',
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config });

      const buttonElement = fixture.debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.className).toContain('btn-sm');
    });

    it('should apply large size class', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'button',
          type: 'button',
          label: 'Large Button',
          event: SubmitEvent,
          props: {
            size: 'lg',
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config });

      const buttonElement = fixture.debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.className).toContain('btn-lg');
    });

    it('should not apply size class when not specified', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'button',
          type: 'button',
          label: 'Default Size',
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config });

      const buttonElement = fixture.debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.className).not.toContain('btn-sm');
      expect(buttonElement.nativeElement.className).not.toContain('btn-lg');
    });
  });

  describe('Bootstrap Button Block and Active States', () => {
    it('should apply block class (full width)', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'button',
          type: 'button',
          label: 'Block Button',
          event: SubmitEvent,
          props: {
            block: true,
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config });

      const buttonElement = fixture.debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.className).toContain('w-100');
    });

    it('should apply active class', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'button',
          type: 'button',
          label: 'Active Button',
          event: SubmitEvent,
          props: {
            active: true,
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config });

      const buttonElement = fixture.debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.className).toContain('active');
    });
  });

  describe('Form Integration Tests', () => {
    it('should work alongside form inputs and access form data', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsInputField({ key: 'email', props: { type: 'email' }, required: true })
        .bsInputField({ key: 'firstName' })
        .field({
          key: 'submitButton',
          type: 'button',
          label: 'Submit Form',
          event: SubmitEvent,
        })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          email: 'test@example.com',
          firstName: 'John',
        },
      });

      // Click submit button - should not throw
      await expect(BootstrapFormTestUtils.simulateBsButtonClick(fixture, 'button')).resolves.not.toThrow();

      // Verify form data is accessible - button should be excluded from form values
      expect(BootstrapFormTestUtils.getFormValue(component)).toEqual({
        email: 'test@example.com',
        firstName: 'John',
        // Note: submitButton is intentionally excluded as buttons don't contribute to form values
      });
    });

    it('should handle form validation state without blocking clicks', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsInputField({ key: 'email', required: true, props: { type: 'email' } })
        .field({
          key: 'submitButton',
          type: 'button',
          label: 'Submit',
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { email: '' },
      });

      // Submit with empty required field - should not throw
      await expect(BootstrapFormTestUtils.simulateBsButtonClick(fixture, 'button')).resolves.not.toThrow();
    });

    it('should maintain button state during form updates', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsInputField({ key: 'firstName' })
        .field({
          key: 'saveButton',
          type: 'button',
          label: 'Save Changes',
          event: SubmitEvent,
          props: {
            variant: 'success',
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { firstName: 'John' },
      });

      let buttonElement = fixture.debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.textContent.trim()).toBe('Save Changes');
      expect(buttonElement.nativeElement.className).toContain('btn-success');

      // Update form value programmatically
      fixture.componentRef.setInput('value', { firstName: 'Jane' });
      fixture.detectChanges();

      // Button should maintain its properties
      buttonElement = fixture.debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.textContent.trim()).toBe('Save Changes');
      expect(buttonElement.nativeElement.className).toContain('btn-success');
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle button without issues', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'button',
          type: 'button',
          label: 'Simple Button',
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config });

      // Should not throw error when clicked
      await expect(BootstrapFormTestUtils.simulateBsButtonClick(fixture, 'button')).resolves.not.toThrow();
    });

    it('should handle long button labels', async () => {
      const longLabel = 'This is a very long button label that might cause layout issues';

      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'button',
          type: 'button',
          label: longLabel,
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config });

      const buttonElement = fixture.debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.textContent.trim()).toBe(longLabel);
    });

    it('should handle special characters in button labels', async () => {
      const specialLabel = 'Save & Continue → 💾';

      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'button',
          type: 'button',
          label: specialLabel,
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config });

      const buttonElement = fixture.debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.textContent.trim()).toBe(specialLabel);
    });

    it('should handle multiple buttons with different events', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'saveButton',
          type: 'button',
          label: 'Save',
          event: SubmitEvent,
          props: {
            variant: 'primary',
          },
        })
        .field({
          key: 'cancelButton',
          type: 'button',
          label: 'Cancel',
          event: SubmitEvent, // In real app, this would be a different event type
          props: {
            variant: 'danger',
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config });

      const buttons = fixture.debugElement.queryAll(By.css('button'));

      expect(buttons.length).toBe(2);

      // Click both buttons - should not throw
      await BootstrapFormTestUtils.simulateBsButtonClick(fixture, 'button:first-of-type');
      await BootstrapFormTestUtils.simulateBsButtonClick(fixture, 'button:last-of-type');
      // If we reach here without throwing, the test passes
      expect(true).toBe(true);
    });

    it('should apply custom CSS classes correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'button',
          type: 'button',
          label: 'Custom Button',
          className: 'custom-class another-class',
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config });

      const container = fixture.debugElement.query(By.css('df-bs-button'));
      expect(container.nativeElement.className).toContain('custom-class');
      expect(container.nativeElement.className).toContain('another-class');
    });

    it('should handle rapid consecutive clicks', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsButtonField({
          key: 'button',
          label: 'Rapid Click Test',
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config });

      // Simulate rapid clicks - should not throw
      for (let i = 0; i < 5; i++) {
        await BootstrapFormTestUtils.simulateBsButtonClick(fixture, 'button');
      }
      // If we reach here without throwing, the test passes
      expect(true).toBe(true);
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with minimal configuration', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'button',
          type: 'button',
          label: 'Button',
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config });

      const button = fixture.debugElement.query(By.css('button.btn'));
      const buttonElement = fixture.debugElement.query(By.css('button'));

      expect(button).toBeTruthy();
      expect(buttonElement.nativeElement.textContent.trim()).toBe('Button');
      expect(buttonElement.nativeElement.getAttribute('type')).toBe('button');
      expect(buttonElement.nativeElement.disabled).toBe(false);
      expect(buttonElement.nativeElement.className).toContain('btn-primary');
    });

    it('should not apply className when not provided', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'button',
          type: 'button',
          label: 'Simple Button',
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config });

      const container = fixture.debugElement.query(By.css('df-bs-button'));
      // Should not have undefined or null classes
      expect(container.nativeElement.className).not.toContain('undefined');
      expect(container.nativeElement.className).not.toContain('null');
    });
  });

  describe('Dynamic Text Support', () => {
    describe('Translation Service Integration', () => {
      it('should handle translation service with dynamic language updates for button', async () => {
        const translationService = createTestTranslationService({
          'form.submit.label': 'Submit Form',
        });

        const config = BootstrapFormTestUtils.builder()
          .field({
            key: 'submitButton',
            type: 'button',
            label: translationService.translate('form.submit.label'),
            event: SubmitEvent,
          })
          .build();

        const { fixture } = await BootstrapFormTestUtils.createTest({ config });

        const buttonElement = fixture.debugElement.query(By.css('button'));

        // Initial translation
        expect(buttonElement.nativeElement.textContent.trim()).toBe('Submit Form');

        translationService.addTranslations({
          'form.submit.label': 'Enviar Formulario',
        });
        translationService.setLanguage('es');
        fixture.detectChanges();

        expect(buttonElement.nativeElement.textContent.trim()).toBe('Enviar Formulario');
      });
    });
  });

  describe('Specific Button Types with Preconfigured Events', () => {
    describe('Submit Button', () => {
      it('should render submit button with preconfigured SubmitEvent', async () => {
        const config = BootstrapFormTestUtils.builder()
          .field({
            key: 'submitBtn',
            type: 'submit',
            label: 'Submit',
          })
          .build();

        const { fixture } = await BootstrapFormTestUtils.createTest({ config });

        const button = fixture.debugElement.query(By.css('button.btn'));
        const buttonElement = fixture.debugElement.query(By.css('button'));

        expect(button).toBeTruthy();
        expect(buttonElement.nativeElement.textContent.trim()).toBe('Submit');
      });

      it('should disable submit button when form is invalid', async () => {
        const config = BootstrapFormTestUtils.builder()
          .bsInputField({ key: 'email', required: true })
          .field({
            key: 'submitBtn',
            type: 'submit',
            label: 'Submit',
          })
          .build();

        const { fixture, component } = await BootstrapFormTestUtils.createTest({
          config,
          initialValue: { email: '' },
        });

        const buttonElement = fixture.debugElement.query(By.css('button'));

        // Button should be disabled when form is invalid
        expect(buttonElement.nativeElement.disabled).toBe(true);
        expect(component.valid()).toBe(false);

        // Update form to be valid
        await BootstrapFormTestUtils.simulateBsInput(fixture, 'input', 'test@example.com');

        // Button should now be enabled
        expect(buttonElement.nativeElement.disabled).toBe(false);
        expect(component.valid()).toBe(true);
      });

      it('should allow explicit disabled state to override form validation', async () => {
        const config = BootstrapFormTestUtils.builder()
          .bsInputField({ key: 'email', required: true })
          .field({
            key: 'submitBtn',
            type: 'submit',
            label: 'Submit',
            disabled: true,
          })
          .build();

        const { fixture } = await BootstrapFormTestUtils.createTest({
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
        const config = BootstrapFormTestUtils.builder()
          .field({
            key: 'nextBtn',
            type: 'next',
            label: 'Next',
          })
          .build();

        const { fixture } = await BootstrapFormTestUtils.createTest({ config });

        const button = fixture.debugElement.query(By.css('button.btn'));
        const buttonElement = fixture.debugElement.query(By.css('button'));

        expect(button).toBeTruthy();
        expect(buttonElement.nativeElement.textContent.trim()).toBe('Next');
        expect(buttonElement.nativeElement.disabled).toBe(false);
      });

      it('should respect explicit disabled state', async () => {
        const config = BootstrapFormTestUtils.builder()
          .field({
            key: 'nextBtn',
            type: 'next',
            label: 'Next',
            disabled: true,
          })
          .build();

        const { fixture } = await BootstrapFormTestUtils.createTest({ config });

        const buttonElement = fixture.debugElement.query(By.css('button'));
        expect(buttonElement.nativeElement.disabled).toBe(true);
      });
    });

    describe('Previous Button', () => {
      it('should render previous button with preconfigured PreviousPageEvent', async () => {
        const config = BootstrapFormTestUtils.builder()
          .field({
            key: 'prevBtn',
            type: 'previous',
            label: 'Previous',
          })
          .build();

        const { fixture } = await BootstrapFormTestUtils.createTest({ config });

        const button = fixture.debugElement.query(By.css('button.btn'));
        const buttonElement = fixture.debugElement.query(By.css('button'));

        expect(button).toBeTruthy();
        expect(buttonElement.nativeElement.textContent.trim()).toBe('Previous');
        expect(buttonElement.nativeElement.disabled).toBe(false);
      });

      it('should respect explicit disabled state', async () => {
        const config = BootstrapFormTestUtils.builder()
          .field({
            key: 'prevBtn',
            type: 'previous',
            label: 'Previous',
            disabled: true,
          })
          .build();

        const { fixture } = await BootstrapFormTestUtils.createTest({ config });

        const buttonElement = fixture.debugElement.query(By.css('button'));
        expect(buttonElement.nativeElement.disabled).toBe(true);
      });
    });

    describe('All Specific Button Types Together', () => {
      it('should work correctly when all specific button types are used together', async () => {
        const config = BootstrapFormTestUtils.builder()
          .bsInputField({ key: 'name', required: true })
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

        const { fixture, component } = await BootstrapFormTestUtils.createTest({
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
        await BootstrapFormTestUtils.simulateBsInput(fixture, 'input', 'John');

        // Now all should be enabled
        expect(buttons[0].nativeElement.disabled).toBe(false);
        expect(buttons[1].nativeElement.disabled).toBe(false);
        expect(buttons[2].nativeElement.disabled).toBe(false);
        expect(component.valid()).toBe(true);
      });
    });
  });

  describe('Button Type Attribute', () => {
    it('should set type="button" by default', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'button',
          type: 'button',
          label: 'Click Me',
          event: SubmitEvent,
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config });

      const buttonElement = fixture.debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.getAttribute('type')).toBe('button');
    });

    it('should allow custom type attribute via props', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'button',
          type: 'button',
          label: 'Submit',
          event: SubmitEvent,
          props: {
            type: 'submit',
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config });

      const buttonElement = fixture.debugElement.query(By.css('button'));
      expect(buttonElement.nativeElement.getAttribute('type')).toBe('submit');
    });
  });
});
