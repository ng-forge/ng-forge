import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterial } from '../../providers/material-providers';
import { delay, waitForDynamicFormInitialized } from '../../testing/delay';

interface TestFormModel {
  enabled: boolean;
  notifications: boolean;
  newsletter: boolean;
  terms: boolean;
  privacy: boolean;
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
            key: 'notifications',
            type: 'toggle',
            label: 'Enable Notifications',
            props: {
              hint: 'Receive email notifications',
              required: true,
              color: 'accent',
              labelPosition: 'before',
              hideIcon: true,
              disableRipple: true,
              className: 'notification-toggle',
              tabIndex: 1,
            },
          },
        ],
      };

      createComponent(config, {
        enabled: false,
        notifications: false,
        newsletter: false,
        terms: false,
        privacy: false,
      });

      await waitForDynamicFormInitialized(component, fixture);

      const toggle = debugElement.query(By.directive(MatSlideToggle));
      const hint = debugElement.query(By.css('.mat-hint'));
      const container = debugElement.query(By.css('.toggle-container'));

      expect(toggle).toBeTruthy();
      expect(toggle.nativeElement.getAttribute('ng-reflect-color')).toBe('accent');
      expect(toggle.nativeElement.getAttribute('ng-reflect-label-position')).toBe('before');
      expect(toggle.nativeElement.getAttribute('ng-reflect-hide-icon')).toBe('true');
      expect(toggle.nativeElement.getAttribute('ng-reflect-disable-ripple')).toBe('true');
      expect(toggle.nativeElement.getAttribute('tabindex')).toBe('1');
      expect(toggle.nativeElement.textContent.trim()).toBe('Enable Notifications');
      expect(hint.nativeElement.textContent.trim()).toBe('Receive email notifications');
      expect(container.nativeElement.closest('div').className).toContain('notification-toggle');
    });

    it('should handle user toggle and update form value', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'enabled',
            type: 'toggle',
            label: 'Enable Feature',
          },
        ],
      };

      const { component } = createComponent(config, {
        enabled: false,
        notifications: false,
        newsletter: false,
        terms: false,
        privacy: false,
      });

      await waitForDynamicFormInitialized(component, fixture);

      // Initial value check
      expect(component.formValue().enabled).toBe(false);

      // Simulate user clicking toggle
      const toggle = debugElement.query(By.directive(MatSlideToggle));
      const toggleInput = toggle.query(By.css('input[type="checkbox"]'));
      
      toggleInput.nativeElement.click();
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      // Verify form value updated
      expect(component.formValue().enabled).toBe(true);
    });

    it('should reflect external value changes in toggle field', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'enabled',
            type: 'toggle',
            label: 'Enable Feature',
          },
        ],
      };

      const { component } = createComponent(config, {
        enabled: false,
        notifications: false,
        newsletter: false,
        terms: false,
        privacy: false,
      });

      await waitForDynamicFormInitialized(component, fixture);

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        enabled: true,
        notifications: false,
        newsletter: false,
        terms: false,
        privacy: false,
      });
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(component.formValue().enabled).toBe(true);
    });
  });

  describe('Different Toggle Configurations Integration', () => {
    it('should render various toggle configurations with correct attributes', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'notifications',
            type: 'toggle',
            label: 'Notifications',
            props: { color: 'primary' },
          },
          {
            key: 'newsletter',
            type: 'toggle',
            label: 'Newsletter',
            props: { color: 'accent' },
          },
          {
            key: 'terms',
            type: 'toggle',
            label: 'Accept Terms',
            props: { color: 'warn' },
          },
          {
            key: 'privacy',
            type: 'toggle',
            label: 'Privacy Policy',
            props: { labelPosition: 'before' },
          },
        ],
      };

      const { component } = createComponent(config, {
        notifications: false,
        newsletter: false,
        terms: false,
        privacy: false,
      });

      await waitForDynamicFormInitialized(component, fixture);

      const toggles = debugElement.queryAll(By.directive(MatSlideToggle));

      expect(toggles.length).toBe(4);
      expect(toggles[0].nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      expect(toggles[1].nativeElement.getAttribute('ng-reflect-color')).toBe('accent');
      expect(toggles[2].nativeElement.getAttribute('ng-reflect-color')).toBe('warn');
      expect(toggles[3].nativeElement.getAttribute('ng-reflect-label-position')).toBe('before');
    });

    it('should apply default configuration when props not provided', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'enabled',
            type: 'toggle',
            label: 'Default Toggle',
          },
        ],
      };

      createComponent(config, { enabled: false });

      await waitForDynamicFormInitialized(component, fixture);

      const toggle = debugElement.query(By.directive(MatSlideToggle));
      expect(toggle.nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      expect(toggle.nativeElement.getAttribute('ng-reflect-label-position')).toBe('after');
      expect(toggle.nativeElement.getAttribute('ng-reflect-hide-icon')).toBe('false');
      expect(toggle.nativeElement.getAttribute('ng-reflect-disable-ripple')).toBe('false');
    });

    it('should handle boolean value changes correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'enabled',
            type: 'toggle',
            label: 'Enable Feature',
          },
        ],
      };

      const { component } = createComponent(config, { enabled: false });

      await waitForDynamicFormInitialized(component, fixture);

      // Initial value
      expect(component.formValue().enabled).toBe(false);

      // Simulate toggle click (false to true)
      const toggle = debugElement.query(By.directive(MatSlideToggle));
      const toggleInput = toggle.query(By.css('input[type="checkbox"]'));
      
      toggleInput.nativeElement.click();
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(component.formValue().enabled).toBe(true);

      // Simulate another toggle click (true to false)
      toggleInput.nativeElement.click();
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(component.formValue().enabled).toBe(false);
    });

    it('should reflect external value changes for all toggle configurations', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'notifications',
            type: 'toggle',
            label: 'Notifications',
          },
          {
            key: 'newsletter',
            type: 'toggle',
            label: 'Newsletter',
          },
          {
            key: 'terms',
            type: 'toggle',
            label: 'Terms',
          },
          {
            key: 'privacy',
            type: 'toggle',
            label: 'Privacy',
          },
        ],
      };

      const { component } = createComponent(config, {
        notifications: false,
        newsletter: false,
        terms: false,
        privacy: false,
      });

      await waitForDynamicFormInitialized(component, fixture);

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        notifications: true,
        newsletter: false,
        terms: true,
        privacy: false,
      });
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      const formValue = component.formValue();
      expect(formValue.notifications).toBe(true);
      expect(formValue.newsletter).toBe(false);
      expect(formValue.terms).toBe(true);
      expect(formValue.privacy).toBe(false);
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default Material configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'enabled',
            type: 'toggle',
            label: 'Toggle',
          },
        ],
      };

      createComponent(config, { enabled: false });

      await delay();
      fixture.detectChanges();

      const toggle = debugElement.query(By.directive(MatSlideToggle));
      const container = debugElement.query(By.css('.toggle-container'));

      expect(toggle.nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      expect(container).toBeTruthy();
    });

    it('should not display hint when not provided', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'enabled',
            type: 'toggle',
            label: 'Toggle',
          },
        ],
      };

      createComponent(config, { enabled: false });

      await delay();
      fixture.detectChanges();

      const hint = debugElement.query(By.css('.mat-hint'));
      expect(hint).toBeNull();
    });
  });

  describe('Field State and Configuration Tests', () => {
    it('should handle disabled state correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'enabled',
            type: 'toggle',
            label: 'Disabled Toggle',
            disabled: true,
          },
        ],
      };

      createComponent(config, { enabled: false });

      await delay();
      fixture.detectChanges();
      await delay();
      fixture.detectChanges();

      const toggle = debugElement.query(By.directive(MatSlideToggle));
      expect(toggle.nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
    });

    it('should apply different Material color themes', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'primary',
            type: 'toggle',
            label: 'Primary Toggle',
            props: {
              color: 'primary',
            },
          },
          {
            key: 'accent',
            type: 'toggle',
            label: 'Accent Toggle',
            props: {
              color: 'accent',
            },
          },
          {
            key: 'warn',
            type: 'toggle',
            label: 'Warn Toggle',
            props: {
              color: 'warn',
            },
          },
        ],
      };

      createComponent(config, { primary: false, accent: false, warn: false });

      await delay();
      fixture.detectChanges();

      const toggles = debugElement.queryAll(By.directive(MatSlideToggle));
      expect(toggles[0].nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      expect(toggles[1].nativeElement.getAttribute('ng-reflect-color')).toBe('accent');
      expect(toggles[2].nativeElement.getAttribute('ng-reflect-color')).toBe('warn');
    });

    it('should handle multiple toggles with independent value changes', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'notifications',
            type: 'toggle',
            label: 'Notifications',
          },
          {
            key: 'newsletter',
            type: 'toggle',
            label: 'Newsletter',
          },
        ],
      };

      const { component } = createComponent(config, {
        notifications: false,
        newsletter: true,
      });

      await delay();
      fixture.detectChanges();

      // Initial values
      expect(component.formValue().notifications).toBe(false);
      expect(component.formValue().newsletter).toBe(true);

      const toggles = debugElement.queryAll(By.directive(MatSlideToggle));

      // Change first toggle
      const firstToggleInput = toggles[0].query(By.css('input[type="checkbox"]'));
      firstToggleInput.nativeElement.click();
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      let formValue = component.formValue();
      expect(formValue.notifications).toBe(true);
      expect(formValue.newsletter).toBe(true);

      // Change second toggle
      const secondToggleInput = toggles[1].query(By.css('input[type="checkbox"]'));
      secondToggleInput.nativeElement.click();
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      formValue = component.formValue();
      expect(formValue.notifications).toBe(true);
      expect(formValue.newsletter).toBe(false);
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined form values gracefully', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'enabled',
            type: 'toggle',
            label: 'Toggle',
          },
        ],
      };

      createComponent(config); // No initial value provided

      await delay();
      fixture.detectChanges();

      const toggle = debugElement.query(By.directive(MatSlideToggle));
      expect(toggle).toBeTruthy();
    });

    it('should handle null form values gracefully', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'enabled',
            type: 'toggle',
            label: 'Toggle',
          },
        ],
      };

      createComponent(config, null as unknown as TestFormModel);

      await delay();
      fixture.detectChanges();

      const toggle = debugElement.query(By.directive(MatSlideToggle));
      expect(toggle).toBeTruthy();
    });

    it('should handle false values correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'enabled',
            type: 'toggle',
            label: 'Toggle',
          },
        ],
      };

      const { component } = createComponent(config, { enabled: false });

      await delay();
      fixture.detectChanges();

      expect(component.formValue().enabled).toBe(false);
    });

    it('should apply default Material Design configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'enabled',
            type: 'toggle',
            label: 'Test Toggle',
          },
        ],
      };

      createComponent(config, { enabled: false });

      await delay();
      fixture.detectChanges();

      const toggle = debugElement.query(By.directive(MatSlideToggle));
      const container = debugElement.query(By.css('.toggle-container'));

      // Verify default Material configuration is applied
      expect(toggle.nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      expect(toggle.nativeElement.getAttribute('ng-reflect-label-position')).toBe('after');
      expect(container).toBeTruthy();
    });

    it('should handle rapid toggle changes correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'enabled',
            type: 'toggle',
            label: 'Toggle',
          },
        ],
      };

      const { component } = createComponent(config, { enabled: false });

      await delay();
      fixture.detectChanges();

      const toggle = debugElement.query(By.directive(MatSlideToggle));
      const toggleInput = toggle.query(By.css('input[type="checkbox"]'));

      // Simulate rapid clicking
      for (let i = 0; i < 5; i++) {
        toggleInput.nativeElement.click();
        fixture.detectChanges();
      }

      await delay();
      fixture.detectChanges();

      // Should have the final toggle state (odd number of clicks = true)
      expect(component.formValue().enabled).toBe(true);
    });

    it('should handle label position changes correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'beforeLabel',
            type: 'toggle',
            label: 'Before Label',
            props: { labelPosition: 'before' },
          },
          {
            key: 'afterLabel',
            type: 'toggle',
            label: 'After Label',
            props: { labelPosition: 'after' },
          },
        ],
      };

      createComponent(config, { beforeLabel: false, afterLabel: false });

      await delay();
      fixture.detectChanges();

      const toggles = debugElement.queryAll(By.directive(MatSlideToggle));
      expect(toggles[0].nativeElement.getAttribute('ng-reflect-label-position')).toBe('before');
      expect(toggles[1].nativeElement.getAttribute('ng-reflect-label-position')).toBe('after');
    });

    it('should handle required field validation', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'terms',
            type: 'toggle',
            label: 'Accept Terms',
            props: { required: true },
          },
        ],
      };

      createComponent(config, { terms: false });

      await delay();
      fixture.detectChanges();

      const toggle = debugElement.query(By.directive(MatSlideToggle));
      expect(toggle.nativeElement.getAttribute('ng-reflect-required')).toBe('true');
    });
  });
});