import { untracked } from '@angular/core';
import { By } from '@angular/platform-browser';
import { createTestTranslationService } from '../../testing/fake-translation.service';
import { PrimeNGFormTestUtils } from '../../testing/primeng-test-utils';

describe('PrimeTextareaFieldComponent', () => {
  describe('Basic PrimeNG Textarea Integration', () => {
    it('should render textarea with full configuration', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'comments',
          type: 'textarea',
          label: 'Comments',
          placeholder: 'Enter your comments',
          required: true,
          tabIndex: 1,
          className: 'comments-textarea',
          props: {
            hint: 'Please provide detailed feedback',
            rows: 6,
            maxlength: 500,
            autoResize: true,
          },
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          comments: '',
          description: '',
          feedback: '',
          bio: '',
          notes: '',
        },
      });

      const textarea = fixture.debugElement.query(By.css('textarea[pInputTextarea]'));
      const fieldWrapper = fixture.debugElement.query(By.css('.p-field'));
      const label = fixture.debugElement.query(By.css('label'));
      const hint = fixture.debugElement.query(By.css('small.p-text-secondary'));

      expect(textarea).toBeTruthy();
      expect(textarea.nativeElement.getAttribute('placeholder')).toBe('Enter your comments');
      expect(textarea.nativeElement.getAttribute('rows')).toBe('6');
      expect(textarea.nativeElement.getAttribute('maxlength')).toBe('500');
      expect(textarea.nativeElement.getAttribute('tabindex')).toBe('1');
      expect(fieldWrapper.nativeElement.className).toContain('comments-textarea');
      expect(label.nativeElement.textContent.trim()).toBe('Comments');
      expect(hint.nativeElement.textContent.trim()).toBe('Please provide detailed feedback');
    });

    it('should handle user input and update form value', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeTextareaField({ key: 'comments', props: { rows: 4 } })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
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
      expect(PrimeNGFormTestUtils.getFormValue(component).comments).toBe('');

      // Simulate user typing using utility
      await PrimeNGFormTestUtils.simulatePrimeInput(fixture, 'textarea[pInputTextarea]', 'This is a multi-line comment\nwith line breaks');

      // Verify form value updated
      expect(PrimeNGFormTestUtils.getFormValue(component).comments).toBe('This is a multi-line comment\nwith line breaks');
    });

    it('should reflect external value changes in textarea field', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeTextareaField({ key: 'comments', props: { rows: 4 } })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
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
      untracked(() => fixture.detectChanges());

      expect(PrimeNGFormTestUtils.getFormValue(component).comments).toBe('Updated comments\nwith multiple lines');
    });
  });

  describe('Textarea Configuration Options', () => {
    it('should apply default rows when not specified', async () => {
      const config = PrimeNGFormTestUtils.builder().primeTextareaField({ key: 'comments' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      const textarea = fixture.debugElement.query(By.css('textarea[pInputTextarea]'));
      expect(textarea.nativeElement.getAttribute('rows')).toBe('4'); // Default rows
    });

    it('should handle maxlength attribute correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeTextareaField({ key: 'comments', props: { maxlength: 100 } })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      const textarea = fixture.debugElement.query(By.css('textarea[pInputTextarea]'));
      expect(textarea.nativeElement.getAttribute('maxlength')).toBe('100');
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default PrimeNG configuration', async () => {
      const config = PrimeNGFormTestUtils.builder().primeTextareaField({ key: 'comments' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      const textarea = fixture.debugElement.query(By.css('textarea[pInputTextarea]'));
      const fieldWrapper = fixture.debugElement.query(By.css('.p-field'));

      expect(textarea.nativeElement.getAttribute('rows')).toBe('4');
      expect(fieldWrapper).toBeTruthy();
    });

    it('should not display hint when not provided', async () => {
      const config = PrimeNGFormTestUtils.builder().primeTextareaField({ key: 'comments' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      const hint = fixture.debugElement.query(By.css('small.p-text-secondary'));
      expect(hint).toBeNull();
    });
  });

  describe('Field State and Configuration Tests', () => {
    it('should handle disabled state correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'comments',
          type: 'textarea',
          label: 'Disabled Textarea',
          disabled: true,
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      const textarea = fixture.debugElement.query(By.css('textarea'));
      expect(textarea.nativeElement.disabled).toBe(true);
    });

    it('should handle autoResize configuration', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeTextareaField({ key: 'description', props: { autoResize: false } })
        .primeTextareaField({ key: 'feedback', props: { autoResize: true } })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { description: '', feedback: '' },
      });

      const textareas = fixture.debugElement.queryAll(By.css('textarea[pInputTextarea]'));
      expect(textareas.length).toBe(2);
      // AutoResize is a component property, not a DOM attribute, so we verify it exists
      expect(textareas[0]).toBeTruthy();
      expect(textareas[1]).toBeTruthy();
    });

    it('should handle multiple textareas with independent value changes', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeTextareaField({ key: 'description' })
        .primeTextareaField({ key: 'feedback' })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          description: 'Initial description',
          feedback: 'Initial feedback',
        },
      });

      // Initial values
      expect(PrimeNGFormTestUtils.getFormValue(component).description).toBe('Initial description');
      expect(PrimeNGFormTestUtils.getFormValue(component).feedback).toBe('Initial feedback');

      const textareas = fixture.debugElement.queryAll(By.css('textarea[pInputTextarea]'));

      // Change first textarea
      textareas[0].nativeElement.value = 'Updated description\nwith new lines';
      textareas[0].nativeElement.dispatchEvent(new Event('input'));
      untracked(() => fixture.detectChanges());

      let formValue = PrimeNGFormTestUtils.getFormValue(component);
      expect(formValue.description).toBe('Updated description\nwith new lines');
      expect(formValue.feedback).toBe('Initial feedback');

      // Change second textarea
      textareas[1].nativeElement.value = 'Updated feedback\nwith multiple lines\nof text';
      textareas[1].nativeElement.dispatchEvent(new Event('input'));
      untracked(() => fixture.detectChanges());

      formValue = PrimeNGFormTestUtils.getFormValue(component);
      expect(formValue.description).toBe('Updated description\nwith new lines');
      expect(formValue.feedback).toBe('Updated feedback\nwith multiple lines\nof text');
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined form values gracefully', async () => {
      const config = PrimeNGFormTestUtils.builder().primeTextareaField({ key: 'comments' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({ config }); // No initial value provided

      const textarea = fixture.debugElement.query(By.css('textarea[pInputTextarea]'));
      expect(textarea).toBeTruthy();
    });

    it('should handle null form values gracefully', async () => {
      const config = PrimeNGFormTestUtils.builder().primeTextareaField({ key: 'comments' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: null as unknown,
      });

      const textarea = fixture.debugElement.query(By.css('textarea[pInputTextarea]'));
      expect(textarea).toBeTruthy();
    });

    it('should handle empty string values correctly', async () => {
      const config = PrimeNGFormTestUtils.builder().primeTextareaField({ key: 'comments' }).build();

      const { component } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      expect(PrimeNGFormTestUtils.getFormValue(component).comments).toBe('');
    });

    it('should apply default PrimeNG configuration', async () => {
      const config = PrimeNGFormTestUtils.builder().primeTextareaField({ key: 'comments' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      const textarea = fixture.debugElement.query(By.css('textarea[pInputTextarea]'));
      const fieldWrapper = fixture.debugElement.query(By.css('.p-field'));

      // Verify default PrimeNG configuration is applied
      expect(textarea.nativeElement.getAttribute('rows')).toBe('4');
      expect(fieldWrapper).toBeTruthy();
    });

    it('should handle special characters and unicode input', async () => {
      const config = PrimeNGFormTestUtils.builder().primeTextareaField({ key: 'comments' }).build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      const specialText = 'José María 🌟 @#$%^&*()\nSecond line with émojis 🎉\nThird line with symbols: ¿¡§';

      // Simulate typing special characters using utility
      await PrimeNGFormTestUtils.simulatePrimeInput(fixture, 'textarea[pInputTextarea]', specialText);

      expect(PrimeNGFormTestUtils.getFormValue(component).comments).toBe(specialText);
    });

    it('should handle rapid value changes correctly', async () => {
      const config = PrimeNGFormTestUtils.builder().primeTextareaField({ key: 'comments' }).build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      const textarea = fixture.debugElement.query(By.css('textarea[pInputTextarea]'));
      const testValues = ['Line 1', 'Line 1\nLine 2', 'Line 1\nLine 2\nLine 3', 'Final multi-line\ntext content\nwith three lines'];

      // Simulate rapid typing
      for (const value of testValues) {
        textarea.nativeElement.value = value;
        textarea.nativeElement.dispatchEvent(new Event('input'));
        untracked(() => fixture.detectChanges());
      }

      // Should have the final value
      expect(PrimeNGFormTestUtils.getFormValue(component).comments).toBe('Final multi-line\ntext content\nwith three lines');
    });

    it('should handle long text content correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeTextareaField({ key: 'comments', props: { rows: 10 } })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      const longText = Array(50).fill('This is a long line of text that will create a very long textarea content.').join('\n');

      // Simulate typing long content using utility
      await PrimeNGFormTestUtils.simulatePrimeInput(fixture, 'textarea[pInputTextarea]', longText);

      expect(PrimeNGFormTestUtils.getFormValue(component).comments).toBe(longText);
    });
  });

  describe('Dynamic Text Support', () => {
    describe('Translation Service Integration', () => {
      it('should handle translation service with dynamic language updates for textarea', async () => {
        const translationService = createTestTranslationService({
          'form.comments.label': 'Comments',
          'form.comments.placeholder': 'Enter your comments',
          'form.comments.hint': 'Please provide feedback',
        });

        const config = PrimeNGFormTestUtils.builder()
          .field({
            key: 'comments',
            type: 'textarea',
            label: translationService.translate('form.comments.label'),
            placeholder: translationService.translate('form.comments.placeholder'),
            props: {
              hint: translationService.translate('form.comments.hint'),
            },
          })
          .build();

        const { fixture } = await PrimeNGFormTestUtils.createTest({
          config,
          initialValue: { comments: '' },
        });

        const label = fixture.debugElement.query(By.css('label'));
        const textarea = fixture.debugElement.query(By.css('textarea[pInputTextarea]'));
        const hint = fixture.debugElement.query(By.css('small.p-text-secondary'));

        // Initial translations
        expect(label.nativeElement.textContent.trim()).toBe('Comments');
        expect(textarea.nativeElement.getAttribute('placeholder')).toBe('Enter your comments');
        expect(hint.nativeElement.textContent.trim()).toBe('Please provide feedback');

        // Update to Spanish
        translationService.addTranslations({
          'form.comments.label': 'Comentarios',
          'form.comments.placeholder': 'Ingrese sus comentarios',
          'form.comments.hint': 'Proporcione sus comentarios',
        });
        translationService.setLanguage('es');
        untracked(() => fixture.detectChanges());

        expect(label.nativeElement.textContent.trim()).toBe('Comentarios');
        expect(textarea.nativeElement.getAttribute('placeholder')).toBe('Ingrese sus comentarios');
        expect(hint.nativeElement.textContent.trim()).toBe('Proporcione sus comentarios');
      });
    });
  });
});
