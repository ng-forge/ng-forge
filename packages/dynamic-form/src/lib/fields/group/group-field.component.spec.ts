import { GroupFieldComponent } from './group-field.component';
import { GroupField } from '../../definitions/default/group-field';
import { createSimpleTestField, setupSimpleTest } from '../../testing';

describe('GroupFieldComponent', () => {
  it('should create', () => {
    const field: GroupField<any> = {
      key: 'testGroup',
      type: 'group',
      label: 'Test Group',
      fields: [],
    };

    const { component } = setupSimpleTest(GroupFieldComponent, {
      field,
    });

    expect(component).toBeTruthy();
  });

  it('should have field input property', () => {
    const field: GroupField<any> = {
      key: 'testGroup',
      type: 'group',
      label: 'Test Group',
      fields: [],
    };

    const { component } = setupSimpleTest(GroupFieldComponent, {
      field,
    });

    expect(component.field()).toEqual(field);
  });

  it('should render group label as legend', () => {
    const field: GroupField<any> = {
      key: 'testGroup',
      type: 'group',
      label: 'Test Group Label',
      fields: [],
    };

    const { fixture } = setupSimpleTest(GroupFieldComponent, {
      field,
    });

    const legend = fixture.nativeElement.querySelector('.lib-group-field__legend');
    expect(legend).toBeTruthy();
    expect(legend.textContent.trim()).toBe('Test Group Label');
  });

  it('should have form state properties', () => {
    const field: GroupField<any> = {
      key: 'testGroup',
      type: 'group',
      label: 'Test Group',
      fields: [],
    };

    const { component } = setupSimpleTest(GroupFieldComponent, {
      field,
    });

    expect(typeof component.valid()).toBe('boolean');
    expect(typeof component.invalid()).toBe('boolean');
    expect(typeof component.dirty()).toBe('boolean');
    expect(typeof component.touched()).toBe('boolean');
  });

  it('should render with child fields', () => {
    const field: GroupField<any> = {
      key: 'testGroup',
      type: 'group',
      label: 'Test Group',
      fields: [createSimpleTestField('field1', 'Field 1'), createSimpleTestField('field2', 'Field 2')],
    };

    const { fixture } = setupSimpleTest(GroupFieldComponent, {
      field,
      value: { field1: 'value1', field2: 'value2' },
    });

    const content = fixture.nativeElement.querySelector('.lib-group-field__content');
    expect(content).toBeTruthy();
  });

  it('should have host classes', () => {
    const field: GroupField<any> = {
      key: 'testGroup',
      type: 'group',
      label: 'Test Group',
      fields: [],
    };

    const { fixture } = setupSimpleTest(GroupFieldComponent, {
      field,
    });

    const element = fixture.nativeElement;
    expect(element.classList.contains('lib-group-field')).toBe(true);
  });
});
