import { describe, expect, it } from 'vitest';
import { DynamicFormInstanceRegistry } from './dynamic-form-instance-registry.service';

describe('DynamicFormInstanceRegistry', () => {
  it('starts empty — count 0, not multiple', () => {
    const registry = new DynamicFormInstanceRegistry();
    expect(registry.count()).toBe(0);
    expect(registry.multiplePresent()).toBe(false);
  });

  it('hands out sequential slots and tracks the count', () => {
    const registry = new DynamicFormInstanceRegistry();
    expect(registry.register()).toBe('df-1');
    expect(registry.count()).toBe(1);
    expect(registry.register()).toBe('df-2');
    expect(registry.count()).toBe(2);
  });

  it('flips multiplePresent once more than one form is mounted', () => {
    const registry = new DynamicFormInstanceRegistry();
    registry.register();
    expect(registry.multiplePresent()).toBe(false);
    registry.register();
    expect(registry.multiplePresent()).toBe(true);
  });

  it('decrements the count on unregister', () => {
    const registry = new DynamicFormInstanceRegistry();
    const a = registry.register();
    registry.register();
    expect(registry.count()).toBe(2);
    registry.unregister(a);
    expect(registry.count()).toBe(1);
    expect(registry.multiplePresent()).toBe(false);
  });

  it('recycles the lowest freed slot rather than climbing', () => {
    const registry = new DynamicFormInstanceRegistry();
    registry.register(); // df-1
    const b = registry.register(); // df-2
    registry.unregister(b);
    expect(registry.register()).toBe('df-2'); // reuses the freed slot, not df-3
  });

  it('keeps ids compact across navigation: a persistent form holds df-1 while page forms reuse df-2', () => {
    const registry = new DynamicFormInstanceRegistry();
    registry.register(); // shell form → df-1 (stays mounted)

    const page1 = registry.register();
    expect(page1).toBe('df-2');
    registry.unregister(page1); // navigate away

    const page2 = registry.register();
    expect(page2).toBe('df-2'); // fresh page reuses df-2 — never df-3
  });

  it('ignores unregister of an unknown id', () => {
    const registry = new DynamicFormInstanceRegistry();
    registry.register();
    registry.unregister('df-99');
    expect(registry.count()).toBe(1);
  });
});
