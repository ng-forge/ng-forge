import { RowFieldComponent } from './row-field.component';
import { RowField } from '../../definitions/default/row-field';
import { createSimpleTestField, setupSimpleTest } from '../../testing';
import { FieldDef } from '../../definitions';

describe('RowFieldComponent', () => {
  it('should create', () => {
    const field: RowField<never[]> = {
      key: 'testRow',
      type: 'row',
      label: 'Test Row',
      fields: [],
    };

    const { component } = setupSimpleTest(RowFieldComponent, {
      field,
    });

    // ITERATION 6 FIX: Verify component is correct type
    // Previous: expect(component).toBeTruthy()
    expect(component).toBeDefined();
    expect(component).toBeInstanceOf(RowFieldComponent);
  });

  it('should have field input property', () => {
    const field: RowField<never[]> = {
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

  it('should render with child fields', () => {
    const field: RowField<readonly FieldDef<Record<string, unknown>>[]> = {
      key: 'testRow',
      type: 'row',
      label: 'Test Row',
      fields: [createSimpleTestField('field1', 'Field 1'), createSimpleTestField('field2', 'Field 2')],
    };

    const { component } = setupSimpleTest(RowFieldComponent, {
      field,
      value: { field1: 'value1', field2: 'value2' },
    });

    // The component should render directly as the host element (no nested form)
    expect(component.field()).toEqual(field);
    expect(component.fields()).toBeDefined();
  });

  it('should have host classes', () => {
    const field: RowField<never[]> = {
      key: 'testRow',
      type: 'row',
      label: 'Test Row',
      fields: [],
    };

    const { fixture } = setupSimpleTest(RowFieldComponent, {
      field,
    });

    const element = fixture.nativeElement;
    expect(element.classList.contains('df-field')).toBe(true);
    expect(element.classList.contains('df-row')).toBe(true);
  });
});
