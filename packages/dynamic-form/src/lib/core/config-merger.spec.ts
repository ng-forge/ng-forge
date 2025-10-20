import { ConfigMerger, DynamicFormConfig } from './config-merger';
import { FieldTypeDefinition, FieldWrapperDefinition } from '../models/field-type';

class MockInputComponent {}
class MockSelectComponent {}
class MockWrapperComponent {}

describe('ConfigMerger', () => {
  let service: ConfigMerger;

  const mockInputType: FieldTypeDefinition = {
    name: 'input',
    component: MockInputComponent,
    defaultProps: {
      type: 'text',
      placeholder: 'Enter value',
    },
  };

  const mockSelectType: FieldTypeDefinition = {
    name: 'select',
    component: MockSelectComponent,
    defaultProps: {
      multiple: false,
    },
  };

  const mockWrapper: FieldWrapperDefinition = {
    name: 'form-field',
    component: MockWrapperComponent,
    priority: 10,
  };

  beforeEach(() => {
    service = new ConfigMerger();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('merge', () => {
    it('should return default config when no configs provided', () => {
      const result = service.merge();

      expect(result).toEqual({
        types: [],
        wrappers: [],
        validators: {},
        defaultFormOptions: {
          showError: true,
          validationStrategy: 'onTouched',
          updateOn: 'change',
        },
        defaultFieldProps: {},
        errorMessages: {},
      });
    });

    it('should merge single config with defaults', () => {
      const config: Partial<DynamicFormConfig> = {
        types: [mockInputType],
        validators: { required: true },
        defaultFieldProps: { className: 'form-control' },
      };

      const result = service.merge(config);

      expect(result.types).toEqual([mockInputType]);
      expect(result.validators).toEqual({ required: true });
      expect(result.defaultFieldProps).toEqual({ className: 'form-control' });
      expect(result.defaultFormOptions).toEqual({
        showError: true,
        validationStrategy: 'onTouched',
        updateOn: 'change',
      });
    });

    it('should merge multiple configs', () => {
      const config1: Partial<DynamicFormConfig> = {
        types: [mockInputType],
        validators: { required: true },
        defaultFieldProps: { className: 'form-control' },
      };

      const config2: Partial<DynamicFormConfig> = {
        types: [mockSelectType],
        validators: { email: true },
        defaultFieldProps: { disabled: false },
      };

      const result = service.merge(config1, config2);

      expect(result.types).toEqual([mockInputType, mockSelectType]);
      expect(result.validators).toEqual({ required: true, email: true });
      expect(result.defaultFieldProps).toEqual({
        className: 'form-control',
        disabled: false,
      });
    });

    it('should override properties in later configs', () => {
      const config1: Partial<DynamicFormConfig> = {
        defaultFormOptions: {
          showError: true,
          validationStrategy: 'always',
        },
        validators: { required: 'Required field' },
      };

      const config2: Partial<DynamicFormConfig> = {
        defaultFormOptions: {
          validationStrategy: 'onDirty',
        },
        validators: { required: 'This field is required' },
      };

      const result = service.merge(config1, config2);

      expect(result.defaultFormOptions).toEqual({
        showError: true,
        validationStrategy: 'onDirty',
        updateOn: 'change', // from defaults
      });
      expect(result.validators).toEqual({ required: 'This field is required' });
    });

    it('should handle empty configs', () => {
      const result = service.merge({}, {}, {});

      expect(result).toEqual({
        types: [],
        wrappers: [],
        validators: {},
        defaultFormOptions: {
          showError: true,
          validationStrategy: 'onTouched',
          updateOn: 'change',
        },
        defaultFieldProps: {},
        errorMessages: {},
      });
    });
  });

  describe('type merging', () => {
    it('should merge type arrays without duplicates', () => {
      const config1: Partial<DynamicFormConfig> = {
        types: [mockInputType],
      };

      const config2: Partial<DynamicFormConfig> = {
        types: [mockSelectType],
      };

      const result = service.merge(config1, config2);

      expect(result.types).toEqual([mockInputType, mockSelectType]);
    });

    it('should override types with same name', () => {
      const inputType1: FieldTypeDefinition = {
        name: 'input',
        component: MockInputComponent,
        defaultProps: { type: 'text' },
      };

      const inputType2: FieldTypeDefinition = {
        name: 'input',
        component: MockSelectComponent, // Different component
        defaultProps: { type: 'email' },
      };

      const config1: Partial<DynamicFormConfig> = { types: [inputType1] };
      const config2: Partial<DynamicFormConfig> = { types: [inputType2] };

      const result = service.merge(config1, config2);

      expect(result.types).toHaveLength(1);
      expect(result.types![0]).toBe(inputType2);
      expect(result.types![0].component).toBe(MockSelectComponent);
    });

    it('should handle empty type arrays', () => {
      const config1: Partial<DynamicFormConfig> = { types: [] };
      const config2: Partial<DynamicFormConfig> = { types: [mockInputType] };

      const result = service.merge(config1, config2);

      expect(result.types).toEqual([mockInputType]);
    });
  });

  describe('wrapper merging', () => {
    it('should merge wrapper arrays without duplicates', () => {
      const wrapper1: FieldWrapperDefinition = {
        name: 'wrapper1',
        component: MockWrapperComponent,
      };

      const config1: Partial<DynamicFormConfig> = { wrappers: [wrapper1] };
      const config2: Partial<DynamicFormConfig> = { wrappers: [mockWrapper] };

      const result = service.merge(config1, config2);

      expect(result.wrappers).toEqual([wrapper1, mockWrapper]);
    });

    it('should override wrappers with same name', () => {
      const wrapper1: FieldWrapperDefinition = {
        name: 'form-field',
        component: MockWrapperComponent,
        priority: 5,
      };

      const wrapper2: FieldWrapperDefinition = {
        name: 'form-field',
        component: MockInputComponent, // Different component
        priority: 15,
      };

      const config1: Partial<DynamicFormConfig> = { wrappers: [wrapper1] };
      const config2: Partial<DynamicFormConfig> = { wrappers: [wrapper2] };

      const result = service.merge(config1, config2);

      expect(result.wrappers).toHaveLength(1);
      expect(result.wrappers![0]).toBe(wrapper2);
      expect(result.wrappers![0].priority).toBe(15);
    });
  });

  describe('error message merging', () => {
    it('should merge error message objects', () => {
      const config1: Partial<DynamicFormConfig> = {
        errorMessages: {
          required: 'This field is required',
          email: 'Invalid email',
        },
      };

      const config2: Partial<DynamicFormConfig> = {
        errorMessages: {
          minLength: 'Too short',
          email: 'Please enter a valid email', // Override
        },
      };

      const result = service.merge(config1, config2);

      expect(result.errorMessages).toEqual({
        required: 'This field is required',
        email: 'Please enter a valid email',
        minLength: 'Too short',
      });
    });

    it('should handle function error messages', () => {
      const errorFn = (_error: unknown, _field: unknown) => 'Custom error';

      const config: Partial<DynamicFormConfig> = {
        errorMessages: {
          custom: errorFn,
        },
      };

      const result = service.merge(config);

      expect(result.errorMessages!['custom']).toBe(errorFn);
    });
  });
});
