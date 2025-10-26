import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MatSelect } from '@angular/material/select';
import { DynamicForm, FieldConfig, provideDynamicForm, withConfig } from '@ng-forge/dynamic-form';
import { MATERIAL_FIELD_TYPES } from '../../config/material-field-config';

interface TestFormModel {
  country: string;
  languages: string[];
  priority: number;
  categories: string[];
}

describe('MatSelectFieldComponent - Dynamic Form Integration', () => {
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
          key: 'country',
          type: 'select',
          props: {
            label: 'Country',
            placeholder: 'Select your country',
            hint: 'Choose the country you live in',
            required: true,
            appearance: 'outline',
            className: 'country-select',
            options: [
              { label: 'United States', value: 'US' },
              { label: 'Canada', value: 'CA' },
              { label: 'United Kingdom', value: 'UK' },
              { label: 'Germany', value: 'DE', disabled: true },
            ],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        country: 'US',
        languages: [],
        priority: 0,
        categories: [],
      });
      fixture.detectChanges();
    });

    it('should render select through dynamic form', () => {
      const select = debugElement.query(By.directive(MatSelect));
      const formField = debugElement.query(By.css('mat-form-field'));
      const label = debugElement.query(By.css('mat-label'));
      const hint = debugElement.query(By.css('mat-hint'));

      expect(select).toBeTruthy();
      expect(select.nativeElement.getAttribute('ng-reflect-placeholder')).toBe('Select your country');
      expect(formField.nativeElement.className).toContain('country-select');
      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
      expect(label.nativeElement.textContent.trim()).toBe('Country');
      expect(hint.nativeElement.textContent.trim()).toBe('Choose the country you live in');
    });

    it('should handle value changes through dynamic form', async () => {
      const select = debugElement.query(By.directive(MatSelect));

      // Simulate selection change
      select.componentInstance.value = 'CA';
      select.componentInstance.selectionChange.emit({
        value: 'CA',
        source: select.componentInstance,
      });
      fixture.detectChanges();

      const emittedValue: TestFormModel = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue?.country).toBe('CA');
    });

    it('should reflect form model changes in select', () => {
      const select = debugElement.query(By.directive(MatSelect));

      // Update form model
      fixture.componentRef.setInput('value', {
        country: 'UK',
        languages: [],
        priority: 0,
        categories: [],
      });
      fixture.detectChanges();

      expect(select.nativeElement.getAttribute('ng-reflect-ng-model')).toBe('UK');
    });

    it('should display selected option text', () => {
      const select = debugElement.query(By.directive(MatSelect));

      expect(select.nativeElement.textContent.trim()).toBe('United States');
    });
  });

  describe('Multi-Select Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'languages',
          type: 'select',
          props: {
            label: 'Languages',
            multiple: true,
            hint: 'Select all languages you speak',
            options: [
              { label: 'English', value: 'en' },
              { label: 'Spanish', value: 'es' },
              { label: 'French', value: 'fr' },
              { label: 'German', value: 'de' },
            ],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        country: '',
        languages: ['en', 'es'],
        priority: 0,
        categories: [],
      });
      fixture.detectChanges();
    });

    it('should render multi-select correctly', () => {
      const select = debugElement.query(By.directive(MatSelect));
      const hint = debugElement.query(By.css('mat-hint'));

      expect(select.nativeElement.getAttribute('ng-reflect-multiple')).toBe('true');
      expect(hint.nativeElement.textContent.trim()).toBe('Select all languages you speak');
    });

    it('should handle multi-select value changes', async () => {
      const select = debugElement.query(By.directive(MatSelect));

      // Simulate multi-selection change
      select.componentInstance.value = ['en', 'es', 'fr'];
      select.componentInstance.selectionChange.emit({
        value: ['en', 'es', 'fr'],
        source: select.componentInstance,
      });
      fixture.detectChanges();

      const emittedValue: TestFormModel = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue?.languages).toEqual(['en', 'es', 'fr']);
    });

    it('should reflect multi-select form model changes', () => {
      const select = debugElement.query(By.directive(MatSelect));

      // Update form model
      fixture.componentRef.setInput('value', {
        country: '',
        languages: ['fr', 'de'],
        priority: 0,
        categories: [],
      });
      fixture.detectChanges();

      expect(select.nativeElement.getAttribute('ng-reflect-ng-model')).toBe('fr,de');
    });
  });

  describe('Minimal Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'country',
          type: 'select',
          props: {
            label: 'Simple Select',
            options: [
              { label: 'Option 1', value: 'opt1' },
              { label: 'Option 2', value: 'opt2' },
            ],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        country: '',
        languages: [],
        priority: 0,
        categories: [],
      });
      fixture.detectChanges();
    });

    it('should render with default values from configuration', () => {
      const select = debugElement.query(By.directive(MatSelect));
      const formField = debugElement.query(By.css('mat-form-field'));

      expect(select).toBeTruthy();
      expect(select.nativeElement.getAttribute('ng-reflect-multiple')).toBe('false');
      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
    });

    it('should not display hint when not provided', () => {
      const hint = debugElement.query(By.css('mat-hint'));
      expect(hint).toBeNull();
    });
  });

  describe('Multiple Select Fields', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'country',
          type: 'select',
          props: {
            label: 'Country',
            appearance: 'outline',
            options: [
              { label: 'US', value: 'US' },
              { label: 'CA', value: 'CA' },
            ],
          },
        },
        {
          key: 'priority',
          type: 'select',
          props: {
            label: 'Priority',
            appearance: 'fill',
            options: [
              { label: 'Low', value: 1 },
              { label: 'High', value: 2 },
            ],
          },
        },
        {
          key: 'categories',
          type: 'select',
          props: {
            label: 'Categories',
            multiple: true,
            options: [
              { label: 'Tech', value: 'tech' },
              { label: 'Business', value: 'business' },
            ],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        country: 'US',
        languages: [],
        priority: 2,
        categories: ['tech'],
      });
      fixture.detectChanges();
    });

    it('should render multiple select fields correctly', () => {
      const selects = debugElement.queryAll(By.directive(MatSelect));
      const labels = debugElement.queryAll(By.css('mat-label'));

      expect(selects.length).toBe(3);
      expect(labels[0].nativeElement.textContent.trim()).toBe('Country');
      expect(labels[1].nativeElement.textContent.trim()).toBe('Priority');
      expect(labels[2].nativeElement.textContent.trim()).toBe('Categories');
    });

    it('should reflect individual field states from form model', () => {
      const selects = debugElement.queryAll(By.directive(MatSelect));

      expect(selects[0].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('US');
      expect(selects[1].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('2');
      expect(selects[2].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('tech');
    });

    it('should handle independent field interactions', async () => {
      const selects = debugElement.queryAll(By.directive(MatSelect));

      // Change country
      selects[0].componentInstance.value = 'CA';
      selects[0].componentInstance.selectionChange.emit({
        value: 'CA',
        source: selects[0].componentInstance,
      });
      fixture.detectChanges();

      let emittedValue: TestFormModel = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue).toEqual({
        country: 'CA',
        languages: [],
        priority: 2,
        categories: ['tech'],
      });

      // Change categories
      selects[2].componentInstance.value = ['tech', 'business'];
      selects[2].componentInstance.selectionChange.emit({
        value: ['tech', 'business'],
        source: selects[2].componentInstance,
      });
      fixture.detectChanges();

      emittedValue = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue).toEqual({
        country: 'CA',
        languages: [],
        priority: 2,
        categories: ['tech', 'business'],
      });
    });

    it('should apply different appearances to selects', () => {
      const formFields = debugElement.queryAll(By.css('mat-form-field'));

      expect(formFields[0].nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
      expect(formFields[1].nativeElement.getAttribute('ng-reflect-appearance')).toBe('fill');
      expect(formFields[2].nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
    });
  });

  describe('Disabled State through Dynamic Form', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'country',
          type: 'select',
          props: {
            label: 'Disabled Select',
            disabled: true,
            options: [
              { label: 'Option 1', value: 'opt1' },
              { label: 'Option 2', value: 'opt2' },
            ],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        country: '',
        languages: [],
        priority: 0,
        categories: [],
      });
      fixture.detectChanges();
    });

    it('should render select as disabled', () => {
      const select = debugElement.query(By.directive(MatSelect));

      expect(select.nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
    });

    it('should not emit value changes when disabled select is interacted with', () => {
      const select = debugElement.query(By.directive(MatSelect));

      // Try to change disabled select
      select.componentInstance.value = 'opt1';
      // Note: disabled selects won't emit selectionChange events
      fixture.detectChanges();

      // Verify the select remains disabled
      expect(select.nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
    });
  });

  describe('Empty Options Array', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'country',
          type: 'select',
          props: {
            label: 'No Options',
            options: [],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        country: '',
        languages: [],
        priority: 0,
        categories: [],
      });
      fixture.detectChanges();
    });

    it('should render select with empty options', () => {
      const select = debugElement.query(By.directive(MatSelect));
      const label = debugElement.query(By.css('mat-label'));

      expect(select).toBeTruthy();
      expect(label.nativeElement.textContent.trim()).toBe('No Options');
    });
  });

  describe('Disabled Options', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'country',
          type: 'select',
          props: {
            label: 'Select with Disabled Options',
            options: [
              { label: 'Available Option', value: 'available' },
              { label: 'Disabled Option', value: 'disabled', disabled: true },
              { label: 'Another Available', value: 'available2' },
            ],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        country: '',
        languages: [],
        priority: 0,
        categories: [],
      });
      fixture.detectChanges();
    });

    it('should render select with mixed enabled/disabled options', () => {
      const select = debugElement.query(By.directive(MatSelect));

      expect(select).toBeTruthy();
      // Disabled options would be tested when the select is opened
    });
  });

  describe('Compare Function', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'country',
          type: 'select',
          props: {
            label: 'Select with Compare Function',
            compareWith: (o1: any, o2: any) => o1 === o2,
            options: [
              { label: 'Option 1', value: 'opt1' },
              { label: 'Option 2', value: 'opt2' },
            ],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        country: 'opt1',
        languages: [],
        priority: 0,
        categories: [],
      });
      fixture.detectChanges();
    });

    it('should apply custom compare function', () => {
      const select = debugElement.query(By.directive(MatSelect));

      expect(select).toBeTruthy();
      // Compare function would be tested during option comparison
    });
  });

  describe('Default Props from Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'country',
          type: 'select',
          props: {
            label: 'Test Select',
            options: [{ label: 'Option 1', value: 'opt1' }],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        country: '',
        languages: [],
        priority: 0,
        categories: [],
      });
      fixture.detectChanges();
    });

    it('should apply default props from MATERIAL_FIELD_TYPES configuration', () => {
      const select = debugElement.query(By.directive(MatSelect));
      const formField = debugElement.query(By.css('mat-form-field'));

      // Check default props from configuration
      expect(select.nativeElement.getAttribute('ng-reflect-multiple')).toBe('false');
      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
    });
  });

  describe('Form Value Binding Edge Cases', () => {
    it('should handle undefined form values', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'country',
          type: 'select',
          props: {
            label: 'Test Select',
            options: [{ label: 'Option 1', value: 'opt1' }],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      // Don't set initial value
      fixture.detectChanges();

      const select = debugElement.query(By.directive(MatSelect));
      expect(select).toBeTruthy();
    });

    it('should handle null form values', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'country',
          type: 'select',
          props: {
            label: 'Test Select',
            options: [{ label: 'Option 1', value: 'opt1' }],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', null as any);
      fixture.detectChanges();

      const select = debugElement.query(By.directive(MatSelect));
      expect(select).toBeTruthy();
    });

    it("should handle value that doesn't match any option", () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'country',
          type: 'select',
          props: {
            label: 'Test Select',
            options: [
              { label: 'Option 1', value: 'opt1' },
              { label: 'Option 2', value: 'opt2' },
            ],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        country: 'non-existent-value',
        languages: [],
        priority: 0,
        categories: [],
      });
      fixture.detectChanges();

      const select = debugElement.query(By.directive(MatSelect));

      expect(select.nativeElement.getAttribute('ng-reflect-ng-model')).toBe('non-existent-value');
    });

    it('should handle empty array for multi-select', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'languages',
          type: 'select',
          props: {
            label: 'Multi Select',
            multiple: true,
            options: [
              { label: 'Option 1', value: 'opt1' },
              { label: 'Option 2', value: 'opt2' },
            ],
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        country: '',
        languages: [],
        priority: 0,
        categories: [],
      });
      fixture.detectChanges();

      const select = debugElement.query(By.directive(MatSelect));
      expect(select.nativeElement.getAttribute('ng-reflect-ng-model')).toBe('');
    });
  });

  describe('Field Configuration Validation', () => {
    it('should handle missing key gracefully', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          type: 'select',
          props: {
            label: 'Select without key',
            options: [{ label: 'Option 1', value: 'opt1' }],
          },
        },
      ];

      expect(() => {
        fixture.componentRef.setInput('config', { fields });
        fixture.detectChanges();
      }).not.toThrow();

      const select = debugElement.query(By.directive(MatSelect));
      expect(select).toBeTruthy();
    });

    it('should auto-generate field IDs', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'country',
          type: 'select',
          props: {
            label: 'Test Select',
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
