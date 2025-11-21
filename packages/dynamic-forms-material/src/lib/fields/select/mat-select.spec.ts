import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MaterialFormTestUtils } from '../../testing/material-test-utils';
import { MinimalTestBuilder } from '../../testing/minimal-test-builders';

describe('MatSelectFieldComponent', () => {
  describe('Basic Rendering (Unit)', () => {
    it('should render mat-select element', async () => {
      const { config, initialValue } = MinimalTestBuilder.withSelectOptions([{ label: 'Option 1', value: '1' }]);
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      // Additional stabilization cycles for Material select component
      // Material components sometimes need multiple cycles to fully initialize
      for (let i = 0; i < 3; i++) {
        TestBed.flushEffects();
        fixture.detectChanges();
        await fixture.whenStable();
      }

      const select = fixture.debugElement.query(By.css('mat-select'));
      expect(select).not.toBeNull();
      expect(select.nativeElement).toBeInstanceOf(HTMLElement);
    });
  });

  describe('Options Rendering (Unit)', () => {
    it('should render options correctly', async () => {
      const { config, initialValue } = MinimalTestBuilder.withSelectOptions([
        { label: 'United States', value: 'US' },
        { label: 'Canada', value: 'CA' },
        { label: 'United Kingdom', value: 'UK' },
      ]);
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const select = fixture.debugElement.query(By.css('mat-select'));
      select.nativeElement.click(); // Open dropdown
      fixture.detectChanges();
      await fixture.whenStable();

      const options = fixture.debugElement.queryAll(By.css('mat-option'));
      expect(options.length).toBe(3);
      expect(options[0].nativeElement.textContent.trim()).toBe('United States');
      expect(options[1].nativeElement.textContent.trim()).toBe('Canada');
      expect(options[2].nativeElement.textContent.trim()).toBe('United Kingdom');
    });

    it('should handle disabled options', async () => {
      const { config, initialValue } = MinimalTestBuilder.withDisabledOption();
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const select = fixture.debugElement.query(By.css('mat-select'));
      select.nativeElement.click();
      fixture.detectChanges();
      await fixture.whenStable();

      const options = fixture.debugElement.queryAll(By.css('mat-option'));
      expect(options[1].componentInstance.disabled).toBe(true);
    });
  });

  describe('Placeholder (Unit)', () => {
    it('should render placeholder text', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'field',
          type: 'select',
          placeholder: 'Select your country',
          options: [{ label: 'US', value: 'US' }],
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { field: null },
      });

      const select = fixture.debugElement.query(By.css('mat-select'));
      expect(select.componentInstance.placeholder).toBe('Select your country');
    });
  });

  describe('Label Rendering (Unit)', () => {
    it('should render label text', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'field',
          type: 'select',
          label: 'Country',
          options: [{ label: 'US', value: 'US' }],
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { field: null },
      });

      const label = fixture.debugElement.query(By.css('mat-label'));
      expect(label.nativeElement.textContent.trim()).toBe('Country');
    });
  });

  describe('Hint Text (Unit)', () => {
    it('should render hint text', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'field',
          type: 'select',
          options: [{ label: 'US', value: 'US' }],
          props: { hint: 'Choose the country you live in' },
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { field: null },
      });

      const hint = fixture.debugElement.query(By.css('mat-hint'));
      expect(hint.nativeElement.textContent.trim()).toBe('Choose the country you live in');
    });
  });

  describe('Material Appearance (Unit)', () => {
    it('should render outline appearance', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'field',
          type: 'select',
          options: [{ label: 'US', value: 'US' }],
          props: { appearance: 'outline' },
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { field: null },
      });

      const formField = fixture.debugElement.query(By.css('mat-form-field'));
      expect(formField.nativeElement.className).toContain('mat-form-field-appearance-outline');
    });
  });

  describe('CSS Classes (Unit)', () => {
    it('should apply custom className', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'field',
          type: 'select',
          className: 'country-select',
          options: [{ label: 'US', value: 'US' }],
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { field: null },
      });

      const hostElement = fixture.debugElement.query(By.css('df-mat-select'));
      expect(hostElement.nativeElement.className).toContain('country-select');
    });
  });

  describe('Multiple Selection (Unit)', () => {
    it('should enable multiple selection', async () => {
      const { config, initialValue } = MinimalTestBuilder.withMultiSelect();
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const select = fixture.debugElement.query(By.css('mat-select'));
      expect(select.componentInstance.multiple).toBe(true);
    });
  });

  describe('Required State (Unit)', () => {
    it('should mark select as required', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'field',
          type: 'select',
          required: true,
          options: [{ label: 'US', value: 'US' }],
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { field: null },
      });

      const select = fixture.debugElement.query(By.css('mat-select'));
      expect(select.componentInstance.required).toBe(true);
    });
  });

  describe('Full Configuration (Integration)', () => {
    /**
     * Integration test - verifies all features work together
     * Still uses minimal initialValue (1 field vs original 4)
     */
    it('should render select with all properties configured correctly', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'country',
          type: 'select',
          label: 'Country',
          required: true,
          placeholder: 'Select your country',
          options: [
            { label: 'United States', value: 'US' },
            { label: 'Canada', value: 'CA' },
            { label: 'Germany', value: 'DE', disabled: true },
          ],
          props: {
            hint: 'Choose the country you live in',
            appearance: 'outline',
          },
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { country: null }, // Minimal! Only 1 field vs original 4
      });

      const select = fixture.debugElement.query(By.css('mat-select'));
      const formField = fixture.debugElement.query(By.css('mat-form-field'));
      const label = fixture.debugElement.query(By.css('mat-label'));
      const hint = fixture.debugElement.query(By.css('mat-hint'));

      // Verify all features integrated correctly
      expect(select.componentInstance.placeholder).toBe('Select your country');
      expect(select.componentInstance.required).toBe(true);
      expect(formField.nativeElement.className).toContain('mat-form-field-appearance-outline');
      expect(label.nativeElement.textContent.trim()).toBe('Country');
      expect(hint.nativeElement.textContent.trim()).toBe('Choose the country you live in');

      // Verify options
      select.nativeElement.click();
      fixture.detectChanges();
      await fixture.whenStable();

      const options = fixture.debugElement.queryAll(By.css('mat-option'));
      expect(options.length).toBe(3);
      expect(options[2].componentInstance.disabled).toBe(true);
    });
  });
});
