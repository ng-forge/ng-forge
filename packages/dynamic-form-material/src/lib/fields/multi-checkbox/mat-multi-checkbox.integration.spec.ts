import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MatCheckbox } from '@angular/material/checkbox';
import { DynamicForm, FieldConfig, provideDynamicForm, withConfig } from '@ng-forge/dynamic-form';
import { MATERIAL_FIELD_TYPES } from '../../config/material-field-config';

interface TestFormModel {
  skills: string[];
  interests: number[];
  features: string[];
  permissions: string[];
}

describe('MatMultiCheckboxFieldComponent - Dynamic Form Integration', () => {
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
          key: 'skills',
          type: 'multi-checkbox',
          props: {
            label: 'Technical Skills',
            hint: 'Select all skills that apply to you',
            required: true,
            color: 'primary',
            labelPosition: 'after',
            className: 'skills-checkboxes',
            appearance: 'outline',
            disableRipple: true,
            tabIndex: 1,
            options: [
              { label: 'JavaScript', value: 'javascript' },
              { label: 'TypeScript', value: 'typescript' },
              { label: 'Angular', value: 'angular' },
              { label: 'React', value: 'react', disabled: true },
            ],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        skills: ['javascript'],
        interests: [],
        features: [],
        permissions: [],
      });
      fixture.detectChanges();
    });

    it('should render multi-checkbox through dynamic form', () => {
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      const formField = debugElement.query(By.css('mat-form-field'));
      const label = debugElement.query(By.css('mat-label'));
      const hint = debugElement.query(By.css('mat-hint'));

      expect(checkboxes.length).toBe(4);
      expect(checkboxes[0].nativeElement.textContent.trim()).toBe('JavaScript');
      expect(checkboxes[1].nativeElement.textContent.trim()).toBe('TypeScript');
      expect(checkboxes[2].nativeElement.textContent.trim()).toBe('Angular');
      expect(checkboxes[3].nativeElement.textContent.trim()).toBe('React');
      expect(formField.nativeElement.className).toContain('skills-checkboxes');
      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
      expect(label.nativeElement.textContent.trim()).toBe('Technical Skills');
      expect(hint.nativeElement.textContent.trim()).toBe('Select all skills that apply to you');
    });

    it('should handle value changes through dynamic form', async () => {
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));

      // Click TypeScript checkbox
      checkboxes[1].nativeElement.click();
      fixture.detectChanges();

      const emittedValue: TestFormModel = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue?.skills).toEqual(['javascript', 'typescript']);
    });

    it('should reflect form model changes in checkboxes', () => {
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));

      // Update form model
      fixture.componentRef.setInput('value', {
        skills: ['typescript', 'angular'],
        interests: [],
        features: [],
        permissions: [],
      });
      fixture.detectChanges();

      expect(checkboxes[0].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('false');
      expect(checkboxes[1].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('true');
      expect(checkboxes[2].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('true');
      expect(checkboxes[3].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('false');
    });

    it('should handle all multi-checkbox-specific properties', () => {
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));

      expect(checkboxes[0].nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      expect(checkboxes[0].nativeElement.getAttribute('ng-reflect-label-position')).toBe('after');
      expect(checkboxes[0].nativeElement.getAttribute('ng-reflect-disable-ripple')).toBe('true');
      expect(checkboxes[0].nativeElement.getAttribute('tabindex')).toBe('1');
    });

    it('should handle disabled options', () => {
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      const reactCheckbox = checkboxes[3];

      expect(reactCheckbox.nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
    });
  });

  describe('Minimal Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'interests',
          type: 'multi-checkbox',
          props: {
            label: 'Interests',
            options: [
              { label: 'Sports', value: 1 },
              { label: 'Music', value: 2 },
              { label: 'Technology', value: 3 },
            ],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        skills: [],
        interests: [],
        features: [],
        permissions: [],
      });
      fixture.detectChanges();
    });

    it('should render with default values from configuration', () => {
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      const formField = debugElement.query(By.css('mat-form-field'));

      expect(checkboxes.length).toBe(3);
      expect(checkboxes[0].nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      expect(checkboxes[0].nativeElement.getAttribute('ng-reflect-label-position')).toBe('after');
      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('fill');
    });

    it('should not display hint when not provided', () => {
      const hint = debugElement.query(By.css('mat-hint'));
      expect(hint).toBeNull();
    });
  });

  describe('Multiple Multi-Checkbox Fields', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'skills',
          type: 'multi-checkbox',
          props: {
            label: 'Skills',
            color: 'primary',
            options: [
              { label: 'JavaScript', value: 'js' },
              { label: 'TypeScript', value: 'ts' },
            ],
          },
        },
        {
          key: 'features',
          type: 'multi-checkbox',
          props: {
            label: 'Features',
            color: 'accent',
            options: [
              { label: 'Dark Mode', value: 'dark' },
              { label: 'Notifications', value: 'notifications' },
            ],
          },
        },
        {
          key: 'permissions',
          type: 'multi-checkbox',
          props: {
            label: 'Permissions',
            color: 'warn',
            options: [
              { label: 'Read', value: 'read' },
              { label: 'Write', value: 'write' },
              { label: 'Admin', value: 'admin' },
            ],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        skills: ['js'],
        interests: [],
        features: ['dark'],
        permissions: [],
      });
      fixture.detectChanges();
    });

    it('should render multiple multi-checkbox fields correctly', () => {
      const labels = debugElement.queryAll(By.css('mat-label'));
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));

      expect(labels.length).toBe(3);
      expect(labels[0].nativeElement.textContent.trim()).toBe('Skills');
      expect(labels[1].nativeElement.textContent.trim()).toBe('Features');
      expect(labels[2].nativeElement.textContent.trim()).toBe('Permissions');
      expect(checkboxes.length).toBe(7); // 2 + 2 + 3
    });

    it('should reflect individual field states from form model', () => {
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));

      // Skills checkboxes
      expect(checkboxes[0].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('true');
      expect(checkboxes[1].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('false');

      // Features checkboxes
      expect(checkboxes[2].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('true');
      expect(checkboxes[3].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('false');

      // Permissions checkboxes
      expect(checkboxes[4].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('false');
      expect(checkboxes[5].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('false');
      expect(checkboxes[6].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('false');
    });

    it('should handle independent field interactions', async () => {
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));

      // Click TypeScript checkbox in skills
      checkboxes[1].nativeElement.click();
      fixture.detectChanges();

      let emittedValue: TestFormModel = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue).toEqual({
        skills: ['js', 'ts'],
        interests: [],
        features: ['dark'],
        permissions: [],
      });

      // Click Admin checkbox in permissions
      checkboxes[6].nativeElement.click();
      fixture.detectChanges();

      emittedValue = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue).toEqual({
        skills: ['js', 'ts'],
        interests: [],
        features: ['dark'],
        permissions: ['admin'],
      });
    });

    it('should apply different colors to checkbox groups', () => {
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));

      // Skills (primary)
      expect(checkboxes[0].nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      expect(checkboxes[1].nativeElement.getAttribute('ng-reflect-color')).toBe('primary');

      // Features (accent)
      expect(checkboxes[2].nativeElement.getAttribute('ng-reflect-color')).toBe('accent');
      expect(checkboxes[3].nativeElement.getAttribute('ng-reflect-color')).toBe('accent');

      // Permissions (warn)
      expect(checkboxes[4].nativeElement.getAttribute('ng-reflect-color')).toBe('warn');
      expect(checkboxes[5].nativeElement.getAttribute('ng-reflect-color')).toBe('warn');
      expect(checkboxes[6].nativeElement.getAttribute('ng-reflect-color')).toBe('warn');
    });
  });

  describe('Disabled State through Dynamic Form', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'skills',
          type: 'multi-checkbox',
          props: {
            label: 'Disabled Skills',
            disabled: true,
            options: [
              { label: 'JavaScript', value: 'js' },
              { label: 'TypeScript', value: 'ts' },
            ],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        skills: [],
        interests: [],
        features: [],
        permissions: [],
      });
      fixture.detectChanges();
    });

    it('should render all checkboxes as disabled', () => {
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));

      expect(checkboxes[0].nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
      expect(checkboxes[1].nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
    });

    it('should not emit value changes when disabled checkboxes are clicked', () => {
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));

      // Try to click disabled checkboxes - should not change values since they're disabled
      checkboxes[0].nativeElement.click();
      checkboxes[1].nativeElement.click();
      fixture.detectChanges();

      // Verify checkboxes remain disabled
      expect(checkboxes[0].nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
      expect(checkboxes[1].nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
    });
  });

  describe('Empty Options Array', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'skills',
          type: 'multi-checkbox',
          props: {
            label: 'No Options',
            options: [],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        skills: [],
        interests: [],
        features: [],
        permissions: [],
      });
      fixture.detectChanges();
    });

    it('should render without checkboxes when options array is empty', () => {
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      const label = debugElement.query(By.css('mat-label'));

      expect(checkboxes.length).toBe(0);
      expect(label.nativeElement.textContent.trim()).toBe('No Options');
    });
  });

  describe('Label Position Variations', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'skills',
          type: 'multi-checkbox',
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
          key: 'features',
          type: 'multi-checkbox',
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
        skills: [],
        interests: [],
        features: [],
        permissions: [],
      });
      fixture.detectChanges();
    });

    it('should apply different label positions to checkbox groups', () => {
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));

      // Before label position
      expect(checkboxes[0].nativeElement.getAttribute('ng-reflect-label-position')).toBe('before');
      expect(checkboxes[1].nativeElement.getAttribute('ng-reflect-label-position')).toBe('before');

      // After label position
      expect(checkboxes[2].nativeElement.getAttribute('ng-reflect-label-position')).toBe('after');
      expect(checkboxes[3].nativeElement.getAttribute('ng-reflect-label-position')).toBe('after');
    });
  });

  describe('Default Props from Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'skills',
          type: 'multi-checkbox',
          props: {
            label: 'Test Multi-Checkbox',
            options: [{ label: 'Option 1', value: 'opt1' }],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        skills: [],
        interests: [],
        features: [],
        permissions: [],
      });
      fixture.detectChanges();
    });

    it('should apply default props from MATERIAL_FIELD_TYPES configuration', () => {
      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      const formField = debugElement.query(By.css('mat-form-field'));

      // Check default props from configuration
      expect(checkboxes[0].nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      expect(checkboxes[0].nativeElement.getAttribute('ng-reflect-label-position')).toBe('after');
      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('fill');
    });
  });

  describe('Form Value Binding Edge Cases', () => {
    it('should handle undefined form values', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'skills',
          type: 'multi-checkbox',
          props: {
            label: 'Test Multi-Checkbox',
            options: [{ label: 'Option 1', value: 'opt1' }],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      // Don't set initial value
      fixture.detectChanges();

      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      expect(checkboxes.length).toBe(1);
    });

    it('should handle null form values', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'skills',
          type: 'multi-checkbox',
          props: {
            label: 'Test Multi-Checkbox',
            options: [{ label: 'Option 1', value: 'opt1' }],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', null as any);
      fixture.detectChanges();

      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      expect(checkboxes.length).toBe(1);
    });

    it('should handle selection and deselection', async () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'skills',
          type: 'multi-checkbox',
          props: {
            label: 'Test Multi-Checkbox',
            options: [
              { label: 'Option 1', value: 'opt1' },
              { label: 'Option 2', value: 'opt2' },
            ],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        skills: ['opt1'],
        interests: [],
        features: [],
        permissions: [],
      });
      fixture.detectChanges();

      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));

      // Select second option
      checkboxes[1].nativeElement.click();
      fixture.detectChanges();

      let emittedValue: TestFormModel = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue?.skills).toEqual(['opt1', 'opt2']);

      // Deselect first option
      checkboxes[0].nativeElement.click();
      fixture.detectChanges();

      emittedValue = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue?.skills).toEqual(['opt2']);
    });
  });

  describe('Field Configuration Validation', () => {
    it('should handle missing key gracefully', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          type: 'multi-checkbox',
          props: {
            label: 'Multi-checkbox without key',
            options: [{ label: 'Option 1', value: 'opt1' }],
          },
        },
      ];

      expect(() => {
        fixture.componentRef.setInput('config', { fields });
        fixture.detectChanges();
      }).not.toThrow();

      const checkboxes = debugElement.queryAll(By.directive(MatCheckbox));
      expect(checkboxes.length).toBe(1);
    });

    it('should auto-generate field IDs', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'skills',
          type: 'multi-checkbox',
          props: {
            label: 'Test Multi-Checkbox',
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
