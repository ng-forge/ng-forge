import { untracked } from '@angular/core';
import { By } from '@angular/platform-browser';
import { createTestTranslationService } from '../../testing/fake-translation.service';
import { PrimeNGFormTestUtils } from '../../testing/primeng-test-utils';
import { DatePicker } from 'primeng/datepicker';

describe('PrimeDatepickerFieldComponent', () => {
  describe('Basic PrimeNG Datepicker Integration', () => {
    it('should render datepicker with full configuration', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'birthDate',
          type: 'datepicker',
          label: 'Birth Date',
          placeholder: 'Select your birth date',
          minDate: new Date(1900, 0, 1),
          maxDate: new Date(),
          tabIndex: 1,
          className: 'birth-date-picker',
          props: {
            hint: 'Choose the date you were born',
            view: 'year',
            touchUI: false,
            showIcon: true,
            dateFormat: 'mm/dd/yy',
          },
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          birthDate: null,
          startDate: null,
          endDate: null,
          appointmentDate: null,
        },
      });

      const calendar = fixture.debugElement.query(By.directive(DatePicker));
      const hostElement = fixture.debugElement.query(By.css('[data-testid="birthDate"]'));
      const label = fixture.debugElement.query(By.css('label'));
      const hint = fixture.debugElement.query(By.css('small.df-prime-hint'));

      expect(calendar).toBeTruthy();
      expect(hostElement.nativeElement.className).toContain('birth-date-picker');
      expect(label.nativeElement.textContent.trim()).toBe('Birth Date');
      expect(hint.nativeElement.textContent.trim()).toBe('Choose the date you were born');
    });

    it('should handle user input and update form value', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeDatepickerField({ key: 'birthDate', props: { view: 'month' } })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          birthDate: null,
          startDate: null,
          endDate: null,
          appointmentDate: null,
        },
      });

      // Initial value check
      expect(PrimeNGFormTestUtils.getFormValue(component).birthDate).toBe(null);

      // Simulate date selection via programmatic update
      const testDate = new Date(1995, 5, 15);
      await PrimeNGFormTestUtils.updateFormValue(fixture, { birthDate: testDate });

      // Verify form value updated
      expect(PrimeNGFormTestUtils.getFormValue(component).birthDate).toEqual(testDate);
    });

    it('should reflect external value changes in datepicker field', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeDatepickerField({ key: 'birthDate', props: { view: 'month' } })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          birthDate: null,
          startDate: null,
          endDate: null,
          appointmentDate: null,
        },
      });

      const testDate = new Date(1995, 5, 15);

      // Update form model programmatically
      await PrimeNGFormTestUtils.updateFormValue(fixture, {
        birthDate: testDate,
        startDate: null,
        endDate: null,
        appointmentDate: null,
      });

      expect(PrimeNGFormTestUtils.getFormValue(component).birthDate).toEqual(testDate);
    });

    it('should handle datepicker-specific properties', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'birthDate',
          type: 'datepicker',
          label: 'Birth Date',
          minDate: new Date(1900, 0, 1),
          maxDate: new Date(),
          props: {
            view: 'year',
            touchUI: false,
          },
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { birthDate: null },
      });

      const calendar = fixture.debugElement.query(By.directive(DatePicker));
      expect(calendar).toBeTruthy();
      // Component-specific properties are tested at the component level
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default PrimeNG configuration', async () => {
      const config = PrimeNGFormTestUtils.builder().primeDatepickerField({ key: 'startDate' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { startDate: null },
      });

      const calendar = fixture.debugElement.query(By.directive(DatePicker));
      const fieldWrapper = fixture.debugElement.query(By.css('df-prime-datepicker'));

      expect(calendar).toBeTruthy();
      expect(fieldWrapper).toBeTruthy();
    });

    it('should not display hint when not provided', async () => {
      const config = PrimeNGFormTestUtils.builder().primeDatepickerField({ key: 'startDate' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { startDate: null },
      });

      const hint = fixture.debugElement.query(By.css('small.df-prime-hint'));
      expect(hint).toBeNull();
    });
  });

  describe('Multiple Datepicker Integration Tests', () => {
    it('should render multiple datepickers with different configurations', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeDatepickerField({ key: 'startDate', label: 'Start Date', props: { showIcon: true } })
        .primeDatepickerField({ key: 'endDate', label: 'End Date', props: { showIcon: false } })
        .primeDatepickerField({ key: 'appointmentDate', label: 'Appointment Date', props: { touchUI: true } })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          birthDate: null,
          startDate: new Date(2024, 0, 1),
          endDate: new Date(2024, 11, 31),
          appointmentDate: null,
        },
      });

      const calendars = fixture.debugElement.queryAll(By.directive(DatePicker));
      const labels = fixture.debugElement.queryAll(By.css('label'));

      expect(calendars.length).toBe(3);
      expect(labels[0].nativeElement.textContent.trim()).toBe('Start Date');
      expect(labels[1].nativeElement.textContent.trim()).toBe('End Date');
      expect(labels[2].nativeElement.textContent.trim()).toBe('Appointment Date');
    });

    it('should reflect individual datepicker states from form model', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeDatepickerField({ key: 'startDate' })
        .primeDatepickerField({ key: 'endDate' })
        .primeDatepickerField({ key: 'appointmentDate' })
        .build();

      const { component } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          startDate: new Date(2024, 0, 1),
          endDate: new Date(2024, 11, 31),
          appointmentDate: null,
        },
      });

      const formValue = PrimeNGFormTestUtils.getFormValue(component);
      expect(formValue.startDate).toEqual(new Date(2024, 0, 1));
      expect(formValue.endDate).toEqual(new Date(2024, 11, 31));
      expect(formValue.appointmentDate).toBe(null);
    });

    it('should handle independent datepicker interactions', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeDatepickerField({ key: 'startDate' })
        .primeDatepickerField({ key: 'endDate' })
        .primeDatepickerField({ key: 'appointmentDate' })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          startDate: new Date(2024, 0, 1),
          endDate: new Date(2024, 11, 31),
          appointmentDate: null,
        },
      });

      const newDate = new Date(2024, 6, 15);

      // Change third datepicker via programmatic update
      await PrimeNGFormTestUtils.updateFormValue(fixture, { appointmentDate: newDate });

      const formValue = PrimeNGFormTestUtils.getFormValue(component);
      expect(formValue.startDate).toEqual(new Date(2024, 0, 1));
      expect(formValue.endDate).toEqual(new Date(2024, 11, 31));
      expect(formValue.appointmentDate).toEqual(newDate);
    });

    it('should apply different PrimeNG configurations to datepickers', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeDatepickerField({ key: 'startDate', props: { showIcon: true } })
        .primeDatepickerField({ key: 'endDate', props: { showIcon: false } })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { startDate: null, endDate: null },
      });

      const calendars = fixture.debugElement.queryAll(By.directive(DatePicker));
      expect(calendars[0]).toBeTruthy();
      expect(calendars[1]).toBeTruthy();
    });
  });

  describe('Field State and Configuration Tests', () => {
    it('should handle disabled state correctly', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'birthDate',
          type: 'datepicker',
          label: 'Disabled Datepicker',
          disabled: true,
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { birthDate: null },
      });

      const calendar = fixture.debugElement.query(By.directive(DatePicker));
      expect(calendar.componentInstance.disabled()).toBe(true);
    });

    it('should apply different PrimeNG styles', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeDatepickerField({ key: 'startDate', props: { showIcon: true } })
        .primeDatepickerField({ key: 'endDate', props: { showIcon: false } })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { startDate: null, endDate: null },
      });

      const calendars = fixture.debugElement.queryAll(By.directive(DatePicker));
      expect(calendars[0]).toBeTruthy();
      expect(calendars[1]).toBeTruthy();
    });

    it('should handle multiple datepickers with independent value changes', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeDatepickerField({ key: 'startDate' })
        .primeDatepickerField({ key: 'endDate' })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: {
          startDate: new Date(2024, 0, 1),
          endDate: new Date(2024, 11, 31),
        },
      });

      // Initial values
      expect(PrimeNGFormTestUtils.getFormValue(component).startDate).toEqual(new Date(2024, 0, 1));
      expect(PrimeNGFormTestUtils.getFormValue(component).endDate).toEqual(new Date(2024, 11, 31));

      const newDate = new Date(2024, 5, 15);

      // Change first datepicker via programmatic update
      await PrimeNGFormTestUtils.updateFormValue(fixture, { startDate: newDate });

      let formValue = PrimeNGFormTestUtils.getFormValue(component);
      expect(formValue.startDate).toEqual(newDate);
      expect(formValue.endDate).toEqual(new Date(2024, 11, 31));

      // Change second datepicker
      const anotherDate = new Date(2024, 8, 20);
      await PrimeNGFormTestUtils.updateFormValue(fixture, { endDate: anotherDate });

      formValue = PrimeNGFormTestUtils.getFormValue(component);
      expect(formValue.startDate).toEqual(newDate);
      expect(formValue.endDate).toEqual(anotherDate);
    });
  });

  describe('Datepicker-Specific Features', () => {
    it('should apply date range constraints', async () => {
      const minDate = new Date(2020, 0, 1);
      const maxDate = new Date(2025, 11, 31);

      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'appointmentDate',
          type: 'datepicker',
          label: 'Appointment Date',
          minDate: minDate,
          maxDate: maxDate,
          props: {
            hint: `Select date between ${minDate.getFullYear()} and ${maxDate.getFullYear()}`,
          },
        })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { appointmentDate: null },
      });

      const calendar = fixture.debugElement.query(By.directive(DatePicker));
      const hint = fixture.debugElement.query(By.css('small.df-prime-hint'));

      expect(calendar).toBeTruthy();
      expect(hint.nativeElement.textContent.trim()).toBe('Select date between 2020 and 2025');
    });

    it('should enable touch UI when specified', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .primeDatepickerField({ key: 'birthDate', props: { touchUI: true } })
        .build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { birthDate: null },
      });

      const calendar = fixture.debugElement.query(By.directive(DatePicker));
      expect(calendar).toBeTruthy();
      // Touch UI would be tested at component level, here we verify it renders
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined form values gracefully', async () => {
      const config = PrimeNGFormTestUtils.builder().primeDatepickerField({ key: 'birthDate' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({ config }); // No initial value provided

      const calendar = fixture.debugElement.query(By.directive(DatePicker));
      expect(calendar).toBeTruthy();
    });

    it('should handle null form values gracefully', async () => {
      const config = PrimeNGFormTestUtils.builder().primeDatepickerField({ key: 'birthDate' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: null as unknown,
      });

      const calendar = fixture.debugElement.query(By.directive(DatePicker));
      expect(calendar).toBeTruthy();
    });

    it('should handle date value changes correctly', async () => {
      const config = PrimeNGFormTestUtils.builder().primeDatepickerField({ key: 'birthDate' }).build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { birthDate: null },
      });

      expect(PrimeNGFormTestUtils.getFormValue(component).birthDate).toBe(null);

      const testDate = new Date(2024, 5, 15);

      // Update via programmatic value change
      await PrimeNGFormTestUtils.updateFormValue(fixture, { birthDate: testDate });

      expect(PrimeNGFormTestUtils.getFormValue(component).birthDate).toEqual(testDate);
    });

    it('should apply default PrimeNG configuration', async () => {
      const config = PrimeNGFormTestUtils.builder().primeDatepickerField({ key: 'birthDate' }).build();

      const { fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { birthDate: null },
      });

      const calendar = fixture.debugElement.query(By.directive(DatePicker));
      const fieldWrapper = fixture.debugElement.query(By.css('df-prime-datepicker'));

      // Verify default PrimeNG configuration is applied
      expect(calendar).toBeTruthy();
      expect(fieldWrapper).toBeTruthy();
    });

    it('should handle date inputs with special format requirements', async () => {
      const config = PrimeNGFormTestUtils.builder()
        .field({
          key: 'birthDate',
          type: 'datepicker',
          label: 'Birth Date with Constraints',
          props: {
            minDate: new Date(1900, 0, 1),
            maxDate: new Date(),
            view: 'year',
          },
        })
        .build();

      const { component, fixture } = await PrimeNGFormTestUtils.createTest({
        config,
        initialValue: { birthDate: null },
      });

      const testDate = new Date(1995, 5, 15);

      // Simulate date selection within constraints via programmatic update
      await PrimeNGFormTestUtils.updateFormValue(fixture, { birthDate: testDate });

      expect(PrimeNGFormTestUtils.getFormValue(component).birthDate).toEqual(testDate);
    });
  });

  describe('Dynamic Text Support', () => {
    describe('Translation Service Integration', () => {
      it('should handle translation service with dynamic language updates for labels and placeholders', async () => {
        const translationService = createTestTranslationService({
          'form.birthDate.label': 'Birth Date',
          'form.birthDate.placeholder': 'Select your birth date',
          'form.birthDate.hint': 'Choose the date you were born',
        });

        const config = PrimeNGFormTestUtils.builder()
          .field({
            key: 'birthDate',
            type: 'datepicker',
            label: translationService.translate('form.birthDate.label'),
            placeholder: translationService.translate('form.birthDate.placeholder'),
            props: {
              hint: translationService.translate('form.birthDate.hint'),
            },
          })
          .build();

        const { fixture } = await PrimeNGFormTestUtils.createTest({
          config,
          initialValue: { birthDate: null },
        });

        const label = fixture.debugElement.query(By.css('label'));
        const hint = fixture.debugElement.query(By.css('small.df-prime-hint'));

        // Initial translations
        expect(label.nativeElement.textContent.trim()).toBe('Birth Date');
        expect(hint.nativeElement.textContent.trim()).toBe('Choose the date you were born');

        // Update to Spanish
        translationService.addTranslations({
          'form.birthDate.label': 'Fecha de Nacimiento',
          'form.birthDate.placeholder': 'Selecciona tu fecha de nacimiento',
          'form.birthDate.hint': 'Elige la fecha en que naciste',
        });
        translationService.setLanguage('es');
        untracked(() => fixture.detectChanges());
        await fixture.whenStable();

        expect(label.nativeElement.textContent.trim()).toBe('Fecha de Nacimiento');
        expect(hint.nativeElement.textContent.trim()).toBe('Elige la fecha en que naciste');
      });
    });
  });
});
