import { describe, it, expect, vi, beforeEach } from 'vitest';
import { computed, DestroyRef, Injector, Type } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { reconcileFields, ResolvedField, resolveField, ResolveFieldContext } from './resolve-field';
import { FieldDef } from '../../definitions/base/field-def';
import { FieldTypeDefinition } from '../../models/field-type';

describe('resolve-field', () => {
  describe('resolveField', () => {
    let mockInjector: Injector;
    let mockDestroyRef: DestroyRef;
    let mockRegistry: Map<string, FieldTypeDefinition>;
    let mockComponent: Type<unknown>;

    beforeEach(() => {
      mockInjector = {
        get: vi.fn(),
      } as unknown as Injector;

      mockDestroyRef = {
        destroyed: false,
        onDestroy: vi.fn(),
      } as unknown as DestroyRef;

      mockRegistry = new Map<string, FieldTypeDefinition>();
      mockComponent = class TestComponent {} as Type<unknown>;
    });

    it('should resolve a field successfully', async () => {
      const fieldDef: FieldDef<unknown> = { type: 'input', key: 'testField', label: 'Test Label' };
      const loadTypeComponent = vi.fn().mockResolvedValue(mockComponent);

      const context: ResolveFieldContext = {
        loadTypeComponent,
        registry: mockRegistry,
        injector: mockInjector,
        destroyRef: mockDestroyRef,
      };

      const result = await firstValueFrom(resolveField(fieldDef, context));

      expect(result).toBeDefined();
      expect(result?.key).toBe('testField');
      expect(result?.component).toBe(mockComponent);
      expect(result?.injector).toBe(mockInjector);
      expect(result?.inputs).toBeDefined();
      expect(loadTypeComponent).toHaveBeenCalledWith('input');
    });

    it('should return undefined when destroyed before component loads', async () => {
      const fieldDef: FieldDef<unknown> = { type: 'input', key: 'testField' };
      const loadTypeComponent = vi.fn().mockImplementation(async () => {
        // Simulate destruction during component loading
        (mockDestroyRef as { destroyed: boolean }).destroyed = true;
        return mockComponent;
      });

      const context: ResolveFieldContext = {
        loadTypeComponent,
        registry: mockRegistry,
        injector: mockInjector,
        destroyRef: mockDestroyRef,
      };

      const result = await firstValueFrom(resolveField(fieldDef, context));

      expect(result).toBeUndefined();
    });

    it('should call onError callback when component loading fails', async () => {
      const fieldDef: FieldDef<unknown> = { type: 'unknown', key: 'testField' };
      const error = new Error('Component not found');
      const loadTypeComponent = vi.fn().mockRejectedValue(error);
      const onError = vi.fn();

      const context: ResolveFieldContext = {
        loadTypeComponent,
        registry: mockRegistry,
        injector: mockInjector,
        destroyRef: mockDestroyRef,
        onError,
      };

      const result = await firstValueFrom(resolveField(fieldDef, context));

      expect(result).toBeUndefined();
      expect(onError).toHaveBeenCalledWith(fieldDef, error);
    });

    it('should not call onError when component is destroyed', async () => {
      const fieldDef: FieldDef<unknown> = { type: 'unknown', key: 'testField' };
      const error = new Error('Component not found');
      const loadTypeComponent = vi.fn().mockImplementation(async () => {
        (mockDestroyRef as { destroyed: boolean }).destroyed = true;
        throw error;
      });
      const onError = vi.fn();

      const context: ResolveFieldContext = {
        loadTypeComponent,
        registry: mockRegistry,
        injector: mockInjector,
        destroyRef: mockDestroyRef,
        onError,
      };

      const result = await firstValueFrom(resolveField(fieldDef, context));

      expect(result).toBeUndefined();
      // onError should NOT be called when destroyed to avoid accessing cleaned-up state
      expect(onError).not.toHaveBeenCalled();
    });

    it('should return undefined on error without onError callback', async () => {
      const fieldDef: FieldDef<unknown> = { type: 'unknown', key: 'testField' };
      const loadTypeComponent = vi.fn().mockRejectedValue(new Error('Failed'));

      const context: ResolveFieldContext = {
        loadTypeComponent,
        registry: mockRegistry,
        injector: mockInjector,
        destroyRef: mockDestroyRef,
        // No onError provided
      };

      const result = await firstValueFrom(resolveField(fieldDef, context));

      expect(result).toBeUndefined();
    });

    it('should create inputs signal from field definition', async () => {
      const fieldDef: FieldDef<unknown> = {
        type: 'input',
        key: 'email',
        label: 'Email Address',
      };
      const loadTypeComponent = vi.fn().mockResolvedValue(mockComponent);

      const context: ResolveFieldContext = {
        loadTypeComponent,
        registry: mockRegistry,
        injector: mockInjector,
        destroyRef: mockDestroyRef,
      };

      const result = await firstValueFrom(resolveField(fieldDef, context));

      expect(result).toBeDefined();
      expect(result?.inputs).toBeDefined();
      // The inputs signal should contain the field's label
      const inputsValue = result?.inputs();
      expect(inputsValue).toHaveProperty('label', 'Email Address');
    });
  });

  describe('reconcileFields', () => {
    let injector1: Injector;
    let injector2: Injector;
    let injector3: Injector;
    let componentA: Type<unknown>;
    let componentB: Type<unknown>;

    beforeEach(() => {
      injector1 = { get: vi.fn() } as unknown as Injector;
      injector2 = { get: vi.fn() } as unknown as Injector;
      injector3 = { get: vi.fn() } as unknown as Injector;
      componentA = class ComponentA {} as Type<unknown>;
      componentB = class ComponentB {} as Type<unknown>;
    });

    function createResolvedField(key: string, component: Type<unknown>, injector: Injector): ResolvedField {
      return {
        key,
        component,
        injector,
        inputs: computed(() => ({})),
      };
    }

    it('should preserve injector when key and component are the same', () => {
      const prev: ResolvedField[] = [createResolvedField('field1', componentA, injector1)];
      const curr: ResolvedField[] = [createResolvedField('field1', componentA, injector2)];

      const result = reconcileFields(prev, curr);

      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('field1');
      expect(result[0].injector).toBe(injector1); // Preserved from prev
      expect(result[0].component).toBe(componentA);
    });

    it('should use new injector when component type changes', () => {
      const prev: ResolvedField[] = [createResolvedField('field1', componentA, injector1)];
      const curr: ResolvedField[] = [createResolvedField('field1', componentB, injector2)];

      const result = reconcileFields(prev, curr);

      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('field1');
      expect(result[0].injector).toBe(injector2); // New injector used
      expect(result[0].component).toBe(componentB);
    });

    it('should use new injector for new fields', () => {
      const prev: ResolvedField[] = [createResolvedField('field1', componentA, injector1)];
      const curr: ResolvedField[] = [
        createResolvedField('field1', componentA, injector2),
        createResolvedField('field2', componentB, injector3),
      ];

      const result = reconcileFields(prev, curr);

      expect(result).toHaveLength(2);
      expect(result[0].injector).toBe(injector1); // Preserved
      expect(result[1].injector).toBe(injector3); // New field, new injector
    });

    it('should handle removed fields (fields in prev but not in curr)', () => {
      const prev: ResolvedField[] = [
        createResolvedField('field1', componentA, injector1),
        createResolvedField('field2', componentB, injector2),
      ];
      const curr: ResolvedField[] = [createResolvedField('field1', componentA, injector3)];

      const result = reconcileFields(prev, curr);

      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('field1');
      expect(result[0].injector).toBe(injector1); // Preserved
    });

    it('should handle empty previous array', () => {
      const prev: ResolvedField[] = [];
      const curr: ResolvedField[] = [
        createResolvedField('field1', componentA, injector1),
        createResolvedField('field2', componentB, injector2),
      ];

      const result = reconcileFields(prev, curr);

      expect(result).toHaveLength(2);
      expect(result[0].injector).toBe(injector1);
      expect(result[1].injector).toBe(injector2);
    });

    it('should handle empty current array', () => {
      const prev: ResolvedField[] = [
        createResolvedField('field1', componentA, injector1),
        createResolvedField('field2', componentB, injector2),
      ];
      const curr: ResolvedField[] = [];

      const result = reconcileFields(prev, curr);

      expect(result).toHaveLength(0);
    });

    it('should handle both arrays empty', () => {
      const prev: ResolvedField[] = [];
      const curr: ResolvedField[] = [];

      const result = reconcileFields(prev, curr);

      expect(result).toHaveLength(0);
    });

    it('should handle reordering of fields', () => {
      const prev: ResolvedField[] = [
        createResolvedField('field1', componentA, injector1),
        createResolvedField('field2', componentB, injector2),
      ];
      const curr: ResolvedField[] = [
        createResolvedField('field2', componentB, injector3),
        createResolvedField('field1', componentA, injector3),
      ];

      const result = reconcileFields(prev, curr);

      expect(result).toHaveLength(2);
      // field2 should preserve injector2
      expect(result[0].key).toBe('field2');
      expect(result[0].injector).toBe(injector2);
      // field1 should preserve injector1
      expect(result[1].key).toBe('field1');
      expect(result[1].injector).toBe(injector1);
    });

    it('should update inputs while preserving injector', () => {
      const oldInputs = computed(() => ({ label: 'Old' }));
      const newInputs = computed(() => ({ label: 'New' }));

      const prev: ResolvedField[] = [
        {
          key: 'field1',
          component: componentA,
          injector: injector1,
          inputs: oldInputs,
        },
      ];
      const curr: ResolvedField[] = [
        {
          key: 'field1',
          component: componentA,
          injector: injector2,
          inputs: newInputs,
        },
      ];

      const result = reconcileFields(prev, curr);

      expect(result[0].injector).toBe(injector1); // Preserved
      expect(result[0].inputs).toBe(newInputs); // Updated from curr
    });

    it('should handle multiple fields with mixed scenarios', () => {
      const componentC = class ComponentC {} as Type<unknown>;

      const prev: ResolvedField[] = [
        createResolvedField('unchanged', componentA, injector1),
        createResolvedField('typeChanged', componentA, injector1),
        createResolvedField('removed', componentB, injector2),
      ];
      const curr: ResolvedField[] = [
        createResolvedField('unchanged', componentA, injector3),
        createResolvedField('typeChanged', componentC, injector3),
        createResolvedField('newField', componentB, injector3),
      ];

      const result = reconcileFields(prev, curr);

      expect(result).toHaveLength(3);

      // unchanged: same key & component -> preserve injector
      const unchanged = result.find((f) => f.key === 'unchanged');
      expect(unchanged?.injector).toBe(injector1);

      // typeChanged: same key, different component -> new injector
      const typeChanged = result.find((f) => f.key === 'typeChanged');
      expect(typeChanged?.injector).toBe(injector3);
      expect(typeChanged?.component).toBe(componentC);

      // newField: new field -> new injector
      const newField = result.find((f) => f.key === 'newField');
      expect(newField?.injector).toBe(injector3);
    });
  });
});
