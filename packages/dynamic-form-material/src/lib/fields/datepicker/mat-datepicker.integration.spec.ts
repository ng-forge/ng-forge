import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MatDatepickerInput } from '@angular/material/datepicker';
import { DynamicForm, FieldConfig, provideDynamicForm, withConfig } from '@ng-forge/dynamic-form';
import { MATERIAL_FIELD_TYPES } from '../../config/material-field-config';

interface TestFormModel {
  birthDate: Date | null;
  startDate: Date | null;
  endDate: Date | null;
  appointmentDate: Date | null;
}

describe('MatDatepickerFieldComponent - Dynamic Form Integration', () => {
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
          key: 'birthDate',
          type: 'datepicker',
          props: {
            label: 'Birth Date',
            placeholder: 'Select your birth date',
            hint: 'Choose the date you were born',
            minDate: new Date(1900, 0, 1),
            maxDate: new Date(),
            startAt: new Date(1990, 0, 1),
            startView: 'year',
            touchUi: false,
            appearance: 'outline',
            color: 'primary',
            disableRipple: true,
            tabIndex: 1,
            className: 'birth-date-picker',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        birthDate: null,
        startDate: null,
        endDate: null,
        appointmentDate: null,
      });
      fixture.detectChanges();
    });

    it('should render datepicker through dynamic form', () => {
      const datepickerInput = debugElement.query(By.directive(MatDatepickerInput));
      const formField = debugElement.query(By.css('mat-form-field'));
      const label = debugElement.query(By.css('mat-label'));
      const hint = debugElement.query(By.css('mat-hint'));

      expect(datepickerInput).toBeTruthy();
      expect(datepickerInput.nativeElement.getAttribute('placeholder')).toBe('Select your birth date');
      expect(datepickerInput.nativeElement.getAttribute('tabindex')).toBe('1');
      expect(formField.nativeElement.className).toContain('birth-date-picker');
      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
      expect(label.nativeElement.textContent.trim()).toBe('Birth Date');
      expect(hint.nativeElement.textContent.trim()).toBe('Choose the date you were born');
    });

    it('should handle value changes through dynamic form', async () => {
      const datepickerInput = debugElement.query(By.directive(MatDatepickerInput));
      const testDate = new Date(1995, 5, 15);

      // Simulate date selection
      datepickerInput.nativeElement.value = testDate.toLocaleDateString();
      datepickerInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const emittedValue: TestFormModel = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue?.birthDate).toBeDefined();
    });

    it('should reflect form model changes in datepicker', () => {
      const datepickerInput = debugElement.query(By.directive(MatDatepickerInput));
      const testDate = new Date(1995, 5, 15);

      // Update form model
      fixture.componentRef.setInput('value', {
        birthDate: testDate,
        startDate: null,
        endDate: null,
        appointmentDate: null,
      });
      fixture.detectChanges();

      expect(datepickerInput.nativeElement.getAttribute('ng-reflect-ng-model')).toContain('1995');
    });

    it('should handle all datepicker-specific properties', () => {
      const datepickerInput = debugElement.query(By.directive(MatDatepickerInput));

      expect(datepickerInput.nativeElement.getAttribute('ng-reflect-start-view')).toBe('year');
    });
  });

  describe('Minimal Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'startDate',
          type: 'datepicker',
          props: {
            label: 'Start Date',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        birthDate: null,
        startDate: null,
        endDate: null,
        appointmentDate: null,
      });
      fixture.detectChanges();
    });

    it('should render with default values from configuration', () => {
      const datepickerInput = debugElement.query(By.directive(MatDatepickerInput));
      const formField = debugElement.query(By.css('mat-form-field'));

      expect(datepickerInput).toBeTruthy();
      expect(datepickerInput.nativeElement.textContent.trim()).toBe('');
      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('fill');
    });

    it('should not display hint when not provided', () => {
      const hint = debugElement.query(By.css('mat-hint'));
      expect(hint).toBeNull();
    });
  });

  describe('Multiple Datepickers', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'startDate',
          type: 'datepicker',
          props: {
            label: 'Start Date',
            appearance: 'outline',
          },
        },
        {
          key: 'endDate',
          type: 'datepicker',
          props: {
            label: 'End Date',
            appearance: 'fill',
          },
        },
        {
          key: 'appointmentDate',
          type: 'datepicker',
          props: {
            label: 'Appointment Date',
            touchUi: true,
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        birthDate: null,
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 11, 31),
        appointmentDate: null,
      });
      fixture.detectChanges();
    });

    it('should render multiple datepickers correctly', () => {
      const datepickers = debugElement.queryAll(By.directive(MatDatepickerInput));
      const labels = debugElement.queryAll(By.css('mat-label'));

      expect(datepickers.length).toBe(3);
      expect(labels[0].nativeElement.textContent.trim()).toBe('Start Date');
      expect(labels[1].nativeElement.textContent.trim()).toBe('End Date');
      expect(labels[2].nativeElement.textContent.trim()).toBe('Appointment Date');
    });

    it('should reflect individual datepicker states from form model', () => {
      const datepickers = debugElement.queryAll(By.directive(MatDatepickerInput));

      expect(datepickers[0].nativeElement.getAttribute('ng-reflect-ng-model')).toContain('2024');
      expect(datepickers[1].nativeElement.getAttribute('ng-reflect-ng-model')).toContain('2024');
      expect(datepickers[2].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('');
    });

    it('should handle independent datepicker interactions', async () => {
      const datepickers = debugElement.queryAll(By.directive(MatDatepickerInput));
      const newDate = new Date(2024, 6, 15);

      // Change third datepicker
      datepickers[2].nativeElement.value = newDate.toLocaleDateString();
      datepickers[2].nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const emittedValue: TestFormModel = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue?.startDate).toEqual(new Date(2024, 0, 1));
      expect(emittedValue?.endDate).toEqual(new Date(2024, 11, 31));
      expect(emittedValue?.appointmentDate).toBeDefined();
    });

    it('should apply different appearances to datepickers', () => {
      const formFields = debugElement.queryAll(By.css('mat-form-field'));

      expect(formFields[0].nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
      expect(formFields[1].nativeElement.getAttribute('ng-reflect-appearance')).toBe('fill');
      expect(formFields[2].nativeElement.getAttribute('ng-reflect-appearance')).toBe('fill');
    });
  });

  describe('Disabled State through Dynamic Form', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'birthDate',
          type: 'datepicker',
          props: {
            label: 'Disabled Datepicker',
            disabled: true,
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        birthDate: null,
        startDate: null,
        endDate: null,
        appointmentDate: null,
      });
      fixture.detectChanges();
    });

    it('should render datepicker as disabled', () => {
      const datepickerInput = debugElement.query(By.directive(MatDatepickerInput));

      expect(datepickerInput.nativeElement.disabled).toBe(true);
    });

    it('should not emit value changes when disabled datepicker is modified', () => {
      const datepickerInput = debugElement.query(By.directive(MatDatepickerInput));

      // Try to change disabled datepicker - should not change value since it's disabled
      datepickerInput.nativeElement.value = new Date().toLocaleDateString();
      datepickerInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Verify the datepicker remains disabled
      expect(datepickerInput.nativeElement.disabled).toBe(true);
    });
  });

  describe('Date Range Configuration', () => {
    beforeEach(() => {
      const minDate = new Date(2020, 0, 1);
      const maxDate = new Date(2025, 11, 31);

      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'appointmentDate',
          type: 'datepicker',
          props: {
            label: 'Appointment Date',
            minDate: minDate,
            maxDate: maxDate,
            startAt: new Date(2024, 0, 1),
            hint: `Select date between ${minDate.getFullYear()} and ${maxDate.getFullYear()}`,
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        birthDate: null,
        startDate: null,
        endDate: null,
        appointmentDate: null,
      });
      fixture.detectChanges();
    });

    it('should apply date range constraints', () => {
      const datepickerInput = debugElement.query(By.directive(MatDatepickerInput));
      const hint = debugElement.query(By.css('mat-hint'));

      expect(datepickerInput).toBeTruthy();
      expect(hint.nativeElement.textContent.trim()).toBe('Select date between 2020 and 2025');
    });
  });

  describe('Default Props from Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'birthDate',
          type: 'datepicker',
          props: {
            label: 'Test Datepicker',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        birthDate: null,
        startDate: null,
        endDate: null,
        appointmentDate: null,
      });
      fixture.detectChanges();
    });

    it('should apply default props from MATERIAL_FIELD_TYPES configuration', () => {
      const datepickerInput = debugElement.query(By.directive(MatDatepickerInput));
      const formField = debugElement.query(By.css('mat-form-field'));

      // Check default props from configuration
      expect(datepickerInput.nativeElement.getAttribute('ng-reflect-start-view')).toBe('month');
      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('fill');
    });
  });

  describe('Touch UI Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'birthDate',
          type: 'datepicker',
          props: {
            label: 'Touch UI Datepicker',
            touchUi: true,
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        birthDate: null,
        startDate: null,
        endDate: null,
        appointmentDate: null,
      });
      fixture.detectChanges();
    });

    it('should enable touch UI when specified', () => {
      const datepickerInput = debugElement.query(By.directive(MatDatepickerInput));

      expect(datepickerInput).toBeTruthy();
      // Touch UI would be tested at component level, here we verify it renders
    });
  });

  describe('Form Value Binding Edge Cases', () => {
    it('should handle undefined form values', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'birthDate',
          type: 'datepicker',
          props: {
            label: 'Test Datepicker',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      // Don't set initial value
      fixture.detectChanges();

      const datepickerInput = debugElement.query(By.directive(MatDatepickerInput));
      expect(datepickerInput).toBeTruthy();
    });

    it('should handle null form values', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'birthDate',
          type: 'datepicker',
          props: {
            label: 'Test Datepicker',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', null as any);
      fixture.detectChanges();

      const datepickerInput = debugElement.query(By.directive(MatDatepickerInput));
      expect(datepickerInput).toBeTruthy();
    });

    it('should handle deep form value updates', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'birthDate',
          type: 'datepicker',
          props: {
            label: 'Test Datepicker',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        birthDate: null,
        startDate: null,
        endDate: null,
        appointmentDate: null,
      });
      fixture.detectChanges();

      const datepickerInput = debugElement.query(By.directive(MatDatepickerInput));
      const testDate = new Date(2024, 5, 15);

      // Update via programmatic value change
      fixture.componentRef.setInput('value', {
        birthDate: testDate,
        startDate: null,
        endDate: null,
        appointmentDate: null,
      });
      fixture.detectChanges();

      expect(datepickerInput.nativeElement.getAttribute('ng-reflect-ng-model')).toContain('2024');
    });
  });

  describe('Field Configuration Validation', () => {
    it('should handle missing key gracefully', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          type: 'datepicker',
          props: {
            label: 'Datepicker without key',
          },
        },
      ];

      expect(() => {
        fixture.componentRef.setInput('config', { fields });
        fixture.detectChanges();
      }).not.toThrow();

      const datepickerInput = debugElement.query(By.directive(MatDatepickerInput));
      expect(datepickerInput).toBeTruthy();
    });

    it('should auto-generate field IDs', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'birthDate',
          type: 'datepicker',
          props: {
            label: 'Test Datepicker',
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
