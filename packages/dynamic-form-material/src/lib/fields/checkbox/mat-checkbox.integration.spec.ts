import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { DynamicForm, FieldConfig, provideDynamicForm, withConfig } from '@ng-forge/dynamic-form';
import { MATERIAL_FIELD_TYPES } from '../../config/material-field-config';

interface TestFormModel {
  acceptTerms: boolean;
  newsletter: boolean;
  enableNotifications: boolean;
}

describe('MatCheckboxFieldComponent - Dynamic Form Integration', () => {
  let fixture: ComponentFixture<DynamicForm<TestFormModel>>;
  let component: DynamicForm<TestFormModel>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicForm],
      providers: [provideAnimations(), provideDynamicForm(withConfig({ types: MATERIAL_FIELD_TYPES }))],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicForm<TestFormModel>);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  describe('Happy Flow - Full Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'acceptTerms',
          type: 'checkbox',
          props: {
            label: 'Accept Terms and Conditions',
            hint: 'Please read and accept our terms',
            required: true,
            color: 'accent',
            labelPosition: 'before',
            className: 'terms-checkbox',
            indeterminate: false,
            disableRipple: true,
            tabIndex: 1,
          },
        },
      ];

      fixture.componentRef.setInput('fields', fields);
      fixture.componentRef.setInput('value', {
        acceptTerms: false,
        newsletter: false,
        enableNotifications: false,
      });
      fixture.detectChanges();
    });

    it('should render checkbox through dynamic form', () => {
      const checkbox = debugElement.query(By.directive(MatCheckbox));
      const matCheckboxComponent = debugElement.query(By.css('df-mat-checkbox')).componentInstance;
      const containerDiv = debugElement.query(By.css('.terms-checkbox'));
      const hintElement = debugElement.query(By.css('.mat-hint'));

      expect(checkbox).toBeTruthy();
      expect(matCheckboxComponent.label).toBe('Accept Terms and Conditions');
      expect(checkbox.nativeElement.textContent.trim()).toBe('Accept Terms and Conditions');
      expect(matCheckboxComponent.color).toBe('accent');
      expect(matCheckboxComponent.labelPosition).toBe('before');
      expect(containerDiv).toBeTruthy();
      expect(hintElement.nativeElement.textContent.trim()).toBe('Please read and accept our terms');
    });

    it('should handle value changes through dynamic form', async () => {
      const checkbox = debugElement.query(By.directive(MatCheckbox));
      const checkboxComponent = checkbox.componentInstance;

      // Simulate checkbox change
      checkboxComponent.checked = true;
      checkboxComponent.change.emit({ checked: true, source: checkboxComponent });
      fixture.detectChanges();

      // Wait for next tick to allow value propagation
      await new Promise((resolve) => setTimeout(resolve, 0));

      const currentValue = component.currentFormValue();
      expect(currentValue?.acceptTerms).toBe(true);
    });

    it('should reflect form model changes in checkbox', () => {
      const checkbox = debugElement.query(By.directive(MatCheckbox));
      const checkboxComponent = checkbox.componentInstance;

      // Update form model
      fixture.componentRef.setInput('value', {
        acceptTerms: true,
        newsletter: false,
        enableNotifications: false,
      });
      fixture.detectChanges();

      expect(checkboxComponent.checked).toBe(true);
    });

    it('should handle all checkbox-specific properties', () => {
      const checkbox = debugElement.query(By.directive(MatCheckbox));
      const checkboxComponent = checkbox.componentInstance;

      expect(checkboxComponent.indeterminate).toBe(false);
      expect(checkboxComponent.disableRipple).toBe(true);
      expect(checkboxComponent.tabIndex).toBe(1);
    });
  });

  describe('Minimal Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'newsletter',
          type: 'checkbox',
          props: {
            label: 'Subscribe to Newsletter',
          },
        },
      ];

      fixture.componentRef.setInput('fields', fields);
      fixture.componentRef.setInput('value', {
        acceptTerms: false,
        newsletter: false,
        enableNotifications: false,
      });
      fixture.detectChanges();
    });

    it('should render with default values', () => {
      const checkbox = debugElement.query(By.directive(MatCheckbox));
      const checkboxComponent = checkbox.componentInstance;

      expect(checkbox).toBeTruthy();
      expect(checkbox.nativeElement.textContent.trim()).toBe('Subscribe to Newsletter');
      expect(checkboxComponent.color).toBe('primary');
      expect(checkboxComponent.labelPosition).toBe('after');
    });

    it('should not display hint when not provided', () => {
      const hintElement = debugElement.query(By.css('.mat-hint'));
      expect(hintElement).toBeNull();
    });
  });

  describe('Multiple Checkboxes', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'acceptTerms',
          type: 'checkbox',
          props: {
            label: 'Accept Terms',
            required: true,
          },
        },
        {
          key: 'newsletter',
          type: 'checkbox',
          props: {
            label: 'Newsletter',
            color: 'accent',
          },
        },
        {
          key: 'enableNotifications',
          type: 'checkbox',
          props: {
            label: 'Enable Notifications',
            color: 'warn',
          },
        },
      ];

      fixture.componentRef.setInput('fields', fields);
      fixture.componentRef.setInput('value', {
        acceptTerms: false,
        newsletter: true,
        enableNotifications: false,
      });
      fixture.detectChanges();
    });

    it('should render multiple checkboxes correctly', () => {
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));

      expect(checkboxes.length).toBe(3);
      expect(checkboxes[0].nativeElement.textContent.trim()).toBe('Accept Terms');
      expect(checkboxes[1].nativeElement.textContent.trim()).toBe('Newsletter');
      expect(checkboxes[2].nativeElement.textContent.trim()).toBe('Enable Notifications');
    });

    it('should reflect individual checkbox states from form model', () => {
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));

      expect(checkboxes[0].componentInstance.checked).toBe(false);
      expect(checkboxes[1].componentInstance.checked).toBe(true);
      expect(checkboxes[2].componentInstance.checked).toBe(false);
    });

    it('should handle independent checkbox interactions', async () => {
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));

      // Simulate first checkbox change
      checkboxes[0].componentInstance.checked = true;
      checkboxes[0].componentInstance.change.emit({ checked: true, source: checkboxes[0].componentInstance });
      fixture.detectChanges();
      await new Promise((resolve) => setTimeout(resolve, 0));

      let currentValue = component.currentFormValue();
      expect(currentValue).toEqual({
        acceptTerms: true,
        newsletter: true,
        enableNotifications: false,
      });

      // Simulate third checkbox change
      checkboxes[2].componentInstance.checked = true;
      checkboxes[2].componentInstance.change.emit({ checked: true, source: checkboxes[2].componentInstance });
      fixture.detectChanges();
      await new Promise((resolve) => setTimeout(resolve, 0));

      currentValue = component.currentFormValue();
      expect(currentValue).toEqual({
        acceptTerms: true,
        newsletter: true,
        enableNotifications: true,
      });
    });

    it('should apply different colors to checkboxes', () => {
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));

      expect(checkboxes[0].componentInstance.color).toBe('primary');
      expect(checkboxes[1].componentInstance.color).toBe('accent');
      expect(checkboxes[2].componentInstance.color).toBe('warn');
    });
  });

  describe('Disabled State through Dynamic Form', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'acceptTerms',
          type: 'checkbox',
          props: {
            label: 'Disabled Checkbox',
            disabled: true,
          },
        },
      ];

      fixture.componentRef.setInput('fields', fields);
      fixture.componentRef.setInput('value', {
        acceptTerms: false,
        newsletter: false,
        enableNotifications: false,
      });
      fixture.detectChanges();
    });

    it('should render checkbox as disabled', () => {
      const checkbox = debugElement.query(By.directive(MatCheckbox));
      const checkboxComponent = checkbox.componentInstance;

      expect(checkboxComponent.disabled).toBe(true);
    });

    it('should not emit value changes when disabled checkbox is clicked', () => {
      const checkbox = debugElement.query(By.directive(MatCheckbox));
      const checkboxComponent = checkbox.componentInstance;

      // Try to click disabled checkbox - should not change value since it's disabled
      checkbox.nativeElement.click();
      fixture.detectChanges();

      // Verify the checkbox remains disabled and doesn't change
      expect(checkboxComponent.disabled).toBe(true);
      expect(checkboxComponent.checked).toBe(false);
    });
  });

  describe('Default Props from Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'acceptTerms',
          type: 'checkbox',
          props: {
            label: 'Test Checkbox',
          },
        },
      ];

      fixture.componentRef.setInput('fields', fields);
      fixture.componentRef.setInput('value', {
        acceptTerms: false,
        newsletter: false,
        enableNotifications: false,
      });
      fixture.detectChanges();
    });

    it('should apply default props from MATERIAL_FIELD_TYPES configuration', () => {
      const checkbox = debugElement.query(By.directive(MatCheckbox));
      const checkboxComponent = checkbox.componentInstance;

      // Check default props from configuration
      expect(checkboxComponent.color).toBe('primary');
      expect(checkboxComponent.labelPosition).toBe('after');
    });
  });

  describe('Indeterminate State', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'acceptTerms',
          type: 'checkbox',
          props: {
            label: 'Indeterminate Checkbox',
            indeterminate: true,
          },
        },
      ];

      fixture.componentRef.setInput('fields', fields);
      fixture.componentRef.setInput('value', {
        acceptTerms: false,
        newsletter: false,
        enableNotifications: false,
      });
      fixture.detectChanges();
    });

    it('should render checkbox in indeterminate state', () => {
      const checkbox = debugElement.query(By.directive(MatCheckbox));
      const checkboxComponent = checkbox.componentInstance;

      expect(checkboxComponent.indeterminate).toBe(true);
    });
  });

  describe('Form Value Binding Edge Cases', () => {
    it('should handle undefined form values', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'acceptTerms',
          type: 'checkbox',
          props: {
            label: 'Test Checkbox',
          },
        },
      ];

      fixture.componentRef.setInput('fields', fields);
      // Don't set initial value
      fixture.detectChanges();

      const checkbox = debugElement.query(By.directive(MatCheckbox));
      expect(checkbox).toBeTruthy();
    });

    it('should handle null form values', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'acceptTerms',
          type: 'checkbox',
          props: {
            label: 'Test Checkbox',
          },
        },
      ];

      fixture.componentRef.setInput('fields', fields);
      fixture.componentRef.setInput('value', null as any);
      fixture.detectChanges();

      const checkbox = debugElement.query(By.directive(MatCheckbox));
      expect(checkbox).toBeTruthy();
    });

    it('should handle deep form value updates', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'acceptTerms',
          type: 'checkbox',
          props: {
            label: 'Test Checkbox',
          },
        },
      ];

      fixture.componentRef.setInput('fields', fields);
      fixture.componentRef.setInput('value', {
        acceptTerms: false,
        newsletter: false,
        enableNotifications: false,
      });
      fixture.detectChanges();

      const checkbox = debugElement.query(By.directive(MatCheckbox));
      const checkboxComponent = checkbox.componentInstance;

      // Update via programmatic value change
      fixture.componentRef.setInput('value', {
        acceptTerms: true,
        newsletter: false,
        enableNotifications: false,
      });
      fixture.detectChanges();

      expect(checkboxComponent.checked).toBe(true);
    });
  });

  describe('Field Configuration Validation', () => {
    it('should handle missing key gracefully', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          type: 'checkbox',
          props: {
            label: 'Checkbox without key',
          },
        },
      ];

      expect(() => {
        fixture.componentRef.setInput('fields', fields);
        fixture.detectChanges();
      }).not.toThrow();

      const checkbox = debugElement.query(By.directive(MatCheckbox));
      expect(checkbox).toBeTruthy();
    });

    it('should auto-generate field IDs', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'acceptTerms',
          type: 'checkbox',
          props: {
            label: 'Test Checkbox',
          },
        },
      ];

      fixture.componentRef.setInput('fields', fields);
      fixture.detectChanges();

      // Field should have auto-generated ID
      expect(component.processedFields()[0].id).toBeDefined();
      expect(component.processedFields()[0].id).toContain('dynamic-field');
    });
  });
});
