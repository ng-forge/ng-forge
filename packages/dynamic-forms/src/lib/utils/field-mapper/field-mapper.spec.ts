import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, Injector, Provider, runInInjectionContext, signal, Signal, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { mapFieldToInputs } from './field-mapper';
import { FieldDef } from '@ng-forge/dynamic-forms/internal';
import { FieldTypeDefinition } from '@ng-forge/dynamic-forms/internal';
import { createPropertyOverrideStore, PROPERTY_OVERRIDE_STORE } from '../../core/property-derivation/property-override-store';
import { ARRAY_CONTEXT, FORM_ID_PREFIX, GROUP_CONTEXT } from '@ng-forge/dynamic-forms/internal';
import type { ArrayContext, GroupContext } from '@ng-forge/dynamic-forms/internal';

describe('mapFieldToInputs', () => {
  let registry: Map<string, FieldTypeDefinition>;

  beforeEach(() => {
    registry = new Map<string, FieldTypeDefinition>();
    TestBed.configureTestingModule({
      providers: [{ provide: PROPERTY_OVERRIDE_STORE, useFactory: createPropertyOverrideStore }],
    });
  });

  function run<T>(fn: () => T): T {
    return TestBed.runInInjectionContext(fn);
  }

  describe('custom mapper', () => {
    it('should use custom mapper when field type has one', () => {
      const customMapper = vi.fn().mockReturnValue(computed(() => ({ custom: 'result' })));

      registry.set('input', {
        component: {} as any,
        mapper: customMapper,
      });

      const field: FieldDef<any> = { type: 'input', key: 'email' };
      const resultSignal = run(() => mapFieldToInputs(field, registry));

      expect(customMapper).toHaveBeenCalledWith(field);
      expect(resultSignal()).toEqual({ custom: 'result' });
    });

    it('should pass field definition to custom mapper', () => {
      const customMapper = vi.fn().mockReturnValue(computed(() => ({})));

      registry.set('select', {
        component: {} as any,
        mapper: customMapper,
      });

      const field: FieldDef<any> = {
        type: 'select',
        key: 'country',
        label: 'Country',
      };

      run(() => mapFieldToInputs(field, registry));

      expect(customMapper).toHaveBeenCalledWith(field);
    });
  });

  describe('base mapper fallback', () => {
    it('should use base mapper when no custom mapper defined but has loadComponent', () => {
      registry.set('input', {
        name: 'input',
        loadComponent: () => Promise.resolve({} as any),
        // No mapper defined - should fall back to base mapper
      });

      const field: FieldDef<any> = { type: 'input', key: 'name' };
      const resultSignal = run(() => mapFieldToInputs(field, registry));

      // Base mapper should return a signal
      expect(resultSignal).toBeDefined();
      expect(typeof resultSignal).toBe('function'); // Signal is a function
      // Calling the signal should return an object
      const result = resultSignal();
      expect(typeof result).toBe('object');
      expect(Object.keys(result).length).toBeGreaterThan(0);
    });

    it('should handle fields without registry entry using base mapper', () => {
      const field: FieldDef<any> = { type: 'unknown', key: 'test' };
      const resultSignal = run(() => mapFieldToInputs(field, registry));

      expect(resultSignal).toBeDefined();
      expect(typeof resultSignal).toBe('function'); // Signal is a function
      const result = resultSignal();
      expect(typeof result).toBe('object');
    });
  });

  describe('componentless fields', () => {
    it('should return undefined for componentless fields (no mapper and no loadComponent)', () => {
      registry.set('hidden', {
        name: 'hidden',
        valueHandling: 'include',
        // No mapper and no loadComponent - componentless field
      });

      const field: FieldDef<any> = { type: 'hidden', key: 'id', value: 'test-id' };
      const result = run(() => mapFieldToInputs(field, registry));

      // Should return undefined for componentless fields - nothing to map
      expect(result).toBeUndefined();
    });

    it('should return undefined for all componentless field types', () => {
      registry.set('hidden', {
        name: 'hidden',
        valueHandling: 'include',
        // No mapper and no loadComponent
      });

      const field1: FieldDef<any> = { type: 'hidden', key: 'id1', value: 'val1' };
      const field2: FieldDef<any> = { type: 'hidden', key: 'id2', value: 'val2' };

      expect(run(() => mapFieldToInputs(field1, registry))).toBeUndefined();
      expect(run(() => mapFieldToInputs(field2, registry))).toBeUndefined();
    });

    it('should not call base mapper for componentless fields', () => {
      registry.set('hidden', {
        name: 'hidden',
        valueHandling: 'include',
        // No mapper and no loadComponent
      });

      const field: FieldDef<any> = { type: 'hidden', key: 'id', value: 123 };
      const result = run(() => mapFieldToInputs(field, registry));

      // Undefined for componentless fields - base mapper should not be called
      expect(result).toBeUndefined();
    });
  });

  describe('field type resolution', () => {
    it('should lookup field type from registry', () => {
      const customMapper = vi.fn().mockReturnValue(computed(() => ({})));

      registry.set('email', {
        component: {} as any,
        mapper: customMapper,
      });

      const field: FieldDef<any> = { type: 'email', key: 'userEmail' };
      run(() => mapFieldToInputs(field, registry));

      expect(customMapper).toHaveBeenCalled();
    });

    it('should handle case-sensitive type names', () => {
      const mapper1 = vi.fn().mockReturnValue(computed(() => ({})));
      const mapper2 = vi.fn().mockReturnValue(computed(() => ({})));

      registry.set('Input', { component: {} as any, mapper: mapper1 });
      registry.set('input', { component: {} as any, mapper: mapper2 });

      const field1: FieldDef<any> = { type: 'Input', key: 'field1' };
      const field2: FieldDef<any> = { type: 'input', key: 'field2' };

      run(() => mapFieldToInputs(field1, registry));
      run(() => mapFieldToInputs(field2, registry));

      expect(mapper1).toHaveBeenCalledTimes(1);
      expect(mapper2).toHaveBeenCalledTimes(1);
    });
  });

  describe('inputs generation', () => {
    it('should return inputs signal', () => {
      const customMapper = (): Signal<Record<string, unknown>> =>
        computed(() => ({
          field: { key: 'test' },
          label: 'Test Label',
        }));

      registry.set('custom', {
        component: {} as any,
        mapper: customMapper,
      });

      const field: FieldDef<any> = { type: 'custom', key: 'test' };
      const resultSignal = run(() => mapFieldToInputs(field, registry));
      const result = resultSignal(); // Call signal to get inputs

      expect(Object.keys(result)).toHaveLength(2);
      expect(result).toHaveProperty('field');
      expect(result).toHaveProperty('label', 'Test Label');
    });

    it('should handle empty inputs object', () => {
      const customMapper = (): Signal<Record<string, unknown>> => computed(() => ({}));

      registry.set('minimal', {
        component: {} as any,
        mapper: customMapper,
      });

      const field: FieldDef<any> = { type: 'minimal', key: 'test' };
      const resultSignal = run(() => mapFieldToInputs(field, registry));

      expect(resultSignal()).toEqual({});
    });
  });

  describe('complex field scenarios', () => {
    it('should handle fields with multiple properties', () => {
      const customMapper = vi.fn().mockReturnValue(computed(() => ({})));

      registry.set('complex', {
        component: {} as any,
        mapper: customMapper,
      });

      const field: FieldDef<any> = {
        type: 'complex',
        key: 'data',
        label: 'Data Field',
        placeholder: 'Enter data',
        required: true,
        disabled: false,
      };

      run(() => mapFieldToInputs(field, registry));

      expect(customMapper).toHaveBeenCalledWith(field);
      expect(customMapper.mock.calls[0][0]).toEqual(field);
    });

    it('should handle fields with nested structures', () => {
      const customMapper = vi.fn().mockReturnValue(computed(() => ({})));

      registry.set('nested', {
        component: {} as any,
        mapper: customMapper,
      });

      const field: FieldDef<any> = {
        type: 'nested',
        key: 'parent',
        props: {
          validation: { min: 0, max: 100 },
          formatting: { decimals: 2 },
        },
      };

      run(() => mapFieldToInputs(field, registry));

      expect(customMapper).toHaveBeenCalledWith(field);
    });
  });

  describe('mapper function interface', () => {
    it('should call mapper with field as single argument', () => {
      const customMapper = vi.fn().mockReturnValue(computed(() => ({})));

      registry.set('test', {
        component: {} as any,
        mapper: customMapper,
      });

      const field: FieldDef<any> = { type: 'test', key: 'field' };
      run(() => mapFieldToInputs(field, registry));

      expect(customMapper).toHaveBeenCalledTimes(1);
      expect(customMapper.mock.calls[0]).toHaveLength(1);
      expect(customMapper.mock.calls[0][0]).toBe(field);
    });

    it('should use mapper return value (signal) directly', () => {
      const expectedInputs = {
        a: 1,
        b: 2,
        c: 3,
      };

      const signalInstance = computed(() => expectedInputs);
      const customMapper = () => signalInstance;

      registry.set('test', {
        component: {} as any,
        mapper: customMapper,
      });

      const field: FieldDef<any> = { type: 'test', key: 'field' };
      const resultSignal = run(() => mapFieldToInputs(field, registry));

      // The result should be the same signal instance
      expect(resultSignal).toBe(signalInstance);
      // Calling the signal should return the expected inputs
      expect(resultSignal()).toEqual(expectedInputs);
    });
  });

  describe('registry integration', () => {
    it('should support multiple field types in registry', () => {
      const mapper1 = vi.fn().mockReturnValue(computed(() => ({ type1: true })));
      const mapper2 = vi.fn().mockReturnValue(computed(() => ({ type2: true })));
      const mapper3 = vi.fn().mockReturnValue(computed(() => ({ type3: true })));

      registry.set('type1', { component: {} as any, mapper: mapper1 });
      registry.set('type2', { component: {} as any, mapper: mapper2 });
      registry.set('type3', { component: {} as any, mapper: mapper3 });

      run(() => mapFieldToInputs({ type: 'type1', key: 'f1' }, registry));
      run(() => mapFieldToInputs({ type: 'type2', key: 'f2' }, registry));
      run(() => mapFieldToInputs({ type: 'type3', key: 'f3' }, registry));

      expect(mapper1).toHaveBeenCalledTimes(1);
      expect(mapper2).toHaveBeenCalledTimes(1);
      expect(mapper3).toHaveBeenCalledTimes(1);
    });

    it('should handle empty registry gracefully', () => {
      const emptyRegistry = new Map<string, FieldTypeDefinition>();
      const field: FieldDef<any> = { type: 'unknown', key: 'test' };

      const resultSignal = run(() => mapFieldToInputs(field, emptyRegistry));

      expect(resultSignal).toBeDefined();
      expect(typeof resultSignal).toBe('function'); // Signal is a function
      const result = resultSignal();
      expect(typeof result).toBe('object');
    });
  });

  /**
   * Tests for the DOM-ID rewriting contract added for issue #401:
   *  - inside a GROUP_CONTEXT, the `key` input is prefixed with the underscored ancestor path
   *  - inside an ARRAY_CONTEXT, the `key` input is suffixed with `_${index}`
   *  - when both apply, group prefix runs BEFORE array suffix → `{group}_{key}_{index}`
   */
  describe('key rewriting (issue #401 group + array scoping)', () => {
    function runWithProviders<T>(providers: Provider[], fn: () => T): T {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [{ provide: PROPERTY_OVERRIDE_STORE, useFactory: createPropertyOverrideStore }, ...providers],
      });
      return TestBed.runInInjectionContext(fn);
    }

    function groupCtx(path: string): GroupContext {
      return { groupPath: signal(path) };
    }

    function arrayCtx(index: number, arrayKey = 'items'): ArrayContext {
      return {
        arrayKey,
        index: signal(index),
        formValue: null,
        field: { type: 'array', key: arrayKey } as FieldDef<unknown>,
      };
    }

    it('passes the key through unchanged when neither context is provided', () => {
      const field: FieldDef<unknown> = { type: 'input', key: 'name' };
      const result = run(() => mapFieldToInputs(field, registry));
      expect(result!()['key']).toBe('name');
    });

    it('prefixes the key with the underscored group path when inside a group', () => {
      const field: FieldDef<unknown> = { type: 'input', key: 'street' };
      const result = runWithProviders([{ provide: GROUP_CONTEXT, useValue: groupCtx('address') }], () => mapFieldToInputs(field, registry));
      expect(result!()['key']).toBe('address_street');
    });

    it('underscores nested group paths in the prefix', () => {
      const field: FieldDef<unknown> = { type: 'input', key: 'street' };
      const result = runWithProviders([{ provide: GROUP_CONTEXT, useValue: groupCtx('user.address') }], () =>
        mapFieldToInputs(field, registry),
      );
      expect(result!()['key']).toBe('user_address_street');
    });

    it('appends the array index suffix when inside an array', () => {
      const field: FieldDef<unknown> = { type: 'input', key: 'value' };
      const result = runWithProviders([{ provide: ARRAY_CONTEXT, useValue: arrayCtx(2) }], () => mapFieldToInputs(field, registry));
      expect(result!()['key']).toBe('value_2');
    });

    it('applies group prefix BEFORE array suffix (contract: {group}_{key}_{index})', () => {
      // A group inside an array item — e.g. an `address` group inside each `users` item.
      // Renders as `address_street_0` for the first item's street field.
      const field: FieldDef<unknown> = { type: 'input', key: 'street' };
      const result = runWithProviders(
        [
          { provide: GROUP_CONTEXT, useValue: groupCtx('address') },
          { provide: ARRAY_CONTEXT, useValue: arrayCtx(0, 'users') },
        ],
        () => mapFieldToInputs(field, registry),
      );
      expect(result!()['key']).toBe('address_street_0');
    });

    it('skips the prefix when the group path is empty', () => {
      const field: FieldDef<unknown> = { type: 'input', key: 'street' };
      const result = runWithProviders([{ provide: GROUP_CONTEXT, useValue: groupCtx('') }], () => mapFieldToInputs(field, registry));
      expect(result!()['key']).toBe('street');
    });

    it('leaves non-string keys untouched', () => {
      // Custom mapper that returns a numeric `key` (escape hatch — must not be string-prefixed).
      const customMapper = () => computed(() => ({ key: 42 as unknown as string, other: true }));
      registry.set('custom', { component: {} as Type<unknown>, mapper: customMapper });
      const field: FieldDef<unknown> = { type: 'custom', key: 'ignored' };
      const result = runWithProviders([{ provide: GROUP_CONTEXT, useValue: groupCtx('address') }], () => mapFieldToInputs(field, registry));
      expect(result!()['key']).toBe(42);
    });
  });

  /**
   * Form-level DOM-id prefixing: when FORM_ID_PREFIX resolves to a non-empty
   * string, the `key` input gets it as its OUTERMOST segment so two forms built
   * from the same config on one page produce distinct ids. An empty prefix is a
   * no-op (single-form default), and a missing token leaves the static fast-path
   * intact.
   */
  describe('form id prefix (multi-form collision scoping)', () => {
    function runWithPrefix<T>(prefix: string, providers: Provider[], fn: () => T): T {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          { provide: PROPERTY_OVERRIDE_STORE, useFactory: createPropertyOverrideStore },
          { provide: FORM_ID_PREFIX, useValue: signal(prefix) },
          ...providers,
        ],
      });
      return TestBed.runInInjectionContext(fn);
    }

    function groupCtx(path: string): GroupContext {
      return { groupPath: signal(path) };
    }

    function arrayCtx(index: number, arrayKey = 'items'): ArrayContext {
      return {
        arrayKey,
        index: signal(index),
        formValue: null,
        field: { type: 'array', key: arrayKey } as FieldDef<unknown>,
      };
    }

    it('prepends the prefix to a plain top-level key', () => {
      const field: FieldDef<unknown> = { type: 'input', key: 'email' };
      const result = runWithPrefix('df-2', [], () => mapFieldToInputs(field, registry));
      expect(result!()['key']).toBe('df-2_email');
    });

    it('is a no-op when the prefix is empty (single-form default)', () => {
      const field: FieldDef<unknown> = { type: 'input', key: 'email' };
      const result = runWithPrefix('', [], () => mapFieldToInputs(field, registry));
      expect(result!()['key']).toBe('email');
    });

    it('is the OUTERMOST segment: {prefix}_{group}_{key}_{index}', () => {
      const field: FieldDef<unknown> = { type: 'input', key: 'street' };
      const result = runWithPrefix(
        'df-1',
        [
          { provide: GROUP_CONTEXT, useValue: groupCtx('address') },
          { provide: ARRAY_CONTEXT, useValue: arrayCtx(0, 'users') },
        ],
        () => mapFieldToInputs(field, registry),
      );
      expect(result!()['key']).toBe('df-1_address_street_0');
    });

    it('composes with a group prefix', () => {
      const field: FieldDef<unknown> = { type: 'input', key: 'street' };
      const result = runWithPrefix('myform', [{ provide: GROUP_CONTEXT, useValue: groupCtx('address') }], () =>
        mapFieldToInputs(field, registry),
      );
      expect(result!()['key']).toBe('myform_address_street');
    });

    it('leaves non-string keys untouched', () => {
      const customMapper = () => computed(() => ({ key: 7 as unknown as string }));
      registry.set('custom', { component: {} as Type<unknown>, mapper: customMapper });
      const field: FieldDef<unknown> = { type: 'custom', key: 'ignored' };
      const result = runWithPrefix('df-2', [], () => mapFieldToInputs(field, registry));
      expect(result!()['key']).toBe(7);
    });

    it('reacts when the prefix flips from empty to an auto-id (second form mounts)', () => {
      TestBed.resetTestingModule();
      const prefix = signal('');
      TestBed.configureTestingModule({
        providers: [
          { provide: PROPERTY_OVERRIDE_STORE, useFactory: createPropertyOverrideStore },
          { provide: FORM_ID_PREFIX, useValue: prefix },
        ],
      });
      const field: FieldDef<unknown> = { type: 'input', key: 'email' };
      const result = TestBed.runInInjectionContext(() => mapFieldToInputs(field, registry));
      expect(result!()['key']).toBe('email');

      prefix.set('df-2');
      expect(result!()['key']).toBe('df-2_email');
    });
  });

  /**
   * Regression test for issue #401: when two fields share the same leaf key
   * inside different groups, their property-derivation override slots in the
   * PropertyOverrideStore must remain distinct. Before this fix, both fields
   * read/wrote the same `'name'` slot, so one derivation silently overwrote
   * the other.
   */
  describe('property override store keys (issue #401 group scoping)', () => {
    function makeGroupCtx(path: string): GroupContext {
      return { groupPath: signal(path) };
    }

    it('uses distinct override-store slots for same leaf key in different groups', () => {
      TestBed.resetTestingModule();
      const store = createPropertyOverrideStore();
      TestBed.configureTestingModule({
        providers: [{ provide: PROPERTY_OVERRIDE_STORE, useValue: store }],
      });

      // Pre-populate per-group overrides for the SAME leaf key.
      store.setOverride('createADto.name', 'label', 'A Label');
      store.setOverride('createBDto.name', 'label', 'B Label');

      const fieldDef: FieldDef<unknown> = {
        type: 'input',
        key: 'name',
        logic: [{ type: 'derivation', targetProperty: 'label', value: 'static' }],
      } as unknown as FieldDef<unknown>;

      const rootInjector = TestBed.inject(Injector);

      // Field rendered inside the `createADto` group.
      const injA = Injector.create({
        parent: rootInjector,
        providers: [{ provide: GROUP_CONTEXT, useValue: makeGroupCtx('createADto') }],
      });
      const resultA = runInInjectionContext(injA, () => mapFieldToInputs(fieldDef, registry));

      // Field rendered inside the `createBDto` group — same leaf key.
      const injB = Injector.create({
        parent: rootInjector,
        providers: [{ provide: GROUP_CONTEXT, useValue: makeGroupCtx('createBDto') }],
      });
      const resultB = runInInjectionContext(injB, () => mapFieldToInputs(fieldDef, registry));

      expect(resultA!()['label']).toBe('A Label');
      expect(resultB!()['label']).toBe('B Label');
    });
  });
});
