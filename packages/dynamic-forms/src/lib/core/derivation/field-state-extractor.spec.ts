import { describe, expect, it } from 'vitest';
import { computed, signal } from '@angular/core';
import { createFieldStateProxy, createFormFieldStateProxy } from './field-state-extractor';

describe('field-state-extractor', () => {
  /**
   * Creates a mock field instance with signal-based state properties.
   */
  function createMockFieldInstance(state: {
    touched?: boolean;
    dirty?: boolean;
    valid?: boolean;
    invalid?: boolean;
    pending?: boolean;
    hidden?: boolean;
    readonly?: boolean;
    disabled?: boolean;
  }) {
    return {
      touched: signal(state.touched ?? false),
      dirty: signal(state.dirty ?? false),
      valid: signal(state.valid ?? true),
      invalid: signal(state.invalid ?? false),
      pending: signal(state.pending ?? false),
      hidden: signal(state.hidden ?? false),
      readonly: signal(state.readonly ?? false),
      disabled: signal(state.disabled ?? false),
      value: signal('test'),
    };
  }

  /**
   * Creates a mock form with signal-based field accessors.
   * Uses computed() so accessors pass isSignal() checks.
   */
  function createMockForm(fields: Record<string, ReturnType<typeof createMockFieldInstance>>) {
    const form: Record<string, unknown> = {};
    for (const [key, instance] of Object.entries(fields)) {
      form[key] = computed(() => instance);
    }
    return form;
  }

  describe('createFieldStateProxy', () => {
    it('should return undefined for null/undefined accessor', () => {
      expect(createFieldStateProxy(undefined, false)).toBeUndefined();
      expect(createFieldStateProxy(null as unknown as undefined, false)).toBeUndefined();
    });

    it('should return undefined for non-function accessor', () => {
      expect(createFieldStateProxy('not-a-function' as unknown as undefined, false)).toBeUndefined();
    });

    it('should lazily read state properties', () => {
      const instance = createMockFieldInstance({ touched: true, dirty: true, valid: false });
      const proxy = createFieldStateProxy(
        computed(() => instance as unknown as Record<string, unknown>),
        false,
      );

      expect(proxy).toBeDefined();
      expect(proxy!.touched).toBe(true);
      expect(proxy!.dirty).toBe(true);
      expect(proxy!.valid).toBe(false);
      expect(proxy!.invalid).toBe(false);
      expect(proxy!.pending).toBe(false);
      expect(proxy!.hidden).toBe(false);
      expect(proxy!.readonly).toBe(false);
      expect(proxy!.disabled).toBe(false);
    });

    it('should compute pristine as !dirty', () => {
      const dirtyInstance = createMockFieldInstance({ dirty: true });
      const cleanInstance = createMockFieldInstance({ dirty: false });

      const dirtyProxy = createFieldStateProxy(
        computed(() => dirtyInstance as unknown as Record<string, unknown>),
        false,
      );
      const cleanProxy = createFieldStateProxy(
        computed(() => cleanInstance as unknown as Record<string, unknown>),
        false,
      );

      expect(dirtyProxy!.pristine).toBe(false);
      expect(cleanProxy!.pristine).toBe(true);
    });

    it('should reflect signal changes when reactive', () => {
      const touchedSignal = signal(false);
      const instance = {
        touched: touchedSignal,
        dirty: signal(false),
        valid: signal(true),
        invalid: signal(false),
        pending: signal(false),
        hidden: signal(false),
        readonly: signal(false),
        disabled: signal(false),
        value: signal('test'),
      };

      const proxy = createFieldStateProxy(
        computed(() => instance as unknown as Record<string, unknown>),
        true,
      );

      expect(proxy!.touched).toBe(false);

      touchedSignal.set(true);
      expect(proxy!.touched).toBe(true);
    });

    it('should return undefined for unknown properties', () => {
      const instance = createMockFieldInstance({});
      const proxy = createFieldStateProxy(
        computed(() => instance as unknown as Record<string, unknown>),
        false,
      );

      expect((proxy as Record<string, unknown>)['nonexistent']).toBeUndefined();
    });

    it('should accept a direct field instance object (FieldContext path)', () => {
      const instance = createMockFieldInstance({ touched: true, dirty: false, valid: true });
      const proxy = createFieldStateProxy(instance as unknown as Record<string, unknown>, false);

      expect(proxy).toBeDefined();
      expect(proxy!.touched).toBe(true);
      expect(proxy!.dirty).toBe(false);
      expect(proxy!.pristine).toBe(true);
      expect(proxy!.valid).toBe(true);
    });

    it('should reflect signal changes on direct instance', () => {
      const touchedSignal = signal(false);
      const instance = {
        touched: touchedSignal,
        dirty: signal(false),
        valid: signal(true),
        invalid: signal(false),
        pending: signal(false),
        hidden: signal(false),
        readonly: signal(false),
        disabled: signal(false),
        value: signal('test'),
      };

      const proxy = createFieldStateProxy(instance as unknown as Record<string, unknown>, true);

      expect(proxy!.touched).toBe(false);
      touchedSignal.set(true);
      expect(proxy!.touched).toBe(true);
    });
  });

  describe('createFormFieldStateProxy', () => {
    it('should provide field state by key', () => {
      const nameInstance = createMockFieldInstance({ touched: true, dirty: true });
      const emailInstance = createMockFieldInstance({ valid: false, invalid: true });
      const form = createMockForm({ name: nameInstance, email: emailInstance });

      const proxy = createFormFieldStateProxy(form as unknown as import('@angular/forms/signals').FieldTree<unknown>, false);

      expect(proxy['name']).toBeDefined();
      expect(proxy['name']!.touched).toBe(true);
      expect(proxy['name']!.dirty).toBe(true);

      expect(proxy['email']).toBeDefined();
      expect(proxy['email']!.valid).toBe(false);
      expect(proxy['email']!.invalid).toBe(true);
    });

    it('should return undefined for missing fields', () => {
      const form = createMockForm({});
      const proxy = createFormFieldStateProxy(form as unknown as import('@angular/forms/signals').FieldTree<unknown>, false);

      expect(proxy['nonexistent']).toBeUndefined();
    });

    it('should cache proxy identity for the same key', () => {
      const nameInstance = createMockFieldInstance({});
      const form = createMockForm({ name: nameInstance });

      const proxy = createFormFieldStateProxy(form as unknown as import('@angular/forms/signals').FieldTree<unknown>, false);

      const first = proxy['name'];
      const second = proxy['name'];
      expect(first).toBe(second); // Same reference
    });

    it('should provide different proxies for different keys', () => {
      const nameInstance = createMockFieldInstance({ touched: true });
      const emailInstance = createMockFieldInstance({ touched: false });
      const form = createMockForm({ name: nameInstance, email: emailInstance });

      const proxy = createFormFieldStateProxy(form as unknown as import('@angular/forms/signals').FieldTree<unknown>, false);

      expect(proxy['name']!.touched).toBe(true);
      expect(proxy['email']!.touched).toBe(false);
    });
  });
});
