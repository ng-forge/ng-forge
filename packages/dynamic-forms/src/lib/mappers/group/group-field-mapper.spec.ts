import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { groupFieldMapper } from './group-field-mapper';
import { GroupField } from '../../definitions';

describe('groupFieldMapper', () => {
  let injector: Injector;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
    injector = TestBed.inject(Injector);
  });

  it('should create 2 bindings (key + field) for minimal group field', () => {
    const fieldDef: GroupField = {
      key: 'testGroup',
      type: 'group',
      fields: [],
    };

    const bindings = groupFieldMapper(fieldDef);
    expect(bindings).toHaveLength(2);
  });

  it('should create 2 bindings regardless of additional properties', () => {
    const fieldDef: GroupField = {
      key: 'complexGroup',
      type: 'group',
      label: 'Complex Group',
      className: 'group-class',
      tabIndex: 1,
      props: { hint: 'hint' },
      fields: [],
    };

    const bindings = groupFieldMapper(fieldDef);
    expect(bindings).toHaveLength(2);
  });

  it('should handle nested fields of various types', () => {
    const fieldDef: GroupField = {
      key: 'addressGroup',
      type: 'group',
      fields: [
        { key: 'street', type: 'input', label: 'Street' },
        { key: 'city', type: 'input', label: 'City' },
        {
          key: 'nestedGroup',
          type: 'group',
          fields: [{ key: 'zip', type: 'input', label: 'ZIP' }],
        } as any,
      ],
    };

    const bindings = groupFieldMapper(fieldDef);
    expect(bindings).toHaveLength(2);
  });

  it('should handle edge cases (empty fields, validation)', () => {
    const testCases = [
      { key: '', type: 'group' as const, fields: [] },
      {
        key: 'validated',
        type: 'group' as const,
        fields: [],
        validation: { required: true },
      } as any,
      {
        key: 'conditional',
        type: 'group' as const,
        fields: [{ key: 'f1', type: 'input' as const }],
        conditionals: { show: true },
      } as any,
    ];

    testCases.forEach((fieldDef) => {
      const bindings = groupFieldMapper(fieldDef);
      expect(bindings).toHaveLength(2);
    });
  });
});
