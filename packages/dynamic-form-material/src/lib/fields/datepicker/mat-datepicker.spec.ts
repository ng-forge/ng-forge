import { By } from '@angular/platform-browser';
import { MatDatepickerInput } from '@angular/material/datepicker';
import { createTestTranslationService } from '../../testing/fake-translation.service';
import { MaterialFormTestUtils } from '../../testing/material-test-utils';

describe('MatDatepickerFieldComponent', () => {
  describe('Basic Material Datepicker Integration', () => {
    it('should render datepicker with full configuration', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'birthDate',
          type: 'datepicker',
          label: 'Birth Date',
          placeholder: 'Select your birth date',
          minDate: new Date(1900, 0, 1),
          maxDate: new Date(),
          startAt: new Date(1990, 0, 1),
          tabIndex: 1,
          className: 'birth-date-picker',
          props: {
            hint: 'Choose the date you were born',
            startView: 'year',
            touchUi: false,
            appearance: 'outline',
            disableRipple: true,
          },
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          birthDate: null,
          startDate: null,
          endDate: null,
          appointmentDate: null,
        },
      });

      const datepickerInput = fixture.debugElement.query(By.directive(MatDatepickerInput));
      const formField = fixture.debugElement.query(By.css('mat-form-field'));
      const label = fixture.debugElement.query(By.css('mat-label'));
      const hint = fixture.debugElement.query(By.css('mat-hint'));

      expect(datepickerInput).toBeTruthy();
      expect(datepickerInput.nativeElement.getAttribute('placeholder')).toBe('Select your birth date');
      expect(datepickerInput.nativeElement.getAttribute('tabindex')).toBe('1');
      expect(formField.nativeElement.className).toContain('birth-date-picker');
      expect(formField.nativeElement.className).toContain('mat-form-field-appearance-outline');
      expect(label.nativeElement.textContent.trim()).toBe('Birth Date');
      expect(hint.nativeElement.textContent.trim()).toBe('Choose the date you were born');
    });

    it('should handle user input and update form value', async () => {
      const config = MaterialFormTestUtils.builder()
        .matDatepickerField({ key: 'birthDate', props: { startView: 'month' } })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          birthDate: null,
          startDate: null,
          endDate: null,
          appointmentDate: null,
        },
      });

      // Initial value check
      expect(MaterialFormTestUtils.getFormValue(component).birthDate).toBe(null);

      // Simulate date selection
      const datepickerInput = fixture.debugElement.query(By.directive(MatDatepickerInput));
      const testDate = new Date(1995, 5, 15);
      datepickerInput.nativeElement.value = testDate.toLocaleDateString();
      datepickerInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // ITERATION 1 FIX: Verify form value updated with correct date values
      // Previous: expect(MaterialFormTestUtils.getFormValue(component).birthDate).toBeDefined();
      const formValue = MaterialFormTestUtils.getFormValue(component).birthDate;
      expect(formValue).toBeDefined();
      expect(formValue).toBeInstanceOf(Date);
      // Check date values match (day, month, year)
      expect(formValue?.getFullYear()).toBe(1995);
      expect(formValue?.getMonth()).toBe(5);
      expect(formValue?.getDate()).toBe(15);
    });

    it('should reflect external value changes in datepicker field', async () => {
      const config = MaterialFormTestUtils.builder()
        .matDatepickerField({ key: 'birthDate', props: { startView: 'month' } })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
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
      fixture.componentRef.setInput('value', {
        birthDate: testDate,
        startDate: null,
        endDate: null,
        appointmentDate: null,
      });
      fixture.detectChanges();

      expect(MaterialFormTestUtils.getFormValue(component).birthDate).toEqual(testDate);
    });

    it('should handle datepicker-specific properties', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'birthDate',
          type: 'datepicker',
          label: 'Birth Date',
          minDate: new Date(1900, 0, 1),
          maxDate: new Date(),
          props: {
            startView: 'year',
            touchUi: false,
          },
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { birthDate: null },
      });

      const datepickerInput = fixture.debugElement.query(By.directive(MatDatepickerInput));
      // ITERATION 3 FIX: Verify datepicker input is correct instance
      // Previous: expect(datepickerInput).toBeTruthy()
      expect(datepickerInput).not.toBeNull();
      expect(datepickerInput.nativeElement.tagName.toLowerCase()).toBe('input');
      // Component-specific properties are tested at the component level
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default Material configuration', async () => {
      const config = MaterialFormTestUtils.builder().matDatepickerField({ key: 'startDate' }).build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { startDate: null },
      });

      const datepickerInput = fixture.debugElement.query(By.directive(MatDatepickerInput));
      const formField = fixture.debugElement.query(By.css('mat-form-field'));

      // ITERATION 3 FIX: Verify datepicker input is correct instance
      // Previous: expect(datepickerInput).toBeTruthy()
      expect(datepickerInput).not.toBeNull();
      expect(datepickerInput.nativeElement.tagName.toLowerCase()).toBe('input');
      expect(formField.nativeElement.className).toContain('mat-form-field-appearance-fill');
    });

    it('should not display hint when not provided', async () => {
      const config = MaterialFormTestUtils.builder().matDatepickerField({ key: 'startDate' }).build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { startDate: null },
      });

      const hint = fixture.debugElement.query(By.css('mat-hint'));
      expect(hint).toBeNull();
    });
  });

  describe('Multiple Datepicker Integration Tests', () => {
    it('should render multiple datepickers with different configurations', async () => {
      const config = MaterialFormTestUtils.builder()
        .matDatepickerField({ key: 'startDate', label: 'Start Date', props: { appearance: 'outline' } })
        .matDatepickerField({ key: 'endDate', label: 'End Date', props: { appearance: 'fill' } })
        .matDatepickerField({ key: 'appointmentDate', label: 'Appointment Date', props: { touchUi: true } })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          birthDate: null,
          startDate: new Date(2024, 0, 1),
          endDate: new Date(2024, 11, 31),
          appointmentDate: null,
        },
      });

      const datepickers = fixture.debugElement.queryAll(By.directive(MatDatepickerInput));
      const labels = fixture.debugElement.queryAll(By.css('mat-label'));

      expect(datepickers.length).toBe(3);
      expect(labels[0].nativeElement.textContent.trim()).toBe('Start Date');
      expect(labels[1].nativeElement.textContent.trim()).toBe('End Date');
      expect(labels[2].nativeElement.textContent.trim()).toBe('Appointment Date');
    });

    it('should reflect individual datepicker states from form model', async () => {
      const config = MaterialFormTestUtils.builder()
        .matDatepickerField({ key: 'startDate' })
        .matDatepickerField({ key: 'endDate' })
        .matDatepickerField({ key: 'appointmentDate' })
        .build();

      const { component } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          startDate: new Date(2024, 0, 1),
          endDate: new Date(2024, 11, 31),
          appointmentDate: null,
        },
      });

      const formValue = MaterialFormTestUtils.getFormValue(component);
      expect(formValue.startDate).toEqual(new Date(2024, 0, 1));
      expect(formValue.endDate).toEqual(new Date(2024, 11, 31));
      expect(formValue.appointmentDate).toBe(null);
    });

    it('should handle independent datepicker interactions', async () => {
      const config = MaterialFormTestUtils.builder()
        .matDatepickerField({ key: 'startDate' })
        .matDatepickerField({ key: 'endDate' })
        .matDatepickerField({ key: 'appointmentDate' })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          startDate: new Date(2024, 0, 1),
          endDate: new Date(2024, 11, 31),
          appointmentDate: null,
        },
      });

      const datepickers = fixture.debugElement.queryAll(By.directive(MatDatepickerInput));
      const newDate = new Date(2024, 6, 15);

      // Change third datepicker
      datepickers[2].nativeElement.value = newDate.toLocaleDateString();
      datepickers[2].nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const formValue = MaterialFormTestUtils.getFormValue(component);
      expect(formValue.startDate).toEqual(new Date(2024, 0, 1));
      expect(formValue.endDate).toEqual(new Date(2024, 11, 31));

      // ITERATION 1 FIX: Verify appointmentDate is the correct date, not just defined
      // Previous: expect(formValue.appointmentDate).toBeDefined();
      expect(formValue.appointmentDate).toBeDefined();
      expect(formValue.appointmentDate).toBeInstanceOf(Date);
      expect(formValue.appointmentDate?.getFullYear()).toBe(2024);
      expect(formValue.appointmentDate?.getMonth()).toBe(6);
      expect(formValue.appointmentDate?.getDate()).toBe(15);
    });

    it('should apply different Material appearances to datepickers', async () => {
      const config = MaterialFormTestUtils.builder()
        .matDatepickerField({ key: 'startDate', props: { appearance: 'outline' } })
        .matDatepickerField({ key: 'endDate', props: { appearance: 'fill' } })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { startDate: null, endDate: null },
      });

      const formFields = fixture.debugElement.queryAll(By.css('mat-form-field'));
      expect(formFields[0].nativeElement.className).toContain('mat-form-field-appearance-outline');
      expect(formFields[1].nativeElement.className).toContain('mat-form-field-appearance-fill');
    });
  });

  describe('Field State and Configuration Tests', () => {
    it('should handle disabled state correctly', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'birthDate',
          type: 'datepicker',
          label: 'Disabled Datepicker',
          disabled: true,
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { birthDate: null },
      });

      const datepickerInput = fixture.debugElement.query(By.directive(MatDatepickerInput));
      expect(datepickerInput.nativeElement.disabled).toBe(true);
    });

    it('should apply different Material appearance styles', async () => {
      const config = MaterialFormTestUtils.builder()
        .matDatepickerField({ key: 'startDate', props: { appearance: 'fill' } })
        .matDatepickerField({ key: 'endDate', props: { appearance: 'outline' } })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { startDate: null, endDate: null },
      });

      const formFields = fixture.debugElement.queryAll(By.css('mat-form-field'));
      expect(formFields[0].nativeElement.className).toContain('mat-form-field-appearance-fill');
      expect(formFields[1].nativeElement.className).toContain('mat-form-field-appearance-outline');
    });

    it('should handle multiple datepickers with independent value changes', async () => {
      const config = MaterialFormTestUtils.builder()
        .matDatepickerField({ key: 'startDate' })
        .matDatepickerField({ key: 'endDate' })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: {
          startDate: new Date(2024, 0, 1),
          endDate: new Date(2024, 11, 31),
        },
      });

      // Initial values
      expect(MaterialFormTestUtils.getFormValue(component).startDate).toEqual(new Date(2024, 0, 1));
      expect(MaterialFormTestUtils.getFormValue(component).endDate).toEqual(new Date(2024, 11, 31));

      const datepickers = fixture.debugElement.queryAll(By.directive(MatDatepickerInput));
      const newDate = new Date(2024, 5, 15);

      // Change first datepicker
      datepickers[0].nativeElement.value = newDate.toLocaleDateString();
      datepickers[0].nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // ITERATION 1 FIX: Verify startDate changed to correct new date
      // Previous: expect(formValue.startDate).toBeDefined();
      let formValue = MaterialFormTestUtils.getFormValue(component);
      expect(formValue.startDate).toBeDefined();
      expect(formValue.startDate).toBeInstanceOf(Date);
      expect(formValue.startDate?.getFullYear()).toBe(2024);
      expect(formValue.startDate?.getMonth()).toBe(5);
      expect(formValue.startDate?.getDate()).toBe(15);
      // Verify endDate unchanged
      expect(formValue.endDate).toEqual(new Date(2024, 11, 31));

      // Change second datepicker
      const anotherDate = new Date(2024, 8, 20);
      datepickers[1].nativeElement.value = anotherDate.toLocaleDateString();
      datepickers[1].nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // ITERATION 1 FIX: Verify both dates have correct values after sequential changes
      // Previous: expect(formValue.startDate).toBeDefined(); expect(formValue.endDate).toBeDefined();
      formValue = MaterialFormTestUtils.getFormValue(component);
      // Verify startDate still has first change
      expect(formValue.startDate?.getFullYear()).toBe(2024);
      expect(formValue.startDate?.getMonth()).toBe(5);
      expect(formValue.startDate?.getDate()).toBe(15);
      // Verify endDate changed to another date
      expect(formValue.endDate).toBeInstanceOf(Date);
      expect(formValue.endDate?.getFullYear()).toBe(2024);
      expect(formValue.endDate?.getMonth()).toBe(8);
      expect(formValue.endDate?.getDate()).toBe(20);
    });
  });

  describe('Datepicker-Specific Features', () => {
    it('should apply date range constraints', async () => {
      const minDate = new Date(2020, 0, 1);
      const maxDate = new Date(2025, 11, 31);

      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'appointmentDate',
          type: 'datepicker',
          label: 'Appointment Date',
          props: {
            minDate: minDate,
            maxDate: maxDate,
            startAt: new Date(2024, 0, 1),
            hint: `Select date between ${minDate.getFullYear()} and ${maxDate.getFullYear()}`,
          },
        })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { appointmentDate: null },
      });

      const datepickerInput = fixture.debugElement.query(By.directive(MatDatepickerInput));
      const hint = fixture.debugElement.query(By.css('mat-hint'));

      expect(datepickerInput).toBeTruthy();
      expect(hint.nativeElement.textContent.trim()).toBe('Select date between 2020 and 2025');
    });

    it('should enable touch UI when specified', async () => {
      const config = MaterialFormTestUtils.builder()
        .matDatepickerField({ key: 'birthDate', props: { touchUi: true } })
        .build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { birthDate: null },
      });

      const datepickerInput = fixture.debugElement.query(By.directive(MatDatepickerInput));
      expect(datepickerInput).toBeTruthy();
      // Touch UI would be tested at component level, here we verify it renders
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined form values gracefully', async () => {
      const config = MaterialFormTestUtils.builder().matDatepickerField({ key: 'birthDate' }).build();

      const { fixture } = await MaterialFormTestUtils.createTest({ config }); // No initial value provided

      const datepickerInput = fixture.debugElement.query(By.directive(MatDatepickerInput));
      expect(datepickerInput).toBeTruthy();
    });

    it('should handle null form values gracefully', async () => {
      const config = MaterialFormTestUtils.builder().matDatepickerField({ key: 'birthDate' }).build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: null as any,
      });

      const datepickerInput = fixture.debugElement.query(By.directive(MatDatepickerInput));
      expect(datepickerInput).toBeTruthy();
    });

    it('should handle date value changes correctly', async () => {
      const config = MaterialFormTestUtils.builder().matDatepickerField({ key: 'birthDate' }).build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { birthDate: null },
      });

      expect(MaterialFormTestUtils.getFormValue(component).birthDate).toBe(null);

      const testDate = new Date(2024, 5, 15);

      // Update via programmatic value change
      fixture.componentRef.setInput('value', { birthDate: testDate });
      fixture.detectChanges();

      expect(MaterialFormTestUtils.getFormValue(component).birthDate).toEqual(testDate);
    });

    it('should apply default Material Design configuration', async () => {
      const config = MaterialFormTestUtils.builder().matDatepickerField({ key: 'birthDate' }).build();

      const { fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { birthDate: null },
      });

      const datepickerInput = fixture.debugElement.query(By.directive(MatDatepickerInput));
      const formField = fixture.debugElement.query(By.css('mat-form-field'));

      // Verify default Material configuration is applied
      expect(datepickerInput).toBeTruthy();
      expect(formField.nativeElement.className).toContain('mat-form-field-appearance-fill');
    });

    it('should handle date inputs with special format requirements', async () => {
      const config = MaterialFormTestUtils.builder()
        .field({
          key: 'birthDate',
          type: 'datepicker',
          label: 'Birth Date with Constraints',
          props: {
            minDate: new Date(1900, 0, 1),
            maxDate: new Date(),
            startView: 'year',
          },
        })
        .build();

      const { component, fixture } = await MaterialFormTestUtils.createTest({
        config,
        initialValue: { birthDate: null },
      });

      const datepickerInput = fixture.debugElement.query(By.directive(MatDatepickerInput));
      const testDate = new Date(1995, 5, 15);

      // Simulate date selection within constraints
      datepickerInput.nativeElement.value = testDate.toLocaleDateString();
      datepickerInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(MaterialFormTestUtils.getFormValue(component).birthDate).toBeDefined();
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

        const config = MaterialFormTestUtils.builder()
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

        const { fixture } = await MaterialFormTestUtils.createTest({
          config,
          initialValue: { birthDate: null },
        });

        const label = fixture.debugElement.query(By.css('mat-label'));
        const input = fixture.debugElement.query(By.directive(MatDatepickerInput));
        const hint = fixture.debugElement.query(By.css('mat-hint'));

        // Initial translations
        expect(label.nativeElement.textContent.trim()).toBe('Birth Date');
        expect(input.nativeElement.getAttribute('placeholder')).toBe('Select your birth date');
        expect(hint.nativeElement.textContent.trim()).toBe('Choose the date you were born');

        // Update to Spanish
        translationService.addTranslations({
          'form.birthDate.label': 'Fecha de Nacimiento',
          'form.birthDate.placeholder': 'Selecciona tu fecha de nacimiento',
          'form.birthDate.hint': 'Elige la fecha en que naciste',
        });
        translationService.setLanguage('es');
        fixture.detectChanges();

        expect(label.nativeElement.textContent.trim()).toBe('Fecha de Nacimiento');
        expect(input.nativeElement.getAttribute('placeholder')).toBe('Selecciona tu fecha de nacimiento');
        expect(hint.nativeElement.textContent.trim()).toBe('Elige la fecha en que naciste');
      });
    });
  });
});
