import { EnvironmentInjector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { containerFieldMapper } from './container-field-mapper';
import { ContainerField } from '../../definitions/default/container-field';
import { RootFormRegistryService } from '../../core/registry/root-form-registry.service';
import { vi } from 'vitest';

describe('containerFieldMapper', () => {
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

  it('should include the field definition with container wrappers config', () => {
    const fieldDef = {
      key: 'containerSection',
      type: 'container',
      fields: [{ key: 'child', type: 'input' }],
      wrappers: [
        { type: 'section', header: 'Details' },
        { type: 'style', class: 'highlight' },
      ],
    } as unknown as ContainerField;

    const inputs = testMapper(fieldDef);
    const field = inputs['field'] as ContainerField;
    expect(field.wrappers).toHaveLength(2);
    expect(field.wrappers[0].type).toBe('section');
    expect(field.wrappers[1].type).toBe('style');
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
});
