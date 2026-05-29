import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DynamicFormInstanceRegistry } from './dynamic-form-instance-registry.service';

describe('DynamicFormInstanceRegistry', () => {
  let registry: DynamicFormInstanceRegistry;
  const created: HTMLElement[] = [];

  /** A real, attached, visible host so checkVisibility() reflects display state. */
  function host(): HTMLElement {
    const el = document.createElement('div');
    el.textContent = 'x';
    document.body.appendChild(el);
    created.push(el);
    return el;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
    registry = TestBed.inject(DynamicFormInstanceRegistry);
  });

  afterEach(() => {
    created.forEach((el) => el.remove());
    created.length = 0;
  });

  it('hands out sequential slots and recycles the lowest freed one', () => {
    expect(registry.register(host())).toBe('df-1');
    const b = registry.register(host());
    expect(b).toBe('df-2');
    registry.unregister(b);
    expect(registry.register(host())).toBe('df-2'); // reuses the freed slot, not df-3
  });

  it('multiplePresent stays false for a single visible form', () => {
    registry.register(host());
    expect(registry.multiplePresent()).toBe(false);
  });

  it('multiplePresent flips true with two visible forms', () => {
    registry.register(host());
    registry.register(host());
    expect(registry.multiplePresent()).toBe(true);
  });

  it('excludes hidden (display:none) forms from the count', () => {
    registry.register(host());
    const hidden = host();
    hidden.style.display = 'none';
    registry.register(hidden);
    // Two registered, only one rendered → not "multiple present".
    expect(registry.multiplePresent()).toBe(false);
  });

  it('re-counts when a hidden form is shown again', () => {
    registry.register(host());
    const toggling = host();
    toggling.style.display = 'none';
    registry.register(toggling);
    expect(registry.multiplePresent()).toBe(false);

    toggling.style.display = '';
    registry.refreshVisibility();
    expect(registry.multiplePresent()).toBe(true);
  });
});
