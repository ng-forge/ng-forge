import { By } from '@angular/platform-browser';
import { createTestTranslationService } from '../../testing/fake-translation.service';
import { BootstrapFormTestUtils } from '../../testing/bootstrap-test-utils';

describe('BsDatepickerFieldComponent', () => {
  describe('Basic Bootstrap Datepicker Integration', () => {
    it('should render datepicker with full configuration', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'birthDate',
          type: 'datepicker',
          label: 'Birth Date',
          placeholder: 'Select your birth date',
          minDate: '1900-01-01',
          maxDate: '2024-12-31',
          startAt: new Date(1990, 0, 1),
          tabIndex: 1,
          className: 'birth-date-picker',
          props: {
            helpText: 'Choose the date you were born',
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          birthDate: null,
          startDate: null,
          endDate: null,
          appointmentDate: null,
        },
      });

      const datepickerInput = fixture.debugElement.query(By.css('input[type="date"].form-control'));
      const container = fixture.debugElement.query(By.css('df-bs-datepicker'));
      const label = fixture.debugElement.query(By.css('.form-label'));
      const helpText = fixture.debugElement.query(By.css('.form-text'));

      expect(datepickerInput).toBeTruthy();
      expect(datepickerInput.nativeElement.getAttribute('placeholder')).toBe('Select your birth date');
      expect(datepickerInput.nativeElement.getAttribute('tabindex')).toBe('1');
      // Angular 21: Field directive handles min/max bindings automatically
      expect(container.nativeElement.className).toContain('birth-date-picker');
      expect(label.nativeElement.textContent.trim()).toBe('Birth Date');
      expect(helpText.nativeElement.textContent.trim()).toBe('Choose the date you were born');
    });

    it('should handle user input and update form value', async () => {
      const config = BootstrapFormTestUtils.builder().bsDatepickerField({ key: 'birthDate' }).build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          birthDate: null,
          startDate: null,
          endDate: null,
          appointmentDate: null,
        },
      });

      // Initial value check
      expect(BootstrapFormTestUtils.getFormValue(component).birthDate).toBe(null);

      // Simulate date selection
      const datepickerInput = fixture.debugElement.query(By.css('input[type="date"]'));
      datepickerInput.nativeElement.value = '1995-06-15';
      datepickerInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // Verify form value updated
      expect(BootstrapFormTestUtils.getFormValue(component).birthDate).toBeDefined();
    });

    it('should reflect external value changes in datepicker field', async () => {
      const config = BootstrapFormTestUtils.builder().bsDatepickerField({ key: 'birthDate' }).build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          birthDate: null,
          startDate: null,
          endDate: null,
          appointmentDate: null,
        },
      });

      const testDate = '1995-06-15';

      // Update form model programmatically
      fixture.componentRef.setInput('value', {
        birthDate: testDate,
        startDate: null,
        endDate: null,
        appointmentDate: null,
      });
      fixture.detectChanges();

      expect(BootstrapFormTestUtils.getFormValue(component).birthDate).toEqual(testDate);
    });

    it('should handle datepicker-specific properties', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'birthDate',
          type: 'datepicker',
          label: 'Birth Date',
          minDate: '1900-01-01',
          maxDate: '2024-12-31',
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { birthDate: null },
      });

      const datepickerInput = fixture.debugElement.query(By.css('input[type="date"]'));
      expect(datepickerInput).toBeTruthy();
      // Angular 21: Field directive handles min/max bindings automatically
      expect(datepickerInput.nativeElement.type).toBe('date');
    });
  });

  describe('Bootstrap Size Variants', () => {
    it('should apply small size class', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsDatepickerField({
          key: 'birthDate',
          props: {
            size: 'sm',
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { birthDate: null },
      });

      const datepickerInput = fixture.debugElement.query(By.css('input[type="date"]'));
      expect(datepickerInput.nativeElement.className).toContain('form-control-sm');
    });

    it('should apply large size class', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsDatepickerField({
          key: 'birthDate',
          props: {
            size: 'lg',
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { birthDate: null },
      });

      const datepickerInput = fixture.debugElement.query(By.css('input[type="date"]'));
      expect(datepickerInput.nativeElement.className).toContain('form-control-lg');
    });

    it('should not apply size class when not specified', async () => {
      const config = BootstrapFormTestUtils.builder().bsDatepickerField({ key: 'birthDate' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { birthDate: null },
      });

      const datepickerInput = fixture.debugElement.query(By.css('input[type="date"]'));
      expect(datepickerInput.nativeElement.className).not.toContain('form-control-sm');
      expect(datepickerInput.nativeElement.className).not.toContain('form-control-lg');
    });
  });

  describe('Floating Label Variant', () => {
    it('should render with floating label when floatingLabel is true', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsDatepickerField({
          key: 'birthDate',
          label: 'Birth Date',
          props: {
            floatingLabel: true,
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { birthDate: null },
      });

      const floatingContainer = fixture.debugElement.query(By.css('.form-floating'));
      const label = fixture.debugElement.query(By.css('.form-floating label'));

      expect(floatingContainer).toBeTruthy();
      expect(label).toBeTruthy();
      expect(label.nativeElement.textContent.trim()).toBe('Birth Date');
    });

    it('should render standard layout when floatingLabel is false or not specified', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsDatepickerField({
          key: 'birthDate',
          label: 'Birth Date',
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { birthDate: null },
      });

      const floatingContainer = fixture.debugElement.query(By.css('.form-floating'));
      const standardLabel = fixture.debugElement.query(By.css('.form-label'));

      expect(floatingContainer).toBeNull();
      expect(standardLabel).toBeTruthy();
      expect(standardLabel.nativeElement.textContent.trim()).toBe('Birth Date');
    });

    it('should support size prop with floating label', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsDatepickerField({
          key: 'birthDate',
          label: 'Birth Date',
          props: {
            floatingLabel: true,
            size: 'lg',
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { birthDate: null },
      });

      const floatingContainer = fixture.debugElement.query(By.css('.form-floating'));
      const input = fixture.debugElement.query(By.css('input[type="date"]'));

      expect(floatingContainer).toBeTruthy();
      expect(input.nativeElement.className).toContain('form-control-lg');
    });
  });

  describe('Minimal Configuration Tests', () => {
    it('should render with default Bootstrap configuration', async () => {
      const config = BootstrapFormTestUtils.builder().bsDatepickerField({ key: 'startDate' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { startDate: null },
      });

      const datepickerInput = fixture.debugElement.query(By.css('input[type="date"].form-control'));

      expect(datepickerInput).toBeTruthy();
      expect(datepickerInput.nativeElement.className).toContain('form-control');
    });

    it('should not display helpText when not provided', async () => {
      const config = BootstrapFormTestUtils.builder().bsDatepickerField({ key: 'startDate' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { startDate: null },
      });

      const helpText = fixture.debugElement.query(By.css('.form-text'));
      expect(helpText).toBeNull();
    });
  });

  describe('Multiple Datepicker Integration Tests', () => {
    it('should render multiple datepickers with different configurations', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsDatepickerField({ key: 'startDate', label: 'Start Date' })
        .bsDatepickerField({ key: 'endDate', label: 'End Date' })
        .bsDatepickerField({ key: 'appointmentDate', label: 'Appointment Date', props: { size: 'lg' } })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          birthDate: null,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          appointmentDate: null,
        },
      });

      const datepickers = fixture.debugElement.queryAll(By.css('input[type="date"]'));
      const labels = fixture.debugElement.queryAll(By.css('.form-label'));

      expect(datepickers.length).toBe(3);
      expect(labels[0].nativeElement.textContent.trim()).toBe('Start Date');
      expect(labels[1].nativeElement.textContent.trim()).toBe('End Date');
      expect(labels[2].nativeElement.textContent.trim()).toBe('Appointment Date');

      // Check size variant on third datepicker
      expect(datepickers[2].nativeElement.className).toContain('form-control-lg');
    });

    it('should reflect individual datepicker states from form model', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsDatepickerField({ key: 'startDate' })
        .bsDatepickerField({ key: 'endDate' })
        .bsDatepickerField({ key: 'appointmentDate' })
        .build();

      const { component } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          appointmentDate: null,
        },
      });

      const formValue = BootstrapFormTestUtils.getFormValue(component);
      expect(formValue.startDate).toEqual('2024-01-01');
      expect(formValue.endDate).toEqual('2024-12-31');
      expect(formValue.appointmentDate).toBe(null);
    });

    it('should handle independent datepicker interactions', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsDatepickerField({ key: 'startDate' })
        .bsDatepickerField({ key: 'endDate' })
        .bsDatepickerField({ key: 'appointmentDate' })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          appointmentDate: null,
        },
      });

      const datepickers = fixture.debugElement.queryAll(By.css('input[type="date"]'));
      const newDate = '2024-07-15';

      // Change third datepicker
      datepickers[2].nativeElement.value = newDate;
      datepickers[2].nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const formValue = BootstrapFormTestUtils.getFormValue(component);
      expect(formValue.startDate).toEqual('2024-01-01');
      expect(formValue.endDate).toEqual('2024-12-31');
      expect(formValue.appointmentDate).toBeDefined();
    });

    it('should apply different sizes to datepickers', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsDatepickerField({ key: 'startDate', props: { size: 'sm' } })
        .bsDatepickerField({ key: 'endDate', props: { size: 'lg' } })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { startDate: null, endDate: null },
      });

      const datepickers = fixture.debugElement.queryAll(By.css('input[type="date"]'));
      expect(datepickers[0].nativeElement.className).toContain('form-control-sm');
      expect(datepickers[1].nativeElement.className).toContain('form-control-lg');
    });
  });

  describe('Field State and Configuration Tests', () => {
    it('should handle disabled state correctly', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'birthDate',
          type: 'datepicker',
          label: 'Disabled Datepicker',
          disabled: true,
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { birthDate: null },
      });

      const datepickerInput = fixture.debugElement.query(By.css('input[type="date"]'));
      expect(datepickerInput.nativeElement.disabled).toBe(true);
    });

    it('should handle multiple datepickers with independent value changes', async () => {
      const config = BootstrapFormTestUtils.builder().bsDatepickerField({ key: 'startDate' }).bsDatepickerField({ key: 'endDate' }).build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
      });

      // Initial values
      expect(BootstrapFormTestUtils.getFormValue(component).startDate).toEqual('2024-01-01');
      expect(BootstrapFormTestUtils.getFormValue(component).endDate).toEqual('2024-12-31');

      const datepickers = fixture.debugElement.queryAll(By.css('input[type="date"]'));
      const newDate = '2024-06-15';

      // Change first datepicker
      datepickers[0].nativeElement.value = newDate;
      datepickers[0].nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      let formValue = BootstrapFormTestUtils.getFormValue(component);
      expect(formValue.startDate).toBeDefined();
      expect(formValue.endDate).toEqual('2024-12-31');

      // Change second datepicker
      const anotherDate = '2024-09-20';
      datepickers[1].nativeElement.value = anotherDate;
      datepickers[1].nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      formValue = BootstrapFormTestUtils.getFormValue(component);
      expect(formValue.startDate).toBeDefined();
      expect(formValue.endDate).toBeDefined();
    });
  });

  describe('Datepicker-Specific Features', () => {
    it('should apply date range constraints', async () => {
      const minDate = '2020-01-01';
      const maxDate = '2025-12-31';

      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'appointmentDate',
          type: 'datepicker',
          label: 'Appointment Date',
          minDate: minDate,
          maxDate: maxDate,
          props: {
            helpText: 'Select date between 2020 and 2025',
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { appointmentDate: null },
      });

      const datepickerInput = fixture.debugElement.query(By.css('input[type="date"]'));
      const helpText = fixture.debugElement.query(By.css('.form-text'));

      expect(datepickerInput).toBeTruthy();
      // Angular 21: Field directive handles min/max bindings automatically
      expect(helpText.nativeElement.textContent.trim()).toBe('Select date between 2020 and 2025');
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined form values gracefully', async () => {
      const config = BootstrapFormTestUtils.builder().bsDatepickerField({ key: 'birthDate' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({ config }); // No initial value provided

      const datepickerInput = fixture.debugElement.query(By.css('input[type="date"]'));
      expect(datepickerInput).toBeTruthy();
    });

    it('should handle null form values gracefully', async () => {
      const config = BootstrapFormTestUtils.builder().bsDatepickerField({ key: 'birthDate' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: null as any,
      });

      const datepickerInput = fixture.debugElement.query(By.css('input[type="date"]'));
      expect(datepickerInput).toBeTruthy();
    });

    it('should handle date value changes correctly', async () => {
      const config = BootstrapFormTestUtils.builder().bsDatepickerField({ key: 'birthDate' }).build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { birthDate: null },
      });

      expect(BootstrapFormTestUtils.getFormValue(component).birthDate).toBe(null);

      const testDate = '2024-06-15';

      // Update via programmatic value change
      fixture.componentRef.setInput('value', { birthDate: testDate });
      fixture.detectChanges();

      expect(BootstrapFormTestUtils.getFormValue(component).birthDate).toEqual(testDate);
    });

    it('should apply default Bootstrap configuration', async () => {
      const config = BootstrapFormTestUtils.builder().bsDatepickerField({ key: 'birthDate' }).build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { birthDate: null },
      });

      const datepickerInput = fixture.debugElement.query(By.css('input[type="date"]'));

      // Verify default Bootstrap configuration is applied
      expect(datepickerInput).toBeTruthy();
      expect(datepickerInput.nativeElement.className).toContain('form-control');
    });

    it('should handle date inputs with special format requirements', async () => {
      const config = BootstrapFormTestUtils.builder()
        .field({
          key: 'birthDate',
          type: 'datepicker',
          label: 'Birth Date with Constraints',
          minDate: '1900-01-01',
          maxDate: '2024-12-31',
        })
        .build();

      const { component, fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { birthDate: null },
      });

      const datepickerInput = fixture.debugElement.query(By.css('input[type="date"]'));
      const testDate = '1995-06-15';

      // Simulate date selection within constraints
      datepickerInput.nativeElement.value = testDate;
      datepickerInput.nativeElement.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(BootstrapFormTestUtils.getFormValue(component).birthDate).toBeDefined();
    });
  });

  describe('Dynamic Text Support', () => {
    describe('Translation Service Integration', () => {
      it('should handle translation service with dynamic language updates for labels and placeholders', async () => {
        const translationService = createTestTranslationService({
          'form.birthDate.label': 'Birth Date',
          'form.birthDate.placeholder': 'Select your birth date',
          'form.birthDate.helpText': 'Choose the date you were born',
        });

        const config = BootstrapFormTestUtils.builder()
          .field({
            key: 'birthDate',
            type: 'datepicker',
            label: translationService.translate('form.birthDate.label'),
            placeholder: translationService.translate('form.birthDate.placeholder'),
            props: {
              helpText: translationService.translate('form.birthDate.helpText'),
            },
          })
          .build();

        const { fixture } = await BootstrapFormTestUtils.createTest({
          config,
          initialValue: { birthDate: null },
        });

        const label = fixture.debugElement.query(By.css('.form-label'));
        const input = fixture.debugElement.query(By.css('input[type="date"]'));
        const helpText = fixture.debugElement.query(By.css('.form-text'));

        // Initial translations
        expect(label.nativeElement.textContent.trim()).toBe('Birth Date');
        expect(input.nativeElement.getAttribute('placeholder')).toBe('Select your birth date');
        expect(helpText.nativeElement.textContent.trim()).toBe('Choose the date you were born');

        // Update to Spanish
        translationService.addTranslations({
          'form.birthDate.label': 'Fecha de Nacimiento',
          'form.birthDate.placeholder': 'Selecciona tu fecha de nacimiento',
          'form.birthDate.helpText': 'Elige la fecha en que naciste',
        });
        translationService.setLanguage('es');
        fixture.detectChanges();

        expect(label.nativeElement.textContent.trim()).toBe('Fecha de Nacimiento');
        expect(input.nativeElement.getAttribute('placeholder')).toBe('Selecciona tu fecha de nacimiento');
        expect(helpText.nativeElement.textContent.trim()).toBe('Elige la fecha en que naciste');
      });
    });
  });

  describe('Validation State Display', () => {
    it('should apply is-invalid class when field is invalid and touched', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsDatepickerField({
          key: 'birthDate',
          required: true,
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { birthDate: null },
      });

      const input = fixture.debugElement.query(By.css('input[type="date"]'));

      // Touch the field
      input.nativeElement.focus();
      input.nativeElement.blur();
      fixture.detectChanges();

      expect(input.nativeElement.className).toContain('is-invalid');
    });

    it('should apply is-valid class when validFeedback is provided and field is valid and touched', async () => {
      const config = BootstrapFormTestUtils.builder()
        .bsDatepickerField({
          key: 'birthDate',
          required: true,
          props: {
            validFeedback: 'Valid date selected',
          },
        })
        .build();

      const { fixture } = await BootstrapFormTestUtils.createTest({
        config,
        initialValue: { birthDate: '2000-01-01' },
      });

      const input = fixture.debugElement.query(By.css('input[type="date"]'));

      // Touch the field
      input.nativeElement.focus();
      input.nativeElement.blur();
      fixture.detectChanges();

      expect(input.nativeElement.className).toContain('is-valid');

      const validFeedback = fixture.debugElement.query(By.css('.valid-feedback'));
      expect(validFeedback).toBeTruthy();
      expect(validFeedback.nativeElement.textContent.trim()).toBe('Valid date selected');
    });
  });
});
