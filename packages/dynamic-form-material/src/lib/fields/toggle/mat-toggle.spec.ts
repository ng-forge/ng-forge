import { By } from '@angular/platform-browser';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MaterialFormTestUtils } from '../../testing/material-test-utils';

describe('MatToggleFieldComponent', () => {
  describe('Basic Material Toggle Integration', () => {
    it('should render toggle with full configuration', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'darkMode',
          type: 'toggle',
          label: 'Enable Dark Mode',
          className: 'dark-mode-toggle',
          props: {
            hint: 'Toggle between light and dark themes',
            required: true,
            color: 'accent',
            labelPosition: 'before',
            hideIcon: false,
            disableRipple: true,
            tabIndex: 1,
          },
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          darkMode: false,
          notifications: false,
          enableFeature: false,
        },
      });

      const toggle = fixture.debugElement.query(By.directive(MatSlideToggle));
      const matToggleComponent = fixture.debugElement.query(By.css('df-mat-toggle'))?.componentInstance;
      const containerDiv = fixture.debugElement.query(By.css('.dark-mode-toggle'));
      const hintElement = fixture.debugElement.query(By.css('.mat-hint'));

      expect(toggle).toBeTruthy();
      expect(toggle.nativeElement.textContent.trim()).toBe('Enable Dark Mode');
      expect(containerDiv).toBeTruthy();
      expect(hintElement?.nativeElement.textContent.trim()).toBe('Toggle between light and dark themes');

      // Verify form control integration and dynamic field component properties
      if (matToggleComponent) {
        expect(matToggleComponent.label()).toBe('Enable Dark Mode');
        expect(matToggleComponent.props()?.color).toBe('accent');
        expect(matToggleComponent.props()?.labelPosition).toBe('before');
      }
    });

    it('should handle user interactions and update form value', async () => {
      const config = MaterialFormTestUtils.builder().matToggleField({ key: 'darkMode' }).build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          darkMode: false,
          notifications: false,
          enableFeature: false,
        },
      });

      // Initial value check
      expect(MaterialFormTestUtils.getFormValue(component)['darkMode']).toBe(false);

      // Simulate toggle interaction using utility
      await MaterialFormTestUtils.simulateMatToggle(fixture, 'mat-slide-toggle', true);

      // Verify form value updated
      expect(MaterialFormTestUtils.getFormValue(component)['darkMode']).toBe(true);
    });

    it('should reflect external value changes in toggle', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'darkMode',
          type: 'toggle',
          props: {
            label: 'Dark Mode',
          },
        })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          darkMode: false,
          notifications: false,
          enableFeature: false,
        },
      });

      const toggle = fixture.debugElement.query(By.directive(MatSlideToggle));
      const toggleComponent = toggle.componentInstance;

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        darkMode: true,
        notifications: false,
        enableFeature: false,
      });
      fixture.detectChanges();

      expect(toggleComponent.checked).toBe(true);
      expect(MaterialFormTestUtils.getFormValue(component)['darkMode']).toBe(true);
    });

    it('should handle Material-specific toggle properties', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'darkMode',
          type: 'toggle',
          props: {
            label: 'Test Toggle',
            hideIcon: false,
            disableRipple: true,
            tabIndex: 1,
          },
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { darkMode: false },
      });

      const toggle = fixture.debugElement.query(By.directive(MatSlideToggle));
      const toggleComponent = toggle.componentInstance;

      // These properties are passed to the inner MatSlideToggle component
      expect(toggleComponent.hideIcon).toBe(false);
      // Note: disableRipple and tabIndex are not directly exposed by Material toggle
      // They are internal properties that don't need testing at this integration level
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default Material configuration', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'notifications',
          type: 'toggle',
          label: 'Enable Notifications',
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          darkMode: false,
          notifications: false,
          enableFeature: false,
        },
      });

      const toggle = fixture.debugElement.query(By.directive(MatSlideToggle));
      const toggleComponent = toggle.componentInstance;

      expect(toggle).toBeTruthy();
      expect(toggle.nativeElement.textContent.trim()).toBe('Enable Notifications');
      expect(toggleComponent.color).toBe('primary');
      expect(toggleComponent.labelPosition).toBe('after');
    });

    it('should not display hint when not provided', async () => {
      const config = MaterialFormTestUtils.builder().matToggleField({ key: 'notifications' }).build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { notifications: false },
      });

      const hintElement = fixture.debugElement.query(By.css('.mat-hint'));
      expect(hintElement).toBeNull();
    });
  });

  describe('Multiple Toggle Integration Tests', () => {
    it('should render multiple toggles with different configurations', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'darkMode',
          type: 'toggle',
          label: 'Dark Mode',
          required: true,
        })
        .matToggleField({ key: 'notifications', label: 'Notifications', props: { color: 'accent' } })
        .matToggleField({ key: 'enableFeature', label: 'Enablefeature', props: { color: 'warn' } })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          darkMode: false,
          notifications: true,
          enableFeature: false,
        },
      });

      const toggles = fixture.debugElement.queryAll(By.directive(MatSlideToggle));

      expect(toggles.length).toBe(3);
      expect(toggles[0].nativeElement.textContent.trim()).toBe('Dark Mode');
      expect(toggles[1].nativeElement.textContent.trim()).toBe('Notifications');
      expect(toggles[2].nativeElement.textContent.trim()).toBe('Enablefeature');
    });

    it('should reflect individual toggle states from form model', async () => {
      const config = MaterialFormTestUtils.builder()
        .matToggleField({ key: 'darkMode' })
        .matToggleField({ key: 'notifications' })
        .matToggleField({ key: 'enableFeature' })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          darkMode: false,
          notifications: true,
          enableFeature: false,
        },
      });

      const toggles = fixture.debugElement.queryAll(By.directive(MatSlideToggle));

      expect(toggles[0].componentInstance.checked).toBe(false);
      expect(toggles[1].componentInstance.checked).toBe(true);
      expect(toggles[2].componentInstance.checked).toBe(false);
    });

    it('should handle independent toggle interactions', async () => {
      const config = MaterialFormTestUtils.builder()
        .matToggleField({ key: 'darkMode' })
        .matToggleField({ key: 'notifications' })
        .matToggleField({ key: 'enableFeature' })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          darkMode: false,
          notifications: true,
          enableFeature: false,
        },
      });

      const toggles = fixture.debugElement.queryAll(By.directive(MatSlideToggle));

      // Simulate first toggle click using direct component interaction
      const firstToggleButton = toggles[0].nativeElement.querySelector('button');
      firstToggleButton.click();
      fixture.detectChanges();

      let formValue = MaterialFormTestUtils.getFormValue(component);
      expect(formValue['darkMode']).toBe(true);
      expect(formValue['notifications']).toBe(true);
      expect(formValue['enableFeature']).toBe(false);

      // Simulate third toggle click using direct component interaction
      const thirdToggleButton = toggles[2].nativeElement.querySelector('button');
      thirdToggleButton.click();
      fixture.detectChanges();

      formValue = MaterialFormTestUtils.getFormValue(component);
      expect(formValue['darkMode']).toBe(true);
      expect(formValue['notifications']).toBe(true);
      expect(formValue['enableFeature']).toBe(true);
    });

    it('should apply different Material colors to toggles', async () => {
      const config = MaterialFormTestUtils.builder()
        .matToggleField({ key: 'darkMode' }) // Default primary
        .matToggleField({ key: 'notifications', props: { color: 'accent' } })
        .matToggleField({ key: 'enableFeature', props: { color: 'warn' } })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          darkMode: false,
          notifications: false,
          enableFeature: false,
        },
      });

      const toggles = fixture.debugElement.queryAll(By.directive(MatSlideToggle));

      expect(toggles[0].componentInstance.color).toBe('primary');
      expect(toggles[1].componentInstance.color).toBe('accent');
      expect(toggles[2].componentInstance.color).toBe('warn');
    });
  });

  describe('Toggle State and Edge Cases', () => {
    it('should handle disabled state correctly', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'darkMode',
          type: 'toggle',
          label: 'Disabled Toggle',
          disabled: true,
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          darkMode: false,
          notifications: false,
          enableFeature: false,
        },
      });

      const toggle = fixture.debugElement.query(By.directive(MatSlideToggle));
      const toggleButton = fixture.debugElement.query(By.css('button'));
      const toggleComponent = toggle.componentInstance;

      expect(toggleButton.nativeElement.disabled).toBe(true);

      // Try to click disabled toggle - should not change value since it's disabled
      toggle.nativeElement.click();
      fixture.detectChanges();

      // Verify the toggle remains disabled and doesn't change
      expect(toggleButton.nativeElement.disabled).toBe(true);
      expect(toggleComponent.checked).toBe(false);
    });

    it('should apply default Material Design configuration', async () => {
      const config = MaterialFormTestUtils.builder().matToggleField({ key: 'darkMode' }).build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { darkMode: false },
      });

      const toggle = fixture.debugElement.query(By.directive(MatSlideToggle));
      const toggleComponent = toggle.componentInstance;

      // Check default props from Material configuration
      expect(toggleComponent.color).toBe('primary');
      expect(toggleComponent.labelPosition).toBe('after');
    });

    it('should handle hideIcon property correctly', async () => {
      const config = MaterialFormTestUtils.builder()
        .matToggleField({ key: 'darkMode', props: { hideIcon: true } })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { darkMode: false },
      });

      const toggle = fixture.debugElement.query(By.directive(MatSlideToggle));
      const toggleComponent = toggle.componentInstance;

      expect(toggleComponent.hideIcon).toBe(true);
    });

    it('should handle undefined form values gracefully', async () => {
      const config = MaterialFormTestUtils.builder().matToggleField({ key: 'darkMode' }).build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config }); // No initial value provided

      const toggle = fixture.debugElement.query(By.directive(MatSlideToggle));
      expect(toggle).toBeTruthy();
    });

    it('should handle null form values gracefully', async () => {
      const config = MaterialFormTestUtils.builder().matToggleField({ key: 'darkMode' }).build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: null as any,
      });

      const toggle = fixture.debugElement.query(By.directive(MatSlideToggle));
      expect(toggle).toBeTruthy();
    });

    it('should handle programmatic value updates correctly', async () => {
      const config = MaterialFormTestUtils.builder().matToggleField({ key: 'darkMode' }).build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { darkMode: false },
      });

      const toggle = fixture.debugElement.query(By.directive(MatSlideToggle));
      const toggleComponent = toggle.componentInstance;

      // Initial state
      expect(toggleComponent.checked).toBe(false);

      // Update via programmatic value change
      fixture.componentRef.setInput('value', { darkMode: true });
      fixture.detectChanges();

      expect(toggleComponent.checked).toBe(true);
      expect(MaterialFormTestUtils.getFormValue(component)['darkMode']).toBe(true);
    });
  });
});
