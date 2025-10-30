import { RowFieldComponent } from './row-field.component';
import { RowField } from '../../definitions/default/row-field';
import { createSimpleTestField, setupSimpleTest } from '../../testing';

describe('RowFieldComponent', () => {
  it('should create', () => {
    const field: RowField = {
      key: 'testRow',
      type: 'row',
      label: 'Test Row',
      fields: [],
    };

    const { component } = setupSimpleTest(RowFieldComponent, {
      field,
    });

    expect(component).toBeTruthy();
  });

  it('should have field input property', () => {
    const field: RowField = {
      key: 'testRow',
      type: 'row',
      label: 'Test Row',
      fields: [],
    };

    const { component } = setupSimpleTest(RowFieldComponent, {
      field,
    });

    expect(component.field()).toEqual(field);
  });

  it('should have form state properties', () => {
    const field: RowField = {
      key: 'testRow',
      type: 'row',
      label: 'Test Row',
      fields: [],
    };

    const { component } = setupSimpleTest(RowFieldComponent, {
      field,
    });

    expect(typeof component.valid()).toBe('boolean');
    expect(typeof component.invalid()).toBe('boolean');
    expect(typeof component.dirty()).toBe('boolean');
    expect(typeof component.touched()).toBe('boolean');
  });

  it('should render with child fields', () => {
    const field: RowField = {
      key: 'testRow',
      type: 'row',
      label: 'Test Row',
      fields: [createSimpleTestField('field1', 'Field 1'), createSimpleTestField('field2', 'Field 2')],
    };

    const { fixture } = setupSimpleTest(RowFieldComponent, {
      field,
      value: { field1: 'value1', field2: 'value2' },
    });

    const form = fixture.nativeElement.querySelector('form');
    expect(form).toBeTruthy();
  });

  it('should have host classes', () => {
    const field: RowField = {
      key: 'testRow',
      type: 'row',
      label: 'Test Row',
      fields: [],
    };

    const { fixture } = setupSimpleTest(RowFieldComponent, {
      field,
    });

    const element = fixture.nativeElement;
    expect(element.classList.contains('lib-row-field')).toBe(true);
    expect(element.classList.contains('field__container')).toBe(true);
    expect(element.classList.contains('lib-row-field__responsive')).toBe(true);
  });
});
