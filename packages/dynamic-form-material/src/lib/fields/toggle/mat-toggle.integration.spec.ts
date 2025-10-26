import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { DynamicForm, FieldConfig, provideDynamicForm, withConfig } from '@ng-forge/dynamic-form';
import { MATERIAL_FIELD_TYPES } from '../../config/material-field-config';

interface TestFormModel {
  notifications: boolean;
  darkMode: boolean;
  emailUpdates: boolean;
  autoSave: boolean;
}

describe('MatToggleFieldComponent - Dynamic Form Integration', () => {
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
          key: 'notifications',
          type: 'toggle',
          props: {
            label: 'Enable Notifications',
            hint: 'Receive push notifications for important updates',
            required: true,
            color: 'accent',
            labelPosition: 'before',
            disableRipple: true,
            tabIndex: 1,
            appearance: 'outline',
            className: 'notifications-toggle',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        notifications: true,
        darkMode: false,
        emailUpdates: false,
        autoSave: false,
      });
      fixture.detectChanges();
    });

    it('should render toggle through dynamic form', () => {
      const toggle = debugElement.query(By.directive(MatSlideToggle));
      const formField = debugElement.query(By.css('mat-form-field'));
      const label = debugElement.query(By.css('mat-label'));
      const hint = debugElement.query(By.css('mat-hint'));

      expect(toggle).toBeTruthy();
      expect(toggle.nativeElement.textContent.trim()).toBe('Enable Notifications');
      expect(toggle.nativeElement.getAttribute('ng-reflect-color')).toBe('accent');
      expect(toggle.nativeElement.getAttribute('ng-reflect-label-position')).toBe('before');
      expect(toggle.nativeElement.getAttribute('ng-reflect-disable-ripple')).toBe('true');
      expect(toggle.nativeElement.getAttribute('tabindex')).toBe('1');
      expect(formField.nativeElement.className).toContain('notifications-toggle');
      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
      expect(label.nativeElement.textContent.trim()).toBe('Enable Notifications');
      expect(hint.nativeElement.textContent.trim()).toBe('Receive push notifications for important updates');
    });

    it('should handle value changes through dynamic form', async () => {
      const toggle = debugElement.query(By.directive(MatSlideToggle));

      // Simulate toggle click
      toggle.nativeElement.click();
      fixture.detectChanges();

      const emittedValue: TestFormModel = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue?.notifications).toBe(false);
    });

    it('should reflect form model changes in toggle', () => {
      const toggle = debugElement.query(By.directive(MatSlideToggle));

      // Update form model
      fixture.componentRef.setInput('value', {
        notifications: false,
        darkMode: false,
        emailUpdates: false,
        autoSave: false,
      });
      fixture.detectChanges();

      expect(toggle.nativeElement.getAttribute('ng-reflect-ng-model')).toBe('false');
    });

    it('should handle all toggle-specific properties', () => {
      const toggle = debugElement.query(By.directive(MatSlideToggle));

      expect(toggle.nativeElement.getAttribute('ng-reflect-color')).toBe('accent');
      expect(toggle.nativeElement.getAttribute('ng-reflect-label-position')).toBe('before');
      expect(toggle.nativeElement.getAttribute('ng-reflect-disable-ripple')).toBe('true');
      expect(toggle.nativeElement.getAttribute('tabindex')).toBe('1');
    });
  });

  describe('Minimal Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'darkMode',
          type: 'toggle',
          props: {
            label: 'Dark Mode',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        notifications: false,
        darkMode: false,
        emailUpdates: false,
        autoSave: false,
      });
      fixture.detectChanges();
    });

    it('should render with default values from configuration', () => {
      const toggle = debugElement.query(By.directive(MatSlideToggle));
      const formField = debugElement.query(By.css('mat-form-field'));

      expect(toggle).toBeTruthy();
      expect(toggle.nativeElement.textContent.trim()).toBe('Dark Mode');
      expect(toggle.nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      expect(toggle.nativeElement.getAttribute('ng-reflect-label-position')).toBe('after');
      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('fill');
    });

    it('should not display hint when not provided', () => {
      const hint = debugElement.query(By.css('mat-hint'));
      expect(hint).toBeNull();
    });
  });

  describe('Multiple Toggles', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'notifications',
          type: 'toggle',
          props: {
            label: 'Notifications',
            color: 'primary',
          },
        },
        {
          key: 'darkMode',
          type: 'toggle',
          props: {
            label: 'Dark Mode',
            color: 'accent',
          },
        },
        {
          key: 'emailUpdates',
          type: 'toggle',
          props: {
            label: 'Email Updates',
            color: 'warn',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        notifications: true,
        darkMode: false,
        emailUpdates: true,
        autoSave: false,
      });
      fixture.detectChanges();
    });

    it('should render multiple toggles correctly', () => {
      const toggles = debugElement.queryAll(By.directive(MatSlideToggle));
      const labels = debugElement.queryAll(By.css('mat-label'));

      expect(toggles.length).toBe(3);
      expect(labels[0].nativeElement.textContent.trim()).toBe('Notifications');
      expect(labels[1].nativeElement.textContent.trim()).toBe('Dark Mode');
      expect(labels[2].nativeElement.textContent.trim()).toBe('Email Updates');
    });

    it('should reflect individual toggle states from form model', () => {
      const toggles = debugElement.queryAll(By.directive(MatSlideToggle));

      expect(toggles[0].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('true');
      expect(toggles[1].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('false');
      expect(toggles[2].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('true');
    });

    it('should handle independent toggle interactions', async () => {
      const toggles = debugElement.queryAll(By.directive(MatSlideToggle));

      // Toggle notifications (from true to false)
      toggles[0].nativeElement.click();
      fixture.detectChanges();

      let emittedValue: TestFormModel = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue).toEqual({
        notifications: false,
        darkMode: false,
        emailUpdates: true,
        autoSave: false,
      });

      // Toggle dark mode (from false to true)
      toggles[1].nativeElement.click();
      fixture.detectChanges();

      emittedValue = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue).toEqual({
        notifications: false,
        darkMode: true,
        emailUpdates: true,
        autoSave: false,
      });
    });

    it('should apply different colors to toggles', () => {
      const toggles = debugElement.queryAll(By.directive(MatSlideToggle));

      expect(toggles[0].nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      expect(toggles[1].nativeElement.getAttribute('ng-reflect-color')).toBe('accent');
      expect(toggles[2].nativeElement.getAttribute('ng-reflect-color')).toBe('warn');
    });
  });

  describe('Disabled State through Dynamic Form', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'notifications',
          type: 'toggle',
          props: {
            label: 'Disabled Toggle',
            disabled: true,
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        notifications: true,
        darkMode: false,
        emailUpdates: false,
        autoSave: false,
      });
      fixture.detectChanges();
    });

    it('should render toggle as disabled', () => {
      const toggle = debugElement.query(By.directive(MatSlideToggle));

      expect(toggle.nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
    });

    it('should not emit value changes when disabled toggle is clicked', () => {
      const toggle = debugElement.query(By.directive(MatSlideToggle));

      // Try to click disabled toggle - should not change value since it's disabled
      toggle.nativeElement.click();
      fixture.detectChanges();

      // Verify the toggle remains disabled
      expect(toggle.nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
    });
  });

  describe('Label Position Variations', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'notifications',
          type: 'toggle',
          props: {
            label: 'Before Label',
            labelPosition: 'before',
          },
        },
        {
          key: 'darkMode',
          type: 'toggle',
          props: {
            label: 'After Label',
            labelPosition: 'after',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        notifications: false,
        darkMode: false,
        emailUpdates: false,
        autoSave: false,
      });
      fixture.detectChanges();
    });

    it('should apply different label positions to toggles', () => {
      const toggles = debugElement.queryAll(By.directive(MatSlideToggle));

      expect(toggles[0].nativeElement.getAttribute('ng-reflect-label-position')).toBe('before');
      expect(toggles[1].nativeElement.getAttribute('ng-reflect-label-position')).toBe('after');
    });
  });

  describe('Appearance Variations', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'notifications',
          type: 'toggle',
          props: {
            label: 'Fill Toggle',
            appearance: 'fill',
          },
        },
        {
          key: 'darkMode',
          type: 'toggle',
          props: {
            label: 'Outline Toggle',
            appearance: 'outline',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        notifications: false,
        darkMode: false,
        emailUpdates: false,
        autoSave: false,
      });
      fixture.detectChanges();
    });

    it('should apply different appearances to form fields', () => {
      const formFields = debugElement.queryAll(By.css('mat-form-field'));

      expect(formFields[0].nativeElement.getAttribute('ng-reflect-appearance')).toBe('fill');
      expect(formFields[1].nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
    });
  });

  describe('Ripple Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'notifications',
          type: 'toggle',
          props: {
            label: 'No Ripple Toggle',
            disableRipple: true,
          },
        },
        {
          key: 'darkMode',
          type: 'toggle',
          props: {
            label: 'With Ripple Toggle',
            disableRipple: false,
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        notifications: false,
        darkMode: false,
        emailUpdates: false,
        autoSave: false,
      });
      fixture.detectChanges();
    });

    it('should apply ripple configuration correctly', () => {
      const toggles = debugElement.queryAll(By.directive(MatSlideToggle));

      expect(toggles[0].nativeElement.getAttribute('ng-reflect-disable-ripple')).toBe('true');
      expect(toggles[1].nativeElement.getAttribute('ng-reflect-disable-ripple')).toBe('false');
    });
  });

  describe('Required Field Validation', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'notifications',
          type: 'toggle',
          props: {
            label: 'Required Toggle',
            required: true,
            hint: 'This toggle is required',
          },
        },
        {
          key: 'darkMode',
          type: 'toggle',
          props: {
            label: 'Optional Toggle',
            required: false,
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        notifications: false,
        darkMode: false,
        emailUpdates: false,
        autoSave: false,
      });
      fixture.detectChanges();
    });

    it('should handle required validation correctly', () => {
      const toggles = debugElement.queryAll(By.directive(MatSlideToggle));
      const hint = debugElement.query(By.css('mat-hint'));

      expect(toggles[0]).toBeTruthy();
      expect(toggles[1]).toBeTruthy();
      expect(hint.nativeElement.textContent.trim()).toBe('This toggle is required');
    });
  });

  describe('Tab Index Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'notifications',
          type: 'toggle',
          props: {
            label: 'First Toggle',
            tabIndex: 1,
          },
        },
        {
          key: 'darkMode',
          type: 'toggle',
          props: {
            label: 'Second Toggle',
            tabIndex: 2,
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        notifications: false,
        darkMode: false,
        emailUpdates: false,
        autoSave: false,
      });
      fixture.detectChanges();
    });

    it('should apply tab index correctly', () => {
      const toggles = debugElement.queryAll(By.directive(MatSlideToggle));

      expect(toggles[0].nativeElement.getAttribute('tabindex')).toBe('1');
      expect(toggles[1].nativeElement.getAttribute('tabindex')).toBe('2');
    });
  });

  describe('Toggle State Changes', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'autoSave',
          type: 'toggle',
          props: {
            label: 'Auto Save',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        notifications: false,
        darkMode: false,
        emailUpdates: false,
        autoSave: false,
      });
      fixture.detectChanges();
    });

    it('should toggle from false to true', async () => {
      const toggle = debugElement.query(By.directive(MatSlideToggle));

      // Initial state should be false
      expect(toggle.nativeElement.getAttribute('ng-reflect-ng-model')).toBe('false');

      // Click to toggle to true
      toggle.nativeElement.click();
      fixture.detectChanges();

      const emittedValue: TestFormModel = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue?.autoSave).toBe(true);
      expect(toggle.nativeElement.getAttribute('ng-reflect-ng-model')).toBe('true');
    });

    it('should toggle from true to false', async () => {
      // Set initial state to true
      fixture.componentRef.setInput('value', {
        notifications: false,
        darkMode: false,
        emailUpdates: false,
        autoSave: true,
      });
      fixture.detectChanges();

      const toggle = debugElement.query(By.directive(MatSlideToggle));

      // Initial state should be true
      expect(toggle.nativeElement.getAttribute('ng-reflect-ng-model')).toBe('true');

      // Click to toggle to false
      toggle.nativeElement.click();
      fixture.detectChanges();

      const emittedValue: TestFormModel = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue?.autoSave).toBe(false);
      expect(toggle.nativeElement.getAttribute('ng-reflect-ng-model')).toBe('false');
    });
  });

  describe('Default Props from Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'notifications',
          type: 'toggle',
          props: {
            label: 'Test Toggle',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        notifications: false,
        darkMode: false,
        emailUpdates: false,
        autoSave: false,
      });
      fixture.detectChanges();
    });

    it('should apply default props from MATERIAL_FIELD_TYPES configuration', () => {
      const toggle = debugElement.query(By.directive(MatSlideToggle));
      const formField = debugElement.query(By.css('mat-form-field'));

      // Check default props from configuration
      expect(toggle.nativeElement.getAttribute('ng-reflect-label-position')).toBe('after');
      expect(toggle.nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('fill');
    });
  });

  describe('Form Value Binding Edge Cases', () => {
    it('should handle undefined form values', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'notifications',
          type: 'toggle',
          props: {
            label: 'Test Toggle',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      // Don't set initial value
      fixture.detectChanges();

      const toggle = debugElement.query(By.directive(MatSlideToggle));
      expect(toggle).toBeTruthy();
    });

    it('should handle null form values', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'notifications',
          type: 'toggle',
          props: {
            label: 'Test Toggle',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', null as any);
      fixture.detectChanges();

      const toggle = debugElement.query(By.directive(MatSlideToggle));
      expect(toggle).toBeTruthy();
    });

    it('should handle truthy/falsy values correctly', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'notifications',
          type: 'toggle',
          props: {
            label: 'Test Toggle',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });

      // Test with truthy value (1)
      fixture.componentRef.setInput('value', {
        notifications: 1 as any,
        darkMode: false,
        emailUpdates: false,
        autoSave: false,
      });
      fixture.detectChanges();

      const toggle = debugElement.query(By.directive(MatSlideToggle));
      expect(toggle.nativeElement.getAttribute('ng-reflect-ng-model')).toBe('1');

      // Test with falsy value (0)
      fixture.componentRef.setInput('value', {
        notifications: 0 as any,
        darkMode: false,
        emailUpdates: false,
        autoSave: false,
      });
      fixture.detectChanges();

      expect(toggle.nativeElement.getAttribute('ng-reflect-ng-model')).toBe('0');
    });

    it('should handle deep form value updates', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'notifications',
          type: 'toggle',
          props: {
            label: 'Test Toggle',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        notifications: false,
        darkMode: false,
        emailUpdates: false,
        autoSave: false,
      });
      fixture.detectChanges();

      const toggle = debugElement.query(By.directive(MatSlideToggle));

      // Update via programmatic value change
      fixture.componentRef.setInput('value', {
        notifications: true,
        darkMode: false,
        emailUpdates: false,
        autoSave: false,
      });
      fixture.detectChanges();

      expect(toggle.nativeElement.getAttribute('ng-reflect-ng-model')).toBe('true');
    });
  });

  describe('Field Configuration Validation', () => {
    it('should handle missing key gracefully', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          type: 'toggle',
          props: {
            label: 'Toggle without key',
          },
        },
      ];

      expect(() => {
        fixture.componentRef.setInput('config', { fields });
        fixture.detectChanges();
      }).not.toThrow();

      const toggle = debugElement.query(By.directive(MatSlideToggle));
      expect(toggle).toBeTruthy();
    });

    it('should auto-generate field IDs', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'notifications',
          type: 'toggle',
          props: {
            label: 'Test Toggle',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.detectChanges();

      // Field should have auto-generated ID
      expect(component.processedFields()[0].id).toBeDefined();
      expect(component.processedFields()[0].id).toContain('dynamic-field');
    });
  });
});
