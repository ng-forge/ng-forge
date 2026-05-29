import { describe, expect, it } from 'vitest';
import { signal } from '@angular/core';
import { DynamicFormInstanceRegistry } from './dynamic-form-instance-registry.service';

describe('DynamicFormInstanceRegistry', () => {
  it('hands out sequential slots and recycles the lowest freed one', () => {
    const registry = new DynamicFormInstanceRegistry();
    expect(registry.register(signal(true))).toBe('df-1');
    const b = registry.register(signal(true));
    expect(b).toBe('df-2');
    registry.unregister(b);
    expect(registry.register(signal(true))).toBe('df-2'); // reuses the freed slot, not df-3
  });

  it('multiplePresent stays false for a single visible form', () => {
    const registry = new DynamicFormInstanceRegistry();
    registry.register(signal(true));
    expect(registry.multiplePresent()).toBe(false);
  });

  it('multiplePresent flips true with two visible forms', () => {
    const registry = new DynamicFormInstanceRegistry();
    registry.register(signal(true));
    registry.register(signal(true));
    expect(registry.multiplePresent()).toBe(true);
  });

  it('counts only visible (true) signals', () => {
    const registry = new DynamicFormInstanceRegistry();
    registry.register(signal(true));
    registry.register(signal(false));
    expect(registry.multiplePresent()).toBe(false);
  });

  it('reacts when a form’s visibility signal flips', () => {
    const registry = new DynamicFormInstanceRegistry();
    registry.register(signal(true));
    const v = signal(false);
    registry.register(v);
    expect(registry.multiplePresent()).toBe(false);

    v.set(true);
    expect(registry.multiplePresent()).toBe(true);
  });

  it('re-counts on unregister (membership change)', () => {
    const registry = new DynamicFormInstanceRegistry();
    registry.register(signal(true));
    const b = registry.register(signal(true));
    expect(registry.multiplePresent()).toBe(true);
    registry.unregister(b);
    expect(registry.multiplePresent()).toBe(false);
  });
});
