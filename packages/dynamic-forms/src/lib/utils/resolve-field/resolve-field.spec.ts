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

    it('should preserve object identity when key, component, and injector all match', () => {
      const prev: ResolvedField[] = [createResolvedField('field1', componentA, injector1)];
      const curr: ResolvedField[] = [createResolvedField('field1', componentA, injector1)];

      const result = reconcileFields(prev, curr);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(prev[0]); // Same object reference
    });

    it('should use new field when injector changes (config change)', () => {
      const prev: ResolvedField[] = [createResolvedField('field1', componentA, injector1)];
      const curr: ResolvedField[] = [createResolvedField('field1', componentA, injector2)];

      const result = reconcileFields(prev, curr);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(curr[0]); // New field used
      expect(result[0].injector).toBe(injector2);
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

    it('should use new field for new keys', () => {
      const prev: ResolvedField[] = [createResolvedField('field1', componentA, injector1)];
      const curr: ResolvedField[] = [
        createResolvedField('field1', componentA, injector2),
        createResolvedField('field2', componentB, injector3),
      ];

      const result = reconcileFields(prev, curr);

      expect(result).toHaveLength(2);
      expect(result[0].injector).toBe(injector2); // Different injector, new field used
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
      expect(result[0].injector).toBe(injector3); // Different injector, new field used
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

    it('should handle reordering of fields with same injector', () => {
      const prev: ResolvedField[] = [
        createResolvedField('field1', componentA, injector1),
        createResolvedField('field2', componentB, injector1),
      ];
      const curr: ResolvedField[] = [
        createResolvedField('field2', componentB, injector1),
        createResolvedField('field1', componentA, injector1),
      ];

      const result = reconcileFields(prev, curr);

      expect(result).toHaveLength(2);
      // Both should preserve object identity (same key, component, injector)
      expect(result[0]).toBe(prev[1]); // field2 from prev
      expect(result[1]).toBe(prev[0]); // field1 from prev
    });

    it('should use new fields when reordering with different injector', () => {
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
      expect(result[0]).toBe(curr[0]); // New field (injector changed)
      expect(result[1]).toBe(curr[1]); // New field (injector changed)
    });

    it('should use new field when injector differs even if inputs differ', () => {
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

      expect(result[0]).toBe(curr[0]); // New field used (injector differs)
      expect(result[0].injector).toBe(injector2);
      expect(result[0].inputs).toBe(newInputs);
    });

    it('should handle multiple fields with mixed scenarios', () => {
      const componentC = class ComponentC {} as Type<unknown>;

      const prev: ResolvedField[] = [
        createResolvedField('unchanged', componentA, injector1),
        createResolvedField('injectorChanged', componentA, injector1),
        createResolvedField('typeChanged', componentA, injector1),
        createResolvedField('removed', componentB, injector2),
      ];
      const curr: ResolvedField[] = [
        createResolvedField('unchanged', componentA, injector1),
        createResolvedField('injectorChanged', componentA, injector3),
        createResolvedField('typeChanged', componentC, injector3),
        createResolvedField('newField', componentB, injector3),
      ];

      const result = reconcileFields(prev, curr);

      expect(result).toHaveLength(4);

      // unchanged: same key, component, injector -> preserve object identity
      const unchanged = result.find((f) => f.key === 'unchanged');
      expect(unchanged).toBe(prev[0]);

      // injectorChanged: same key & component, different injector -> new field
      const injectorChanged = result.find((f) => f.key === 'injectorChanged');
      expect(injectorChanged).toBe(curr[1]);
      expect(injectorChanged?.injector).toBe(injector3);

      // typeChanged: same key, different component -> new field
      const typeChanged = result.find((f) => f.key === 'typeChanged');
      expect(typeChanged).toBe(curr[2]);
      expect(typeChanged?.component).toBe(componentC);

      // newField: new field -> new field
      const newField = result.find((f) => f.key === 'newField');
      expect(newField).toBe(curr[3]);
    });
  });
});
