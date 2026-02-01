import { createEnvironmentInjector, EnvironmentInjector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { datepickerFieldMapper } from './datepicker-field-mapper';
import { DatepickerField } from '../../definitions';
import { FIELD_SIGNAL_CONTEXT } from '@ng-forge/dynamic-forms';
import { FieldSignalContext } from '../types';

describe('datepickerFieldMapper', () => {
  let parentInjector: EnvironmentInjector;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
    parentInjector = TestBed.inject(EnvironmentInjector);
  });

  function createTestInjector(options?: { fieldKey?: string; initialValue?: Date | string | null }): EnvironmentInjector {
    const fieldKey = options?.fieldKey || 'dateField';
    const initialValue = signal({ [fieldKey]: options?.initialValue ?? null });

    const testForm = runInInjectionContext(parentInjector, () => {
      return form(initialValue);
    });

    const mockContext: FieldSignalContext = {
      injector: parentInjector,
      value: initialValue,
      defaultValues: () => ({ [fieldKey]: null }),
      form: testForm,
    };

    return createEnvironmentInjector([{ provide: FIELD_SIGNAL_CONTEXT, useValue: mockContext }], parentInjector);
  }

  function testMapper(fieldDef: DatepickerField<unknown>, injector: EnvironmentInjector): Record<string, unknown> {
    const inputsSignal = runInInjectionContext(injector, () => datepickerFieldMapper(fieldDef));
    return inputsSignal();
  }

  describe('datepicker-specific properties', () => {
    it('should convert minDate string to Date object', () => {
      const fieldDef: DatepickerField<unknown> = {
        key: 'birthDate',
        type: 'datepicker',
        minDate: '1900-01-01',
      };

      const injector = createTestInjector({ fieldKey: 'birthDate' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['minDate']).toBeInstanceOf(Date);
      expect((inputs['minDate'] as Date).toISOString()).toContain('1900-01-01');
    });

    it('should include minDate when defined as Date object', () => {
      const minDate = new Date('2020-01-01');
      const fieldDef: DatepickerField<unknown> = {
        key: 'startDate',
        type: 'datepicker',
        minDate,
      };

      const injector = createTestInjector({ fieldKey: 'startDate' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['minDate']).toEqual(minDate);
    });

    it('should convert maxDate string to Date object', () => {
      const fieldDef: DatepickerField<unknown> = {
        key: 'endDate',
        type: 'datepicker',
        maxDate: '2025-12-31',
      };

      const injector = createTestInjector({ fieldKey: 'endDate' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['maxDate']).toBeInstanceOf(Date);
      expect((inputs['maxDate'] as Date).toISOString()).toContain('2025-12-31');
    });

    it('should include maxDate when defined as Date object', () => {
      const maxDate = new Date('2030-12-31');
      const fieldDef: DatepickerField<unknown> = {
        key: 'deadline',
        type: 'datepicker',
        maxDate,
      };

      const injector = createTestInjector({ fieldKey: 'deadline' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['maxDate']).toEqual(maxDate);
    });

    it('should include startAt when defined', () => {
      const startAt = new Date('2023-06-15');
      const fieldDef: DatepickerField<unknown> = {
        key: 'eventDate',
        type: 'datepicker',
        startAt,
      };

      const injector = createTestInjector({ fieldKey: 'eventDate' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['startAt']).toEqual(startAt);
    });

    it('should include all datepicker properties together', () => {
      const minDate = new Date('2020-01-01');
      const maxDate = new Date('2025-12-31');
      const startAt = new Date('2023-06-15');

      const fieldDef: DatepickerField<unknown> = {
        key: 'appointment',
        type: 'datepicker',
        minDate,
        maxDate,
        startAt,
      };

      const injector = createTestInjector({ fieldKey: 'appointment' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['minDate']).toEqual(minDate);
      expect(inputs['maxDate']).toEqual(maxDate);
      expect(inputs['startAt']).toEqual(startAt);
    });

    it('should NOT include datepicker properties when undefined', () => {
      const fieldDef: DatepickerField<unknown> = {
        key: 'dateField',
        type: 'datepicker',
      };

      const injector = createTestInjector({ fieldKey: 'dateField' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs).not.toHaveProperty('minDate');
      expect(inputs).not.toHaveProperty('maxDate');
      expect(inputs).not.toHaveProperty('startAt');
    });

    it('should include null minDate (allows clearing min constraint)', () => {
      const fieldDef: DatepickerField<unknown> = {
        key: 'dateField',
        type: 'datepicker',
        minDate: null,
      };

      const injector = createTestInjector({ fieldKey: 'dateField' });
      const inputs = testMapper(fieldDef, injector);

      // null !== undefined, so null values are passed through
      // This allows explicitly clearing/disabling the min constraint
      expect(inputs['minDate']).toBeNull();
    });

    it('should include null maxDate (allows clearing max constraint)', () => {
      const fieldDef: DatepickerField<unknown> = {
        key: 'dateField',
        type: 'datepicker',
        maxDate: null,
      };

      const injector = createTestInjector({ fieldKey: 'dateField' });
      const inputs = testMapper(fieldDef, injector);

      // null !== undefined, so null values are passed through
      // This allows explicitly clearing/disabling the max constraint
      expect(inputs['maxDate']).toBeNull();
    });

    it('should include null startAt (allows clearing initial date)', () => {
      const fieldDef: DatepickerField<unknown> = {
        key: 'dateField',
        type: 'datepicker',
        startAt: null,
      };

      const injector = createTestInjector({ fieldKey: 'dateField' });
      const inputs = testMapper(fieldDef, injector);

      // null !== undefined, so null values are passed through
      // This allows explicitly clearing the initial picker date
      expect(inputs['startAt']).toBeNull();
    });

    it('should convert ISO date strings to Date objects', () => {
      const fieldDef: DatepickerField<unknown> = {
        key: 'dateField',
        type: 'datepicker',
        minDate: '2023-01-15T00:00:00.000Z',
        maxDate: '2023-12-15T23:59:59.999Z',
      };

      const injector = createTestInjector({ fieldKey: 'dateField' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['minDate']).toBeInstanceOf(Date);
      expect(inputs['maxDate']).toBeInstanceOf(Date);
      expect((inputs['minDate'] as Date).toISOString()).toBe('2023-01-15T00:00:00.000Z');
      expect((inputs['maxDate'] as Date).toISOString()).toBe('2023-12-15T23:59:59.999Z');
    });

    it('should return null for invalid date strings', () => {
      const fieldDef: DatepickerField<unknown> = {
        key: 'dateField',
        type: 'datepicker',
        minDate: 'invalid-date-string',
      };

      const injector = createTestInjector({ fieldKey: 'dateField' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['minDate']).toBeNull();
    });

    it('should return null for empty string dates', () => {
      const fieldDef: DatepickerField<unknown> = {
        key: 'dateField',
        type: 'datepicker',
        minDate: '',
      };

      const injector = createTestInjector({ fieldKey: 'dateField' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['minDate']).toBeNull();
    });
  });

  describe('base value field properties', () => {
    it('should include key from base mapper', () => {
      const fieldDef: DatepickerField<unknown> = {
        key: 'dateField',
        type: 'datepicker',
      };

      const injector = createTestInjector({ fieldKey: 'dateField' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['key']).toBe('dateField');
    });

    it('should include label when defined', () => {
      const fieldDef: DatepickerField<unknown> = {
        key: 'dateField',
        type: 'datepicker',
        label: 'Select Date',
      };

      const injector = createTestInjector({ fieldKey: 'dateField' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['label']).toBe('Select Date');
    });

    it('should include placeholder when defined', () => {
      const fieldDef: DatepickerField<unknown> = {
        key: 'dateField',
        type: 'datepicker',
        placeholder: 'Choose a date...',
      };

      const injector = createTestInjector({ fieldKey: 'dateField' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['placeholder']).toBe('Choose a date...');
    });

    it('should include className when defined', () => {
      const fieldDef: DatepickerField<unknown> = {
        key: 'dateField',
        type: 'datepicker',
        className: 'date-picker-field',
      };

      const injector = createTestInjector({ fieldKey: 'dateField' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['className']).toContain('date-picker-field');
    });

    it('should include tabIndex when defined', () => {
      const fieldDef: DatepickerField<unknown> = {
        key: 'dateField',
        type: 'datepicker',
        tabIndex: 5,
      };

      const injector = createTestInjector({ fieldKey: 'dateField' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['tabIndex']).toBe(5);
    });

    it('should include field proxy', () => {
      const fieldDef: DatepickerField<unknown> = {
        key: 'dateField',
        type: 'datepicker',
      };

      const injector = createTestInjector({ fieldKey: 'dateField' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs).toHaveProperty('field');
    });

    it('should include validationMessages when defined', () => {
      const fieldDef: DatepickerField<unknown> = {
        key: 'dateField',
        type: 'datepicker',
        validationMessages: {
          required: 'Date is required',
          matDatepickerMin: 'Date is too early',
          matDatepickerMax: 'Date is too late',
        },
      };

      const injector = createTestInjector({ fieldKey: 'dateField' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs['validationMessages']).toEqual({
        required: 'Date is required',
        matDatepickerMin: 'Date is too early',
        matDatepickerMax: 'Date is too late',
      });
    });
  });

  describe('excluded properties', () => {
    it('should NOT include type in inputs', () => {
      const fieldDef: DatepickerField<unknown> = {
        key: 'dateField',
        type: 'datepicker',
      };

      const injector = createTestInjector({ fieldKey: 'dateField' });
      const inputs = testMapper(fieldDef, injector);

      expect(inputs).not.toHaveProperty('type');
    });
  });

  describe('complete datepicker field integration', () => {
    it('should correctly map a complete datepicker field definition', () => {
      const minDate = new Date('1900-01-01');
      const maxDate = new Date('2010-12-31');
      const startAt = new Date('2000-06-15');

      const datepickerField: DatepickerField<unknown> = {
        key: 'birthDate',
        type: 'datepicker',
        label: 'Date of Birth',
        placeholder: 'Select your birth date',
        className: 'birth-date-field',
        tabIndex: 4,
        minDate,
        maxDate,
        startAt,
        validationMessages: {
          required: 'Birth date is required',
        },
      };

      const injector = createTestInjector({ fieldKey: 'birthDate' });
      const inputs = testMapper(datepickerField, injector);

      // Base properties
      expect(inputs['key']).toBe('birthDate');
      expect(inputs['label']).toBe('Date of Birth');
      expect(inputs['placeholder']).toBe('Select your birth date');
      expect(inputs['className']).toContain('birth-date-field');
      expect(inputs['tabIndex']).toBe(4);

      // Datepicker-specific properties
      expect(inputs['minDate']).toEqual(minDate);
      expect(inputs['maxDate']).toEqual(maxDate);
      expect(inputs['startAt']).toEqual(startAt);

      // Validation messages
      expect(inputs['validationMessages']).toEqual({
        required: 'Birth date is required',
      });

      // Excluded properties
      expect(inputs).not.toHaveProperty('type');
    });

    it('should correctly map a datepicker with string dates (converted to Date objects)', () => {
      const datepickerField: DatepickerField<unknown> = {
        key: 'deliveryDate',
        type: 'datepicker',
        label: 'Delivery Date',
        minDate: '2024-01-01',
        maxDate: '2024-12-31',
      };

      const injector = createTestInjector({ fieldKey: 'deliveryDate' });
      const inputs = testMapper(datepickerField, injector);

      expect(inputs['key']).toBe('deliveryDate');
      expect(inputs['label']).toBe('Delivery Date');
      expect(inputs['minDate']).toBeInstanceOf(Date);
      expect(inputs['maxDate']).toBeInstanceOf(Date);
      expect((inputs['minDate'] as Date).toISOString()).toContain('2024-01-01');
      expect((inputs['maxDate'] as Date).toISOString()).toContain('2024-12-31');
    });

    it('should map datepicker with minimal definition', () => {
      const datepickerField: DatepickerField<unknown> = {
        key: 'anyDate',
        type: 'datepicker',
      };

      const injector = createTestInjector({ fieldKey: 'anyDate' });
      const inputs = testMapper(datepickerField, injector);

      expect(inputs['key']).toBe('anyDate');
      expect(inputs).toHaveProperty('field');
      expect(inputs).not.toHaveProperty('minDate');
      expect(inputs).not.toHaveProperty('maxDate');
      expect(inputs).not.toHaveProperty('startAt');
    });
  });
});
