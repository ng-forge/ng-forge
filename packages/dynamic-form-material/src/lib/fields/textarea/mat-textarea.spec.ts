import { By } from '@angular/platform-browser';
import { createTestTranslationService } from '../../testing/fake-translation.service';
import { MaterialFormTestUtils } from '../../testing/material-test-utils';

describe('MatTextareaFieldComponent', () => {
  describe('Basic Material Textarea Integration', () => {
    it('should render textarea with full configuration', async () => {
      const config = MaterialFormTestUtils.builder()
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
            cols: 50,
            maxLength: 500,
            appearance: 'outline',
            resize: 'both',
          },
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          comments: '',
          description: '',
          feedback: '',
          bio: '',
          notes: '',
        },
      });

      const textarea = fixture.debugElement.query(By.css('textarea[matInput]'));
      const formField = fixture.debugElement.query(By.css('mat-form-field'));
      const label = fixture.debugElement.query(By.css('mat-label'));
      const hint = fixture.debugElement.query(By.css('mat-hint'));

      // ITERATION 4 FIX: Verify textarea element is correct type
      // Previous: expect(textarea).toBeTruthy()
      expect(textarea).not.toBeNull();
      expect(textarea.nativeElement).toBeInstanceOf(HTMLTextAreaElement);
      expect(textarea.nativeElement.getAttribute('placeholder')).toBe('Enter your comments');
      expect(textarea.nativeElement.getAttribute('rows')).toBe('6');
      expect(textarea.nativeElement.getAttribute('cols')).toBe('50');
      expect(textarea.nativeElement.getAttribute('maxlength')).toBe('500');
      expect(textarea.nativeElement.getAttribute('tabindex')).toBe('1');
      expect(textarea.nativeElement.style.resize).toBe('both');
      expect(formField.nativeElement.className).toContain('comments-textarea');
      expect(formField.nativeElement.className).toContain('mat-form-field-appearance-outline');
      expect(label.nativeElement.textContent.trim()).toBe('Comments');
      expect(hint.nativeElement.textContent.trim()).toBe('Please provide detailed feedback');
    });

    it('should handle user input and update form value', async () => {
      const config = MaterialFormTestUtils.builder()
        .matTextareaField({ key: 'comments', props: { rows: 4 } })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
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
      expect(MaterialFormTestUtils.getFormValue(component).comments).toBe('');

      // Simulate user typing using utility
      await MaterialFormTestUtils.simulateMatInput(fixture, 'textarea[matInput]', 'This is a multi-line comment\nwith line breaks');

      // Verify form value updated
      expect(MaterialFormTestUtils.getFormValue(component).comments).toBe('This is a multi-line comment\nwith line breaks');
    });

    it('should reflect external value changes in textarea field', async () => {
      const config = MaterialFormTestUtils.builder()
        .matTextareaField({ key: 'comments', props: { rows: 4 } })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
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

      expect(MaterialFormTestUtils.getFormValue(component).comments).toBe('Updated comments\nwith multiple lines');
    });
  });

  describe('Textarea Configuration Options', () => {
    it('should apply default rows when not specified', async () => {
      const config = MaterialFormTestUtils.builder().matTextareaField({ key: 'comments' }).build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      const textarea = fixture.debugElement.query(By.css('textarea[matInput]'));
      expect(textarea.nativeElement.getAttribute('rows')).toBe('4'); // Default rows
    });

    it('should handle maxlength attribute correctly', async () => {
      const config = MaterialFormTestUtils.builder()
        .matTextareaField({ key: 'comments', props: { maxLength: 100 } })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      const textarea = fixture.debugElement.query(By.css('textarea[matInput]'));
      expect(textarea.nativeElement.getAttribute('maxlength')).toBe('100');
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default Material configuration', async () => {
      const config = MaterialFormTestUtils.builder().matTextareaField({ key: 'comments' }).build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      const textarea = fixture.debugElement.query(By.css('textarea[matInput]'));
      const formField = fixture.debugElement.query(By.css('mat-form-field'));

      expect(textarea.nativeElement.getAttribute('rows')).toBe('4');
      expect(textarea.nativeElement.style.resize).toBe('vertical');
      expect(formField.nativeElement.className).toContain('mat-form-field-appearance-fill');
    });

    it('should not display hint when not provided', async () => {
      const config = MaterialFormTestUtils.builder().matTextareaField({ key: 'comments' }).build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      const hint = fixture.debugElement.query(By.css('mat-hint'));
      expect(hint).toBeNull();
    });
  });

  describe('Field State and Configuration Tests', () => {
    it('should handle disabled state correctly', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'comments',
          type: 'textarea',
          label: 'Disabled Textarea',
          disabled: true,
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      const textarea = fixture.debugElement.query(By.css('textarea'));
      expect(textarea.nativeElement.disabled).toBe(true);
    });

    it('should apply different Material appearance styles', async () => {
      const config = MaterialFormTestUtils.builder()
        .matTextareaField({ key: 'description', props: { appearance: 'fill' } })
        .matTextareaField({ key: 'feedback', props: { appearance: 'outline' } })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { description: '', feedback: '' },
      });

      const formFields = fixture.debugElement.queryAll(By.css('mat-form-field'));
      expect(formFields[0].nativeElement.className).toContain('mat-form-field-appearance-fill');
      expect(formFields[1].nativeElement.className).toContain('mat-form-field-appearance-outline');
    });

    it('should handle multiple textareas with independent value changes', async () => {
      const config = MaterialFormTestUtils.builder().matTextareaField({ key: 'description' }).matTextareaField({ key: 'feedback' }).build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          description: 'Initial description',
          feedback: 'Initial feedback',
        },
      });

      // Initial values
      expect(MaterialFormTestUtils.getFormValue(component).description).toBe('Initial description');
      expect(MaterialFormTestUtils.getFormValue(component).feedback).toBe('Initial feedback');

      const textareas = fixture.debugElement.queryAll(By.css('textarea[matInput]'));

      // Change first textarea
      textareas[0].nativeElement.value = 'Updated description\nwith new lines';
      textareas[0].nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      let formValue = MaterialFormTestUtils.getFormValue(component);
      expect(formValue.description).toBe('Updated description\nwith new lines');
      expect(formValue.feedback).toBe('Initial feedback');

      // Change second textarea
      textareas[1].nativeElement.value = 'Updated feedback\nwith multiple lines\nof text';
      textareas[1].nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      formValue = MaterialFormTestUtils.getFormValue(component);
      expect(formValue.description).toBe('Updated description\nwith new lines');
      expect(formValue.feedback).toBe('Updated feedback\nwith multiple lines\nof text');
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined form values gracefully', async () => {
      const config = MaterialFormTestUtils.builder().matTextareaField({ key: 'comments' }).build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config }); // No initial value provided

      const textarea = fixture.debugElement.query(By.css('textarea[matInput]'));
      // ITERATION 5 FIX: Verify textarea element exists with undefined value
      // Previous: expect(textarea).toBeTruthy()
      expect(textarea).not.toBeNull();
      expect(textarea.nativeElement).toBeInstanceOf(HTMLTextAreaElement);
    });

    it('should handle null form values gracefully', async () => {
      const config = MaterialFormTestUtils.builder().matTextareaField({ key: 'comments' }).build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: null as any,
      });

      const textarea = fixture.debugElement.query(By.css('textarea[matInput]'));
      // ITERATION 5 FIX: Verify textarea element exists with null value
      // Previous: expect(textarea).toBeTruthy()
      expect(textarea).not.toBeNull();
      expect(textarea.nativeElement).toBeInstanceOf(HTMLTextAreaElement);
    });

    it('should handle empty string values correctly', async () => {
      const config = MaterialFormTestUtils.builder().matTextareaField({ key: 'comments' }).build();

      const { component } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      expect(MaterialFormTestUtils.getFormValue(component).comments).toBe('');
    });

    it('should apply default Material Design configuration', async () => {
      const config = MaterialFormTestUtils.builder().matTextareaField({ key: 'comments' }).build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      const textarea = fixture.debugElement.query(By.css('textarea[matInput]'));
      const formField = fixture.debugElement.query(By.css('mat-form-field'));

      // Verify default Material configuration is applied
      expect(textarea.nativeElement.getAttribute('rows')).toBe('4');
      expect(formField.nativeElement.className).toContain('mat-form-field-appearance-fill');
    });

    it('should handle special characters and unicode input', async () => {
      const config = MaterialFormTestUtils.builder().matTextareaField({ key: 'comments' }).build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      const specialText = 'José María 🌟 @#$%^&*()\nSecond line with émojis 🎉\nThird line with symbols: ¿¡§';

      // Simulate typing special characters using utility
      await MaterialFormTestUtils.simulateMatInput(fixture, 'textarea[matInput]', specialText);

      expect(MaterialFormTestUtils.getFormValue(component).comments).toBe(specialText);
    });

    it('should handle rapid value changes correctly', async () => {
      const config = MaterialFormTestUtils.builder().matTextareaField({ key: 'comments' }).build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      const textarea = fixture.debugElement.query(By.css('textarea[matInput]'));
      const testValues = ['Line 1', 'Line 1\nLine 2', 'Line 1\nLine 2\nLine 3', 'Final multi-line\ntext content\nwith three lines'];

      // Simulate rapid typing
      for (const value of testValues) {
        textarea.nativeElement.value = value;
        textarea.nativeElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();
      }

      // Should have the final value
      expect(MaterialFormTestUtils.getFormValue(component).comments).toBe('Final multi-line\ntext content\nwith three lines');
    });

    it('should handle long text content correctly', async () => {
      const config = MaterialFormTestUtils.builder()
        .matTextareaField({ key: 'comments', props: { rows: 10 } })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      const longText = Array(50).fill('This is a long line of text that will create a very long textarea content.').join('\n');

      // Simulate typing long content using utility
      await MaterialFormTestUtils.simulateMatInput(fixture, 'textarea[matInput]', longText);

      expect(MaterialFormTestUtils.getFormValue(component).comments).toBe(longText);
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

        const config = MaterialFormTestUtils.builder()
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

        const { fixture } = await MaterialFormTestUtils.createTest({
          config,
          initialValue: { comments: '' },
        });

        const label = fixture.debugElement.query(By.css('mat-label'));
        const textarea = fixture.debugElement.query(By.css('textarea[matInput]'));
        const hint = fixture.debugElement.query(By.css('mat-hint'));

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
        fixture.detectChanges();

        expect(label.nativeElement.textContent.trim()).toBe('Comentarios');
        expect(textarea.nativeElement.getAttribute('placeholder')).toBe('Ingrese sus comentarios');
        expect(hint.nativeElement.textContent.trim()).toBe('Proporcione sus comentarios');
      });
    });
  });
});
