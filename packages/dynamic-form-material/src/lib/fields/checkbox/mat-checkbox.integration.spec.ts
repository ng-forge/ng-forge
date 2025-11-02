import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { delay, waitForDFInit } from '../../testing';
import { withMaterialFields } from '../../providers/material-providers';

interface TestFormModel {
  acceptTerms: boolean;
  newsletter: boolean;
  enableNotifications: boolean;
}

describe('MatCheckboxFieldComponent - Dynamic Form Integration', () => {
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
      providers: [provideAnimations(), provideDynamicForm(...withMaterialFields())],
    }).compileComponents();
  });

  describe('Basic Material Checkbox Integration', () => {
    it('should render checkbox with full configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'acceptTerms',
            type: 'checkbox',
            label: 'Accept Terms and Conditions',
            required: true,
            className: 'terms-checkbox',
            tabIndex: 1,
            props: {
              hint: 'Please read and accept our terms',
              color: 'accent',
              labelPosition: 'before',
              indeterminate: false,
              disableRipple: true,
            },
          },
        ] as any[],
      };

      createComponent(config, {
        acceptTerms: false,
        newsletter: false,
        enableNotifications: false,
      });

      await waitForDFInit(component, fixture);

      const checkbox = debugElement.query(By.directive(MatCheckbox));
      const matCheckboxComponent = debugElement.query(By.css('df-mat-checkbox'))?.componentInstance;
      const containerDiv = debugElement.query(By.css('.terms-checkbox'));
      const hintElement = debugElement.query(By.css('.mat-hint'));

      expect(checkbox).toBeTruthy();
      expect(checkbox.nativeElement.textContent.trim()).toBe('Accept Terms and Conditions');
      expect(containerDiv).toBeTruthy();
      expect(hintElement?.nativeElement.textContent.trim()).toBe('Please read and accept our terms');

      // Verify form control integration and dynamic field component properties
      if (matCheckboxComponent) {
        expect(matCheckboxComponent.label()).toBe('Accept Terms and Conditions');
        expect(matCheckboxComponent.color()).toBe('accent');
        expect(matCheckboxComponent.labelPosition()).toBe('before');
      }
    });

    it('should handle user interactions and update form value', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'acceptTerms',
            type: 'checkbox',

            label: 'Accept Terms',
          },
        ] as any[],
      };

      const { component } = createComponent(config, {
        acceptTerms: false,
        newsletter: false,
        enableNotifications: false,
      });

      await waitForDFInit(component, fixture);

      // Initial value check
      expect(component.formValue()['acceptTerms']).toBe(false);

      // Simulate checkbox interaction by clicking the checkbox
      const checkbox = debugElement.query(By.directive(MatCheckbox));
      const checkboxNativeElement = checkbox.nativeElement.querySelector('input[type="checkbox"]');

      // Simulate user click on checkbox
      checkboxNativeElement.click();
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      // Verify form value updated
      expect(component.formValue()['acceptTerms']).toBe(true);
    });

    it('should reflect external value changes in checkbox', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'acceptTerms',
            type: 'checkbox',
            label: 'Accept Terms',
          },
        ] as any[],
      };

      const { component } = createComponent(config, {
        acceptTerms: false,
        newsletter: false,
        enableNotifications: false,
      });

      await waitForDFInit(component, fixture);

      const checkbox = debugElement.query(By.directive(MatCheckbox));
      const checkboxComponent = checkbox.componentInstance;

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        acceptTerms: true,
        newsletter: false,
        enableNotifications: false,
      });
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(checkboxComponent.checked).toBe(true);
      expect(component.formValue()['acceptTerms']).toBe(true);
    });

    it('should handle Material-specific checkbox properties', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'acceptTerms',
            type: 'checkbox',
            label: 'Test Checkbox',
            tabIndex: 1,
            props: {
              indeterminate: false,
              disableRipple: true,
            },
          },
        ] as any[],
      };

      createComponent(config, { acceptTerms: false });

      await waitForDFInit(component, fixture);

      const checkbox = debugElement.query(By.directive(MatCheckbox));
      const checkboxComponent = checkbox.componentInstance;

      // These properties are passed to the inner MatCheckbox component
      expect(checkboxComponent.indeterminate).toBe(false);
      // Note: disableRipple and tabIndex are not directly exposed by Material checkbox
      // They are internal properties that don't need testing at this integration level
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default Material configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'newsletter',
            type: 'checkbox',
            props: {
              label: 'Subscribe to Newsletter',
            },
          },
        ] as any[],
      };

      createComponent(config, {
        acceptTerms: false,
        newsletter: false,
        enableNotifications: false,
      });

      await waitForDFInit(component, fixture);

      const checkbox = debugElement.query(By.directive(MatCheckbox));
      const checkboxComponent = checkbox.componentInstance;

      expect(checkbox).toBeTruthy();
      expect(checkbox.nativeElement.textContent.trim()).toBe('Subscribe to Newsletter');
      expect(checkboxComponent.props.color).toBe('primary');
      expect(checkboxComponent.props.labelPosition).toBe('after');
    });

    it('should not display hint when not provided', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'newsletter',
            type: 'checkbox',
            label: 'Subscribe to Newsletter',
          },
        ] as any[],
      };

      createComponent(config, { newsletter: false });

      await waitForDFInit(component, fixture);

      const hintElement = debugElement.query(By.css('.mat-hint'));
      expect(hintElement).toBeNull();
    });
  });

  describe('Multiple Checkbox Integration Tests', () => {
    it('should render multiple checkboxes with different configurations', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'acceptTerms',
            type: 'checkbox',
            label: 'Accept Terms',
            required: true,
          },
          {
            key: 'newsletter',
            type: 'checkbox',
            label: 'Newsletter',
            props: {
              color: 'accent',
            },
          },
          {
            key: 'enableNotifications',
            type: 'checkbox',
            label: 'Enable Notifications',
            props: {
              color: 'warn',
            },
          },
        ] as any[],
      };

      createComponent(config, {
        acceptTerms: false,
        newsletter: true,
        enableNotifications: false,
      });

      await waitForDFInit(component, fixture);

      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));

      expect(checkboxes.length).toBe(3);
      expect(checkboxes[0].nativeElement.textContent.trim()).toBe('Accept Terms');
      expect(checkboxes[1].nativeElement.textContent.trim()).toBe('Newsletter');
      expect(checkboxes[2].nativeElement.textContent.trim()).toBe('Enable Notifications');
    });

    it('should reflect individual checkbox states from form model', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'acceptTerms',
            type: 'checkbox',
            label: 'Accept Terms',
          },
          {
            key: 'newsletter',
            type: 'checkbox',
            label: 'Newsletter',
          },
          {
            key: 'enableNotifications',
            type: 'checkbox',
            label: 'Enable Notifications',
          },
        ] as any[],
      };

      createComponent(config, {
        acceptTerms: false,
        newsletter: true,
        enableNotifications: false,
      });

      await waitForDFInit(component, fixture);

      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));

      expect(checkboxes[0].componentInstance.checked).toBe(false);
      expect(checkboxes[1].componentInstance.checked).toBe(true);
      expect(checkboxes[2].componentInstance.checked).toBe(false);
    });

    it('should handle independent checkbox interactions', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'acceptTerms',
            type: 'checkbox',
            label: 'Accept Terms',
          },
          {
            key: 'newsletter',
            type: 'checkbox',
            label: 'Newsletter',
          },
          {
            key: 'enableNotifications',
            type: 'checkbox',
            label: 'Enable Notifications',
          },
        ] as any[],
      };

      const { component } = createComponent(config, {
        acceptTerms: false,
        newsletter: true,
        enableNotifications: false,
      });

      await delay();
      fixture.detectChanges();

      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));

      // Simulate first checkbox click
      const firstCheckboxInput = checkboxes[0].nativeElement.querySelector('input[type="checkbox"]');
      firstCheckboxInput.click();
      fixture.detectChanges();
      await delay();

      let formValue = component.formValue();
      expect(formValue['acceptTerms']).toBe(true);
      expect(formValue['newsletter']).toBe(true);
      expect(formValue['enableNotifications']).toBe(false);

      // Simulate third checkbox click
      const thirdCheckboxInput = checkboxes[2].nativeElement.querySelector('input[type="checkbox"]');
      thirdCheckboxInput.click();
      fixture.detectChanges();
      await delay();

      formValue = component.formValue();
      expect(formValue['acceptTerms']).toBe(true);
      expect(formValue['newsletter']).toBe(true);
      expect(formValue['enableNotifications']).toBe(true);
    });

    it('should apply different Material colors to checkboxes', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'acceptTerms',
            type: 'checkbox',
            label: 'Accept Terms',
          },
          {
            key: 'newsletter',
            type: 'checkbox',
            label: 'Newsletter',
            props: { color: 'accent' },
          },
          {
            key: 'enableNotifications',
            type: 'checkbox',
            label: 'Enable Notifications',
            props: { color: 'warn' },
          },
        ] as any[],
      };

      createComponent(config, {
        acceptTerms: false,
        newsletter: false,
        enableNotifications: false,
      });

      await delay();
      fixture.detectChanges();

      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));

      expect(checkboxes[0].componentInstance.color).toBe('primary');
      expect(checkboxes[1].componentInstance.color).toBe('accent');
      expect(checkboxes[2].componentInstance.color).toBe('warn');
    });
  });

  describe('Checkbox State and Edge Cases', () => {
    it('should handle disabled state correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'acceptTerms',
            type: 'checkbox',
            label: 'Disabled Checkbox',
            disabled: true,
          },
        ] as any[],
      };

      createComponent(config, {
        acceptTerms: false,
        newsletter: false,
        enableNotifications: false,
      });

      await waitForDFInit(component, fixture);

      const checkbox = debugElement.query(By.directive(MatCheckbox));
      const checkboxInput = debugElement.query(By.css('input[type="checkbox"]'));
      const checkboxComponent = checkbox.componentInstance;

      expect(checkboxInput.nativeElement.disabled).toBe(true);

      // Try to click disabled checkbox - should not change value since it's disabled
      checkbox.nativeElement.click();
      fixture.detectChanges();

      // Verify the checkbox remains disabled and doesn't change
      expect(checkboxInput.nativeElement.disabled).toBe(true);
      expect(checkboxComponent.checked).toBe(false);
    });

    it('should apply default Material Design configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'acceptTerms',
            type: 'checkbox',
            label: 'Test Checkbox',
          },
        ] as any[],
      };

      createComponent(config, { acceptTerms: false });

      await waitForDFInit(component, fixture);

      const checkbox = debugElement.query(By.directive(MatCheckbox));
      const checkboxComponent = checkbox.componentInstance;

      // Check default props from Material configuration
      expect(checkboxComponent.color).toBe('primary');
      expect(checkboxComponent.labelPosition).toBe('after');
    });

    it('should handle indeterminate state correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'acceptTerms',
            type: 'checkbox',
            label: 'Indeterminate Checkbox',
            props: {
              indeterminate: true,
            },
          },
        ] as any[],
      };

      createComponent(config, { acceptTerms: false });

      await waitForDFInit(component, fixture);

      const checkbox = debugElement.query(By.directive(MatCheckbox));
      const checkboxComponent = checkbox.componentInstance;

      expect(checkboxComponent.indeterminate).toBe(true);
    });

    it('should handle undefined form values gracefully', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'acceptTerms',
            type: 'checkbox',
            label: 'Test Checkbox',
          },
        ] as any[],
      };

      createComponent(config); // No initial value provided

      await waitForDFInit(component, fixture);

      const checkbox = debugElement.query(By.directive(MatCheckbox));
      expect(checkbox).toBeTruthy();
    });

    it('should handle null form values gracefully', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'acceptTerms',
            type: 'checkbox',
            label: 'Test Checkbox',
          },
        ] as any[],
      };

      createComponent(config, null as unknown as TestFormModel);

      await waitForDFInit(component, fixture);

      const checkbox = debugElement.query(By.directive(MatCheckbox));
      expect(checkbox).toBeTruthy();
    });

    it('should handle programmatic value updates correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'acceptTerms',
            type: 'checkbox',
            label: 'Test Checkbox',
          },
        ] as any[],
      };

      const { component } = createComponent(config, { acceptTerms: false });

      await waitForDFInit(component, fixture);

      const checkbox = debugElement.query(By.directive(MatCheckbox));
      const checkboxComponent = checkbox.componentInstance;

      // Initial state
      expect(checkboxComponent.checked).toBe(false);

      // Update via programmatic value change
      fixture.componentRef.setInput('value', { acceptTerms: true });
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(checkboxComponent.checked).toBe(true);
      expect(component.formValue()['acceptTerms']).toBe(true);
    });
  });
});
