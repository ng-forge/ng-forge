import { EnvironmentInjector, runInInjectionContext, signal, Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { groupFieldMapper } from './group-field-mapper';
import { GroupField } from '../../definitions/default/group-field';
import { RootFormRegistryService } from '../../core/registry/root-form-registry.service';
import { FieldContextRegistryService } from '../../core/registry/field-context-registry.service';
import { FunctionRegistryService } from '../../core/registry/function-registry.service';
import { EXTERNAL_DATA } from '../../models/field-signal-context.token';
import { vi } from 'vitest';

describe('groupFieldMapper', () => {
  let parentInjector: EnvironmentInjector;
  const mockFormValue = signal<Record<string, unknown>>({});
  const externalDataSignal = signal<Record<string, Signal<unknown>> | undefined>(undefined);
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
    externalDataSignal.set(undefined);

    mockRootFormRegistry = {
      rootForm: signal(mockForm),
      formValue: mockFormValue,
    };

    await TestBed.configureTestingModule({
      providers: [
        { provide: RootFormRegistryService, useValue: mockRootFormRegistry },
        { provide: EXTERNAL_DATA, useValue: externalDataSignal },
        FunctionRegistryService,
        FieldContextRegistryService,
      ],
    }).compileComponents();

    parentInjector = TestBed.inject(EnvironmentInjector);
  });

  function testMapper(fieldDef: GroupField): Record<string, unknown> {
    const inputsSignal = runInInjectionContext(parentInjector, () => groupFieldMapper(fieldDef));
    return inputsSignal();
  }

  it('should create inputs object with key and field for minimal group field', () => {
    const fieldDef: GroupField = {
      key: 'testGroup',
      type: 'group',
      fields: [],
    };

    const inputs = testMapper(fieldDef);
    expect(inputs).toHaveProperty('key', 'testGroup');
    expect(inputs).toHaveProperty('field');
  });

  it('should create inputs with key, field, and className when className is provided', () => {
    const fieldDef: GroupField = {
      key: 'complexGroup',
      type: 'group',
      label: 'Complex Group',
      className: 'group-class',
      tabIndex: 1,
      props: { hint: 'hint' },
      fields: [],
    };

    const inputs = testMapper(fieldDef);
    expect(inputs).toHaveProperty('key');
    expect(inputs).toHaveProperty('field');
    expect(inputs).toHaveProperty('className', 'group-class');
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

    const inputs = testMapper(fieldDef);
    expect(inputs).toHaveProperty('key');
    expect(inputs).toHaveProperty('field');
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
      const inputs = testMapper(fieldDef);
      expect(inputs).toHaveProperty('key');
      expect(inputs).toHaveProperty('field');
    });
  });

  describe('hidden logic', () => {
    it('should NOT include hidden when no logic or hidden property is defined', () => {
      const fieldDef: GroupField = {
        key: 'testGroup',
        type: 'group',
        fields: [],
      };

      const inputs = testMapper(fieldDef);
      expect(inputs).not.toHaveProperty('hidden');
    });

    it('should resolve static hidden: true', () => {
      const fieldDef: GroupField = {
        key: 'testGroup',
        type: 'group',
        hidden: true,
        fields: [],
      };

      const inputs = testMapper(fieldDef);
      expect(inputs['hidden']).toBe(true);
    });

    it('should evaluate hidden logic with boolean condition true', () => {
      const fieldDef: GroupField = {
        key: 'testGroup',
        type: 'group',
        logic: [{ type: 'hidden', condition: true }],
        fields: [],
      };

      const inputs = testMapper(fieldDef);
      expect(inputs['hidden']).toBe(true);
    });

    it('should evaluate hidden logic with boolean condition false', () => {
      const fieldDef: GroupField = {
        key: 'testGroup',
        type: 'group',
        logic: [{ type: 'hidden', condition: false }],
        fields: [],
      };

      const inputs = testMapper(fieldDef);
      expect(inputs['hidden']).toBe(false);
    });

    it('should evaluate hidden logic with conditional expression (hidden when condition met)', () => {
      mockFormValue.set({ accountType: 'personal' });

      const fieldDef: GroupField = {
        key: 'businessDetails',
        type: 'group',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'accountType',
              operator: 'notEquals',
              value: 'business',
            },
          },
        ],
        fields: [{ key: 'companyName', type: 'input' }],
      };

      const inputs = testMapper(fieldDef);
      expect(inputs['hidden']).toBe(true);
    });

    it('should evaluate hidden logic with conditional expression (visible when condition not met)', () => {
      mockFormValue.set({ accountType: 'business' });

      const fieldDef: GroupField = {
        key: 'businessDetails',
        type: 'group',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'accountType',
              operator: 'notEquals',
              value: 'business',
            },
          },
        ],
        fields: [{ key: 'companyName', type: 'input' }],
      };

      const inputs = testMapper(fieldDef);
      expect(inputs['hidden']).toBe(false);
    });
  });

  describe('hidden logic with externalData and custom functions', () => {
    it('should hide when a javascript condition reading externalData is met', () => {
      externalDataSignal.set({ mode: signal('active') });

      const fieldDef: GroupField = {
        key: 'externalGroup',
        type: 'group',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'javascript',
              expression: "['active'].some((s) => externalData.mode.startsWith(s))",
            },
          },
        ],
        fields: [{ key: 'child', type: 'input' }],
      };

      const inputs = testMapper(fieldDef);
      expect(inputs['hidden']).toBe(true);
    });

    it('should invoke a registered custom function and hide when it returns true', () => {
      externalDataSignal.set({ mode: signal('active') });
      const probe = vi.fn((ctx: { externalData?: Record<string, unknown> }) => ctx.externalData?.['mode'] === 'active');
      TestBed.inject(FunctionRegistryService).registerCustomFunction('probe', probe);

      const fieldDef: GroupField = {
        key: 'customGroup',
        type: 'group',
        logic: [{ type: 'hidden', condition: { type: 'custom', functionName: 'probe' } }],
        fields: [{ key: 'child', type: 'input' }],
      };

      const inputs = testMapper(fieldDef);
      expect(probe).toHaveBeenCalled();
      expect(inputs['hidden']).toBe(true);
    });
  });
});
