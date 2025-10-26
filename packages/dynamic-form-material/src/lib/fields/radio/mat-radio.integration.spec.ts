import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MatRadioButton } from '@angular/material/radio';
import { DynamicForm, FieldConfig, provideDynamicForm, withConfig } from '@ng-forge/dynamic-form';
import { MATERIAL_FIELD_TYPES } from '../../config/material-field-config';

interface TestFormModel {
  gender: string;
  size: string;
  priority: number;
  theme: string;
}

describe('MatRadioFieldComponent - Dynamic Form Integration', () => {
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
          key: 'gender',
          type: 'radio',
          props: {
            label: 'Gender',
            hint: 'Please select your gender',
            required: true,
            color: 'primary',
            labelPosition: 'after',
            className: 'gender-radio',
            appearance: 'outline',
            disableRipple: true,
            tabIndex: 1,
            options: [
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
              { label: 'Other', value: 'other' },
              { label: 'Prefer not to say', value: 'no-answer', disabled: true },
            ],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        gender: 'male',
        size: '',
        priority: 0,
        theme: '',
      });
      fixture.detectChanges();
    });

    it('should render radio buttons through dynamic form', () => {
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));
      const formField = debugElement.query(By.css('mat-form-field'));
      const label = debugElement.query(By.css('mat-label'));
      const hint = debugElement.query(By.css('mat-hint'));

      expect(radioButtons.length).toBe(4);
      expect(radioButtons[0].nativeElement.textContent.trim()).toBe('Male');
      expect(radioButtons[1].nativeElement.textContent.trim()).toBe('Female');
      expect(radioButtons[2].nativeElement.textContent.trim()).toBe('Other');
      expect(radioButtons[3].nativeElement.textContent.trim()).toBe('Prefer not to say');
      expect(formField.nativeElement.className).toContain('gender-radio');
      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
      expect(label.nativeElement.textContent.trim()).toBe('Gender');
      expect(hint.nativeElement.textContent.trim()).toBe('Please select your gender');
    });

    it('should handle value changes through dynamic form', async () => {
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));

      // Click Female radio button
      radioButtons[1].nativeElement.click();
      fixture.detectChanges();

      const emittedValue: TestFormModel = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue?.gender).toBe('female');
    });

    it('should reflect form model changes in radio buttons', () => {
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));

      // Update form model
      fixture.componentRef.setInput('value', {
        gender: 'other',
        size: '',
        priority: 0,
        theme: '',
      });
      fixture.detectChanges();

      expect(radioButtons[0].nativeElement.getAttribute('ng-reflect-checked')).toBe('false');
      expect(radioButtons[1].nativeElement.getAttribute('ng-reflect-checked')).toBe('false');
      expect(radioButtons[2].nativeElement.getAttribute('ng-reflect-checked')).toBe('true');
      expect(radioButtons[3].nativeElement.getAttribute('ng-reflect-checked')).toBe('false');
    });

    it('should handle all radio-specific properties', () => {
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));

      expect(radioButtons[0].nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      expect(radioButtons[0].nativeElement.getAttribute('ng-reflect-label-position')).toBe('after');
      expect(radioButtons[0].nativeElement.getAttribute('ng-reflect-disable-ripple')).toBe('true');
      expect(radioButtons[0].nativeElement.getAttribute('tabindex')).toBe('1');
    });

    it('should handle disabled options', () => {
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));
      const disabledOption = radioButtons[3];

      expect(disabledOption.nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
    });
  });

  describe('Minimal Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'size',
          type: 'radio',
          props: {
            label: 'Size',
            options: [
              { label: 'Small', value: 'S' },
              { label: 'Medium', value: 'M' },
              { label: 'Large', value: 'L' },
            ],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        gender: '',
        size: '',
        priority: 0,
        theme: '',
      });
      fixture.detectChanges();
    });

    it('should render with default values from configuration', () => {
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));
      const formField = debugElement.query(By.css('mat-form-field'));

      expect(radioButtons.length).toBe(3);
      expect(radioButtons[0].nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      expect(radioButtons[0].nativeElement.getAttribute('ng-reflect-label-position')).toBe('after');
      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
    });

    it('should not display hint when not provided', () => {
      const hint = debugElement.query(By.css('mat-hint'));
      expect(hint).toBeNull();
    });
  });

  describe('Multiple Radio Fields', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'size',
          type: 'radio',
          props: {
            label: 'Size',
            color: 'primary',
            options: [
              { label: 'Small', value: 'S' },
              { label: 'Large', value: 'L' },
            ],
          },
        },
        {
          key: 'priority',
          type: 'radio',
          props: {
            label: 'Priority',
            color: 'accent',
            options: [
              { label: 'Low', value: 1 },
              { label: 'High', value: 2 },
            ],
          },
        },
        {
          key: 'theme',
          type: 'radio',
          props: {
            label: 'Theme',
            color: 'warn',
            options: [
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' },
            ],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        gender: '',
        size: 'S',
        priority: 2,
        theme: '',
      });
      fixture.detectChanges();
    });

    it('should render multiple radio fields correctly', () => {
      const labels = debugElement.queryAll(By.css('mat-label'));
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));

      expect(labels.length).toBe(3);
      expect(labels[0].nativeElement.textContent.trim()).toBe('Size');
      expect(labels[1].nativeElement.textContent.trim()).toBe('Priority');
      expect(labels[2].nativeElement.textContent.trim()).toBe('Theme');
      expect(radioButtons.length).toBe(6); // 2 + 2 + 2
    });

    it('should reflect individual field states from form model', () => {
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));

      // Size radio buttons
      expect(radioButtons[0].nativeElement.getAttribute('ng-reflect-checked')).toBe('true');
      expect(radioButtons[1].nativeElement.getAttribute('ng-reflect-checked')).toBe('false');

      // Priority radio buttons
      expect(radioButtons[2].nativeElement.getAttribute('ng-reflect-checked')).toBe('false');
      expect(radioButtons[3].nativeElement.getAttribute('ng-reflect-checked')).toBe('true');

      // Theme radio buttons
      expect(radioButtons[4].nativeElement.getAttribute('ng-reflect-checked')).toBe('false');
      expect(radioButtons[5].nativeElement.getAttribute('ng-reflect-checked')).toBe('false');
    });

    it('should handle independent field interactions', async () => {
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));

      // Click Large in size
      radioButtons[1].nativeElement.click();
      fixture.detectChanges();

      let emittedValue: TestFormModel = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue).toEqual({
        gender: '',
        size: 'L',
        priority: 2,
        theme: '',
      });

      // Click Dark in theme
      radioButtons[5].nativeElement.click();
      fixture.detectChanges();

      emittedValue = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue).toEqual({
        gender: '',
        size: 'L',
        priority: 2,
        theme: 'dark',
      });
    });

    it('should apply different colors to radio groups', () => {
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));

      // Size (primary)
      expect(radioButtons[0].nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      expect(radioButtons[1].nativeElement.getAttribute('ng-reflect-color')).toBe('primary');

      // Priority (accent)
      expect(radioButtons[2].nativeElement.getAttribute('ng-reflect-color')).toBe('accent');
      expect(radioButtons[3].nativeElement.getAttribute('ng-reflect-color')).toBe('accent');

      // Theme (warn)
      expect(radioButtons[4].nativeElement.getAttribute('ng-reflect-color')).toBe('warn');
      expect(radioButtons[5].nativeElement.getAttribute('ng-reflect-color')).toBe('warn');
    });
  });

  describe('Disabled State through Dynamic Form', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'gender',
          type: 'radio',
          props: {
            label: 'Disabled Gender',
            disabled: true,
            options: [
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
            ],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        gender: '',
        size: '',
        priority: 0,
        theme: '',
      });
      fixture.detectChanges();
    });

    it('should render all radio buttons as disabled', () => {
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));

      expect(radioButtons[0].nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
      expect(radioButtons[1].nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
    });

    it('should not emit value changes when disabled radio buttons are clicked', () => {
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));

      // Try to click disabled radio buttons - should not change values since they're disabled
      radioButtons[0].nativeElement.click();
      radioButtons[1].nativeElement.click();
      fixture.detectChanges();

      // Verify radio buttons remain disabled
      expect(radioButtons[0].nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
      expect(radioButtons[1].nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
    });
  });

  describe('Empty Options Array', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'gender',
          type: 'radio',
          props: {
            label: 'No Options',
            options: [],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        gender: '',
        size: '',
        priority: 0,
        theme: '',
      });
      fixture.detectChanges();
    });

    it('should render without radio buttons when options array is empty', () => {
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));
      const label = debugElement.query(By.css('mat-label'));

      expect(radioButtons.length).toBe(0);
      expect(label.nativeElement.textContent.trim()).toBe('No Options');
    });
  });

  describe('Label Position Variations', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'size',
          type: 'radio',
          props: {
            label: 'Before Label',
            labelPosition: 'before',
            options: [
              { label: 'Option 1', value: 'opt1' },
              { label: 'Option 2', value: 'opt2' },
            ],
          },
        },
        {
          key: 'theme',
          type: 'radio',
          props: {
            label: 'After Label',
            labelPosition: 'after',
            options: [
              { label: 'Option 3', value: 'opt3' },
              { label: 'Option 4', value: 'opt4' },
            ],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        gender: '',
        size: '',
        priority: 0,
        theme: '',
      });
      fixture.detectChanges();
    });

    it('should apply different label positions to radio groups', () => {
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));

      // Before label position
      expect(radioButtons[0].nativeElement.getAttribute('ng-reflect-label-position')).toBe('before');
      expect(radioButtons[1].nativeElement.getAttribute('ng-reflect-label-position')).toBe('before');

      // After label position
      expect(radioButtons[2].nativeElement.getAttribute('ng-reflect-label-position')).toBe('after');
      expect(radioButtons[3].nativeElement.getAttribute('ng-reflect-label-position')).toBe('after');
    });
  });

  describe('Radio Button Selection Behavior', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'size',
          type: 'radio',
          props: {
            label: 'Size Selection',
            options: [
              { label: 'Small', value: 'S' },
              { label: 'Medium', value: 'M' },
              { label: 'Large', value: 'L' },
            ],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        gender: '',
        size: '',
        priority: 0,
        theme: '',
      });
      fixture.detectChanges();
    });

    it('should only allow one selection at a time', async () => {
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));

      // Click Small
      radioButtons[0].nativeElement.click();
      fixture.detectChanges();

      let emittedValue: TestFormModel = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue?.size).toBe('S');

      // Click Medium - should deselect Small
      radioButtons[1].nativeElement.click();
      fixture.detectChanges();

      emittedValue = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue?.size).toBe('M');
      expect(radioButtons[0].nativeElement.getAttribute('ng-reflect-checked')).toBe('false');
      expect(radioButtons[1].nativeElement.getAttribute('ng-reflect-checked')).toBe('true');
      expect(radioButtons[2].nativeElement.getAttribute('ng-reflect-checked')).toBe('false');
    });
  });

  describe('Default Props from Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'gender',
          type: 'radio',
          props: {
            label: 'Test Radio',
            options: [{ label: 'Option 1', value: 'opt1' }],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        gender: '',
        size: '',
        priority: 0,
        theme: '',
      });
      fixture.detectChanges();
    });

    it('should apply default props from MATERIAL_FIELD_TYPES configuration', () => {
      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));
      const formField = debugElement.query(By.css('mat-form-field'));

      // Check default props from configuration
      expect(radioButtons[0].nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      expect(radioButtons[0].nativeElement.getAttribute('ng-reflect-label-position')).toBe('after');
      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
    });
  });

  describe('Form Value Binding Edge Cases', () => {
    it('should handle undefined form values', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'gender',
          type: 'radio',
          props: {
            label: 'Test Radio',
            options: [{ label: 'Option 1', value: 'opt1' }],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      // Don't set initial value
      fixture.detectChanges();

      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));
      expect(radioButtons.length).toBe(1);
    });

    it('should handle null form values', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'gender',
          type: 'radio',
          props: {
            label: 'Test Radio',
            options: [{ label: 'Option 1', value: 'opt1' }],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', null as any);
      fixture.detectChanges();

      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));
      expect(radioButtons.length).toBe(1);
    });

    it("should handle value that doesn't match any option", () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'gender',
          type: 'radio',
          props: {
            label: 'Test Radio',
            options: [
              { label: 'Option 1', value: 'opt1' },
              { label: 'Option 2', value: 'opt2' },
            ],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        gender: 'non-existent-value',
        size: '',
        priority: 0,
        theme: '',
      });
      fixture.detectChanges();

      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));

      // No radio button should be selected
      expect(radioButtons[0].nativeElement.getAttribute('ng-reflect-checked')).toBe('false');
      expect(radioButtons[1].nativeElement.getAttribute('ng-reflect-checked')).toBe('false');
    });
  });

  describe('Field Configuration Validation', () => {
    it('should handle missing key gracefully', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          type: 'radio',
          props: {
            label: 'Radio without key',
            options: [{ label: 'Option 1', value: 'opt1' }],
          },
        },
      ];

      expect(() => {
        fixture.componentRef.setInput('config', { fields });
        fixture.detectChanges();
      }).not.toThrow();

      const radioButtons = debugElement.queryAll(By.directive(MatRadioButton));
      expect(radioButtons.length).toBe(1);
    });

    it('should auto-generate field IDs', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'gender',
          type: 'radio',
          props: {
            label: 'Test Radio',
            options: [{ label: 'Option 1', value: 'opt1' }],
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
