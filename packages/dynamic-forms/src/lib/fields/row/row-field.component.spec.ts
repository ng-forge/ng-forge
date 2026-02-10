import { RowFieldComponent } from './row-field.component';
import { RowField } from '../../definitions/default/row-field';
import { createSimpleTestField, setupSimpleTest } from '../../../../testing/src/simple-test-utils';
import { FieldDef } from '../../definitions/base/field-def';

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
    const field: RowField<readonly FieldDef<any>[]> = {
      key: 'testRow',
      type: 'row',
      label: 'Test Row',
      fields: [createSimpleTestField('field1', 'Field 1'), createSimpleTestField('field2', 'Field 2')],
    };

    const { component } = setupSimpleTest(RowFieldComponent, {
      field,
    });

    // The component should render directly as the host element (no nested form)
    expect(component.field()).toEqual(field);
    expect(component.resolvedFields()).toBeDefined();
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

  it('should not have df-container-hidden class when hidden is false', () => {
    const field: RowField<never[]> = {
      key: 'testRow',
      type: 'row',
      fields: [],
    };

    const { fixture } = setupSimpleTest(RowFieldComponent, {
      field,
      hidden: false,
    });

    const element = fixture.nativeElement;
    expect(element.classList.contains('df-container-hidden')).toBe(false);
    expect(element.getAttribute('aria-hidden')).toBeNull();
  });

  it('should have df-container-hidden class and aria-hidden when hidden is true', () => {
    const field: RowField<never[]> = {
      key: 'testRow',
      type: 'row',
      fields: [],
    };

    const { fixture } = setupSimpleTest(RowFieldComponent, {
      field,
      hidden: true,
    });

    const element = fixture.nativeElement;
    expect(element.classList.contains('df-container-hidden')).toBe(true);
    expect(element.getAttribute('aria-hidden')).toBe('true');
  });
});
