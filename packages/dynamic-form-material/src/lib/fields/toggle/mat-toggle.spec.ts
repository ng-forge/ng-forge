import { By } from '@angular/platform-browser';
import { MaterialFormTestUtils } from '../../testing/material-test-utils';
import { MinimalTestBuilder } from '../../testing/minimal-test-builders';

describe('MatToggleFieldComponent', () => {
  describe('Basic Rendering', () => {
    it('should render toggle element', async () => {
      const { config, initialValue } = MinimalTestBuilder.withToggle();
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const toggle = fixture.debugElement.query(By.css('mat-slide-toggle'));
      expect(toggle).not.toBeNull();
    });
  });

  describe('Label Rendering', () => {
    it('should render label text', async () => {
      const config = MaterialFormTestUtils.builder().field({ key: 'field', type: 'toggle', label: 'Enable Notifications' }).build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue: { field: false } });

      const toggle = fixture.debugElement.query(By.css('mat-slide-toggle'));
      expect(toggle.nativeElement.textContent.trim()).toBe('Enable Notifications');
    });
  });

  describe('Hint Text', () => {
    it('should render hint text', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({ key: 'field', type: 'toggle', label: 'Notifications', props: { hint: 'Receive email notifications' } })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue: { field: false } });

      const hint = fixture.debugElement.query(By.css('.mat-hint'));
      expect(hint.nativeElement.textContent.trim()).toBe('Receive email notifications');
    });
  });

  describe('Material Color Theme', () => {
    it('should apply primary color', async () => {
      const { config, initialValue } = MinimalTestBuilder.withToggleColor('primary');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const toggle = fixture.debugElement.query(By.css('mat-slide-toggle'));
      expect(toggle.componentInstance.color).toBe('primary');
    });

    it('should apply accent color', async () => {
      const { config, initialValue } = MinimalTestBuilder.withToggleColor('accent');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const toggle = fixture.debugElement.query(By.css('mat-slide-toggle'));
      expect(toggle.componentInstance.color).toBe('accent');
    });
  });

  describe('Label Position', () => {
    it('should apply after label position', async () => {
      const { config, initialValue } = MinimalTestBuilder.withToggleLabelPosition('after');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const toggle = fixture.debugElement.query(By.css('mat-slide-toggle'));
      expect(toggle.componentInstance.labelPosition).toBe('after');
    });

    it('should apply before label position', async () => {
      const { config, initialValue } = MinimalTestBuilder.withToggleLabelPosition('before');
      const { fixture } = await MaterialFormTestUtils.createTest({ config, initialValue });

      const toggle = fixture.debugElement.query(By.css('mat-slide-toggle'));
      expect(toggle.componentInstance.labelPosition).toBe('before');
    });
  });
});
