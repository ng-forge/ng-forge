import { By } from '@angular/platform-browser';
import { MaterialFormTestUtils } from '../../testing/material-test-utils';
import { MinimalTestBuilder } from '../../testing/minimal-test-builders';

describe('MatMultiCheckboxFieldComponent', () => {
  describe('Basic Rendering (Unit)', () => {
    it('should render checkbox group', async () => {
      const { config, initialValue } = MinimalTestBuilder.withCheckboxOptions([{ label: 'Option 1', value: '1' }]);
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const checkboxes = fixture.debugElement.queryAll(By.css('mat-checkbox'));
      expect(Array.isArray(checkboxes)).toBe(true);
      expect(checkboxes.length).toBe(1);
    });
  });

  describe('Options Rendering (Unit)', () => {
    it('should render multiple checkboxes correctly', async () => {
      const { config, initialValue } = MinimalTestBuilder.withCheckboxOptions([
        { label: 'Reading', value: 'reading' },
        { label: 'Gaming', value: 'gaming' },
        { label: 'Cooking', value: 'cooking' },
      ]);
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const checkboxes = fixture.debugElement.queryAll(By.css('mat-checkbox'));
      expect(checkboxes.length).toBe(3);
      expect(checkboxes[0].nativeElement.textContent.trim()).toBe('Reading');
      expect(checkboxes[1].nativeElement.textContent.trim()).toBe('Gaming');
      expect(checkboxes[2].nativeElement.textContent.trim()).toBe('Cooking');
    });

    it('should handle disabled options', async () => {
      const { config, initialValue } = MinimalTestBuilder.withDisabledCheckboxOption();
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const checkboxes = fixture.debugElement.queryAll(By.css('mat-checkbox'));
      expect(checkboxes[0].componentInstance.disabled).toBe(false);
      expect(checkboxes[1].componentInstance.disabled).toBe(true);
      expect(checkboxes[2].componentInstance.disabled).toBe(false);
    });
  });

  describe('Label Rendering (Unit)', () => {
    it('should render label text', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'field',
          type: 'multi-checkbox',
          label: 'Hobbies',
          options: [{ label: 'Reading', value: 'reading' }],
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { field: [] },
      });

      const label = fixture.debugElement.query(By.css('.checkbox-group-label'));
      expect(label.nativeElement.textContent.trim()).toBe('Hobbies');
    });

    it('should not render label when not provided', async () => {
      const { config, initialValue } = MinimalTestBuilder.withCheckboxOptions([{ label: 'Reading', value: 'reading' }]);
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const label = fixture.debugElement.query(By.css('.checkbox-group-label'));
      expect(label).toBeNull();
    });
  });

  describe('Hint Text (Unit)', () => {
    it('should render hint text', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'field',
          type: 'multi-checkbox',
          options: [{ label: 'Reading', value: 'reading' }],
          props: { hint: 'Select all that apply' },
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { field: [] },
      });

      const hint = fixture.debugElement.query(By.css('.mat-hint'));
      expect(hint.nativeElement.textContent.trim()).toBe('Select all that apply');
    });

    it('should not render hint when not provided', async () => {
      const { config, initialValue } = MinimalTestBuilder.withCheckboxOptions([{ label: 'Reading', value: 'reading' }]);
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const hint = fixture.debugElement.query(By.css('.mat-hint'));
      expect(hint).toBeNull();
    });
  });

  describe('CSS Classes (Unit)', () => {
    it('should apply custom className', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'field',
          type: 'multi-checkbox',
          className: 'hobbies-checkbox',
          options: [{ label: 'Reading', value: 'reading' }],
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { field: [] },
      });

      const hostElement = fixture.debugElement.query(By.css('df-mat-multi-checkbox'));
      expect(hostElement.nativeElement.className).toContain('hobbies-checkbox');
    });
  });

  describe('Material Color Theme (Unit)', () => {
    it('should apply primary color', async () => {
      const { config, initialValue } = MinimalTestBuilder.withCheckboxColor('primary');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const checkbox = fixture.debugElement.query(By.css('mat-checkbox'));
      expect(checkbox.componentInstance.color).toBe('primary');
    });

    it('should apply accent color', async () => {
      const { config, initialValue } = MinimalTestBuilder.withCheckboxColor('accent');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const checkbox = fixture.debugElement.query(By.css('mat-checkbox'));
      expect(checkbox.componentInstance.color).toBe('accent');
    });

    it('should apply warn color', async () => {
      const { config, initialValue } = MinimalTestBuilder.withCheckboxColor('warn');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const checkbox = fixture.debugElement.query(By.css('mat-checkbox'));
      expect(checkbox.componentInstance.color).toBe('warn');
    });
  });

  describe('Label Position (Unit)', () => {
    it('should apply after label position', async () => {
      const { config, initialValue } = MinimalTestBuilder.withCheckboxLabelPosition('after');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const checkbox = fixture.debugElement.query(By.css('mat-checkbox'));
      expect(checkbox.componentInstance.labelPosition).toBe('after');
    });

    it('should apply before label position', async () => {
      const { config, initialValue } = MinimalTestBuilder.withCheckboxLabelPosition('before');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const checkbox = fixture.debugElement.query(By.css('mat-checkbox'));
      expect(checkbox.componentInstance.labelPosition).toBe('before');
    });
  });

  describe('Full Configuration (Integration)', () => {
    /**
     * Integration test - verifies all features work together
     * Still uses minimal initialValue (1 field vs original 3)
     */
    it('should render multi-checkbox with all properties configured correctly', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'hobbies',
          type: 'multi-checkbox',
          label: 'Hobbies',
          required: true,
          className: 'hobbies-checkbox',
          props: {
            hint: 'Select all that apply',
            color: 'primary',
            labelPosition: 'after',
          },
          options: [
            { value: 'reading', label: 'Reading' },
            { value: 'gaming', label: 'Gaming' },
            { value: 'cooking', label: 'Cooking' },
          ],
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { hobbies: [] }, // Minimal! Only 1 field vs original 3
      });

      const checkboxes = fixture.debugElement.queryAll(By.css('mat-checkbox'));
      const label = fixture.debugElement.query(By.css('.checkbox-group-label'));
      const hint = fixture.debugElement.query(By.css('.mat-hint'));
      const wrapper = fixture.debugElement.query(By.css('df-mat-multi-checkbox'));

      // Verify all features integrated correctly
      expect(checkboxes.length).toBe(3);
      expect(label.nativeElement.textContent.trim()).toBe('Hobbies');
      expect(hint.nativeElement.textContent.trim()).toBe('Select all that apply');
      expect(wrapper.nativeElement.className).toContain('hobbies-checkbox');

      // Check individual checkbox properties
      expect(checkboxes[0].componentInstance.labelPosition).toBe('after');
      expect(checkboxes[0].componentInstance.color).toBe('primary');
      expect(checkboxes[0].nativeElement.textContent.trim()).toBe('Reading');
      expect(checkboxes[1].nativeElement.textContent.trim()).toBe('Gaming');
      expect(checkboxes[2].nativeElement.textContent.trim()).toBe('Cooking');
    });
  });
});
