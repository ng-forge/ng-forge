import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { baseFieldMapper } from './base-field-mapper';
import { FieldDef } from '../../definitions';

describe('baseFieldMapper', () => {
  let injector: Injector;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
    injector = TestBed.inject(Injector);
  });

  it('should create bindings for non-excluded properties', () => {
    const testCases = [
      {
        desc: 'minimal field (key only)',
        field: { key: 'test', type: 'input' } as FieldDef<any>,
        expectedCount: 1,
      },
      {
        desc: 'field with label',
        field: { key: 'test', type: 'input', label: 'Test' } as FieldDef<any>,
        expectedCount: 2,
      },
      {
        desc: 'field with standard properties',
        field: {
          key: 'test',
          type: 'input',
          label: 'Test',
          className: 'test-class',
          tabIndex: 1,
          props: { hint: 'hint' },
        } as FieldDef<any>,
        expectedCount: 5,
      },
      {
        desc: 'complex field with custom properties',
        field: {
          key: 'test',
          type: 'input',
          label: 'Test',
          className: 'class',
          tabIndex: 1,
          props: { hint: 'hint' },
          customProp: 'value',
          anotherProp: 123,
        } as any,
        expectedCount: 7,
      },
    ];

    testCases.forEach(({ desc, field, expectedCount }) => {
      const bindings = baseFieldMapper(field);
      expect(bindings).toHaveLength(expectedCount);
    });
  });

  it('should exclude specific properties from bindings', () => {
    const fieldWithExcludedProps: FieldDef<any> = {
      key: 'test',
      type: 'input',
      label: 'Test',
      disabled: true,
      readonly: false,
      hidden: false,
      validation: { required: true },
      conditionals: { show: true },
      customProp: 'included',
    } as any;

    const bindings = baseFieldMapper(fieldWithExcludedProps);

    expect(bindings).toHaveLength(3); // key + label + customProp (excluded props not counted)
  });

  it('should handle field with only excluded properties', () => {
    const fieldDef: FieldDef<any> = {
      key: 'test',
      type: 'input',
      validation: { required: true },
      conditionals: {},
    } as any;

    const bindings = baseFieldMapper(fieldDef);
    expect(bindings).toHaveLength(1); // only key binding
  });
});
