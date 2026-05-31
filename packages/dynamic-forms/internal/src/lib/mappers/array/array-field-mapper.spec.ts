import { EnvironmentInjector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { arrayFieldMapper } from './array-field-mapper';
import { ArrayField } from '../../definitions/default/array-field';
import { RootFormRegistryService } from '../../core/registry/root-form-registry.service';
import { vi } from 'vitest';

describe('arrayFieldMapper', () => {
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

  function testMapper(fieldDef: ArrayField): Record<string, unknown> {
    const inputsSignal = runInInjectionContext(parentInjector, () => arrayFieldMapper(fieldDef));
    return inputsSignal();
  }

  it('should create inputs object with key and field for minimal array field', () => {
    const fieldDef: ArrayField = {
      key: 'items',
      type: 'array',
      fields: [{ key: 'item', type: 'input' }],
    };

    const inputs = testMapper(fieldDef);
    expect(inputs).toHaveProperty('key', 'items');
    expect(inputs).toHaveProperty('field');
  });

  it('should create inputs with key, field, and className when className is provided', () => {
    const fieldDef: ArrayField = {
      key: 'complexArray',
      type: 'array',
      className: 'array-class',
      tabIndex: 1,
      fields: [{ key: 'item', type: 'input' }],
    };

    const inputs = testMapper(fieldDef);
    expect(inputs).toHaveProperty('key');
    expect(inputs).toHaveProperty('field');
    expect(inputs).toHaveProperty('className', 'array-class');
  });

  it('should handle group fields for object arrays', () => {
    const fieldDef: ArrayField = {
      key: 'contacts',
      type: 'array',
      fields: [
        {
          key: 'contact',
          type: 'group',
          fields: [
            { key: 'name', type: 'input' },
            { key: 'email', type: 'input' },
          ],
        },
      ],
    };

    const inputs = testMapper(fieldDef);
    expect(inputs).toHaveProperty('key');
    expect(inputs).toHaveProperty('field');
  });

  it('should handle edge cases (empty key, null values)', () => {
    const testCases: ArrayField[] = [
      { key: '', type: 'array', fields: [{ key: 'item', type: 'input' }] },
      {
        key: 'arr',
        type: 'array',
        className: undefined,
        fields: [{ key: 'item', type: 'input' }],
      },
    ];

    testCases.forEach((fieldDef) => {
      const inputs = testMapper(fieldDef);
      expect(inputs).toHaveProperty('key');
      expect(inputs).toHaveProperty('field');
    });
  });

  it('should pass the complete field definition as field input', () => {
    const fieldDef: ArrayField = {
      key: 'tags',
      type: 'array',
      className: 'tag-array',
      fields: [{ key: 'tag', type: 'input' }],
    };

    const inputs = testMapper(fieldDef);
    expect(inputs['field']).toBe(fieldDef);
  });

  describe('hidden logic', () => {
    it('should NOT include hidden when no logic or hidden property is defined', () => {
      const fieldDef: ArrayField = {
        key: 'items',
        type: 'array',
        fields: [{ key: 'item', type: 'input' }],
      };

      const inputs = testMapper(fieldDef);
      expect(inputs).not.toHaveProperty('hidden');
    });

    it('should resolve static hidden: true', () => {
      const fieldDef: ArrayField = {
        key: 'items',
        type: 'array',
        hidden: true,
        fields: [{ key: 'item', type: 'input' }],
      };

      const inputs = testMapper(fieldDef);
      expect(inputs['hidden']).toBe(true);
    });

    it('should evaluate hidden logic with boolean condition true', () => {
      const fieldDef: ArrayField = {
        key: 'items',
        type: 'array',
        logic: [{ type: 'hidden', condition: true }],
        fields: [{ key: 'item', type: 'input' }],
      };

      const inputs = testMapper(fieldDef);
      expect(inputs['hidden']).toBe(true);
    });

    it('should evaluate hidden logic with boolean condition false', () => {
      const fieldDef: ArrayField = {
        key: 'items',
        type: 'array',
        logic: [{ type: 'hidden', condition: false }],
        fields: [{ key: 'item', type: 'input' }],
      };

      const inputs = testMapper(fieldDef);
      expect(inputs['hidden']).toBe(false);
    });

    it('should evaluate hidden logic with conditional expression (hidden when condition met)', () => {
      mockFormValue.set({ showItems: false });

      const fieldDef: ArrayField = {
        key: 'items',
        type: 'array',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'showItems',
              operator: 'equals',
              value: false,
            },
          },
        ],
        fields: [{ key: 'item', type: 'input' }],
      };

      const inputs = testMapper(fieldDef);
      expect(inputs['hidden']).toBe(true);
    });

    it('should evaluate hidden logic with conditional expression (visible when condition not met)', () => {
      mockFormValue.set({ showItems: true });

      const fieldDef: ArrayField = {
        key: 'items',
        type: 'array',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'showItems',
              operator: 'equals',
              value: false,
            },
          },
        ],
        fields: [{ key: 'item', type: 'input' }],
      };

      const inputs = testMapper(fieldDef);
      expect(inputs['hidden']).toBe(false);
    });
  });
});
