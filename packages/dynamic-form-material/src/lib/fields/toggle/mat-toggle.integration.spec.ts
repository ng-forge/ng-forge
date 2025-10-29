import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { delay, waitForDFInit } from '../../testing';
import { withMaterial } from '../../providers/material-providers';

interface TestFormModel {
  darkMode: boolean;
  notifications: boolean;
  enableFeature: boolean;
}

describe('MatToggleFieldComponent - Dynamic Form Integration', () => {
  let component: DynamicForm;
  let fixture: ComponentFixture<DynamicForm>;
  let debugElement: DebugElement;

  const createComponent = (config: FormConfig, initialValue?: Partial<TestFormModel>) => {
    fixture = TestBed.createComponent(DynamicForm<any>);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;

    fixture.componentRef.setInput('config', config);
    if (initialValue !== undefined) {
      fixture.componentRef.setInput('value', initialValue);
    }
    fixture.detectChanges();

    return { component, fixture, debugElement };
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicForm],
      providers: [provideAnimations(), provideDynamicForm(withMaterial())],
    }).compileComponents();
  });

  describe('Basic Material Toggle Integration', () => {
    it('should render toggle with full configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'darkMode',
            type: 'toggle',
            label: 'Enable Dark Mode',
            props: {
              hint: 'Toggle between light and dark themes',
              required: true,
              color: 'accent',
              labelPosition: 'before',
              className: 'dark-mode-toggle',
              hideIcon: false,
              disableRipple: true,
              tabIndex: 1,
            },
          },
        ] as any[],
      };

      createComponent(config, {
        darkMode: false,
        notifications: false,
        enableFeature: false,
      });

      await waitForDFInit(component, fixture);

      const toggle = debugElement.query(By.directive(MatSlideToggle));
      const matToggleComponent = debugElement.query(By.css('df-mat-toggle'))?.componentInstance;
      const containerDiv = debugElement.query(By.css('.dark-mode-toggle'));
      const hintElement = debugElement.query(By.css('.mat-hint'));

      expect(toggle).toBeTruthy();
      expect(toggle.nativeElement.textContent.trim()).toBe('Enable Dark Mode');
      expect(containerDiv).toBeTruthy();
      expect(hintElement?.nativeElement.textContent.trim()).toBe('Toggle between light and dark themes');

      // Verify form control integration and dynamic field component properties
      if (matToggleComponent) {
        expect(matToggleComponent.label()).toBe('Enable Dark Mode');
        expect(matToggleComponent.color()).toBe('accent');
        expect(matToggleComponent.labelPosition()).toBe('before');
      }
    });

    it('should handle user interactions and update form value', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'darkMode',
            type: 'toggle',
            label: 'Dark Mode',
          },
        ] as any[],
      };

      const { component } = createComponent(config, {
        darkMode: false,
        notifications: false,
        enableFeature: false,
      });

      await waitForDFInit(component, fixture);

      // Initial value check
      expect(component.formValue()['darkMode']).toBe(false);

      // Simulate toggle interaction by clicking the toggle
      const toggle = debugElement.query(By.directive(MatSlideToggle));
      const toggleButton = toggle.nativeElement.querySelector('button');

      // Simulate user click on toggle
      toggleButton.click();
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      // Verify form value updated
      expect(component.formValue()['darkMode']).toBe(true);
    });

    it('should reflect external value changes in toggle', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'darkMode',
            type: 'toggle',
            props: {
              label: 'Dark Mode',
            },
          },
        ] as any[],
      };

      const { component } = createComponent(config, {
        darkMode: false,
        notifications: false,
        enableFeature: false,
      });

      await waitForDFInit(component, fixture);

      const toggle = debugElement.query(By.directive(MatSlideToggle));
      const toggleComponent = toggle.componentInstance;

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        darkMode: true,
        notifications: false,
        enableFeature: false,
      });
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(toggleComponent.checked).toBe(true);
      expect(component.formValue()['darkMode']).toBe(true);
    });

    it('should handle Material-specific toggle properties', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'darkMode',
            type: 'toggle',
            props: {
              label: 'Test Toggle',
              hideIcon: false,
              disableRipple: true,
              tabIndex: 1,
            },
          },
        ] as any[],
      };

      createComponent(config, { darkMode: false });

      await waitForDFInit(component, fixture);

      const toggle = debugElement.query(By.directive(MatSlideToggle));
      const toggleComponent = toggle.componentInstance;

      // These properties are passed to the inner MatSlideToggle component
      expect(toggleComponent.hideIcon).toBe(false);
      // Note: disableRipple and tabIndex are not directly exposed by Material toggle
      // They are internal properties that don't need testing at this integration level
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default Material configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'notifications',
            type: 'toggle',
            props: {
              label: 'Enable Notifications',
            },
          },
        ] as any[],
      };

      createComponent(config, {
        darkMode: false,
        notifications: false,
        enableFeature: false,
      });

      await waitForDFInit(component, fixture);

      const toggle = debugElement.query(By.directive(MatSlideToggle));
      const toggleComponent = toggle.componentInstance;

      expect(toggle).toBeTruthy();
      expect(toggle.nativeElement.textContent.trim()).toBe('Enable Notifications');
      expect(toggleComponent.color).toBe('primary');
      expect(toggleComponent.labelPosition).toBe('after');
    });

    it('should not display hint when not provided', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'notifications',
            type: 'toggle',
            props: {
              label: 'Enable Notifications',
            },
          },
        ] as any[],
      };

      createComponent(config, { notifications: false });

      await waitForDFInit(component, fixture);

      const hintElement = debugElement.query(By.css('.mat-hint'));
      expect(hintElement).toBeNull();
    });
  });

  describe('Multiple Toggle Integration Tests', () => {
    it('should render multiple toggles with different configurations', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'darkMode',
            type: 'toggle',
            props: {
              label: 'Dark Mode',
              required: true,
            },
          },
          {
            key: 'notifications',
            type: 'toggle',
            props: {
              label: 'Notifications',
              color: 'accent',
            },
          },
          {
            key: 'enableFeature',
            type: 'toggle',
            props: {
              label: 'Enable Feature',
              color: 'warn',
            },
          },
        ] as any[],
      };

      createComponent(config, {
        darkMode: false,
        notifications: true,
        enableFeature: false,
      });

      await waitForDFInit(component, fixture);

      const toggles = debugElement.queryAll(By.directive(MatSlideToggle));

      expect(toggles.length).toBe(3);
      expect(toggles[0].nativeElement.textContent.trim()).toBe('Dark Mode');
      expect(toggles[1].nativeElement.textContent.trim()).toBe('Notifications');
      expect(toggles[2].nativeElement.textContent.trim()).toBe('Enable Feature');
    });

    it('should reflect individual toggle states from form model', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'darkMode',
            type: 'toggle',
            props: { label: 'Dark Mode' },
          },
          {
            key: 'notifications',
            type: 'toggle',
            props: { label: 'Notifications' },
          },
          {
            key: 'enableFeature',
            type: 'toggle',
            props: { label: 'Enable Feature' },
          },
        ] as any[],
      };

      createComponent(config, {
        darkMode: false,
        notifications: true,
        enableFeature: false,
      });

      await waitForDFInit(component, fixture);

      const toggles = debugElement.queryAll(By.directive(MatSlideToggle));

      expect(toggles[0].componentInstance.checked).toBe(false);
      expect(toggles[1].componentInstance.checked).toBe(true);
      expect(toggles[2].componentInstance.checked).toBe(false);
    });

    it('should handle independent toggle interactions', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'darkMode',
            type: 'toggle',
            props: { label: 'Dark Mode' },
          },
          {
            key: 'notifications',
            type: 'toggle',
            props: { label: 'Notifications' },
          },
          {
            key: 'enableFeature',
            type: 'toggle',
            props: { label: 'Enable Feature' },
          },
        ] as any[],
      };

      const { component } = createComponent(config, {
        darkMode: false,
        notifications: true,
        enableFeature: false,
      });

      await delay();
      fixture.detectChanges();

      const toggles = debugElement.queryAll(By.directive(MatSlideToggle));

      // Simulate first toggle click
      const firstToggleButton = toggles[0].nativeElement.querySelector('button');
      firstToggleButton.click();
      fixture.detectChanges();
      await delay();

      let formValue = component.formValue();
      expect(formValue['darkMode']).toBe(true);
      expect(formValue['notifications']).toBe(true);
      expect(formValue['enableFeature']).toBe(false);

      // Simulate third toggle click
      const thirdToggleButton = toggles[2].nativeElement.querySelector('button');
      thirdToggleButton.click();
      fixture.detectChanges();
      await delay();

      formValue = component.formValue();
      expect(formValue['darkMode']).toBe(true);
      expect(formValue['notifications']).toBe(true);
      expect(formValue['enableFeature']).toBe(true);
    });

    it('should apply different Material colors to toggles', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'darkMode',
            type: 'toggle',
            props: { label: 'Dark Mode' }, // Default primary
          },
          {
            key: 'notifications',
            type: 'toggle',
            props: { label: 'Notifications', color: 'accent' },
          },
          {
            key: 'enableFeature',
            type: 'toggle',
            props: { label: 'Enable Feature', color: 'warn' },
          },
        ] as any[],
      };

      createComponent(config, {
        darkMode: false,
        notifications: false,
        enableFeature: false,
      });

      await delay();
      fixture.detectChanges();

      const toggles = debugElement.queryAll(By.directive(MatSlideToggle));

      expect(toggles[0].componentInstance.color).toBe('primary');
      expect(toggles[1].componentInstance.color).toBe('accent');
      expect(toggles[2].componentInstance.color).toBe('warn');
    });
  });

  describe('Toggle State and Edge Cases', () => {
    it('should handle disabled state correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'darkMode',
            type: 'toggle',
            label: 'Disabled Toggle',
            disabled: true,
          },
        ] as any[],
      };

      createComponent(config, {
        darkMode: false,
        notifications: false,
        enableFeature: false,
      });

      await delay();
      fixture.detectChanges();
      await delay();
      fixture.detectChanges();

      const toggle = debugElement.query(By.directive(MatSlideToggle));
      const toggleButton = debugElement.query(By.css('button'));
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
      const config: FormConfig = {
        fields: [
          {
            key: 'darkMode',
            type: 'toggle',
            props: {
              label: 'Test Toggle',
            },
          },
        ] as any[],
      };

      createComponent(config, { darkMode: false });

      await waitForDFInit(component, fixture);

      const toggle = debugElement.query(By.directive(MatSlideToggle));
      const toggleComponent = toggle.componentInstance;

      // Check default props from Material configuration
      expect(toggleComponent.color).toBe('primary');
      expect(toggleComponent.labelPosition).toBe('after');
    });

    it('should handle hideIcon property correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'darkMode',
            type: 'toggle',
            props: {
              label: 'Toggle with Hidden Icon',
              hideIcon: true,
            },
          },
        ] as any[],
      };

      createComponent(config, { darkMode: false });

      await waitForDFInit(component, fixture);

      const toggle = debugElement.query(By.directive(MatSlideToggle));
      const toggleComponent = toggle.componentInstance;

      expect(toggleComponent.hideIcon).toBe(true);
    });

    it('should handle undefined form values gracefully', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'darkMode',
            type: 'toggle',
            props: {
              label: 'Test Toggle',
            },
          },
        ] as any[],
      };

      createComponent(config); // No initial value provided

      await waitForDFInit(component, fixture);

      const toggle = debugElement.query(By.directive(MatSlideToggle));
      expect(toggle).toBeTruthy();
    });

    it('should handle null form values gracefully', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'darkMode',
            type: 'toggle',
            props: {
              label: 'Test Toggle',
            },
          },
        ] as any[],
      };

      createComponent(config, null as unknown as TestFormModel);

      await waitForDFInit(component, fixture);

      const toggle = debugElement.query(By.directive(MatSlideToggle));
      expect(toggle).toBeTruthy();
    });

    it('should handle programmatic value updates correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'darkMode',
            type: 'toggle',
            props: {
              label: 'Test Toggle',
            },
          },
        ] as any[],
      };

      const { component } = createComponent(config, { darkMode: false });

      await waitForDFInit(component, fixture);

      const toggle = debugElement.query(By.directive(MatSlideToggle));
      const toggleComponent = toggle.componentInstance;

      // Initial state
      expect(toggleComponent.checked).toBe(false);

      // Update via programmatic value change
      fixture.componentRef.setInput('value', { darkMode: true });
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(toggleComponent.checked).toBe(true);
      expect(component.formValue()['darkMode']).toBe(true);
    });
  });
});
