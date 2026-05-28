import { describe, expect, it } from 'vitest';
import { DynamicFormInstanceRegistry } from './dynamic-form-instance-registry.service';

describe('DynamicFormInstanceRegistry', () => {
  it('starts empty — count 0, not multiple', () => {
    const registry = new DynamicFormInstanceRegistry();
    expect(registry.count()).toBe(0);
    expect(registry.multiplePresent()).toBe(false);
  });

  it('increments count and hands out sequential auto-ids on register', () => {
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

  it('decrements count on unregister', () => {
    const registry = new DynamicFormInstanceRegistry();
    registry.register();
    registry.register();
    expect(registry.count()).toBe(2);
    registry.unregister();
    expect(registry.count()).toBe(1);
    expect(registry.multiplePresent()).toBe(false);
  });

  it('never lets count go negative', () => {
    const registry = new DynamicFormInstanceRegistry();
    registry.unregister();
    registry.unregister();
    expect(registry.count()).toBe(0);
  });

  it('resets the auto-id seq once the last form unmounts (bounded ids per mount-wave)', () => {
    const registry = new DynamicFormInstanceRegistry();
    expect(registry.register()).toBe('df-1');
    expect(registry.register()).toBe('df-2');

    registry.unregister();
    registry.unregister();
    expect(registry.count()).toBe(0);

    // Next mount-wave starts fresh from df-1 rather than climbing forever.
    expect(registry.register()).toBe('df-1');
  });

  it('does NOT reset the seq while at least one form stays mounted', () => {
    const registry = new DynamicFormInstanceRegistry();
    registry.register(); // df-1, count 1
    registry.register(); // df-2, count 2
    registry.unregister(); // count 1 — one form still live

    // seq must keep climbing so the new form never collides with the survivor.
    expect(registry.register()).toBe('df-3');
  });
});
