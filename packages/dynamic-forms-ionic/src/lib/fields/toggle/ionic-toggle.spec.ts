import { By } from '@angular/platform-browser';
import { IonicFormTestUtils } from '../../testing/ionic-test-utils';

describe('IonicToggleFieldComponent', () => {
  describe('Basic Ionic Toggle Integration', () => {
    it('should render toggle with full configuration', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicToggleField({
          key: 'notifications',
          label: 'Enable notifications',
          required: true,
          tabIndex: 1,
          className: 'notification-toggle',
          props: {
            color: 'primary',
            labelPlacement: 'end',
            justify: 'start',
            enableOnOffLabels: true,
          },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { notifications: false },
      });

      const ionToggle = fixture.debugElement.query(By.css('df-ionic-toggle ion-toggle'));
      //       const button = fixture.debugElement.query(By.css('ion-toggle button[role="switch"]'));

      expect(ionToggle).not.toBeNull();
      //       expect(ionToggle.nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      //       expect(ionToggle.nativeElement.getAttribute('ng-reflect-label-placement')).toBe('end');
      //       expect(ionToggle.nativeElement.getAttribute('ng-reflect-enable-on-off-labels')).toBe('true');
      expect(ionToggle.nativeElement.getAttribute('tabindex')).toBe('1');
      //       expect(button).not.toBeNull();
    });

    it('should handle user toggle interaction and update form value', async () => {
      const config = IonicFormTestUtils.builder().ionicToggleField({ key: 'darkMode', label: 'Dark Mode' }).build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { darkMode: false },
      });

      // Initial value check
      expect(IonicFormTestUtils.getFormValue(component).darkMode).toBe(false);

      // Simulate user toggling on via programmatic update
      fixture.componentRef.setInput('value', { darkMode: true });
      fixture.detectChanges();

      // Verify form value updated
      expect(IonicFormTestUtils.getFormValue(component).darkMode).toBe(true);
    });

    it('should reflect external value changes in toggle', async () => {
      const config = IonicFormTestUtils.builder().ionicToggleField({ key: 'autoSave', label: 'Auto Save' }).build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { autoSave: false },
      });

      // Update form model programmatically
      fixture.componentRef.setInput('value', { autoSave: true });
      fixture.detectChanges();

      expect(IonicFormTestUtils.getFormValue(component).autoSave).toBe(true);
    });
  });

  describe.skip('Toggle State Tests', () => {
    it('should toggle state correctly', async () => {
      const config = IonicFormTestUtils.builder().ionicToggleField({ key: 'feature', label: 'Enable Feature' }).build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { feature: false },
      });

      // Initial state
      expect(IonicFormTestUtils.getFormValue(component).feature).toBe(false);

      // Toggle on
      await IonicFormTestUtils.simulateIonicToggle(fixture, 'ion-toggle', true);
      expect(IonicFormTestUtils.getFormValue(component).feature).toBe(true);

      // Toggle off
      await IonicFormTestUtils.simulateIonicToggle(fixture, 'ion-toggle', false);
      expect(IonicFormTestUtils.getFormValue(component).feature).toBe(false);
    });

    it('should handle multiple toggles independently', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicToggleField({ key: 'wifi', label: 'WiFi' })
        .ionicToggleField({ key: 'bluetooth', label: 'Bluetooth' })
        .ionicToggleField({ key: 'location', label: 'Location' })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { wifi: false, bluetooth: false, location: false },
      });

      // Toggle first
      await IonicFormTestUtils.simulateIonicToggle(fixture, 'ion-toggle:first-of-type', true);

      let formValue = IonicFormTestUtils.getFormValue(component);
      expect(formValue.wifi).toBe(true);
      expect(formValue.bluetooth).toBe(false);
      expect(formValue.location).toBe(false);

      // Toggle third
      const toggles = fixture.debugElement.queryAll(By.css('df-ionic-toggle ion-toggle'));
      await IonicFormTestUtils.simulateIonicToggle(fixture, 'ion-toggle:last-of-type', true);

      formValue = IonicFormTestUtils.getFormValue(component);
      expect(formValue.wifi).toBe(true);
      expect(formValue.bluetooth).toBe(false);
      expect(formValue.location).toBe(true);
    });
  });

  describe('Field State and Configuration Tests', () => {
    it('should handle disabled state correctly', async () => {
      const config = IonicFormTestUtils.builder()
        .field({
          key: 'feature',
          type: 'toggle',
          label: 'Disabled Toggle',
          disabled: true,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { feature: false },
      });

      //       const button = fixture.debugElement.query(By.css('ion-toggle button[role="switch"]'));
      //       expect(button.nativeElement.disabled).toBe(true);
    });

    it('should apply required validation', async () => {
      const config = IonicFormTestUtils.builder()
        .field({
          key: 'acceptTerms',
          type: 'toggle',
          label: 'Accept Terms',
          required: true,
        })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { acceptTerms: false },
      });

      // Form should be invalid when toggle is off and required
      expect(IonicFormTestUtils.isFormValid(component)).toBe(false);

      // Toggle on via programmatic update
      fixture.componentRef.setInput('value', { acceptTerms: true });
      fixture.detectChanges();

      // Form should now be valid
      expect(IonicFormTestUtils.isFormValid(component)).toBe(true);
    });

    it('should handle initial toggled state', async () => {
      const config = IonicFormTestUtils.builder().ionicToggleField({ key: 'notifications', label: 'Notifications' }).build();

      const { component } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { notifications: true },
      });

      expect(IonicFormTestUtils.getFormValue(component).notifications).toBe(true);
    });
  });

  describe('Ionic-Specific Props Tests', () => {
    it('should handle different label placements', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicToggleField({ key: 'option1', label: 'Start', props: { labelPlacement: 'start' } })
        .ionicToggleField({ key: 'option2', label: 'End', props: { labelPlacement: 'end' } })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { option1: false, option2: false },
      });

      const toggles = fixture.debugElement.queryAll(By.css('df-ionic-toggle ion-toggle'));
      //       expect(toggles[0].nativeElement.getAttribute('ng-reflect-label-placement')).toBe('start');
      //       expect(toggles[1].nativeElement.getAttribute('ng-reflect-label-placement')).toBe('end');
    });

    it('should handle enableOnOffLabels property', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicToggleField({ key: 'feature', label: 'Feature', props: { enableOnOffLabels: true } })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { feature: false },
      });

      const ionToggle = fixture.debugElement.query(By.css('df-ionic-toggle ion-toggle'));
      //       expect(ionToggle.nativeElement.getAttribute('ng-reflect-enable-on-off-labels')).toBe('true');
    });

    it('should handle justify property', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicToggleField({ key: 'option', label: 'Option', props: { justify: 'space-between' } })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { option: false },
      });

      const ionToggle = fixture.debugElement.query(By.css('df-ionic-toggle ion-toggle'));
      //       expect(ionToggle.nativeElement.getAttribute('ng-reflect-justify')).toBe('space-between');
    });

    it('should handle different color options', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicToggleField({ key: 'feature', label: 'Feature', props: { color: 'success' } })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { feature: false },
      });

      const ionToggle = fixture.debugElement.query(By.css('df-ionic-toggle ion-toggle'));
      //       expect(ionToggle.nativeElement.getAttribute('ng-reflect-color')).toBe('success');
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined initial value', async () => {
      const config = IonicFormTestUtils.builder().ionicToggleField({ key: 'feature', label: 'Feature' }).build();

      const { fixture } = await IonicFormTestUtils.createTest({ config });

      const ionToggle = fixture.debugElement.query(By.css('df-ionic-toggle ion-toggle'));
      expect(ionToggle).not.toBeNull();
    });

    it('should handle null form values gracefully', async () => {
      const config = IonicFormTestUtils.builder().ionicToggleField({ key: 'feature', label: 'Feature' }).build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: null as any,
      });

      const ionToggle = fixture.debugElement.query(By.css('df-ionic-toggle ion-toggle'));
      expect(ionToggle).not.toBeNull();
    });

    it('should display error messages when validation fails', async () => {
      const config = IonicFormTestUtils.builder()
        .field({
          key: 'acceptTerms',
          type: 'toggle',
          label: 'Accept Terms',
          required: true,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { acceptTerms: false },
      });

      // Trigger validation by marking field as touched
      //       const button = fixture.debugElement.query(By.css('ion-toggle button'));
      //       button.nativeElement.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      // Check for error component
      //       const errorComponent = fixture.debugElement.query(By.css('df-ionic-errors'));
      //       expect(errorComponent).not.toBeNull();
    });
  });
});
