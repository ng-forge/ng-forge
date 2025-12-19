import { describe, it, expect } from 'vitest';
import { signal, computed } from '@angular/core';
import { shouldShowErrors } from '@ng-forge/dynamic-forms/integration';

// Mock FieldTree structure for testing
function createMockFieldTree(invalid: boolean, touched: boolean, errorsCount: number) {
  return signal(() => ({
    invalid: signal(invalid),
    touched: signal(touched),
    errors: signal(Array(errorsCount).fill({ kind: 'test' })),
  }));
}

describe('shouldShowErrors', () => {
  it('should return true when field is invalid, touched, and has errors', () => {
    const field = createMockFieldTree(true, true, 1);
    const result = shouldShowErrors(field);

    expect(result()).toBe(true);
  });

  it('should return false when field is valid', () => {
    const field = createMockFieldTree(false, true, 1);
    const result = shouldShowErrors(field);

    expect(result()).toBe(false);
  });

  it('should return false when field is untouched', () => {
    const field = createMockFieldTree(true, false, 1);
    const result = shouldShowErrors(field);

    expect(result()).toBe(false);
  });

  it('should return false when field has no errors', () => {
    const field = createMockFieldTree(true, true, 0);
    const result = shouldShowErrors(field);

    expect(result()).toBe(false);
  });

  it('should return false when invalid but untouched', () => {
    const field = createMockFieldTree(true, false, 1);
    const result = shouldShowErrors(field);

    expect(result()).toBe(false);
  });

  it('should return false when touched but valid', () => {
    const field = createMockFieldTree(false, true, 1);
    const result = shouldShowErrors(field);

    expect(result()).toBe(false);
  });

  it('should return false when all flags are false', () => {
    const field = createMockFieldTree(false, false, 0);
    const result = shouldShowErrors(field);

    expect(result()).toBe(false);
  });

  it('should return true with multiple errors', () => {
    const field = createMockFieldTree(true, true, 3);
    const result = shouldShowErrors(field);

    expect(result()).toBe(true);
  });

  it('should be reactive to field state changes', () => {
    // Create mutable signals for testing reactivity
    const invalidSignal = signal(false);
    const touchedSignal = signal(false);
    const errorsSignal = signal<unknown[]>([]);

    const field = signal(() => ({
      invalid: computed(() => invalidSignal()),
      touched: computed(() => touchedSignal()),
      errors: computed(() => errorsSignal()),
    }));

    const result = shouldShowErrors(field);

    // Initially should be false
    expect(result()).toBe(false);

    // Set invalid and touched, but no errors
    invalidSignal.set(true);
    touchedSignal.set(true);
    expect(result()).toBe(false);

    // Add errors - now should be true
    errorsSignal.set([{ kind: 'required' }]);
    expect(result()).toBe(true);

    // Remove errors - should be false again
    errorsSignal.set([]);
    expect(result()).toBe(false);
  });

  it('should handle edge case with invalid=true, touched=true, but errors removed', () => {
    const field = createMockFieldTree(true, true, 0);
    const result = shouldShowErrors(field);

    // Even though invalid=true and touched=true, no errors means false
    expect(result()).toBe(false);
  });

  it('should return computed signal that can be used in templates', () => {
    const field = createMockFieldTree(true, true, 1);
    const result = shouldShowErrors(field);

    // Verify it's a signal (has a callable signature)
    expect(typeof result).toBe('function');
    expect(typeof result()).toBe('boolean');
  });
});
