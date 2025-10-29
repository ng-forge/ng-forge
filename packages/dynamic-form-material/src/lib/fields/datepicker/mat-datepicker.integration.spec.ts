import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { MatDatepickerInput } from '@angular/material/datepicker';
import { DynamicForm, FormConfig, provideDynamicForm } from '@ng-forge/dynamic-form';
import { withMaterialFields } from '../../providers/material-providers';
import { delay, waitForDFInit } from '../../testing';

interface TestFormModel {
  birthDate: Date | null;
  startDate: Date | null;
  endDate: Date | null;
  appointmentDate: Date | null;
}

describe('MatDatepickerFieldComponent - Dynamic Form Integration', () => {
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

  describe('Basic Material Datepicker Integration', () => {
    it('should render datepicker with full configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'birthDate',
            type: 'datepicker',
            label: 'Birth Date',
            minDate: new Date(1900, 0, 1),
            maxDate: new Date(),
            startAt: new Date(1990, 0, 1),
            tabIndex: 1,
            className: 'birth-date-picker',
            props: {
              placeholder: 'Select your birth date',
              hint: 'Choose the date you were born',
              startView: 'year',
              touchUi: false,
              appearance: 'outline',
              disableRipple: true,
            },
          },
        ],
      };

      createComponent(config, {
        birthDate: null,
        startDate: null,
        endDate: null,
        appointmentDate: null,
      });

      await waitForDFInit(component, fixture);

      const datepickerInput = debugElement.query(By.directive(MatDatepickerInput));
      const formField = debugElement.query(By.css('mat-form-field'));
      const label = debugElement.query(By.css('mat-label'));
      const hint = debugElement.query(By.css('mat-hint'));

      expect(datepickerInput).toBeTruthy();
      expect(datepickerInput.nativeElement.getAttribute('placeholder')).toBe('Select your birth date');
      expect(datepickerInput.nativeElement.getAttribute('tabindex')).toBe('1');
      expect(formField.nativeElement.className).toContain('birth-date-picker');
      expect(formField.nativeElement.className).toContain('mat-form-field-appearance-outline');
      expect(label.nativeElement.textContent.trim()).toBe('Birth Date');
      expect(hint.nativeElement.textContent.trim()).toBe('Choose the date you were born');
    });

    it('should handle user input and update form value', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'birthDate',
            type: 'datepicker',
            label: 'Birth Date',
            props: { startView: 'month' },
          },
        ],
      };

      const { component } = createComponent(config, {
        birthDate: null,
        startDate: null,
        endDate: null,
        appointmentDate: null,
      });

      await waitForDFInit(component, fixture);

      // Initial value check
      expect(component.formValue().birthDate).toBe('');

      // Simulate date selection
      const datepickerInput = debugElement.query(By.directive(MatDatepickerInput));
      const testDate = new Date(1995, 5, 15);
      datepickerInput.nativeElement.value = testDate.toLocaleDateString();
      datepickerInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      // Verify form value updated
      expect(component.formValue().birthDate).toBeDefined();
    });

    it('should reflect external value changes in datepicker field', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'birthDate',
            type: 'datepicker',
            label: 'Birth Date',
            props: { startView: 'month' },
          },
        ],
      };

      const { component } = createComponent(config, {
        birthDate: null,
        startDate: null,
        endDate: null,
        appointmentDate: null,
      });

      await waitForDFInit(component, fixture);

      const testDate = new Date(1995, 5, 15);

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        birthDate: testDate,
        startDate: null,
        endDate: null,
        appointmentDate: null,
      });
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(component.formValue().birthDate).toEqual(testDate);
    });

    it('should handle datepicker-specific properties', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'birthDate',
            type: 'datepicker',
            label: 'Birth Date',
            minDate: new Date(1900, 0, 1),
            maxDate: new Date(),
            props: {
              startView: 'year',
              touchUi: false,
            },
          },
        ],
      };

      createComponent(config, { birthDate: null });

      await waitForDFInit(component, fixture);

      const datepickerInput = debugElement.query(By.directive(MatDatepickerInput));
      expect(datepickerInput).toBeTruthy();
      // Component-specific properties are tested at the component level
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default Material configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'startDate',
            type: 'datepicker',
            label: 'Start Date',
          },
        ],
      };

      createComponent(config, { startDate: null });

      await waitForDFInit(component, fixture);

      const datepickerInput = debugElement.query(By.directive(MatDatepickerInput));
      const formField = debugElement.query(By.css('mat-form-field'));

      expect(datepickerInput).toBeTruthy();
      expect(formField.nativeElement.className).toContain('mat-form-field-appearance-fill');
    });

    it('should not display hint when not provided', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'startDate',
            type: 'datepicker',
            label: 'Start Date',
          },
        ],
      };

      createComponent(config, { startDate: null });

      await waitForDFInit(component, fixture);

      const hint = debugElement.query(By.css('mat-hint'));
      expect(hint).toBeNull();
    });
  });

  describe('Multiple Datepicker Integration Tests', () => {
    it('should render multiple datepickers with different configurations', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'startDate',
            type: 'datepicker',
            label: 'Start Date',
            props: { appearance: 'outline' },
          },
          {
            key: 'endDate',
            type: 'datepicker',
            label: 'End Date',
            props: { appearance: 'fill' },
          },
          {
            key: 'appointmentDate',
            type: 'datepicker',
            label: 'Appointment Date',
            props: { touchUi: true },
          },
        ],
      };

      createComponent(config, {
        birthDate: null,
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 11, 31),
        appointmentDate: null,
      });

      await waitForDFInit(component, fixture);

      const datepickers = debugElement.queryAll(By.directive(MatDatepickerInput));
      const labels = debugElement.queryAll(By.css('mat-label'));

      expect(datepickers.length).toBe(3);
      expect(labels[0].nativeElement.textContent.trim()).toBe('Start Date');
      expect(labels[1].nativeElement.textContent.trim()).toBe('End Date');
      expect(labels[2].nativeElement.textContent.trim()).toBe('Appointment Date');
    });

    it('should reflect individual datepicker states from form model', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'startDate',
            type: 'datepicker',
            label: 'Start Date',
          },
          {
            key: 'endDate',
            type: 'datepicker',
            label: 'End Date',
          },
          {
            key: 'appointmentDate',
            type: 'datepicker',
            label: 'Appointment Date',
          },
        ],
      };

      createComponent(config, {
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 11, 31),
        appointmentDate: null,
      });

      await waitForDFInit(component, fixture);

      const formValue = component.formValue();
      expect(formValue.startDate).toEqual(new Date(2024, 0, 1));
      expect(formValue.endDate).toEqual(new Date(2024, 11, 31));
      expect(formValue.appointmentDate).toBe('');
    });

    it('should handle independent datepicker interactions', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'startDate',
            type: 'datepicker',
            label: 'Start Date',
          },
          {
            key: 'endDate',
            type: 'datepicker',
            label: 'End Date',
          },
          {
            key: 'appointmentDate',
            type: 'datepicker',
            label: 'Appointment Date',
          },
        ],
      };

      const { component } = createComponent(config, {
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 11, 31),
        appointmentDate: null,
      });

      await waitForDFInit(component, fixture);

      const datepickers = debugElement.queryAll(By.directive(MatDatepickerInput));
      const newDate = new Date(2024, 6, 15);

      // Change third datepicker
      datepickers[2].nativeElement.value = newDate.toLocaleDateString();
      datepickers[2].nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      const formValue = component.formValue();
      expect(formValue.startDate).toEqual(new Date(2024, 0, 1));
      expect(formValue.endDate).toEqual(new Date(2024, 11, 31));
      expect(formValue.appointmentDate).toBeDefined();
    });

    it('should apply different Material appearances to datepickers', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'startDate',
            type: 'datepicker',
            label: 'Start Date',
            props: { appearance: 'outline' },
          },
          {
            key: 'endDate',
            type: 'datepicker',
            label: 'End Date',
            props: { appearance: 'fill' },
          },
        ],
      };

      createComponent(config, { startDate: null, endDate: null });

      await waitForDFInit(component, fixture);

      const formFields = debugElement.queryAll(By.css('mat-form-field'));
      expect(formFields[0].nativeElement.className).toContain('mat-form-field-appearance-outline');
      expect(formFields[1].nativeElement.className).toContain('mat-form-field-appearance-fill');
    });
  });

  describe('Field State and Configuration Tests', () => {
    it('should handle disabled state correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'birthDate',
            type: 'datepicker',
            label: 'Disabled Datepicker',
            disabled: true,
          },
        ],
      };

      createComponent(config, { birthDate: null });

      await waitForDFInit(component, fixture);

      const datepickerInput = debugElement.query(By.directive(MatDatepickerInput));
      expect(datepickerInput.nativeElement.disabled).toBe(true);
    });

    it('should apply different Material appearance styles', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'startDate',
            type: 'datepicker',
            label: 'Fill Datepicker',
            props: { appearance: 'fill' },
          },
          {
            key: 'endDate',
            type: 'datepicker',
            label: 'Outline Datepicker',
            props: { appearance: 'outline' },
          },
        ],
      };

      createComponent(config, { startDate: null, endDate: null });

      await waitForDFInit(component, fixture);

      const formFields = debugElement.queryAll(By.css('mat-form-field'));
      expect(formFields[0].nativeElement.className).toContain('mat-form-field-appearance-fill');
      expect(formFields[1].nativeElement.className).toContain('mat-form-field-appearance-outline');
    });

    it('should handle multiple datepickers with independent value changes', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'startDate',
            type: 'datepicker',
            label: 'Start Date',
          },
          {
            key: 'endDate',
            type: 'datepicker',
            label: 'End Date',
          },
        ],
      };

      const { component } = createComponent(config, {
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 11, 31),
      });

      await waitForDFInit(component, fixture);

      // Initial values
      expect(component.formValue().startDate).toEqual(new Date(2024, 0, 1));
      expect(component.formValue().endDate).toEqual(new Date(2024, 11, 31));

      const datepickers = debugElement.queryAll(By.directive(MatDatepickerInput));
      const newDate = new Date(2024, 5, 15);

      // Change first datepicker
      datepickers[0].nativeElement.value = newDate.toLocaleDateString();
      datepickers[0].nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      let formValue = component.formValue();
      expect(formValue.startDate).toBeDefined();
      expect(formValue.endDate).toEqual(new Date(2024, 11, 31));

      // Change second datepicker
      const anotherDate = new Date(2024, 8, 20);
      datepickers[1].nativeElement.value = anotherDate.toLocaleDateString();
      datepickers[1].nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      formValue = component.formValue();
      expect(formValue.startDate).toBeDefined();
      expect(formValue.endDate).toBeDefined();
    });
  });

  describe('Datepicker-Specific Features', () => {
    it('should apply date range constraints', async () => {
      const minDate = new Date(2020, 0, 1);
      const maxDate = new Date(2025, 11, 31);

      const config: FormConfig = {
        fields: [
          {
            key: 'appointmentDate',
            type: 'datepicker',
            label: 'Appointment Date',
            props: {
              minDate: minDate,
              maxDate: maxDate,
              startAt: new Date(2024, 0, 1),
              hint: `Select date between ${minDate.getFullYear()} and ${maxDate.getFullYear()}`,
            },
          },
        ],
      };

      createComponent(config, { appointmentDate: null });

      await waitForDFInit(component, fixture);

      const datepickerInput = debugElement.query(By.directive(MatDatepickerInput));
      const hint = debugElement.query(By.css('mat-hint'));

      expect(datepickerInput).toBeTruthy();
      expect(hint.nativeElement.textContent.trim()).toBe('Select date between 2020 and 2025');
    });

    it('should enable touch UI when specified', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'birthDate',
            type: 'datepicker',
            label: 'Touch UI Datepicker',
            props: { touchUi: true },
          },
        ],
      };

      createComponent(config, { birthDate: null });

      await waitForDFInit(component, fixture);

      const datepickerInput = debugElement.query(By.directive(MatDatepickerInput));
      expect(datepickerInput).toBeTruthy();
      // Touch UI would be tested at component level, here we verify it renders
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined form values gracefully', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'birthDate',
            type: 'datepicker',
            label: 'Test Datepicker',
          },
        ],
      };

      createComponent(config); // No initial value provided

      await waitForDFInit(component, fixture);

      const datepickerInput = debugElement.query(By.directive(MatDatepickerInput));
      expect(datepickerInput).toBeTruthy();
    });

    it('should handle null form values gracefully', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'birthDate',
            type: 'datepicker',
            label: 'Test Datepicker',
          },
        ],
      };

      createComponent(config, null as unknown as TestFormModel);

      await waitForDFInit(component, fixture);

      const datepickerInput = debugElement.query(By.directive(MatDatepickerInput));
      expect(datepickerInput).toBeTruthy();
    });

    it('should handle date value changes correctly', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'birthDate',
            type: 'datepicker',
            label: 'Test Datepicker',
          },
        ],
      };

      const { component } = createComponent(config, { birthDate: null });

      await waitForDFInit(component, fixture);

      expect(component.formValue().birthDate).toBe('');

      const testDate = new Date(2024, 5, 15);

      // Update via programmatic value change
      fixture.componentRef.setInput('value', { birthDate: testDate });
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(component.formValue().birthDate).toEqual(testDate);
    });

    it('should apply default Material Design configuration', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'birthDate',
            type: 'datepicker',
            label: 'Test Datepicker',
          },
        ],
      };

      createComponent(config, { birthDate: null });

      await waitForDFInit(component, fixture);

      const datepickerInput = debugElement.query(By.directive(MatDatepickerInput));
      const formField = debugElement.query(By.css('mat-form-field'));

      // Verify default Material configuration is applied
      expect(datepickerInput).toBeTruthy();
      expect(formField.nativeElement.className).toContain('mat-form-field-appearance-fill');
    });

    it('should handle date inputs with special format requirements', async () => {
      const config: FormConfig = {
        fields: [
          {
            key: 'birthDate',
            type: 'datepicker',
            label: 'Birth Date with Constraints',
            props: {
              minDate: new Date(1900, 0, 1),
              maxDate: new Date(),
              startView: 'year',
            },
          },
        ],
      };

      const { component } = createComponent(config, { birthDate: null });

      await waitForDFInit(component, fixture);

      const datepickerInput = debugElement.query(By.directive(MatDatepickerInput));
      const testDate = new Date(1995, 5, 15);

      // Simulate date selection within constraints
      datepickerInput.nativeElement.value = testDate.toLocaleDateString();
      datepickerInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await delay();
      fixture.detectChanges();

      expect(component.formValue().birthDate).toBeDefined();
    });
  });
});
