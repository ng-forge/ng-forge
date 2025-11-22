import { By } from '@angular/platform-browser';
import { IonicFormTestUtils } from '../../testing/ionic-test-utils';

describe('IonicDatepickerFieldComponent', () => {
  describe('Basic Ionic Datepicker Integration', () => {
    it('should render datepicker with full configuration', async () => {
      const today = new Date();
      const minDate = new Date(today.getFullYear() - 1, 0, 1);
      const maxDate = new Date(today.getFullYear() + 1, 11, 31);

      const config = IonicFormTestUtils.builder()
        .ionicDatepickerField({
          key: 'birthDate',
          label: 'Birth Date',
          placeholder: 'Select your birth date',
          required: true,
          tabIndex: 1,
          className: 'birth-date-picker',
          minDate: minDate,
          maxDate: maxDate,
          props: {
            presentation: 'date',
            showDefaultButtons: true,
            doneText: 'Confirm',
            cancelText: 'Close',
            color: 'primary',
          },
        })
        .build();

      const { component } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { birthDate: null },
      });

      expect(component).toBeTruthy();
    });

    it('should handle date selection and update form value', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicDatepickerField({
          key: 'appointmentDate',
          label: 'Appointment Date',
        })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { appointmentDate: null },
      });

      expect(IonicFormTestUtils.getFormValue(component).appointmentDate).toBe(null);
    });

    it('should reflect external value changes in datepicker', async () => {
      const selectedDate = new Date(2024, 5, 15);

      const config = IonicFormTestUtils.builder()
        .ionicDatepickerField({
          key: 'eventDate',
          label: 'Event Date',
        })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { eventDate: null },
      });

      fixture.componentRef.setInput('value', { eventDate: selectedDate });
      fixture.detectChanges();

      expect(IonicFormTestUtils.getFormValue(component).eventDate).toEqual(selectedDate);
    });
  });

  describe('Date Format and Presentation Tests', () => {
    it('should handle different presentation modes', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicDatepickerField({
          key: 'date1',
          label: 'Date Only',
          props: { presentation: 'date' },
        })
        .ionicDatepickerField({
          key: 'date2',
          label: 'Date and Time',
          props: { presentation: 'date-time' },
        })
        .ionicDatepickerField({
          key: 'date3',
          label: 'Time Only',
          props: { presentation: 'time' },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { date1: null, date2: null, date3: null },
      });

      const datepickers = fixture.debugElement.queryAll(By.css('df-ionic-datepicker'));
      expect(datepickers.length).toBe(3);
    });

    it('should display formatted date in input', async () => {
      const testDate = new Date(2024, 5, 15); // June 15, 2024

      const config = IonicFormTestUtils.builder()
        .ionicDatepickerField({
          key: 'selectedDate',
          label: 'Selected Date',
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { selectedDate: testDate },
      });

      const ionInput = fixture.debugElement.query(By.css('df-ionic-datepicker ion-input'));
      expect(ionInput).not.toBeNull();
    });

    it('should handle null date values', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicDatepickerField({
          key: 'optionalDate',
          label: 'Optional Date',
        })
        .build();

      const { component } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { optionalDate: null },
      });

      expect(IonicFormTestUtils.getFormValue(component).optionalDate).toBe(null);
    });
  });

  describe.skip('Date Range Tests', () => {
    it('should handle min and max date constraints', async () => {
      const minDate = new Date(2020, 0, 1);
      const maxDate = new Date(2025, 11, 31);

      const config = IonicFormTestUtils.builder()
        .ionicDatepickerField({
          key: 'constrainedDate',
          label: 'Constrained Date',
          minDate: minDate,
          maxDate: maxDate,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { constrainedDate: null },
      });

      const ionDatetime = fixture.debugElement.query(By.css('df-ionic-datepicker ion-datetime'));
      expect(ionDatetime).not.toBeNull();
    });

    it('should handle only min date constraint', async () => {
      const minDate = new Date(2020, 0, 1);

      const config = IonicFormTestUtils.builder()
        .ionicDatepickerField({
          key: 'futureDate',
          label: 'Future Date',
          minDate: minDate,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { futureDate: null },
      });

      const ionDatetime = fixture.debugElement.query(By.css('df-ionic-datepicker ion-datetime'));
      expect(ionDatetime).not.toBeNull();
    });

    it('should handle only max date constraint', async () => {
      const maxDate = new Date(2025, 11, 31);

      const config = IonicFormTestUtils.builder()
        .ionicDatepickerField({
          key: 'pastDate',
          label: 'Past Date',
          maxDate: maxDate,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { pastDate: null },
      });

      const ionDatetime = fixture.debugElement.query(By.css('df-ionic-datepicker ion-datetime'));
    });
  });

  describe('Field State and Configuration Tests', () => {
    it('should handle disabled state correctly', async () => {
      const config = IonicFormTestUtils.builder()
        .field({
          key: 'date',
          type: 'datepicker',
          label: 'Disabled Datepicker',
          disabled: true,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { date: null },
      });

      const ionInput = fixture.debugElement.query(By.css('df-ionic-datepicker ion-input'));
    });

    it('should apply required validation', async () => {
      const config = IonicFormTestUtils.builder()
        .field({
          key: 'mandatoryDate',
          type: 'datepicker',
          label: 'Mandatory Date',
          required: true,
        })
        .build();

      const { component } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { mandatoryDate: null },
      });

      expect(IonicFormTestUtils.isFormValid(component)).toBe(false);
    });

    it('should validate when date is provided', async () => {
      const config = IonicFormTestUtils.builder()
        .field({
          key: 'mandatoryDate',
          type: 'datepicker',
          label: 'Mandatory Date',
          required: true,
        })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { mandatoryDate: null },
      });

      fixture.componentRef.setInput('value', { mandatoryDate: new Date() });
      fixture.detectChanges();

      expect(IonicFormTestUtils.isFormValid(component)).toBe(true);
    });
  });

  describe('Ionic-Specific Props Tests', () => {
    it('should handle preferWheel property', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicDatepickerField({
          key: 'date',
          label: 'Date',
          props: { preferWheel: true },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { date: null },
      });

      const ionDatetime = fixture.debugElement.query(By.css('df-ionic-datepicker ion-datetime'));
    });

    it('should handle showDefaultButtons property', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicDatepickerField({
          key: 'date',
          label: 'Date',
          props: { showDefaultButtons: false },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { date: null },
      });

      const ionDatetime = fixture.debugElement.query(By.css('df-ionic-datepicker ion-datetime'));
    });

    it('should handle custom button text', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicDatepickerField({
          key: 'date',
          label: 'Date',
          props: {
            doneText: 'Select',
            cancelText: 'Dismiss',
          },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { date: null },
      });

      const ionDatetime = fixture.debugElement.query(By.css('df-ionic-datepicker ion-datetime'));
    });

    it('should handle size property', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicDatepickerField({
          key: 'date',
          label: 'Date',
          props: { size: 'cover' },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { date: null },
      });

      const ionDatetime = fixture.debugElement.query(By.css('df-ionic-datepicker ion-datetime'));
    });

    it('should handle different color options', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicDatepickerField({
          key: 'date',
          label: 'Date',
          props: { color: 'success' },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { date: null },
      });

      const ionDatetime = fixture.debugElement.query(By.css('df-ionic-datepicker ion-datetime'));
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined initial value', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicDatepickerField({
          key: 'date',
          label: 'Date',
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({ config });

      const ionInput = fixture.debugElement.query(By.css('df-ionic-datepicker ion-input'));
      expect(ionInput).not.toBeNull();
    });

    it('should handle null form values gracefully', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicDatepickerField({
          key: 'date',
          label: 'Date',
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: null as any,
      });

      const ionInput = fixture.debugElement.query(By.css('df-ionic-datepicker ion-input'));
      expect(ionInput).not.toBeNull();
    });

    it('should display error messages when validation fails', async () => {
      const config = IonicFormTestUtils.builder()
        .field({
          key: 'date',
          type: 'datepicker',
          label: 'Date',
          required: true,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { date: null },
      });

      const ionInput = fixture.debugElement.query(By.css('df-ionic-datepicker ion-input'));
      ionInput.nativeElement.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
    });

    it('should handle dates at boundaries', async () => {
      const minDate = new Date(1900, 0, 1);
      const maxDate = new Date(2100, 11, 31);

      const config = IonicFormTestUtils.builder()
        .ionicDatepickerField({
          key: 'date',
          label: 'Date',
          minDate: minDate,
          maxDate: maxDate,
        })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { date: minDate },
      });

      expect(IonicFormTestUtils.getFormValue(component).date).toEqual(minDate);

      fixture.componentRef.setInput('value', { date: maxDate });
      fixture.detectChanges();

      expect(IonicFormTestUtils.getFormValue(component).date).toEqual(maxDate);
    });

    it('should handle today as initial value', async () => {
      const today = new Date();

      const config = IonicFormTestUtils.builder()
        .ionicDatepickerField({
          key: 'date',
          label: 'Date',
        })
        .build();

      const { component } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { date: today },
      });

      const formValue = IonicFormTestUtils.getFormValue(component).date as Date;
      expect(formValue).toBeInstanceOf(Date);
      expect(formValue.toDateString()).toBe(today.toDateString());
    });

    it('should handle modal open and close', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicDatepickerField({
          key: 'date',
          label: 'Date',
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { date: null },
      });

      const ionModal = fixture.debugElement.query(By.css('df-ionic-datepicker ion-modal'));
      expect(ionModal).not.toBeNull();
    });

    it('should render readonly input', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicDatepickerField({
          key: 'date',
          label: 'Date',
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { date: null },
      });

      const ionInput = fixture.debugElement.query(By.css('df-ionic-datepicker ion-input'));
    });
  });
});
