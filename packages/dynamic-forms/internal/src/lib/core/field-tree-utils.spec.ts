import { describe, it, expect } from 'vitest';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, schema } from '@angular/forms/signals';
import { toReadonlyFieldTree } from './field-tree-utils';

interface Model {
  name: string;
  age: number;
}

describe('toReadonlyFieldTree', () => {
  it('returns an object whose signals are identical references to FieldState signals', () => {
    TestBed.configureTestingModule({});
    const injector = TestBed.inject(Injector);

    runInInjectionContext(injector, () => {
      const model = signal<Model>({ name: 'Jane', age: 30 });
      const modelSchema = schema<Model>(() => undefined);
      const fieldTree = form(model, modelSchema);

      const readonly = toReadonlyFieldTree(fieldTree.name);
      const state = fieldTree.name();

      expect(readonly.value).toBe(state.value);
      expect(readonly.valid).toBe(state.valid);
      expect(readonly.invalid).toBe(state.invalid);
      expect(readonly.touched).toBe(state.touched);
      expect(readonly.dirty).toBe(state.dirty);
      expect(readonly.required).toBe(state.required);
      expect(readonly.disabled).toBe(state.disabled);
      expect(readonly.hidden).toBe(state.hidden);
      expect(readonly.errors).toBe(state.errors);
    });
  });

  it('reflects FieldState reads reactively (same underlying signal)', () => {
    TestBed.configureTestingModule({});
    const injector = TestBed.inject(Injector);

    runInInjectionContext(injector, () => {
      const model = signal<Model>({ name: 'Jane', age: 30 });
      const modelSchema = schema<Model>(() => undefined);
      const fieldTree = form(model, modelSchema);

      const readonly = toReadonlyFieldTree(fieldTree.name);

      expect(readonly.value()).toBe('Jane');

      // Mutate via the source and observe through the readonly view
      fieldTree.name().value.set('John');
      expect(readonly.value()).toBe('John');
    });
  });
});
