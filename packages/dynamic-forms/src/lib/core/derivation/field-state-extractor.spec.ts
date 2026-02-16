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
   * Creates a mock FieldTree accessor for a field state using computed().
   * Passes isSignal() checks — exercises the signal code path.
   */
  function createMockFieldTree(fieldState: FieldState<unknown>): FieldTree<unknown> {
    return computed(() => fieldState) as unknown as FieldTree<unknown>;
  }

  /**
   * Creates a mock FieldTree accessor as a plain function (not a signal).
   * Matches real Angular Signal Forms behavior where FieldTree is a
   * `Proxy(() => this, handler)` — fails isSignal() but is callable.
   */
  function createMockFieldTreeAsFunction(fieldState: FieldState<unknown>): FieldTree<unknown> {
    return (() => fieldState) as unknown as FieldTree<unknown>;
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

  /**
   * Creates a mock form with plain function field accessors (matching real Angular behavior).
   */
  function createMockFormAsFunction(fields: Record<string, FieldState<unknown>>): FieldTree<unknown> {
    const form: Record<string, unknown> = {};
    for (const [key, instance] of Object.entries(fields)) {
      form[key] = createMockFieldTreeAsFunction(instance);
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

    it('should lazily read properties (reflecting current signal values)', () => {
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

      const stateInfo = readFieldStateInfo(createMockFieldTree(fieldState), false);
      expect(stateInfo!.touched).toBe(false);

      // Lazy proxy reads current signal values — prevents reactive cycles
      // by only reading the properties that are actually accessed
      touchedSignal.set(true);
      expect(stateInfo!.touched).toBe(true);
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

    it('should support "in" operator for known state properties', () => {
      const fieldState = createMockFieldState({});
      const snapshot = readFieldStateInfo(createMockFieldTree(fieldState), false);

      expect(snapshot).toBeDefined();
      expect('dirty' in snapshot!).toBe(true);
      expect('touched' in snapshot!).toBe(true);
      expect('valid' in snapshot!).toBe(true);
      expect('pristine' in snapshot!).toBe(true);
      expect('hidden' in snapshot!).toBe(true);
      expect('readonly' in snapshot!).toBe(true);
      expect('disabled' in snapshot!).toBe(true);
      expect('pending' in snapshot!).toBe(true);
      expect('invalid' in snapshot!).toBe(true);
      // Unknown properties should not be "in" the map
      expect('nonexistent' in snapshot!).toBe(false);
      expect('value' in snapshot!).toBe(false);
    });

    it('should read state from a plain function accessor (real FieldTree behavior)', () => {
      const fieldState = createMockFieldState({ touched: true, dirty: true, valid: false });
      const fieldTree = createMockFieldTreeAsFunction(fieldState);
      const snapshot = readFieldStateInfo(fieldTree, false);

      expect(snapshot).toBeDefined();
      expect(snapshot!.touched).toBe(true);
      expect(snapshot!.dirty).toBe(true);
      expect(snapshot!.valid).toBe(false);
      expect(snapshot!.pristine).toBe(false);
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

    it('should work with plain function accessors (real FieldTree behavior)', () => {
      const nameState = createMockFieldState({ dirty: true, touched: true });
      const emailState = createMockFieldState({ valid: false, invalid: true });
      const form = createMockFormAsFunction({ name: nameState, email: emailState });

      const map = createFormFieldStateMap(form, false);

      expect(map['name']).toBeDefined();
      expect(map['name']!.dirty).toBe(true);
      expect(map['name']!.touched).toBe(true);

      expect(map['email']).toBeDefined();
      expect(map['email']!.valid).toBe(false);
      expect(map['email']!.invalid).toBe(true);
    });

    it('should resolve nested field state via dot-notation bracket access', () => {
      const cityState = createMockFieldState({ dirty: true, touched: false });
      const streetState = createMockFieldState({ dirty: false, touched: true });

      // Build nested form: address.city, address.street
      const addressGroup: Record<string, unknown> = {
        city: createMockFieldTree(cityState),
        street: createMockFieldTree(streetState),
      };
      const form = { address: addressGroup } as unknown as FieldTree<unknown>;

      const map = createFormFieldStateMap(form, false);

      // Bracket notation for nested paths
      expect(map['address.city']).toBeDefined();
      expect(map['address.city']!.dirty).toBe(true);
      expect(map['address.city']!.touched).toBe(false);

      expect(map['address.street']).toBeDefined();
      expect(map['address.street']!.dirty).toBe(false);
      expect(map['address.street']!.touched).toBe(true);
    });

    it('should return undefined for non-existent nested paths', () => {
      const nameState = createMockFieldState({});
      const form = createMockForm({ name: nameState });
      const map = createFormFieldStateMap(form, false);

      expect(map['address.city']).toBeUndefined();
      expect(map['nonexistent.deeply.nested']).toBeUndefined();
    });

    it('should support "in" operator for existing fields', () => {
      const nameState = createMockFieldState({ dirty: true });
      const form = createMockForm({ name: nameState });
      const map = createFormFieldStateMap(form, false);

      expect('name' in map).toBe(true);
      expect('nonexistent' in map).toBe(false);
    });

    it('should support "in" operator for nested field paths', () => {
      const cityState = createMockFieldState({ dirty: true });
      const addressGroup: Record<string, unknown> = {
        city: createMockFieldTree(cityState),
      };
      const form = { address: addressGroup } as unknown as FieldTree<unknown>;
      const map = createFormFieldStateMap(form, false);

      expect('address.city' in map).toBe(true);
      expect('address.missing' in map).toBe(false);
    });

    it('should return empty array for Object.keys() (Proxy has no "ownKeys" trap)', () => {
      const nameState = createMockFieldState({ dirty: true });
      const emailState = createMockFieldState({ touched: true });
      const form = createMockForm({ name: nameState, email: emailState });
      const map = createFormFieldStateMap(form, false);

      // Object.keys() uses the "ownKeys" trap, which is intentionally not implemented.
      // FormFieldStateMap is a lazy accessor — consumers should use direct bracket
      // access (map['name']) rather than iteration.
      expect(Object.keys(map)).toEqual([]);
    });
  });
});
