import { TestBed } from '@angular/core/testing';
import { FieldConfig } from './field-config';

describe('FieldConfig', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
  });
  it('should create a field config with required type', () => {
    const fieldConfig: FieldConfig = {
      type: 'input',
      key: 'firstName',
      props: {
        label: 'First Name',
        placeholder: 'Enter first name',
      },
    };

    expect(fieldConfig.type).toBe('input');
    expect(fieldConfig.key).toBe('firstName');
    expect(fieldConfig.props?.label).toBe('First Name');
    expect(fieldConfig.props?.placeholder).toBe('Enter first name');
  });

  it('should support minimal configuration', () => {
    const fieldConfig: FieldConfig = {
      type: 'submit',
    };

    expect(fieldConfig.type).toBe('submit');
    expect(fieldConfig.key).toBeUndefined();
  });

  it('should support field groups', () => {
    const fieldConfig: FieldConfig = {
      type: 'fieldgroup',
      key: 'address',
      fieldGroup: [
        { type: 'input', key: 'street' },
        { type: 'input', key: 'city' },
      ],
    };

    expect(fieldConfig.fieldGroup).toHaveLength(2);
    expect(fieldConfig.fieldGroup![0].type).toBe('input');
    expect(fieldConfig.fieldGroup![0].key).toBe('street');
  });

  it('should support validators', () => {
    const fieldConfig: FieldConfig = {
      type: 'input',
      key: 'email',
      validators: {
        required: true,
        email: true,
      },
    };

    expect(fieldConfig.validators?.['required']).toBe(true);
    expect(fieldConfig.validators?.['email']).toBe(true);
  });

  it('should support expressions', () => {
    const fieldConfig: FieldConfig<{ email?: string }> = {
      type: 'input',
      key: 'confirmEmail',
      expressions: {
        hide: (model) => !model.email,
        'props.required': (model) => Boolean(model.email),
      },
    };

    expect(fieldConfig.expressions?.hide).toBeInstanceOf(Function);
    expect(fieldConfig.expressions?.['props.required']).toBeInstanceOf(Function);
  });

  it('should support hooks', () => {
    const onInitSpy = jest.fn();
    const onChangeSpy = jest.fn();
    const onDestroySpy = jest.fn();

    const fieldConfig: FieldConfig = {
      type: 'input',
      key: 'test',
      hooks: {
        onInit: onInitSpy,
        onChange: onChangeSpy,
        onDestroy: onDestroySpy,
      },
    };

    expect(fieldConfig.hooks?.onInit).toBe(onInitSpy);
    expect(fieldConfig.hooks?.onChange).toBe(onChangeSpy);
    expect(fieldConfig.hooks?.onDestroy).toBe(onDestroySpy);
  });
});
