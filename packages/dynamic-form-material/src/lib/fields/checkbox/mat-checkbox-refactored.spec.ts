import { By } from '@angular/platform-browser';
import { MaterialFormTestUtils } from '../../testing/material-test-utils';
import { MinimalTestBuilder } from '../../testing/minimal-test-builders';

describe('MatCheckboxFieldComponent (Refactored)', () => {
  describe('Basic Rendering', () => {
    it('should render checkbox element', async () => {
      const { config, initialValue } = MinimalTestBuilder.withCheckbox();
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const checkbox = fixture.debugElement.query(By.css('mat-checkbox'));
      expect(checkbox).not.toBeNull();
    });
  });

  describe('Label Rendering', () => {
    it('should render label text', async () => {
      const config = MaterialFormTestUtils.builder().field({ key: 'field', type: 'checkbox', label: 'Accept Terms' }).build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue: { field: false } });

      const checkbox = fixture.debugElement.query(By.css('mat-checkbox'));
      expect(checkbox.nativeElement.textContent.trim()).toBe('Accept Terms');
    });
  });

  describe('Hint Text', () => {
    it('should render hint text', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({ key: 'field', type: 'checkbox', label: 'Accept', props: { hint: 'You must accept to continue' } })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue: { field: false } });

      const hint = fixture.debugElement.query(By.css('.mat-hint'));
      expect(hint.nativeElement.textContent.trim()).toBe('You must accept to continue');
    });
  });

  describe('Material Color Theme', () => {
    it('should apply primary color', async () => {
      const { config, initialValue } = MinimalTestBuilder.withCheckboxColorSingle('primary');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const checkbox = fixture.debugElement.query(By.css('mat-checkbox'));
      expect(checkbox.componentInstance.color).toBe('primary');
    });

    it('should apply accent color', async () => {
      const { config, initialValue } = MinimalTestBuilder.withCheckboxColorSingle('accent');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const checkbox = fixture.debugElement.query(By.css('mat-checkbox'));
      expect(checkbox.componentInstance.color).toBe('accent');
    });
  });

  describe('Label Position', () => {
    it('should apply after label position', async () => {
      const { config, initialValue } = MinimalTestBuilder.withCheckboxLabelPositionSingle('after');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const checkbox = fixture.debugElement.query(By.css('mat-checkbox'));
      expect(checkbox.componentInstance.labelPosition).toBe('after');
    });

    it('should apply before label position', async () => {
      const { config, initialValue } = MinimalTestBuilder.withCheckboxLabelPositionSingle('before');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const checkbox = fixture.debugElement.query(By.css('mat-checkbox'));
      expect(checkbox.componentInstance.labelPosition).toBe('before');
    });
  });
});
