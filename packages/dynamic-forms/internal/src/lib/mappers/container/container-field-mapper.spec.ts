import { EnvironmentInjector, Injector, runInInjectionContext, signal, Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { containerFieldMapper } from './container-field-mapper';
import { ContainerField } from '../../definitions/default/container-field';
import { RootFormRegistryService } from '../../core/registry/root-form-registry.service';
import { FieldContextRegistryService } from '../../core/registry/field-context-registry.service';
import { FunctionRegistryService } from '../../core/registry/function-registry.service';
import { ARRAY_CONTEXT, EXTERNAL_DATA } from '../../models/field-signal-context.token';
import { vi } from 'vitest';

describe('containerFieldMapper', () => {
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

  function testMapper(fieldDef: ContainerField): Record<string, unknown> {
    const inputsSignal = runInInjectionContext(parentInjector, () => containerFieldMapper(fieldDef));
    return inputsSignal();
  }

  it('should create inputs object with key and field for minimal container field', () => {
    const fieldDef = {
      key: 'testContainer',
      type: 'container',
      fields: [],
      wrappers: [],
    } as unknown as ContainerField;

    const inputs = testMapper(fieldDef);
    expect(inputs).toHaveProperty('key', 'testContainer');
    expect(inputs).toHaveProperty('field');
  });

  it('should create inputs with key, field, and className when className is provided', () => {
    const fieldDef = {
      key: 'styledContainer',
      type: 'container',
      className: 'container-class',
      fields: [],
      wrappers: [{ type: 'section', header: 'Test' }],
    } as unknown as ContainerField;

    const inputs = testMapper(fieldDef);
    expect(inputs).toHaveProperty('key');
    expect(inputs).toHaveProperty('field');
    expect(inputs).toHaveProperty('className', 'container-class');
  });

  it('should strip wrapper props from the field input (DfFieldOutlet handles wrappers)', () => {
    const fieldDef = {
      key: 'containerSection',
      type: 'container',
      fields: [{ key: 'child', type: 'input' }],
      wrappers: [
        { type: 'section', header: 'Details' },
        { type: 'style', class: 'highlight' },
      ],
      skipAutoWrappers: true,
      skipDefaultWrappers: true,
    } as unknown as ContainerField;

    const inputs = testMapper(fieldDef);
    const field = inputs['field'] as Record<string, unknown>;
    // Wrapper-related props are nullified to avoid double-wrapping.
    // DfFieldOutlet reads wrappers from the original fieldDef; the container's
    // internal wrapper chain only handles mapper-synthesized wrappers (e.g., row).
    expect(field.wrappers).toBeUndefined();
    expect(field.skipAutoWrappers).toBeUndefined();
    expect(field.skipDefaultWrappers).toBeUndefined();
    // Other props are preserved
    expect(field).toHaveProperty('key', 'containerSection');
    expect(field).toHaveProperty('fields');
  });

  describe('hidden logic', () => {
    it('should NOT include hidden when no logic or hidden property is defined', () => {
      const fieldDef = {
        key: 'testContainer',
        type: 'container',
        fields: [],
        wrappers: [],
      } as unknown as ContainerField;

      const inputs = testMapper(fieldDef);
      expect(inputs).not.toHaveProperty('hidden');
    });

    it('should resolve static hidden: true', () => {
      const fieldDef = {
        key: 'testContainer',
        type: 'container',
        hidden: true,
        fields: [],
        wrappers: [],
      } as unknown as ContainerField;

      const inputs = testMapper(fieldDef);
      expect(inputs['hidden']).toBe(true);
    });

    it('should evaluate hidden logic with boolean condition true', () => {
      const fieldDef = {
        key: 'testContainer',
        type: 'container',
        logic: [{ type: 'hidden', condition: true }],
        fields: [],
        wrappers: [],
      } as unknown as ContainerField;

      const inputs = testMapper(fieldDef);
      expect(inputs['hidden']).toBe(true);
    });

    it('should evaluate hidden logic with boolean condition false', () => {
      const fieldDef = {
        key: 'testContainer',
        type: 'container',
        logic: [{ type: 'hidden', condition: false }],
        fields: [],
        wrappers: [],
      } as unknown as ContainerField;

      const inputs = testMapper(fieldDef);
      expect(inputs['hidden']).toBe(false);
    });

    it('should evaluate hidden logic with conditional expression (hidden when condition met)', () => {
      mockFormValue.set({ showSection: false });

      const fieldDef = {
        key: 'conditionalContainer',
        type: 'container',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'showSection',
              operator: 'equals',
              value: false,
            },
          },
        ],
        fields: [{ key: 'child', type: 'input' }],
        wrappers: [{ type: 'section', header: 'Conditional' }],
      } as unknown as ContainerField;

      const inputs = testMapper(fieldDef);
      expect(inputs['hidden']).toBe(true);
    });

    it('should evaluate hidden logic with conditional expression (visible when condition not met)', () => {
      mockFormValue.set({ showSection: true });

      const fieldDef = {
        key: 'conditionalContainer',
        type: 'container',
        logic: [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'showSection',
              operator: 'equals',
              value: false,
            },
          },
        ],
        fields: [{ key: 'child', type: 'input' }],
        wrappers: [{ type: 'section', header: 'Conditional' }],
      } as unknown as ContainerField;

      const inputs = testMapper(fieldDef);
      expect(inputs['hidden']).toBe(false);
    });
  });

  describe('hidden logic with externalData and custom functions', () => {
    it('should hide when a javascript condition reading externalData is met', () => {
      externalDataSignal.set({ mode: signal('active') });

      const fieldDef = {
        key: 'externalContainer',
        type: 'container',
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
        wrappers: [],
      } as unknown as ContainerField;

      const inputs = testMapper(fieldDef);
      expect(inputs['hidden']).toBe(true);
    });

    it('should stay visible when a javascript condition reading externalData is not met', () => {
      externalDataSignal.set({ mode: signal('inactive') });

      const fieldDef = {
        key: 'externalContainer',
        type: 'container',
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
        wrappers: [],
      } as unknown as ContainerField;

      const inputs = testMapper(fieldDef);
      expect(inputs['hidden']).toBe(false);
    });

    it('should invoke a registered custom function and hide when it returns true', () => {
      externalDataSignal.set({ mode: signal('active') });
      const probe = vi.fn((ctx: { externalData?: Record<string, unknown> }) => ctx.externalData?.['mode'] === 'active');
      TestBed.inject(FunctionRegistryService).registerCustomFunction('probe', probe);

      const fieldDef = {
        key: 'customContainer',
        type: 'container',
        logic: [{ type: 'hidden', condition: { type: 'custom', functionName: 'probe' } }],
        fields: [{ key: 'child', type: 'input' }],
        wrappers: [],
      } as unknown as ContainerField;

      const inputs = testMapper(fieldDef);
      expect(probe).toHaveBeenCalled();
      expect(inputs['hidden']).toBe(true);
    });

    it('reacts to externalData signal changes', () => {
      const mode = signal('inactive');
      externalDataSignal.set({ mode });

      const fieldDef = {
        key: 'reactiveContainer',
        type: 'container',
        logic: [
          {
            type: 'hidden',
            condition: { type: 'javascript', expression: "externalData.mode === 'active'" },
          },
        ],
        fields: [{ key: 'child', type: 'input' }],
        wrappers: [],
      } as unknown as ContainerField;

      const inputsSignal = runInInjectionContext(parentInjector, () => containerFieldMapper(fieldDef));
      expect(inputsSignal()['hidden']).toBe(false);

      mode.set('active');
      expect(inputsSignal()['hidden']).toBe(true);
    });

    it('scopes conditions to the enclosing array item when inside one', () => {
      mockFormValue.set({ rows: [{ visible: false }, { visible: true }] });
      const arrayInjector = Injector.create({
        providers: [{ provide: ARRAY_CONTEXT, useValue: { arrayKey: 'rows', index: signal(1) } }],
        parent: parentInjector,
      });

      const fieldDef = {
        key: 'box',
        type: 'container',
        logic: [{ type: 'hidden', condition: { type: 'fieldValue', fieldPath: 'visible', operator: 'equals', value: true } }],
        fields: [],
        wrappers: [],
      } as unknown as ContainerField;

      const inputsSignal = runInInjectionContext(arrayInjector, () => containerFieldMapper(fieldDef));

      // rows[1].visible === true → hidden (item-scoped); root has no `visible`.
      expect(inputsSignal()['hidden']).toBe(true);
    });
  });
});
