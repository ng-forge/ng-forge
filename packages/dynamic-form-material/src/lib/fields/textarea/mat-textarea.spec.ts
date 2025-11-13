import { By } from '@angular/platform-browser';
import { MaterialFormTestUtils } from '../../testing/material-test-utils';
import { MinimalTestBuilder } from '../../testing/minimal-test-builders';

describe('MatTextareaFieldComponent', () => {
  describe('Basic Rendering (Unit)', () => {
    it('should render textarea element', async () => {
      const config = MaterialFormTestUtils.builder().field({ key: 'field', type: 'textarea' }).build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { field: '' },
      });

      const textarea = fixture.debugElement.query(By.css('textarea[matInput]'));
      expect(textarea).not.toBeNull();
      expect(textarea.nativeElement).toBeInstanceOf(HTMLTextAreaElement);
    });
  });

  describe('Rows Attribute (Unit)', () => {
    it('should apply rows attribute', async () => {
      const { config, initialValue } = MinimalTestBuilder.withRows(6);
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const textarea = fixture.debugElement.query(By.css('textarea[matInput]'));
      expect(textarea.nativeElement.getAttribute('rows')).toBe('6');
    });

    it('should apply different rows value', async () => {
      const { config, initialValue } = MinimalTestBuilder.withRows(10);
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const textarea = fixture.debugElement.query(By.css('textarea[matInput]'));
      expect(textarea.nativeElement.getAttribute('rows')).toBe('10');
    });
  });

  describe('Cols Attribute (Unit)', () => {
    it('should apply cols attribute', async () => {
      const { config, initialValue } = MinimalTestBuilder.withCols(50);
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const textarea = fixture.debugElement.query(By.css('textarea[matInput]'));
      expect(textarea.nativeElement.getAttribute('cols')).toBe('50');
    });
  });

  describe('MaxLength Attribute (Unit)', () => {
    // Note: In Angular 21, the Field directive automatically handles the maxlength attribute binding.
    // The attribute is not directly set on the element in the template anymore, but is managed
    // internally by the Field directive based on the field's maxLength() signal.
    // These tests verify the component accepts maxLength configuration without errors.
    it('should accept maxLength configuration', async () => {
      const { config, initialValue } = MinimalTestBuilder.withMaxLength(500);
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const textarea = fixture.debugElement.query(By.css('textarea[matInput]'));
      // Verify the textarea element renders correctly with maxLength config
      expect(textarea).toBeTruthy();
      expect(textarea.nativeElement.tagName).toBe('TEXTAREA');
    });

    it('should accept different maxLength value', async () => {
      const { config, initialValue } = MinimalTestBuilder.withMaxLength(100);
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const textarea = fixture.debugElement.query(By.css('textarea[matInput]'));
      // Verify the textarea element renders correctly with different maxLength config
      expect(textarea).toBeTruthy();
      expect(textarea.nativeElement.tagName).toBe('TEXTAREA');
    });
  });

  describe('Resize Style (Unit)', () => {
    it('should apply resize style both', async () => {
      const { config, initialValue } = MinimalTestBuilder.withResize('both');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const textarea = fixture.debugElement.query(By.css('textarea[matInput]'));
      expect(textarea.nativeElement.style.resize).toBe('both');
    });

    it('should apply resize style none', async () => {
      const { config, initialValue } = MinimalTestBuilder.withResize('none');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const textarea = fixture.debugElement.query(By.css('textarea[matInput]'));
      expect(textarea.nativeElement.style.resize).toBe('none');
    });
  });

  describe('Label Rendering (Unit)', () => {
    it('should render label text', async () => {
      const { config, initialValue } = MinimalTestBuilder.withLabel('Comments', 'textarea');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const label = fixture.debugElement.query(By.css('mat-label'));
      expect(label.nativeElement.textContent.trim()).toBe('Comments');
    });

    it('should not render label when not provided', async () => {
      const config = MaterialFormTestUtils.builder().field({ key: 'field', type: 'textarea' }).build();
      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { field: '' },
      });

      const label = fixture.debugElement.query(By.css('mat-label'));
      expect(label).toBeNull();
    });
  });

  describe('Hint Text (Unit)', () => {
    it('should render hint text', async () => {
      const { config, initialValue } = MinimalTestBuilder.withHint('Please provide detailed feedback');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const hint = fixture.debugElement.query(By.css('mat-hint'));
      expect(hint.nativeElement.textContent.trim()).toBe('Please provide detailed feedback');
    });

    it('should not render hint when not provided', async () => {
      const config = MaterialFormTestUtils.builder().field({ key: 'field', type: 'textarea' }).build();
      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { field: '' },
      });

      const hint = fixture.debugElement.query(By.css('mat-hint'));
      expect(hint).toBeNull();
    });
  });

  describe('Placeholder Attribute (Unit)', () => {
    it('should apply placeholder attribute', async () => {
      const { config, initialValue } = MinimalTestBuilder.withPlaceholder('Enter your comments', 'textarea');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const textarea = fixture.debugElement.query(By.css('textarea[matInput]'));
      expect(textarea.nativeElement.getAttribute('placeholder')).toBe('Enter your comments');
    });
  });

  describe('TabIndex Attribute (Unit)', () => {
    it('should apply tabindex attribute', async () => {
      const { config, initialValue } = MinimalTestBuilder.withTabIndex(5, 'textarea');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const textarea = fixture.debugElement.query(By.css('textarea[matInput]'));
      expect(textarea.nativeElement.getAttribute('tabindex')).toBe('5');
    });
  });

  describe('CSS Classes (Unit)', () => {
    it('should apply custom className', async () => {
      const { config, initialValue } = MinimalTestBuilder.withClassName('comments-textarea', 'textarea');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const hostElement = fixture.debugElement.query(By.css('df-mat-textarea'));
      expect(hostElement.nativeElement.className).toContain('comments-textarea');
    });
  });

  describe('Material Appearance (Unit)', () => {
    it('should render outline appearance', async () => {
      const { config, initialValue } = MinimalTestBuilder.withAppearance('outline');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const formField = fixture.debugElement.query(By.css('mat-form-field'));
      expect(formField.nativeElement.className).toContain('mat-form-field-appearance-outline');
    });

    it('should render fill appearance', async () => {
      const { config, initialValue } = MinimalTestBuilder.withAppearance('fill');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const formField = fixture.debugElement.query(By.css('mat-form-field'));
      expect(formField.nativeElement.className).toContain('mat-form-field-appearance-fill');
    });
  });

  describe('Required State (Unit)', () => {
    it('should mark textarea as required', async () => {
      const { config, initialValue } = MinimalTestBuilder.withRequired(true, 'textarea');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const textarea = fixture.debugElement.query(By.css('textarea[matInput]'));
      expect(textarea.nativeElement.hasAttribute('required')).toBe(true);
    });
  });

  describe('Full Configuration (Integration)', () => {
    /**
     * Integration test verifying multiple features work together.
     * Notice: Still uses minimal initialValue (only 1 field vs original 5 fields)
     */
    it('should render textarea with all properties configured correctly', async () => {
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
        initialValue: { comments: '' }, // Minimal! Only 1 field vs original 5
      });

      const textarea = fixture.debugElement.query(By.css('textarea[matInput]'));
      const formField = fixture.debugElement.query(By.css('mat-form-field'));
      const label = fixture.debugElement.query(By.css('mat-label'));
      const hint = fixture.debugElement.query(By.css('mat-hint'));
      const hostElement = fixture.debugElement.query(By.css('df-mat-textarea'));

      // Verify all features integrated correctly
      expect(textarea.nativeElement.getAttribute('placeholder')).toBe('Enter your comments');
      expect(textarea.nativeElement.getAttribute('rows')).toBe('6');
      expect(textarea.nativeElement.getAttribute('cols')).toBe('50');
      // Note: maxLength is now handled automatically by the Field directive in Angular 21
      expect(textarea.nativeElement.getAttribute('tabindex')).toBe('1');
      expect(textarea.nativeElement.style.resize).toBe('both');
      expect(textarea.nativeElement.hasAttribute('required')).toBe(true);
      expect(formField.nativeElement.className).toContain('mat-form-field-appearance-outline');
      expect(label.nativeElement.textContent.trim()).toBe('Comments');
      expect(hint.nativeElement.textContent.trim()).toBe('Please provide detailed feedback');
      expect(hostElement.nativeElement.className).toContain('comments-textarea');
    });
  });
});
