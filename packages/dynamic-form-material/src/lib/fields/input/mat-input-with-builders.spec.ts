import { By } from '@angular/platform-browser';
import { MaterialFormTestUtils } from '../../testing/material-test-utils';
import { MinimalTestBuilder } from '../../testing/minimal-test-builders';

describe('MatInputFieldComponent (With Builders)', () => {
  describe('Input Type Attribute (Unit)', () => {
    it('should render email input type', async () => {
      const { config, initialValue } = MinimalTestBuilder.withInputType('email');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const input = fixture.debugElement.query(By.css('input[matInput]'));
      expect(input.nativeElement.getAttribute('type')).toBe('email');
    });

    it('should render password input type', async () => {
      const { config, initialValue } = MinimalTestBuilder.withInputType('password');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const input = fixture.debugElement.query(By.css('input[matInput]'));
      expect(input.nativeElement.getAttribute('type')).toBe('password');
    });

    it('should render number input type', async () => {
      const { config, initialValue } = MinimalTestBuilder.withInputType('number');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const input = fixture.debugElement.query(By.css('input[matInput]'));
      expect(input.nativeElement.getAttribute('type')).toBe('number');
    });
  });

  describe('Label Rendering (Unit)', () => {
    it('should render label text', async () => {
      const { config, initialValue } = MinimalTestBuilder.withLabel('Email Address');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const label = fixture.debugElement.query(By.css('mat-label'));
      expect(label.nativeElement.textContent.trim()).toBe('Email Address');
    });

    it('should not render label when not provided', async () => {
      const { config, initialValue } = MinimalTestBuilder.minimal();
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const label = fixture.debugElement.query(By.css('mat-label'));
      expect(label).toBeNull();
    });
  });

  describe('Hint/Help Text (Unit)', () => {
    it('should render hint text', async () => {
      const { config, initialValue } = MinimalTestBuilder.withHint('We will never share your email');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const hint = fixture.debugElement.query(By.css('mat-hint'));
      expect(hint.nativeElement.textContent.trim()).toBe('We will never share your email');
    });

    it('should not render hint when not provided', async () => {
      const { config, initialValue } = MinimalTestBuilder.minimal();
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const hint = fixture.debugElement.query(By.css('mat-hint'));
      expect(hint).toBeNull();
    });
  });

  describe('TabIndex Attribute (Unit)', () => {
    it('should apply tabindex attribute', async () => {
      const { config, initialValue } = MinimalTestBuilder.withTabIndex(5);
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const input = fixture.debugElement.query(By.css('input[matInput]'));
      expect(input.nativeElement.getAttribute('tabindex')).toBe('5');
    });

    it('should support different tabindex values', async () => {
      const { config, initialValue } = MinimalTestBuilder.withTabIndex(10);
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const input = fixture.debugElement.query(By.css('input[matInput]'));
      expect(input.nativeElement.getAttribute('tabindex')).toBe('10');
    });
  });

  describe('CSS Classes (Unit)', () => {
    it('should apply custom className', async () => {
      const { config, initialValue } = MinimalTestBuilder.withClassName('email-input');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const hostElement = fixture.debugElement.query(By.css('df-mat-input'));
      expect(hostElement.nativeElement.className).toContain('email-input');
    });

    it('should apply custom className with multiple classes', async () => {
      const { config, initialValue } = MinimalTestBuilder.withClassName('email-input custom-field');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const hostElement = fixture.debugElement.query(By.css('df-mat-input'));
      expect(hostElement.nativeElement.className).toContain('email-input');
      expect(hostElement.nativeElement.className).toContain('custom-field');
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
    it('should mark input as required', async () => {
      const { config, initialValue } = MinimalTestBuilder.withRequired(true);
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const input = fixture.debugElement.query(By.css('input[matInput]'));
      expect(input.nativeElement.hasAttribute('required')).toBe(true);
    });

    it('should not mark input as required by default', async () => {
      const { config, initialValue } = MinimalTestBuilder.minimal();
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const input = fixture.debugElement.query(By.css('input[matInput]'));
      expect(input.nativeElement.hasAttribute('required')).toBe(false);
    });
  });

  describe('Disabled State (Unit)', () => {
    it('should mark input as disabled', async () => {
      const { config, initialValue } = MinimalTestBuilder.withDisabled(true);
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const input = fixture.debugElement.query(By.css('input[matInput]'));
      expect(input.nativeElement.disabled).toBe(true);
    });

    it('should not mark input as disabled by default', async () => {
      const { config, initialValue } = MinimalTestBuilder.minimal();
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const input = fixture.debugElement.query(By.css('input[matInput]'));
      expect(input.nativeElement.disabled).toBe(false);
    });
  });

  describe('Value Binding (Unit)', () => {
    it('should render with initial string value', async () => {
      const { config, initialValue } = MinimalTestBuilder.withValue('test@example.com');
      const { component } = await MaterialFormTestUtils.createTest({ config, initialValue });

      expect(MaterialFormTestUtils.getFormValue(component).field).toBe('test@example.com');
    });

    it('should render with initial number value', async () => {
      const { config, initialValue } = MinimalTestBuilder.withValue(42);
      const { component } = await MaterialFormTestUtils.createTest({ config, initialValue });

      expect(MaterialFormTestUtils.getFormValue(component).field).toBe(42);
    });

    it('should render with empty string value', async () => {
      const { config, initialValue } = MinimalTestBuilder.withValue('');
      const { component } = await MaterialFormTestUtils.createTest({ config, initialValue });

      expect(MaterialFormTestUtils.getFormValue(component).field).toBe('');
    });
  });

  describe('Multiple Fields (Unit)', () => {
    it('should render 3 input fields', async () => {
      const { config, initialValue } = MinimalTestBuilder.withMultipleFields(3);
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const inputs = fixture.debugElement.queryAll(By.css('input[matInput]'));
      expect(inputs.length).toBe(3);
    });

    it('should render 5 input fields', async () => {
      const { config, initialValue } = MinimalTestBuilder.withMultipleFields(5);
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const inputs = fixture.debugElement.queryAll(By.css('input[matInput]'));
      expect(inputs.length).toBe(5);
    });
  });
});
