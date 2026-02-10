import { EnvironmentInjector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { rowFieldMapper } from './row-field-mapper';
import { RowField } from '../../definitions/default/row-field';
import { RootFormRegistryService } from '../../core/registry/root-form-registry.service';
import { vi } from 'vitest';

describe('rowFieldMapper', () => {
  let parentInjector: EnvironmentInjector;
  const mockFormValue = signal<Record<string, unknown>>({});
  const mockForm = vi.fn(() => ({
    value: vi.fn().mockReturnValue({}),
    valid: vi.fn().mockReturnValue(true),
    submitting: vi.fn().mockReturnValue(false),
  }));
  let mockRootFormRegistry: {
    rootForm: ReturnType<typeof signal>;
    formValue: ReturnType<typeof signal>;
  };

  beforeEach(async () => {
    mockFormValue.set({});

    mockRootFormRegistry = {
      rootForm: signal(mockForm),
      formValue: mockFormValue,
    };

    await TestBed.configureTestingModule({
      providers: [{ provide: RootFormRegistryService, useValue: mockRootFormRegistry }],
    }).compileComponents();

    parentInjector = TestBed.inject(EnvironmentInjector);
  });

  function testMapper(fieldDef: RowField): Record<string, unknown> {
    const inputsSignal = runInInjectionContext(parentInjector, () => rowFieldMapper(fieldDef));
    return inputsSignal();
  }

  it('should create inputs object with key and field for minimal row field', () => {
    const fieldDef: RowField = {
      key: 'testRow',
      type: 'row',
      fields: [],
    };

    const inputs = testMapper(fieldDef);
    expect(inputs).toHaveProperty('key', 'testRow');
    expect(inputs).toHaveProperty('field');
  });

  it('should create inputs with key, field, and className when className is provided', () => {
    const fieldDef: RowField = {
      key: 'complexRow',
      type: 'row',
      label: 'Complex Row',
      className: 'row-class',
      tabIndex: 1,
      props: { hint: 'hint' },
      fields: [],
    };

    const inputs = testMapper(fieldDef);
    expect(inputs).toHaveProperty('key');
    expect(inputs).toHaveProperty('field');
    expect(inputs).toHaveProperty('className', 'row-class');
  });

  it('should handle nested fields of various types', () => {
    const fieldDef: RowField = {
      key: 'mixedRow',
      type: 'row',
      fields: [
        { key: 'input', type: 'input', label: 'Input' },
        { key: 'select', type: 'select', label: 'Select', props: { options: [] } } as any,
        {
          key: 'group',
          type: 'group',
          fields: [{ key: 'nested', type: 'input', label: 'Nested' }],
        } as any,
      ],
    };

    const inputs = testMapper(fieldDef);
    expect(inputs).toHaveProperty('key');
    expect(inputs).toHaveProperty('field');
  });

  it('should handle edge cases (empty fields, complex layouts)', () => {
    const testCases = [
      { key: '', type: 'row' as const, fields: [] },
      {
        key: 'responsive',
        type: 'row' as const,
        fields: [
          { key: 'f1', type: 'input' as const, col: { span: 6 } } as any,
          { key: 'f2', type: 'input' as const, col: { span: 6 } } as any,
        ],
      },
      {
        key: 'validated',
        type: 'row' as const,
        fields: [],
        validation: { required: true },
      } as any,
    ];

    testCases.forEach((fieldDef) => {
      const inputs = testMapper(fieldDef);
      expect(inputs).toHaveProperty('key');
      expect(inputs).toHaveProperty('field');
    });
  });

  describe('hidden logic', () => {
    it('should NOT include hidden when no logic or hidden property is defined', () => {
      const fieldDef: RowField = {
        key: 'testRow',
        type: 'row',
        fields: [],
      };

      const inputs = testMapper(fieldDef);
      expect(inputs).not.toHaveProperty('hidden');
    });

    it('should resolve static hidden: true', () => {
      const fieldDef: RowField = {
        key: 'testRow',
        type: 'row',
        hidden: true,
        fields: [],
      };

      const inputs = testMapper(fieldDef);
      expect(inputs['hidden']).toBe(true);
    });

    it('should evaluate hidden logic with boolean condition true', () => {
      const fieldDef: RowField = {
        key: 'testRow',
        type: 'row',
        logic: [{ type: 'hidden', condition: true }],
        fields: [],
      };

      const inputs = testMapper(fieldDef);
      expect(inputs['hidden']).toBe(true);
    });

    it('should evaluate hidden logic with boolean condition false', () => {
      const fieldDef: RowField = {
        key: 'testRow',
        type: 'row',
        logic: [{ type: 'hidden', condition: false }],
        fields: [],
      };

      const inputs = testMapper(fieldDef);
      expect(inputs['hidden']).toBe(false);
    });

    it('should evaluate hidden logic with conditional expression (hidden when condition met)', () => {
      mockFormValue.set({ enableAdvanced: false });

      const fieldDef: RowField = {
        key: 'advancedRow',
        type: 'row',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'enableAdvanced',
              operator: 'equals',
              value: false,
            },
          },
        ],
        fields: [{ key: 'setting', type: 'input' }],
      };

      const inputs = testMapper(fieldDef);
      expect(inputs['hidden']).toBe(true);
    });

    it('should evaluate hidden logic with conditional expression (visible when condition not met)', () => {
      mockFormValue.set({ enableAdvanced: true });

      const fieldDef: RowField = {
        key: 'advancedRow',
        type: 'row',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'enableAdvanced',
              operator: 'equals',
              value: false,
            },
          },
        ],
        fields: [{ key: 'setting', type: 'input' }],
      };

      const inputs = testMapper(fieldDef);
      expect(inputs['hidden']).toBe(false);
    });
  });
});
