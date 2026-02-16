import { describe, expect, it } from 'vitest';
import { computed, signal } from '@angular/core';
import type { FieldState, FieldTree } from '@angular/forms/signals';
import { readFieldStateInfo, createFormFieldStateMap } from './field-state-extractor';

describe('field-state-extractor', () => {
  /**
   * Creates a mock field instance with signal-based state properties,
   * mimicking the FieldState interface from Angular Signal Forms.
   */
  function createMockFieldState(state: {
    touched?: boolean;
    dirty?: boolean;
    valid?: boolean;
    invalid?: boolean;
    pending?: boolean;
    hidden?: boolean;
    readonly?: boolean;
    disabled?: boolean;
  }): FieldState<unknown> {
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
    } as unknown as FieldState<unknown>;
  }

  /**
   * Creates a mock FieldTree accessor for a field state.
   * Uses computed() so accessors pass isSignal() checks, matching FieldTree behavior.
   */
  function createMockFieldTree(fieldState: FieldState<unknown>): FieldTree<unknown> {
    return computed(() => fieldState) as unknown as FieldTree<unknown>;
  }

  /**
   * Creates a mock form with signal-based field accessors.
   */
  function createMockForm(fields: Record<string, FieldState<unknown>>): FieldTree<unknown> {
    const form: Record<string, unknown> = {};
    for (const [key, instance] of Object.entries(fields)) {
      form[key] = createMockFieldTree(instance);
    }
    return form as unknown as FieldTree<unknown>;
  }

  describe('readFieldStateInfo', () => {
    it('should return undefined for null/undefined source', () => {
      expect(readFieldStateInfo(undefined, false)).toBeUndefined();
      expect(readFieldStateInfo(null as unknown as undefined, false)).toBeUndefined();
    });

    it('should read all state properties from a FieldTree', () => {
      const fieldState = createMockFieldState({ touched: true, dirty: true, valid: false });
      const fieldTree = createMockFieldTree(fieldState);
      const snapshot = readFieldStateInfo(fieldTree, false);

      expect(snapshot).toBeDefined();
      expect(snapshot!.touched).toBe(true);
      expect(snapshot!.dirty).toBe(true);
      expect(snapshot!.valid).toBe(false);
      expect(snapshot!.invalid).toBe(false);
      expect(snapshot!.pending).toBe(false);
      expect(snapshot!.hidden).toBe(false);
      expect(snapshot!.readonly).toBe(false);
      expect(snapshot!.disabled).toBe(false);
    });

    it('should compute pristine as !dirty', () => {
      const dirtyState = createMockFieldState({ dirty: true });
      const cleanState = createMockFieldState({ dirty: false });

      const dirtySnapshot = readFieldStateInfo(createMockFieldTree(dirtyState), false);
      const cleanSnapshot = readFieldStateInfo(createMockFieldTree(cleanState), false);

      expect(dirtySnapshot!.pristine).toBe(false);
      expect(cleanSnapshot!.pristine).toBe(true);
    });

    it('should produce a snapshot (not reflect subsequent signal changes)', () => {
      const touchedSignal = signal(false);
      const fieldState = {
        touched: touchedSignal,
        dirty: signal(false),
        valid: signal(true),
        invalid: signal(false),
        pending: signal(false),
        hidden: signal(false),
        readonly: signal(false),
        disabled: signal(false),
        value: signal('test'),
      } as unknown as FieldState<unknown>;

      const snapshot = readFieldStateInfo(createMockFieldTree(fieldState), false);
      expect(snapshot!.touched).toBe(false);

      // Snapshot is a plain object — changing the signal after creation does NOT update it
      touchedSignal.set(true);
      expect(snapshot!.touched).toBe(false);
    });

    it('should accept a direct FieldState object (FieldContext path)', () => {
      const fieldState = createMockFieldState({ touched: true, dirty: false, valid: true });
      const snapshot = readFieldStateInfo(fieldState, false);

      expect(snapshot).toBeDefined();
      expect(snapshot!.touched).toBe(true);
      expect(snapshot!.dirty).toBe(false);
      expect(snapshot!.pristine).toBe(true);
      expect(snapshot!.valid).toBe(true);
    });
  });

  describe('createFormFieldStateMap', () => {
    it('should provide field state by key', () => {
      const nameState = createMockFieldState({ touched: true, dirty: true });
      const emailState = createMockFieldState({ valid: false, invalid: true });
      const form = createMockForm({ name: nameState, email: emailState });

      const map = createFormFieldStateMap(form, false);

      expect(map['name']).toBeDefined();
      expect(map['name']!.touched).toBe(true);
      expect(map['name']!.dirty).toBe(true);

      expect(map['email']).toBeDefined();
      expect(map['email']!.valid).toBe(false);
      expect(map['email']!.invalid).toBe(true);
    });

    it('should return undefined for missing fields', () => {
      const form = createMockForm({});
      const map = createFormFieldStateMap(form, false);

      expect(map['nonexistent']).toBeUndefined();
    });

    it('should cache snapshot identity for the same key', () => {
      const nameState = createMockFieldState({});
      const form = createMockForm({ name: nameState });

      const map = createFormFieldStateMap(form, false);

      const first = map['name'];
      const second = map['name'];
      expect(first).toBe(second); // Same reference from cache
    });

    it('should provide different snapshots for different keys', () => {
      const nameState = createMockFieldState({ touched: true });
      const emailState = createMockFieldState({ touched: false });
      const form = createMockForm({ name: nameState, email: emailState });

      const map = createFormFieldStateMap(form, false);

      expect(map['name']!.touched).toBe(true);
      expect(map['email']!.touched).toBe(false);
    });
  });
});
