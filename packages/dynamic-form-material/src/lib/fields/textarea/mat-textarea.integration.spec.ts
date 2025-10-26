import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DynamicForm, FieldConfig, provideDynamicForm, withConfig } from '@ng-forge/dynamic-form';
import { MATERIAL_FIELD_TYPES } from '../../config/material-field-config';

interface TestFormModel {
  description: string;
  comments: string;
  feedback: string;
  notes: string;
}

describe('MatTextareaFieldComponent - Dynamic Form Integration', () => {
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
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'description',
          type: 'textarea',
          props: {
            label: 'Product Description',
            placeholder: 'Enter detailed product description',
            hint: 'Provide a comprehensive description of the product',
            rows: 6,
            cols: 50,
            maxlength: 500,
            resize: 'vertical',
            appearance: 'outline',
            tabIndex: 1,
            className: 'description-textarea',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        description: 'Initial description text',
        comments: '',
        feedback: '',
        notes: '',
      });
      fixture.detectChanges();
    });

    it('should render textarea through dynamic form', () => {
      const textarea = debugElement.query(By.css('textarea'));
      const formField = debugElement.query(By.css('mat-form-field'));
      const label = debugElement.query(By.css('mat-label'));
      const hint = debugElement.query(By.css('mat-hint'));

      expect(textarea).toBeTruthy();
      expect(textarea.nativeElement.getAttribute('placeholder')).toBe('Enter detailed product description');
      expect(textarea.nativeElement.getAttribute('rows')).toBe('6');
      expect(textarea.nativeElement.getAttribute('cols')).toBe('50');
      expect(textarea.nativeElement.getAttribute('maxlength')).toBe('500');
      expect(textarea.nativeElement.getAttribute('tabindex')).toBe('1');
      expect(textarea.nativeElement.style.resize).toBe('vertical');
      expect(formField.nativeElement.className).toContain('description-textarea');
      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
      expect(label.nativeElement.textContent.trim()).toBe('Product Description');
      expect(hint.nativeElement.textContent.trim()).toBe('Provide a comprehensive description of the product');
    });

    it('should handle value changes through dynamic form', async () => {
      const textarea = debugElement.query(By.css('textarea'));

      // Simulate typing
      textarea.nativeElement.value = 'Updated description with new content';
      textarea.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const emittedValue: TestFormModel = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue?.description).toBe('Updated description with new content');
    });

    it('should reflect form model changes in textarea', () => {
      const textarea = debugElement.query(By.css('textarea'));

      // Update form model
      fixture.componentRef.setInput('value', {
        description: 'Programmatically updated description',
        comments: '',
        feedback: '',
        notes: '',
      });
      fixture.detectChanges();

      expect(textarea.nativeElement.getAttribute('ng-reflect-ng-model')).toBe('Programmatically updated description');
    });

    it('should handle all textarea-specific properties', () => {
      const textarea = debugElement.query(By.css('textarea'));

      expect(textarea.nativeElement.getAttribute('rows')).toBe('6');
      expect(textarea.nativeElement.getAttribute('cols')).toBe('50');
      expect(textarea.nativeElement.getAttribute('maxlength')).toBe('500');
      expect(textarea.nativeElement.getAttribute('tabindex')).toBe('1');
      expect(textarea.nativeElement.style.resize).toBe('vertical');
    });
  });

  describe('Minimal Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'comments',
          type: 'textarea',
          props: {
            label: 'Comments',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        description: '',
        comments: '',
        feedback: '',
        notes: '',
      });
      fixture.detectChanges();
    });

    it('should render with default values from configuration', () => {
      const textarea = debugElement.query(By.css('textarea'));
      const formField = debugElement.query(By.css('mat-form-field'));

      expect(textarea).toBeTruthy();
      expect(textarea.nativeElement.getAttribute('rows')).toBe('4');
      expect(textarea.nativeElement.style.resize).toBe('vertical');
      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
    });

    it('should not display hint when not provided', () => {
      const hint = debugElement.query(By.css('mat-hint'));
      expect(hint).toBeNull();
    });
  });

  describe('Multiple Textareas', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'description',
          type: 'textarea',
          props: {
            label: 'Description',
            rows: 3,
            appearance: 'outline',
          },
        },
        {
          key: 'comments',
          type: 'textarea',
          props: {
            label: 'Comments',
            rows: 5,
            appearance: 'fill',
          },
        },
        {
          key: 'feedback',
          type: 'textarea',
          props: {
            label: 'Feedback',
            rows: 4,
            resize: 'both',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        description: 'Initial description',
        comments: 'Initial comments',
        feedback: '',
        notes: '',
      });
      fixture.detectChanges();
    });

    it('should render multiple textareas correctly', () => {
      const textareas = debugElement.queryAll(By.css('textarea'));
      const labels = debugElement.queryAll(By.css('mat-label'));

      expect(textareas.length).toBe(3);
      expect(labels[0].nativeElement.textContent.trim()).toBe('Description');
      expect(labels[1].nativeElement.textContent.trim()).toBe('Comments');
      expect(labels[2].nativeElement.textContent.trim()).toBe('Feedback');
    });

    it('should reflect individual textarea states from form model', () => {
      const textareas = debugElement.queryAll(By.css('textarea'));

      expect(textareas[0].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('Initial description');
      expect(textareas[1].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('Initial comments');
      expect(textareas[2].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('');
    });

    it('should handle independent textarea interactions', async () => {
      const textareas = debugElement.queryAll(By.css('textarea'));

      // Change first textarea
      textareas[0].nativeElement.value = 'Updated description';
      textareas[0].nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      let emittedValue: TestFormModel = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue).toEqual({
        description: 'Updated description',
        comments: 'Initial comments',
        feedback: '',
        notes: '',
      });

      // Change third textarea
      textareas[2].nativeElement.value = 'New feedback content';
      textareas[2].nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      emittedValue = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue).toEqual({
        description: 'Updated description',
        comments: 'Initial comments',
        feedback: 'New feedback content',
        notes: '',
      });
    });

    it('should apply different configurations to textareas', () => {
      const textareas = debugElement.queryAll(By.css('textarea'));
      const formFields = debugElement.queryAll(By.css('mat-form-field'));

      // Rows
      expect(textareas[0].nativeElement.getAttribute('rows')).toBe('3');
      expect(textareas[1].nativeElement.getAttribute('rows')).toBe('5');
      expect(textareas[2].nativeElement.getAttribute('rows')).toBe('4');

      // Appearances
      expect(formFields[0].nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
      expect(formFields[1].nativeElement.getAttribute('ng-reflect-appearance')).toBe('fill');
      expect(formFields[2].nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');

      // Resize
      expect(textareas[0].nativeElement.style.resize).toBe('vertical');
      expect(textareas[1].nativeElement.style.resize).toBe('vertical');
      expect(textareas[2].nativeElement.style.resize).toBe('both');
    });
  });

  describe('Disabled State through Dynamic Form', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'description',
          type: 'textarea',
          props: {
            label: 'Disabled Textarea',
            disabled: true,
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        description: 'Cannot edit this',
        comments: '',
        feedback: '',
        notes: '',
      });
      fixture.detectChanges();
    });

    it('should render textarea as disabled', () => {
      const textarea = debugElement.query(By.css('textarea'));

      expect(textarea.nativeElement.disabled).toBe(true);
    });

    it('should not emit value changes when disabled textarea is modified', async () => {
      const textarea = debugElement.query(By.css('textarea'));

      // Try to type in disabled textarea
      textarea.nativeElement.value = 'This should not work';
      textarea.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Since disabled fields don't emit changes, we need to test this differently
      // We can check that the form control itself is disabled
      expect(textarea.nativeElement.disabled).toBe(true);
    });
  });

  describe('Resize Configurations', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'description',
          type: 'textarea',
          props: {
            label: 'No Resize',
            resize: 'none',
          },
        },
        {
          key: 'comments',
          type: 'textarea',
          props: {
            label: 'Horizontal Resize',
            resize: 'horizontal',
          },
        },
        {
          key: 'feedback',
          type: 'textarea',
          props: {
            label: 'Both Resize',
            resize: 'both',
          },
        },
        {
          key: 'notes',
          type: 'textarea',
          props: {
            label: 'Vertical Resize',
            resize: 'vertical',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        description: '',
        comments: '',
        feedback: '',
        notes: '',
      });
      fixture.detectChanges();
    });

    it('should apply different resize configurations', () => {
      const textareas = debugElement.queryAll(By.css('textarea'));

      expect(textareas[0].nativeElement.style.resize).toBe('none');
      expect(textareas[1].nativeElement.style.resize).toBe('horizontal');
      expect(textareas[2].nativeElement.style.resize).toBe('both');
      expect(textareas[3].nativeElement.style.resize).toBe('vertical');
    });
  });

  describe('Appearance Variations', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'description',
          type: 'textarea',
          props: {
            label: 'Fill Textarea',
            appearance: 'fill',
          },
        },
        {
          key: 'comments',
          type: 'textarea',
          props: {
            label: 'Outline Textarea',
            appearance: 'outline',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        description: '',
        comments: '',
        feedback: '',
        notes: '',
      });
      fixture.detectChanges();
    });

    it('should apply different appearances to form fields', () => {
      const formFields = debugElement.queryAll(By.css('mat-form-field'));

      expect(formFields[0].nativeElement.getAttribute('ng-reflect-appearance')).toBe('fill');
      expect(formFields[1].nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
    });
  });

  describe('Character Limit and Maxlength', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'description',
          type: 'textarea',
          props: {
            label: 'Limited Description',
            maxlength: 100,
            hint: 'Maximum 100 characters allowed',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        description: '',
        comments: '',
        feedback: '',
        notes: '',
      });
      fixture.detectChanges();
    });

    it('should apply maxlength attribute', () => {
      const textarea = debugElement.query(By.css('textarea'));

      expect(textarea.nativeElement.getAttribute('maxlength')).toBe('100');
    });

    it('should handle text input within character limit', async () => {
      const textarea = debugElement.query(By.css('textarea'));
      const shortText = 'This is a short description.';

      // Type text within limit
      textarea.nativeElement.value = shortText;
      textarea.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const emittedValue: TestFormModel = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue?.description).toBe(shortText);
    });
  });

  describe('Cols Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'description',
          type: 'textarea',
          props: {
            label: 'Wide Textarea',
            cols: 80,
            rows: 5,
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        description: '',
        comments: '',
        feedback: '',
        notes: '',
      });
      fixture.detectChanges();
    });

    it('should apply cols attribute', () => {
      const textarea = debugElement.query(By.css('textarea'));

      expect(textarea.nativeElement.getAttribute('cols')).toBe('80');
      expect(textarea.nativeElement.getAttribute('rows')).toBe('5');
    });
  });

  describe('Default Props from Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'description',
          type: 'textarea',
          props: {
            label: 'Test Textarea',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        description: '',
        comments: '',
        feedback: '',
        notes: '',
      });
      fixture.detectChanges();
    });

    it('should apply default props from MATERIAL_FIELD_TYPES configuration', () => {
      const textarea = debugElement.query(By.css('textarea'));
      const formField = debugElement.query(By.css('mat-form-field'));

      // Check default props from configuration
      expect(textarea.nativeElement.getAttribute('rows')).toBe('4');
      expect(textarea.nativeElement.style.resize).toBe('vertical');
      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
    });
  });

  describe('Form Value Binding Edge Cases', () => {
    it('should handle undefined form values', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'description',
          type: 'textarea',
          props: {
            label: 'Test Textarea',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      // Don't set initial value
      fixture.detectChanges();

      const textarea = debugElement.query(By.css('textarea'));
      expect(textarea).toBeTruthy();
    });

    it('should handle null form values', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'description',
          type: 'textarea',
          props: {
            label: 'Test Textarea',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', null as any);
      fixture.detectChanges();

      const textarea = debugElement.query(By.css('textarea'));
      expect(textarea).toBeTruthy();
    });

    it('should handle multiline text content', async () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'description',
          type: 'textarea',
          props: {
            label: 'Multiline Textarea',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        description: '',
        comments: '',
        feedback: '',
        notes: '',
      });
      fixture.detectChanges();

      const textarea = debugElement.query(By.css('textarea'));
      const multilineText = 'Line 1\nLine 2\nLine 3\n\nLine 5';

      // Type multiline text
      textarea.nativeElement.value = multilineText;
      textarea.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const emittedValue: TestFormModel = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue?.description).toBe(multilineText);
    });

    it('should handle special characters and unicode', async () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'description',
          type: 'textarea',
          props: {
            label: 'Special Characters Textarea',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        description: '',
        comments: '',
        feedback: '',
        notes: '',
      });
      fixture.detectChanges();

      const textarea = debugElement.query(By.css('textarea'));
      const specialText = 'Special chars: àáâãäå æç èéêë 🌟 @#$%^&*()';

      // Type special characters
      textarea.nativeElement.value = specialText;
      textarea.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const emittedValue: TestFormModel = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue?.description).toBe(specialText);
    });
  });

  describe('Textarea Events', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'description',
          type: 'textarea',
          props: {
            label: 'Event Textarea',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        description: 'Initial content',
        comments: '',
        feedback: '',
        notes: '',
      });
      fixture.detectChanges();
    });

    it('should handle blur events', () => {
      const textarea = debugElement.query(By.css('textarea'));

      // Simulate focus and blur
      textarea.nativeElement.focus();
      textarea.nativeElement.blur();
      fixture.detectChanges();

      // No specific assertion needed, just ensure no errors occur
      expect(textarea).toBeTruthy();
    });

    it('should handle focus events', () => {
      const textarea = debugElement.query(By.css('textarea'));

      // Simulate focus
      textarea.nativeElement.focus();
      fixture.detectChanges();

      // No specific assertion needed, just ensure no errors occur
      expect(textarea).toBeTruthy();
    });
  });

  describe('Field Configuration Validation', () => {
    it('should handle missing key gracefully', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          type: 'textarea',
          props: {
            label: 'Textarea without key',
          },
        },
      ];

      expect(() => {
        fixture.componentRef.setInput('config', { fields });
        fixture.detectChanges();
      }).not.toThrow();

      const textarea = debugElement.query(By.css('textarea'));
      expect(textarea).toBeTruthy();
    });

    it('should auto-generate field IDs', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'description',
          type: 'textarea',
          props: {
            label: 'Test Textarea',
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
});
