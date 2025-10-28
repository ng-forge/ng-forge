import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterial } from '../../providers/material-providers';
import { delay, waitForDFInit } from '../../testing';

interface TestFormModel {
  comments: string;
  description: string;
  feedback: string;
  bio: string;
  notes: string;
}

describe('MatTextareaFieldComponent - Dynamic Form Integration', () => {
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

  describe('Basic Material Textarea Integration', () => {
    it('should render textarea with full configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'comments',
            type: 'textarea',
            label: 'Comments',
            props: {
              placeholder: 'Enter your comments',
              hint: 'Please provide detailed feedback',
              required: true,
              rows: 6,
              cols: 50,
              maxlength: 500,
              tabIndex: 1,
              className: 'comments-textarea',
              appearance: 'outline',
              resize: 'both',
            },
          },
        ],
      };

      createComponent(config, {
        comments: '',
        description: '',
        feedback: '',
        bio: '',
        notes: '',
      });

      await waitForDFInit(component, fixture);

      const textarea = debugElement.query(By.css('textarea[matInput]'));
      const formField = debugElement.query(By.css('mat-form-field'));
      const label = debugElement.query(By.css('mat-label'));
      const hint = debugElement.query(By.css('mat-hint'));

      expect(textarea).toBeTruthy();
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
      const config: FormConfig = {
        fields: [
          {
            key: 'comments',
            type: 'textarea',
            label: 'Comments',
            props: { rows: 4 },
          },
        ],
      };

      const { component } = createComponent(config, {
        comments: '',
        description: '',
        feedback: '',
        bio: '',
        notes: '',
      });

      await waitForDFInit(component, fixture);

      // Initial value check
      expect(component.formValue().comments).toBe('');

      // Simulate user typing
      const textarea = debugElement.query(By.css('textarea[matInput]'));
      textarea.nativeElement.value = 'This is a multi-line comment\nwith line breaks';
      textarea.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      // Verify form value updated
      expect(component.formValue().comments).toBe('This is a multi-line comment\nwith line breaks');
    });

    it('should reflect external value changes in textarea field', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'comments',
            type: 'textarea',
            label: 'Comments',
            props: { rows: 4 },
          },
        ],
      };

      const { component } = createComponent(config, {
        comments: '',
        description: '',
        feedback: '',
        bio: '',
        notes: '',
      });

      await waitForDFInit(component, fixture);

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        comments: 'Updated comments\nwith multiple lines',
        description: '',
        feedback: '',
        bio: '',
        notes: '',
      });
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(component.formValue().comments).toBe('Updated comments\nwith multiple lines');
    });
  });

  describe('Textarea Configuration Options', () => {
    it('should render textarea with different configurations', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'description',
            type: 'textarea',
            label: 'Description',
            props: { rows: 3, resize: 'none' },
          },
          {
            key: 'feedback',
            type: 'textarea',
            label: 'Feedback',
            props: { rows: 8, resize: 'vertical' },
          },
          {
            key: 'bio',
            type: 'textarea',
            label: 'Biography',
            props: { rows: 5, resize: 'horizontal' },
          },
        ],
      };

      const { component } = createComponent(config, {
        comments: '',
        description: '',
        feedback: '',
        bio: '',
        notes: '',
      });

      await waitForDFInit(component, fixture);

      const textareas = debugElement.queryAll(By.css('textarea[matInput]'));

      expect(textareas.length).toBe(3);
      expect(textareas[0].nativeElement.getAttribute('rows')).toBe('3');
      expect(textareas[0].nativeElement.style.resize).toBe('none');
      expect(textareas[1].nativeElement.getAttribute('rows')).toBe('8');
      expect(textareas[1].nativeElement.style.resize).toBe('vertical');
      expect(textareas[2].nativeElement.getAttribute('rows')).toBe('5');
      expect(textareas[2].nativeElement.style.resize).toBe('horizontal');
    });

    it('should apply default rows when not specified', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'comments',
            type: 'textarea',
            label: 'Comments',
          },
        ],
      };

      createComponent(config, { comments: '' });

      await waitForDFInit(component, fixture);

      const textarea = debugElement.query(By.css('textarea[matInput]'));
      expect(textarea.nativeElement.getAttribute('rows')).toBe('4'); // Default rows
    });

    it('should handle maxlength attribute correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'comments',
            type: 'textarea',
            label: 'Limited Comments',
            props: { maxlength: 100 },
          },
        ],
      };

      createComponent(config, { comments: '' });

      await waitForDFInit(component, fixture);

      const textarea = debugElement.query(By.css('textarea[matInput]'));
      expect(textarea.nativeElement.getAttribute('maxlength')).toBe('100');
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default Material configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'comments',
            type: 'textarea',
            label: 'Comments',
          },
        ],
      };

      createComponent(config, { comments: '' });

      await delay();
      fixture.detectChanges();

      const textarea = debugElement.query(By.css('textarea[matInput]'));
      const formField = debugElement.query(By.css('mat-form-field'));

      expect(textarea.nativeElement.getAttribute('rows')).toBe('4');
      expect(textarea.nativeElement.style.resize).toBe('vertical');
      expect(formField.nativeElement.className).toContain('mat-form-field-appearance-fill');
    });

    it('should not display hint when not provided', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'comments',
            type: 'textarea',
            label: 'Comments',
          },
        ],
      };

      createComponent(config, { comments: '' });

      await delay();
      fixture.detectChanges();

      const hint = debugElement.query(By.css('mat-hint'));
      expect(hint).toBeNull();
    });
  });

  describe('Field State and Configuration Tests', () => {
    it('should handle disabled state correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'comments',
            type: 'textarea',
            label: 'Disabled Textarea',
            disabled: true,
          },
        ],
      };

      createComponent(config, { comments: '' });

      await delay();
      fixture.detectChanges();
      await delay();
      fixture.detectChanges();

      const textarea = debugElement.query(By.css('textarea'));
      expect(textarea.nativeElement.disabled).toBe(true);
    });

    it('should apply different Material appearance styles', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'description',
            type: 'textarea',
            label: 'Fill Textarea',
            props: {
              appearance: 'fill',
            },
          },
          {
            key: 'feedback',
            type: 'textarea',
            label: 'Outline Textarea',
            props: {
              appearance: 'outline',
            },
          },
        ],
      };

      createComponent(config, { description: '', feedback: '' });

      await delay();
      fixture.detectChanges();

      const formFields = debugElement.queryAll(By.css('mat-form-field'));
      expect(formFields[0].nativeElement.className).toContain('mat-form-field-appearance-fill');
      expect(formFields[1].nativeElement.className).toContain('mat-form-field-appearance-outline');
    });

    it('should handle multiple textareas with independent value changes', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'description',
            type: 'textarea',
            label: 'Description',
          },
          {
            key: 'feedback',
            type: 'textarea',
            label: 'Feedback',
          },
        ],
      };

      const { component } = createComponent(config, {
        description: 'Initial description',
        feedback: 'Initial feedback',
      });

      await delay();
      fixture.detectChanges();

      // Initial values
      expect(component.formValue().description).toBe('Initial description');
      expect(component.formValue().feedback).toBe('Initial feedback');

      const textareas = debugElement.queryAll(By.css('textarea[matInput]'));

      // Change first textarea
      textareas[0].nativeElement.value = 'Updated description\nwith new lines';
      textareas[0].nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      let formValue = component.formValue();
      expect(formValue.description).toBe('Updated description\nwith new lines');
      expect(formValue.feedback).toBe('Initial feedback');

      // Change second textarea
      textareas[1].nativeElement.value = 'Updated feedback\nwith multiple lines\nof text';
      textareas[1].nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      formValue = component.formValue();
      expect(formValue.description).toBe('Updated description\nwith new lines');
      expect(formValue.feedback).toBe('Updated feedback\nwith multiple lines\nof text');
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined form values gracefully', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'comments',
            type: 'textarea',
            label: 'Comments',
          },
        ],
      };

      createComponent(config); // No initial value provided

      await delay();
      fixture.detectChanges();

      const textarea = debugElement.query(By.css('textarea[matInput]'));
      expect(textarea).toBeTruthy();
    });

    it('should handle null form values gracefully', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'comments',
            type: 'textarea',
            label: 'Comments',
          },
        ],
      };

      createComponent(config, null as unknown as TestFormModel);

      await delay();
      fixture.detectChanges();

      const textarea = debugElement.query(By.css('textarea[matInput]'));
      expect(textarea).toBeTruthy();
    });

    it('should handle empty string values correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'comments',
            type: 'textarea',
            label: 'Comments',
          },
        ],
      };

      const { component } = createComponent(config, { comments: '' });

      await delay();
      fixture.detectChanges();

      expect(component.formValue().comments).toBe('');
    });

    it('should apply default Material Design configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'comments',
            type: 'textarea',
            label: 'Test Textarea',
          },
        ],
      };

      createComponent(config, { comments: '' });

      await delay();
      fixture.detectChanges();

      const textarea = debugElement.query(By.css('textarea[matInput]'));
      const formField = debugElement.query(By.css('mat-form-field'));

      // Verify default Material configuration is applied
      expect(textarea.nativeElement.getAttribute('rows')).toBe('4');
      expect(formField.nativeElement.className).toContain('mat-form-field-appearance-fill');
    });

    it('should handle special characters and unicode input', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'comments',
            type: 'textarea',
            label: 'Comments with Special Characters',
          },
        ],
      };

      const { component } = createComponent(config, { comments: '' });

      await delay();
      fixture.detectChanges();

      const textarea = debugElement.query(By.css('textarea[matInput]'));
      const specialText = 'José María 🌟 @#$%^&*()\nSecond line with émojis 🎉\nThird line with symbols: ¿¡§';

      // Simulate typing special characters
      textarea.nativeElement.value = specialText;
      textarea.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(component.formValue().comments).toBe(specialText);
    });

    it('should handle rapid value changes correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'comments',
            type: 'textarea',
            label: 'Comments',
          },
        ],
      };

      const { component } = createComponent(config, { comments: '' });

      await delay();
      fixture.detectChanges();

      const textarea = debugElement.query(By.css('textarea[matInput]'));
      const testValues = ['Line 1', 'Line 1\nLine 2', 'Line 1\nLine 2\nLine 3', 'Final multi-line\ntext content\nwith three lines'];

      // Simulate rapid typing
      for (const value of testValues) {
        textarea.nativeElement.value = value;
        textarea.nativeElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();
      }

      await delay();
      fixture.detectChanges();

      // Should have the final value
      expect(component.formValue().comments).toBe('Final multi-line\ntext content\nwith three lines');
    });

    it('should handle long text content correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'comments',
            type: 'textarea',
            label: 'Long Comments',
            props: { rows: 10 },
          },
        ],
      };

      const { component } = createComponent(config, { comments: '' });

      await delay();
      fixture.detectChanges();

      const textarea = debugElement.query(By.css('textarea[matInput]'));
      const longText = Array(50).fill('This is a long line of text that will create a very long textarea content.').join('\n');

      // Simulate typing long content
      textarea.nativeElement.value = longText;
      textarea.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(component.formValue().comments).toBe(longText);
    });
  });
});
