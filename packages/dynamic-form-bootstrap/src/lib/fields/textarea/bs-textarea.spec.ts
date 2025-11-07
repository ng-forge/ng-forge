import { By } from '@angular/platform-browser';
import { createTestTranslationService } from '../../testing/fake-translation.service';
import { BootstrapFormTestUtils } from '../../testing/bootstrap-test-utils';

describe('BsTextareaFieldComponent', () => {
  describe('Basic Bootstrap Textarea Integration', () => {
    it('should render textarea with full configuration', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'comments',
          type: 'textarea',
          label: 'Comments',
          placeholder: 'Enter your comments',
          required: true,
          tabIndex: 1,
          className: 'comments-textarea',
          props: {
            helpText: 'Please provide detailed feedback',
            rows: 6,
            size: 'lg',
            validFeedback: 'Looks good!',
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          comments: '',
          description: '',
          feedback: '',
          bio: '',
          notes: '',
        },
      });

      const textarea = fixture.debugElement.query(By.css('textarea.form-control'));
      const label = fixture.debugElement.query(By.css('label.form-label'));
      const helpText = fixture.debugElement.query(By.css('.form-text'));
      const container = fixture.debugElement.query(By.css('.comments-textarea'));

      expect(textarea).toBeTruthy();
      expect(textarea.nativeElement.getAttribute('placeholder')).toBe('Enter your comments');
      expect(textarea.nativeElement.getAttribute('rows')).toBe('6');
      expect(textarea.nativeElement.getAttribute('tabindex')).toBe('1');
      expect(textarea.nativeElement.classList.contains('form-control-lg')).toBe(true);
      expect(container).toBeTruthy();
      expect(label.nativeElement.textContent.trim()).toBe('Comments');
      expect(helpText.nativeElement.textContent.trim()).toBe('Please provide detailed feedback');
    });

    it('should handle user input and update form value', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsTextareaField({ key: 'comments', props: { rows: 4 } })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          comments: '',
          description: '',
          feedback: '',
          bio: '',
          notes: '',
        },
      });

      // Initial value check
      expect(BootstrapFormTestUtils.getFormValue(component).comments).toBe('');

      // Simulate user typing using utility
      await BootstrapFormTestUtils.simulateBsInput(
        fixture,
        'textarea.form-control',
        'This is a multi-line comment\nwith line breaks'
      );

      // Verify form value updated
      expect(BootstrapFormTestUtils.getFormValue(component).comments).toBe('This is a multi-line comment\nwith line breaks');
    });

    it('should reflect external value changes in textarea field', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsTextareaField({ key: 'comments', props: { rows: 4 } })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          comments: '',
          description: '',
          feedback: '',
          bio: '',
          notes: '',
        },
      });

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        comments: 'Updated comments\nwith multiple lines',
        description: '',
        feedback: '',
        bio: '',
        notes: '',
      });
      fixture.detectChanges();

      expect(BootstrapFormTestUtils.getFormValue(component).comments).toBe('Updated comments\nwith multiple lines');
    });
  });

  describe('Textarea Configuration Options', () => {
    it('should apply default rows when not specified', async () => {
      const config = BootstrapFormTestUtils.builder().bsTextareaField({ key: 'comments' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      const textarea = fixture.debugElement.query(By.css('textarea.form-control'));
      expect(textarea.nativeElement.getAttribute('rows')).toBe('4'); // Default rows
    });

    it('should apply size classes correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsTextareaField({ key: 'small', props: { size: 'sm' } })
        .bsTextareaField({ key: 'large', props: { size: 'lg' } })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { small: '', large: '' },
      });

      const textareas = fixture.debugElement.queryAll(By.css('textarea.form-control'));
      expect(textareas[0].nativeElement.classList.contains('form-control-sm')).toBe(true);
      expect(textareas[1].nativeElement.classList.contains('form-control-lg')).toBe(true);
    });

    it('should render floating label variant when specified', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'comments',
          type: 'textarea',
          label: 'Comments',
          placeholder: 'Enter comments',
          props: {
            floatingLabel: true,
            rows: 5,
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      const floatingContainer = fixture.debugElement.query(By.css('.form-floating'));
      const label = fixture.debugElement.query(By.css('.form-floating label'));

      expect(floatingContainer).toBeTruthy();
      expect(label).toBeTruthy();
      expect(label.nativeElement.textContent.trim()).toBe('Comments');
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default Bootstrap configuration', async () => {
      const config = BootstrapFormTestUtils.builder().bsTextareaField({ key: 'comments' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      const textarea = fixture.debugElement.query(By.css('textarea.form-control'));
      const container = fixture.debugElement.query(By.css('.mb-3'));

      expect(textarea.nativeElement.getAttribute('rows')).toBe('4');
      expect(container).toBeTruthy();
    });

    it('should not display help text when not provided', async () => {
      const config = BootstrapFormTestUtils.builder().bsTextareaField({ key: 'comments' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      const helpText = fixture.debugElement.query(By.css('.form-text'));
      expect(helpText).toBeNull();
    });
  });

  describe('Field State and Configuration Tests', () => {
    it('should handle disabled state correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'comments',
          type: 'textarea',
          label: 'Disabled Textarea',
          disabled: true,
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      const textarea = fixture.debugElement.query(By.css('textarea.form-control'));
      expect(textarea.nativeElement.disabled).toBe(true);
    });

    it('should apply validation states correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'comments',
          type: 'textarea',
          label: 'Comments',
          required: true,
          props: {
            validFeedback: 'Looks good!',
          },
        })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      // Touch the field to trigger validation display
      const textarea = fixture.debugElement.query(By.css('textarea.form-control'));
      textarea.nativeElement.dispatchEvent(new Event('blur', { bubbles: true }));
      fixture.detectChanges();

      // Should show invalid state
      expect(textarea.nativeElement.classList.contains('is-invalid')).toBe(true);

      // Add valid value
      await BootstrapFormTestUtils.simulateBsInput(fixture, 'textarea.form-control', 'Valid content');

      // Should show valid state
      expect(textarea.nativeElement.classList.contains('is-valid')).toBe(true);
      expect(BootstrapFormTestUtils.getFormValue(component).comments).toBe('Valid content');
    });

    it('should handle multiple textareas with independent value changes', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsTextareaField({ key: 'description' })
        .bsTextareaField({ key: 'feedback' })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          description: 'Initial description',
          feedback: 'Initial feedback',
        },
      });

      // Initial values
      expect(BootstrapFormTestUtils.getFormValue(component).description).toBe('Initial description');
      expect(BootstrapFormTestUtils.getFormValue(component).feedback).toBe('Initial feedback');

      const textareas = fixture.debugElement.queryAll(By.css('textarea.form-control'));

      // Change first textarea
      textareas[0].nativeElement.value = 'Updated description\nwith new lines';
      textareas[0].nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      let formValue = BootstrapFormTestUtils.getFormValue(component);
      expect(formValue.description).toBe('Updated description\nwith new lines');
      expect(formValue.feedback).toBe('Initial feedback');

      // Change second textarea
      textareas[1].nativeElement.value = 'Updated feedback\nwith multiple lines\nof text';
      textareas[1].nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      formValue = BootstrapFormTestUtils.getFormValue(component);
      expect(formValue.description).toBe('Updated description\nwith new lines');
      expect(formValue.feedback).toBe('Updated feedback\nwith multiple lines\nof text');
    });
  });

  describe('Bootstrap-Specific Features', () => {
    it('should display valid feedback when provided', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'comments',
          type: 'textarea',
          props: {
            validFeedback: 'Great feedback!',
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { comments: 'Some text' },
      });

      // Touch and make valid
      const textarea = fixture.debugElement.query(By.css('textarea.form-control'));
      textarea.nativeElement.dispatchEvent(new Event('blur', { bubbles: true }));
      fixture.detectChanges();

      const validFeedback = fixture.debugElement.query(By.css('.valid-feedback'));
      expect(validFeedback).toBeTruthy();
      expect(validFeedback.nativeElement.textContent.trim()).toBe('Great feedback!');
    });

    it('should handle floating label with validation', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'comments',
          type: 'textarea',
          label: 'Comments',
          placeholder: 'Enter comments',
          required: true,
          props: {
            floatingLabel: true,
            validFeedback: 'Perfect!',
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      const floatingContainer = fixture.debugElement.query(By.css('.form-floating'));
      expect(floatingContainer).toBeTruthy();

      // Add value and check validation
      await BootstrapFormTestUtils.simulateBsInput(fixture, 'textarea.form-control', 'Valid input');

      const validFeedback = fixture.debugElement.query(By.css('.valid-feedback'));
      expect(validFeedback).toBeTruthy();
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined form values gracefully', async () => {
      const config = BootstrapFormTestUtils.builder().bsTextareaField({ key: 'comments' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config }); // No initial value provided

      const textarea = fixture.debugElement.query(By.css('textarea.form-control'));
      expect(textarea).toBeTruthy();
    });

    it('should handle null form values gracefully', async () => {
      const config = BootstrapFormTestUtils.builder().bsTextareaField({ key: 'comments' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: null as any,
      });

      const textarea = fixture.debugElement.query(By.css('textarea.form-control'));
      expect(textarea).toBeTruthy();
    });

    it('should handle empty string values correctly', async () => {
      const config = BootstrapFormTestUtils.builder().bsTextareaField({ key: 'comments' }).build();

      const { component } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      expect(BootstrapFormTestUtils.getFormValue(component).comments).toBe('');
    });

    it('should apply default Bootstrap configuration', async () => {
      const config = BootstrapFormTestUtils.builder().bsTextareaField({ key: 'comments' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      const textarea = fixture.debugElement.query(By.css('textarea.form-control'));
      const container = fixture.debugElement.query(By.css('.mb-3'));

      // Verify default Bootstrap configuration is applied
      expect(textarea.nativeElement.getAttribute('rows')).toBe('4');
      expect(container).toBeTruthy();
    });

    it('should handle special characters and unicode input', async () => {
      const config = BootstrapFormTestUtils.builder().bsTextareaField({ key: 'comments' }).build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      const specialText = 'José María < @#$%^&*()\nSecond line with émojis <‰\nThird line with symbols: ¿¡§';

      // Simulate typing special characters using utility
      await BootstrapFormTestUtils.simulateBsInput(fixture, 'textarea.form-control', specialText);

      expect(BootstrapFormTestUtils.getFormValue(component).comments).toBe(specialText);
    });

    it('should handle rapid value changes correctly', async () => {
      const config = BootstrapFormTestUtils.builder().bsTextareaField({ key: 'comments' }).build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      const textarea = fixture.debugElement.query(By.css('textarea.form-control'));
      const testValues = ['Line 1', 'Line 1\nLine 2', 'Line 1\nLine 2\nLine 3', 'Final multi-line\ntext content\nwith three lines'];

      // Simulate rapid typing
      for (const value of testValues) {
        textarea.nativeElement.value = value;
        textarea.nativeElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();
      }

      // Should have the final value
      expect(BootstrapFormTestUtils.getFormValue(component).comments).toBe('Final multi-line\ntext content\nwith three lines');
    });

    it('should handle long text content correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsTextareaField({ key: 'comments', props: { rows: 10 } })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      const longText = Array(50).fill('This is a long line of text that will create a very long textarea content.').join('\n');

      // Simulate typing long content using utility
      await BootstrapFormTestUtils.simulateBsInput(fixture, 'textarea.form-control', longText);

      expect(BootstrapFormTestUtils.getFormValue(component).comments).toBe(longText);
    });
  });

  describe('Dynamic Text Support', () => {
    describe('Translation Service Integration', () => {
      it('should handle translation service with dynamic language updates for textarea', async () => {
        const translationService = createTestTranslationService({
          'form.comments.label': 'Comments',
          'form.comments.placeholder': 'Enter your comments',
          'form.comments.helpText': 'Please provide feedback',
        });

        const config = BootstrapFormTestUtils.builder()
          .field({
            key: 'comments',
            type: 'textarea',
            label: translationService.translate('form.comments.label'),
            placeholder: translationService.translate('form.comments.placeholder'),
            props: {
              helpText: translationService.translate('form.comments.helpText'),
            },
          })
          .build();

        const { fixture } = await BootstrapFormTestUtils.createTest({
          config,
          initialValue: { comments: '' },
        });

        const label = fixture.debugElement.query(By.css('label.form-label'));
        const textarea = fixture.debugElement.query(By.css('textarea.form-control'));
        const helpText = fixture.debugElement.query(By.css('.form-text'));

        // Initial translations
        expect(label.nativeElement.textContent.trim()).toBe('Comments');
        expect(textarea.nativeElement.getAttribute('placeholder')).toBe('Enter your comments');
        expect(helpText.nativeElement.textContent.trim()).toBe('Please provide feedback');

        // Update to Spanish
        translationService.addTranslations({
          'form.comments.label': 'Comentarios',
          'form.comments.placeholder': 'Ingrese sus comentarios',
          'form.comments.helpText': 'Proporcione sus comentarios',
        });
        translationService.setLanguage('es');
        fixture.detectChanges();

        expect(label.nativeElement.textContent.trim()).toBe('Comentarios');
        expect(textarea.nativeElement.getAttribute('placeholder')).toBe('Ingrese sus comentarios');
        expect(helpText.nativeElement.textContent.trim()).toBe('Proporcione sus comentarios');
      });
    });
  });
});
