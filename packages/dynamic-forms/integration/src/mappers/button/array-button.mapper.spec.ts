import { Injector, runInInjectionContext, signal, WritableSignal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import {
  addArrayItemButtonMapper,
  removeArrayItemButtonMapper,
  prependArrayItemButtonMapper,
  popArrayItemButtonMapper,
  shiftArrayItemButtonMapper,
  BaseArrayAddButtonField,
  BaseArrayRemoveButtonField,
} from './array-button.mapper';
import { ARRAY_CONTEXT, DEFAULT_PROPS, DynamicFormLogger, RootFormRegistryService, NonFieldLogicConfig } from '@ng-forge/dynamic-forms';
import { vi } from 'vitest';

describe('Array Button Mappers with Logic', () => {
  // Mock form: a callable that returns FieldState-like object (matches the
  // shape consumed by resolveNonFieldHidden / resolveNonFieldDisabled).
  function createMockForm(formValue: Record<string, unknown> = {}): FieldTree<Record<string, unknown>> {
    return vi.fn(() => ({
      value: vi.fn().mockReturnValue(formValue),
      valid: vi.fn().mockReturnValue(true),
      submitting: vi.fn().mockReturnValue(false),
    })) as unknown as FieldTree<Record<string, unknown>>;
  }

  let rootFormSignal: WritableSignal<FieldTree<Record<string, unknown>> | undefined>;
  let formValueSignal: WritableSignal<Record<string, unknown>>;

  function setRegistry(formValue: Record<string, unknown> = {}): void {
    formValueSignal.set(formValue);
    rootFormSignal.set(createMockForm(formValue));
  }

  beforeEach(() => {
    rootFormSignal = signal<FieldTree<Record<string, unknown>> | undefined>(undefined);
    formValueSignal = signal<Record<string, unknown>>({});
  });

  function createTestInjector(arrayContext?: { arrayKey: string; index: number }): Injector {
    // ARRAY_CONTEXT.index is a Signal<number>, formValue and field are also required.
    const ctxValue = arrayContext
      ? {
          arrayKey: arrayContext.arrayKey,
          index: signal(arrayContext.index),
          formValue: {},
          field: { key: arrayContext.arrayKey, type: 'array' },
        }
      : undefined;
    return Injector.create({
      providers: [
        {
          provide: RootFormRegistryService,
          useValue: { formValue: formValueSignal, rootForm: rootFormSignal },
        },
        { provide: DEFAULT_PROPS, useValue: signal(undefined) },
        { provide: ARRAY_CONTEXT, useValue: ctxValue },
        {
          provide: DynamicFormLogger,
          useValue: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
        },
      ],
    });
  }

  describe('addArrayItemButtonMapper', () => {
    function runMapper(fieldDef: BaseArrayAddButtonField, injector: Injector): Record<string, unknown> {
      const inputsSignal = runInInjectionContext(injector, () => addArrayItemButtonMapper(fieldDef));
      return inputsSignal();
    }

    describe('hidden logic', () => {
      it('should return hidden=true when explicit hidden is true', () => {
        setRegistry();
        const injector = createTestInjector({ arrayKey: 'items', index: 0 });

        const fieldDef: BaseArrayAddButtonField = {
          key: 'addItem',
          type: 'addArrayItem',
          label: 'Add Item',
          hidden: true,
          arrayKey: 'items',
          template: { key: 'name', type: 'input' },
        };

        const inputs = runMapper(fieldDef, injector);
        expect(inputs['hidden']).toBe(true);
      });

      it('should return hidden=true when hidden logic condition is true', () => {
        setRegistry({ isReadOnly: true });
        const injector = createTestInjector({ arrayKey: 'items', index: 0 });

        const fieldDef: BaseArrayAddButtonField = {
          key: 'addItem',
          type: 'addArrayItem',
          label: 'Add Item',
          arrayKey: 'items',
          template: { key: 'name', type: 'input' },
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'isReadOnly',
                operator: 'equals',
                value: true,
              },
            },
          ],
        };

        const inputs = runMapper(fieldDef, injector);
        expect(inputs['hidden']).toBe(true);
      });

      it('should return hidden=false when hidden logic condition is false', () => {
        setRegistry({ isReadOnly: false });
        const injector = createTestInjector({ arrayKey: 'items', index: 0 });

        const fieldDef: BaseArrayAddButtonField = {
          key: 'addItem',
          type: 'addArrayItem',
          label: 'Add Item',
          arrayKey: 'items',
          template: { key: 'name', type: 'input' },
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'fieldValue',
                fieldPath: 'isReadOnly',
                operator: 'equals',
                value: true,
              },
            },
          ],
        };

        const inputs = runMapper(fieldDef, injector);
        expect(inputs['hidden']).toBe(false);
      });

      // TODO: enable once this spec is wired with TestBed + the expression
      // evaluator services (FunctionRegistryService, LogicFunctionCacheService,
      // FieldContextRegistryService, HttpConditionFunctionCacheService,
      // DynamicValueFunctionCacheService). The fieldValue variants above
      // already exercise the resolver end-to-end.
      it.skip('should evaluate expression-based hidden logic', () => {
        setRegistry({ maxItemsReached: true });
        const injector = createTestInjector({ arrayKey: 'items', index: 0 });

        const fieldDef: BaseArrayAddButtonField = {
          key: 'addItem',
          type: 'addArrayItem',
          label: 'Add Item',
          arrayKey: 'items',
          template: { key: 'name', type: 'input' },
          logic: [
            {
              type: 'hidden',
              condition: { type: 'javascript', expression: 'maxItemsReached' },
            },
          ],
        };

        const inputs = runMapper(fieldDef, injector);
        expect(inputs['hidden']).toBe(true);
      });
    });

    describe('disabled logic', () => {
      it('should return disabled=true when explicit disabled is true', () => {
        setRegistry();
        const injector = createTestInjector({ arrayKey: 'items', index: 0 });

        const fieldDef: BaseArrayAddButtonField = {
          key: 'addItem',
          type: 'addArrayItem',
          label: 'Add Item',
          disabled: true,
          arrayKey: 'items',
          template: { key: 'name', type: 'input' },
        };

        const inputs = runMapper(fieldDef, injector);
        expect(inputs['disabled']).toBe(true);
      });

      it('should return disabled=true when disabled logic condition is true', () => {
        setRegistry({ isLocked: true });
        const injector = createTestInjector({ arrayKey: 'items', index: 0 });

        const fieldDef: BaseArrayAddButtonField = {
          key: 'addItem',
          type: 'addArrayItem',
          label: 'Add Item',
          arrayKey: 'items',
          template: { key: 'name', type: 'input' },
          logic: [
            {
              type: 'disabled',
              condition: {
                type: 'fieldValue',
                fieldPath: 'isLocked',
                operator: 'equals',
                value: true,
              },
            },
          ],
        };

        const inputs = runMapper(fieldDef, injector);
        expect(inputs['disabled']).toBe(true);
      });

      it('should return disabled=false when disabled logic condition is false', () => {
        setRegistry({ isLocked: false });
        const injector = createTestInjector({ arrayKey: 'items', index: 0 });

        const fieldDef: BaseArrayAddButtonField = {
          key: 'addItem',
          type: 'addArrayItem',
          label: 'Add Item',
          arrayKey: 'items',
          template: { key: 'name', type: 'input' },
          logic: [
            {
              type: 'disabled',
              condition: {
                type: 'fieldValue',
                fieldPath: 'isLocked',
                operator: 'equals',
                value: true,
              },
            },
          ],
        };

        const inputs = runMapper(fieldDef, injector);
        expect(inputs['disabled']).toBe(false);
      });
    });

    describe('combined hidden and disabled logic', () => {
      it('should independently evaluate hidden and disabled from same logic array', () => {
        setRegistry({ status: 'locked' });
        const injector = createTestInjector({ arrayKey: 'items', index: 0 });

        const logic: NonFieldLogicConfig[] = [
          {
            type: 'hidden',
            condition: {
              type: 'fieldValue',
              fieldPath: 'status',
              operator: 'equals',
              value: 'archived',
            },
          },
          {
            type: 'disabled',
            condition: {
              type: 'fieldValue',
              fieldPath: 'status',
              operator: 'equals',
              value: 'locked',
            },
          },
        ];

        const fieldDef: BaseArrayAddButtonField = {
          key: 'addItem',
          type: 'addArrayItem',
          label: 'Add Item',
          arrayKey: 'items',
          template: { key: 'name', type: 'input' },
          logic,
        };

        const inputs = runMapper(fieldDef, injector);
        // status is 'locked', not 'archived' - so hidden should be false
        expect(inputs['hidden']).toBe(false);
        // status is 'locked' - so disabled should be true
        expect(inputs['disabled']).toBe(true);
      });
    });
  });

  describe('removeArrayItemButtonMapper', () => {
    function runMapper(fieldDef: BaseArrayRemoveButtonField, injector: Injector): Record<string, unknown> {
      const inputsSignal = runInInjectionContext(injector, () => removeArrayItemButtonMapper(fieldDef));
      return inputsSignal();
    }

    describe('hidden logic', () => {
      it.skip('should return hidden=true when hidden logic condition is true', () => {
        setRegistry({ canDelete: false });
        const injector = createTestInjector({ arrayKey: 'items', index: 0 });

        const fieldDef: BaseArrayRemoveButtonField = {
          key: 'removeItem',
          type: 'removeArrayItem',
          label: 'Remove',
          arrayKey: 'items',
          logic: [
            {
              type: 'hidden',
              condition: { type: 'javascript', expression: '!canDelete' },
            },
          ],
        };

        const inputs = runMapper(fieldDef, injector);
        expect(inputs['hidden']).toBe(true);
      });
    });

    describe('disabled logic', () => {
      it.skip('should return disabled=true when disabled logic condition is true', () => {
        setRegistry({ minItemsReached: true });
        const injector = createTestInjector({ arrayKey: 'items', index: 0 });

        const fieldDef: BaseArrayRemoveButtonField = {
          key: 'removeItem',
          type: 'removeArrayItem',
          label: 'Remove',
          arrayKey: 'items',
          logic: [
            {
              type: 'disabled',
              condition: { type: 'javascript', expression: 'minItemsReached' },
            },
          ],
        };

        const inputs = runMapper(fieldDef, injector);
        expect(inputs['disabled']).toBe(true);
      });
    });
  });

  describe('prependArrayItemButtonMapper', () => {
    function runMapper(fieldDef: BaseArrayAddButtonField, injector: Injector): Record<string, unknown> {
      const inputsSignal = runInInjectionContext(injector, () => prependArrayItemButtonMapper(fieldDef));
      return inputsSignal();
    }

    it.skip('should evaluate hidden and disabled logic', () => {
      setRegistry({ isAdmin: false, isFrozen: true });
      const injector = createTestInjector({ arrayKey: 'items', index: 0 });

      const fieldDef: BaseArrayAddButtonField = {
        key: 'prependItem',
        type: 'prependArrayItem',
        label: 'Add to Start',
        arrayKey: 'items',
        template: { key: 'name', type: 'input' },
        logic: [
          { type: 'hidden', condition: { type: 'javascript', expression: '!isAdmin' } },
          { type: 'disabled', condition: { type: 'javascript', expression: 'isFrozen' } },
        ],
      };

      const inputs = runMapper(fieldDef, injector);
      expect(inputs['hidden']).toBe(true);
      expect(inputs['disabled']).toBe(true);
    });
  });

  describe('popArrayItemButtonMapper', () => {
    function runMapper(fieldDef: BaseArrayRemoveButtonField, injector: Injector): Record<string, unknown> {
      const inputsSignal = runInInjectionContext(injector, () => popArrayItemButtonMapper(fieldDef));
      return inputsSignal();
    }

    it.skip('should evaluate hidden and disabled logic', () => {
      setRegistry({ showPopButton: true, isEmpty: true });
      const injector = createTestInjector();

      const fieldDef: BaseArrayRemoveButtonField = {
        key: 'popItem',
        type: 'popArrayItem',
        label: 'Remove Last',
        arrayKey: 'items',
        logic: [
          { type: 'hidden', condition: { type: 'javascript', expression: '!showPopButton' } },
          { type: 'disabled', condition: { type: 'javascript', expression: 'isEmpty' } },
        ],
      };

      const inputs = runMapper(fieldDef, injector);
      expect(inputs['hidden']).toBe(false);
      expect(inputs['disabled']).toBe(true);
    });
  });

  describe('shiftArrayItemButtonMapper', () => {
    function runMapper(fieldDef: BaseArrayRemoveButtonField, injector: Injector): Record<string, unknown> {
      const inputsSignal = runInInjectionContext(injector, () => shiftArrayItemButtonMapper(fieldDef));
      return inputsSignal();
    }

    it.skip('should evaluate hidden and disabled logic', () => {
      setRegistry({ showShiftButton: false, hasItems: false });
      const injector = createTestInjector();

      const fieldDef: BaseArrayRemoveButtonField = {
        key: 'shiftItem',
        type: 'shiftArrayItem',
        label: 'Remove First',
        arrayKey: 'items',
        logic: [
          { type: 'hidden', condition: { type: 'javascript', expression: '!showShiftButton' } },
          { type: 'disabled', condition: { type: 'javascript', expression: '!hasItems' } },
        ],
      };

      const inputs = runMapper(fieldDef, injector);
      expect(inputs['hidden']).toBe(true);
      expect(inputs['disabled']).toBe(true);
    });
  });

  describe('fallback behavior when rootForm is not available', () => {
    it('should use static values when rootForm is undefined', () => {
      rootFormSignal.set(undefined);
      const injector = createTestInjector({ arrayKey: 'items', index: 0 });

      const fieldDef: BaseArrayAddButtonField = {
        key: 'addItem',
        type: 'addArrayItem',
        label: 'Add Item',
        hidden: true,
        disabled: true,
        arrayKey: 'items',
        template: { key: 'name', type: 'input' },
        logic: [
          { type: 'hidden', condition: false }, // Would normally make it visible
          { type: 'disabled', condition: false }, // Would normally enable it
        ],
      };

      const inputsSignal = runInInjectionContext(injector, () => addArrayItemButtonMapper(fieldDef));
      const inputs = inputsSignal();

      // Should use static values since rootForm is not available
      expect(inputs['hidden']).toBe(true);
      expect(inputs['disabled']).toBe(true);
    });
  });
});
