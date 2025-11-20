import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { pageFieldMapper } from './page-field-mapper';
import { PageField } from '../../definitions';

describe('pageFieldMapper', () => {
  let injector: Injector;

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
    injector = TestBed.inject(Injector);
  });

  it('should create 2 bindings (key + field) for minimal page field', () => {
    const fieldDef: PageField = {
      key: 'page1',
      type: 'page',
      fields: [],
    };

    const bindings = pageFieldMapper(fieldDef);
    expect(bindings).toHaveLength(2);
  });

  it('should create 2 bindings regardless of additional properties', () => {
    const fieldDef: PageField = {
      key: 'page2',
      type: 'page',
      label: 'Page Label',
      className: 'page-class',
      tabIndex: 1,
      props: { hint: 'hint' },
      fields: [],
    };

    const bindings = pageFieldMapper(fieldDef);
    expect(bindings).toHaveLength(2);
  });

  it('should handle nested fields of various types', () => {
    const fieldDef: PageField = {
      key: 'formPage',
      type: 'page',
      fields: [
        { key: 'input', type: 'input', label: 'Input' },
        {
          key: 'group',
          type: 'group',
          fields: [{ key: 'nested', type: 'input', label: 'Nested' }],
        } as any,
      ],
    };

    const bindings = pageFieldMapper(fieldDef);
    expect(bindings).toHaveLength(2);
  });

  it('should handle edge cases (empty fields, validation)', () => {
    const testCases = [
      { key: '', type: 'page' as const, fields: [] },
      {
        key: 'validated',
        type: 'page' as const,
        fields: [],
        validation: { required: true },
      } as any,
      {
        key: 'multiField',
        type: 'page' as const,
        fields: [
          { key: 'f1', type: 'input' as const },
          { key: 'f2', type: 'input' as const },
          { key: 'f3', type: 'input' as const },
        ],
      },
    ];

    testCases.forEach((fieldDef) => {
      const bindings = pageFieldMapper(fieldDef);
      expect(bindings).toHaveLength(2);
    });
  });
});
