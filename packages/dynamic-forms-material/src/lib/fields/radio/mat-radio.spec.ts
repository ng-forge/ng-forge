import { By } from '@angular/platform-browser';
import { MaterialFormTestUtils } from '../../testing/material-test-utils';
import { MinimalTestBuilder } from '../../testing/minimal-test-builders';

describe('MatRadioFieldComponent', () => {
  describe('Basic Rendering', () => {
    it('should render radio group', async () => {
      const { config, initialValue } = MinimalTestBuilder.withRadioOptions([{ label: 'Option 1', value: '1' }]);
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const radios = fixture.debugElement.queryAll(By.css('mat-radio-button'));
      expect(radios.length).toBe(1);
    });
  });

  describe('Options Rendering', () => {
    it('should render multiple radio buttons', async () => {
      const { config, initialValue } = MinimalTestBuilder.withRadioOptions([
        { label: 'Small', value: 'S' },
        { label: 'Medium', value: 'M' },
        { label: 'Large', value: 'L' },
      ]);
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const radios = fixture.debugElement.queryAll(By.css('mat-radio-button'));
      expect(radios.length).toBe(3);
      expect(radios[0].nativeElement.textContent.trim()).toBe('Small');
      expect(radios[1].nativeElement.textContent.trim()).toBe('Medium');
      expect(radios[2].nativeElement.textContent.trim()).toBe('Large');
    });
  });

  describe('Label Rendering', () => {
    it('should render label text', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({ key: 'field', type: 'radio', label: 'Size', options: [{ label: 'Small', value: 'S' }] })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue: { field: null } });

      const label = fixture.debugElement.query(By.css('.radio-label'));
      expect(label.nativeElement.textContent.trim()).toBe('Size');
    });
  });

  describe('Hint Text', () => {
    it('should render hint text', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({ key: 'field', type: 'radio', options: [{ label: 'Small', value: 'S' }], props: { hint: 'Select a size' } })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue: { field: null } });

      const hint = fixture.debugElement.query(By.css('.mat-hint'));
      expect(hint.nativeElement.textContent.trim()).toBe('Select a size');
    });
  });

  describe('Material Color Theme', () => {
    it('should apply primary color', async () => {
      const { config, initialValue } = MinimalTestBuilder.withRadioColor('primary');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const radio = fixture.debugElement.query(By.css('mat-radio-button'));
      expect(radio.componentInstance.color).toBe('primary');
    });

    it('should apply accent color', async () => {
      const { config, initialValue } = MinimalTestBuilder.withRadioColor('accent');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const radio = fixture.debugElement.query(By.css('mat-radio-button'));
      expect(radio.componentInstance.color).toBe('accent');
    });
  });

  describe('Label Position', () => {
    it('should apply after label position', async () => {
      const { config, initialValue } = MinimalTestBuilder.withRadioLabelPosition('after');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const radio = fixture.debugElement.query(By.css('mat-radio-button'));
      expect(radio.componentInstance.labelPosition).toBe('after');
    });

    it('should apply before label position', async () => {
      const { config, initialValue } = MinimalTestBuilder.withRadioLabelPosition('before');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const radio = fixture.debugElement.query(By.css('mat-radio-button'));
      expect(radio.componentInstance.labelPosition).toBe('before');
    });
  });
});
