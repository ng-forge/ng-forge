import { createEnvironmentInjector, EnvironmentInjector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  addArrayItemButtonMapper,
  removeArrayItemButtonMapper,
  prependArrayItemButtonMapper,
  popArrayItemButtonMapper,
  shiftArrayItemButtonMapper,
  BaseArrayAddButtonField,
  BaseArrayRemoveButtonField,
} from './array-button.mapper';
import { ARRAY_CONTEXT, DEFAULT_PROPS, RootFormRegistryService, NonFieldLogicConfig } from '@ng-forge/dynamic-forms';
import { vi } from 'vitest';

describe('Array Button Mappers with Logic', () => {
  let parentInjector: EnvironmentInjector;
  let mockRootFormRegistry: {
    getRootForm: ReturnType<typeof vi.fn>;
    getFormValue: ReturnType<typeof vi.fn>;
  };

  // Create a mock form that satisfies the FieldTree interface
  function createMockForm(formValue: Record<string, unknown> = {}) {
    return vi.fn(() => ({
      value: vi.fn().mockReturnValue(formValue),
      valid: vi.fn().mockReturnValue(true),
      submitting: vi.fn().mockReturnValue(false),
    }));
  }

  function setupMockRegistry(formValue: Record<string, unknown> = {}) {
    const mockForm = createMockForm(formValue);
    mockRootFormRegistry.getRootForm.mockReturnValue(mockForm);
    mockRootFormRegistry.getFormValue.mockReturnValue(formValue);
  }

  beforeEach(async () => {
    mockRootFormRegistry = {
      getRootForm: vi.fn(),
      getFormValue: vi.fn().mockReturnValue({}),
    };

    await TestBed.configureTestingModule({
      providers: [
        { provide: RootFormRegistryService, useValue: mockRootFormRegistry },
        { provide: DEFAULT_PROPS, useValue: signal(undefined) },
        { provide: ARRAY_CONTEXT, useValue: undefined },
      ],
    }).compileComponents();

    parentInjector = TestBed.inject(EnvironmentInjector);
  });

  function createTestInjector(arrayContext?: { arrayKey: string; index: number }): EnvironmentInjector {
    return createEnvironmentInjector(
      [
        { provide: RootFormRegistryService, useValue: mockRootFormRegistry },
        { provide: DEFAULT_PROPS, useValue: signal(undefined) },
        { provide: ARRAY_CONTEXT, useValue: arrayContext },
      ],
      parentInjector,
    );
  }

  describe('addArrayItemButtonMapper', () => {
    function testMapper(fieldDef: BaseArrayAddButtonField, injector: EnvironmentInjector): Record<string, unknown> {
      const inputsSignal = runInInjectionContext(injector, () => addArrayItemButtonMapper(fieldDef));
      return inputsSignal();
    }

    describe('hidden logic', () => {
      it('should return hidden=true when explicit hidden is true', () => {
        setupMockRegistry();
        const injector = createTestInjector({ arrayKey: 'items', index: 0 });

        const fieldDef: BaseArrayAddButtonField = {
          key: 'addItem',
          type: 'addArrayItem',
          label: 'Add Item',
          hidden: true,
          arrayKey: 'items',
          template: { key: 'name', type: 'input' },
        };

        const inputs = testMapper(fieldDef, injector);
        expect(inputs['hidden']).toBe(true);
      });

      it('should return hidden=true when hidden logic condition is true', () => {
        setupMockRegistry({ isReadOnly: true });
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

        const inputs = testMapper(fieldDef, injector);
        expect(inputs['hidden']).toBe(true);
      });

      it('should return hidden=false when hidden logic condition is false', () => {
        setupMockRegistry({ isReadOnly: false });
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

        const inputs = testMapper(fieldDef, injector);
        expect(inputs['hidden']).toBe(false);
      });

      it('should evaluate expression-based hidden logic', () => {
        setupMockRegistry({ maxItemsReached: true });
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

        const inputs = testMapper(fieldDef, injector);
        expect(inputs['hidden']).toBe(true);
      });
    });

    describe('disabled logic', () => {
      it('should return disabled=true when explicit disabled is true', () => {
        setupMockRegistry();
        const injector = createTestInjector({ arrayKey: 'items', index: 0 });

        const fieldDef: BaseArrayAddButtonField = {
          key: 'addItem',
          type: 'addArrayItem',
          label: 'Add Item',
          disabled: true,
          arrayKey: 'items',
          template: { key: 'name', type: 'input' },
        };

        const inputs = testMapper(fieldDef, injector);
        expect(inputs['disabled']).toBe(true);
      });

      it('should return disabled=true when disabled logic condition is true', () => {
        setupMockRegistry({ isLocked: true });
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

        const inputs = testMapper(fieldDef, injector);
        expect(inputs['disabled']).toBe(true);
      });

      it('should return disabled=false when disabled logic condition is false', () => {
        setupMockRegistry({ isLocked: false });
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

        const inputs = testMapper(fieldDef, injector);
        expect(inputs['disabled']).toBe(false);
      });
    });

    describe('combined hidden and disabled logic', () => {
      it('should independently evaluate hidden and disabled from same logic array', () => {
        setupMockRegistry({ status: 'locked' });
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

        const inputs = testMapper(fieldDef, injector);
        // status is 'locked', not 'archived' - so hidden should be false
        expect(inputs['hidden']).toBe(false);
        // status is 'locked' - so disabled should be true
        expect(inputs['disabled']).toBe(true);
      });
    });
  });

  describe('removeArrayItemButtonMapper', () => {
    function testMapper(fieldDef: BaseArrayRemoveButtonField, injector: EnvironmentInjector): Record<string, unknown> {
      const inputsSignal = runInInjectionContext(injector, () => removeArrayItemButtonMapper(fieldDef));
      return inputsSignal();
    }

    describe('hidden logic', () => {
      it('should return hidden=true when hidden logic condition is true', () => {
        setupMockRegistry({ canDelete: false });
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

        const inputs = testMapper(fieldDef, injector);
        expect(inputs['hidden']).toBe(true);
      });
    });

    describe('disabled logic', () => {
      it('should return disabled=true when disabled logic condition is true', () => {
        setupMockRegistry({ minItemsReached: true });
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

        const inputs = testMapper(fieldDef, injector);
        expect(inputs['disabled']).toBe(true);
      });
    });
  });

  describe('prependArrayItemButtonMapper', () => {
    function testMapper(fieldDef: BaseArrayAddButtonField, injector: EnvironmentInjector): Record<string, unknown> {
      const inputsSignal = runInInjectionContext(injector, () => prependArrayItemButtonMapper(fieldDef));
      return inputsSignal();
    }

    it('should evaluate hidden and disabled logic', () => {
      setupMockRegistry({ isAdmin: false, isFrozen: true });
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

      const inputs = testMapper(fieldDef, injector);
      expect(inputs['hidden']).toBe(true);
      expect(inputs['disabled']).toBe(true);
    });
  });

  describe('popArrayItemButtonMapper', () => {
    function testMapper(fieldDef: BaseArrayRemoveButtonField, injector: EnvironmentInjector): Record<string, unknown> {
      const inputsSignal = runInInjectionContext(injector, () => popArrayItemButtonMapper(fieldDef));
      return inputsSignal();
    }

    it('should evaluate hidden and disabled logic', () => {
      setupMockRegistry({ showPopButton: true, isEmpty: true });
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

      const inputs = testMapper(fieldDef, injector);
      expect(inputs['hidden']).toBe(false);
      expect(inputs['disabled']).toBe(true);
    });
  });

  describe('shiftArrayItemButtonMapper', () => {
    function testMapper(fieldDef: BaseArrayRemoveButtonField, injector: EnvironmentInjector): Record<string, unknown> {
      const inputsSignal = runInInjectionContext(injector, () => shiftArrayItemButtonMapper(fieldDef));
      return inputsSignal();
    }

    it('should evaluate hidden and disabled logic', () => {
      setupMockRegistry({ showShiftButton: false, hasItems: false });
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

      const inputs = testMapper(fieldDef, injector);
      expect(inputs['hidden']).toBe(true);
      expect(inputs['disabled']).toBe(true);
    });
  });

  describe('fallback behavior when rootForm is not available', () => {
    it('should use static values when rootForm is undefined', () => {
      mockRootFormRegistry.getRootForm.mockReturnValue(undefined);
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
