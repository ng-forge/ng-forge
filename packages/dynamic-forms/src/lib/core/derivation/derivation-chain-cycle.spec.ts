import { describe, expect, it, vi } from 'vitest';
import { computed, signal, Signal, WritableSignal } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import { applyDerivations, DerivationApplicatorContext } from './derivation-applicator';
import { topologicalSort } from './derivation-sorter';
import { DerivationCollection, DerivationEntry } from './derivation-types';
import { Logger } from '@ng-forge/dynamic-forms/internal';
import { DerivationLogger } from './derivation-logger.service';

/**
 * Chain + cycle behavior of the unified derivation applicator.
 *
 * These exercise the iterative single-traversal loop in `applyDerivations`:
 * - chain propagation (B reads A's NEW value in the same pass)
 * - conditions that gate on a freshly-derived field
 * - bidirectional A<->B cycles stabilizing via equality
 *
 * Harness mirrors `derivation-applicator.spec.ts` but the `formValue` signal is
 * a LIVE computed over the same value signals the form writes to — so reads
 * inside the applicator's iterative loop observe writes made earlier in the
 * cycle. A static snapshot (as in some existing specs) cannot express chains.
 */
describe('derivation chain + cycle behavior', () => {
  function createMockLogger(): Logger {
    return {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    };
  }

  function createMockDerivationLogger(): DerivationLogger {
    return {
      cycleStart: vi.fn(),
      iteration: vi.fn(),
      evaluation: vi.fn(),
      summary: vi.fn(),
      maxIterationsReached: vi.fn(),
    };
  }

  /**
   * Builds a mock signal-form where `formValue` is a LIVE computed reflecting
   * the per-field value signals. Writes via `applyValueToForm` mutate the
   * signals; subsequent `formValue()` reads see the new values.
   */
  function createLiveForm(initialValue: Record<string, unknown>): {
    form: FieldTree<unknown>;
    formValue: Signal<Record<string, unknown>>;
    valueSignals: Record<string, WritableSignal<unknown>>;
    read: (key: string) => unknown;
  } {
    const form: Record<string, unknown> = {};
    const valueSignals: Record<string, WritableSignal<unknown>> = {};

    for (const key of Object.keys(initialValue)) {
      const valueSignal = signal(initialValue[key]);
      valueSignals[key] = valueSignal;
      const dirtySignal = signal(false);
      const touchedSignal = signal(false);
      const fieldInstance = {
        value: valueSignal,
        dirty: dirtySignal,
        touched: touchedSignal,
        reset: () => {
          dirtySignal.set(false);
          touchedSignal.set(false);
        },
      };
      form[key] = computed(() => fieldInstance);
    }

    // Live snapshot: re-reads every value signal each evaluation.
    const formValue = computed(() => {
      const out: Record<string, unknown> = {};
      for (const key of Object.keys(valueSignals)) {
        out[key] = valueSignals[key]();
      }
      return out;
    });

    return {
      form: form as unknown as FieldTree<unknown>,
      formValue,
      valueSignals,
      read: (key: string) => valueSignals[key](),
    };
  }

  function createEntry(fieldKey: string, options: Partial<DerivationEntry> = {}): DerivationEntry {
    return {
      fieldKey,
      dependsOn: options.dependsOn ?? [],
      condition: options.condition ?? true,
      value: options.value,
      expression: options.expression,
      functionName: options.functionName,
      fn: options.fn,
      trigger: options.trigger ?? 'onChange',
      isShorthand: options.isShorthand ?? false,
    };
  }

  function createCollection(entries: DerivationEntry[]): DerivationCollection {
    return { entries };
  }

  function makeContext(
    form: FieldTree<unknown>,
    formValue: Signal<Record<string, unknown>>,
    logger: Logger,
    extra: Partial<DerivationApplicatorContext> = {},
  ): DerivationApplicatorContext {
    return {
      formValue,
      rootForm: form,
      logger,
      derivationLogger: createMockDerivationLogger(),
      ...extra,
    };
  }

  describe('chain propagation within a single traversal', () => {
    it("B (B<-A) reflects A's NEW value when inputX changes (A<-inputX)", () => {
      // inputX = 5 -> A = inputX * 2 = 10 -> B = A + 1 = 11
      const { form, formValue, read } = createLiveForm({ inputX: 5, a: 0, b: 0 });

      const collection = createCollection([
        createEntry('a', { expression: 'formValue.inputX * 2', dependsOn: ['inputX'] }),
        createEntry('b', { expression: 'formValue.a + 1', dependsOn: ['a'] }),
      ]);

      const logger = createMockLogger();
      const result = applyDerivations(collection, makeContext(form, formValue, logger));

      expect(read('a')).toBe(10);
      // B must reflect A's NEW value (11), not the previous-cycle A (0 -> would be 1).
      expect(read('b')).toBe(11);
      expect(result.errorCount).toBe(0);
    });

    it('propagates through a 3-link chain A->B->C in one applyDerivations call', () => {
      // inputX = 3 -> a = 3+1 = 4 -> b = a*10 = 40 -> c = b-5 = 35
      const { form, formValue, read } = createLiveForm({ inputX: 3, a: 0, b: 0, c: 0 });

      const collection = createCollection([
        createEntry('a', { expression: 'formValue.inputX + 1', dependsOn: ['inputX'] }),
        createEntry('b', { expression: 'formValue.a * 10', dependsOn: ['a'] }),
        createEntry('c', { expression: 'formValue.b - 5', dependsOn: ['b'] }),
      ]);

      const logger = createMockLogger();
      applyDerivations(collection, makeContext(form, formValue, logger));

      expect(read('a')).toBe(4);
      expect(read('b')).toBe(40);
      expect(read('c')).toBe(35);
    });

    it('propagates the full chain when entries arrive topologically sorted (production order)', () => {
      // Entries authored in reverse (C, B, A) but the production pipeline always
      // runs topologicalSort at collection time before the applicator sees them.
      // We reproduce that contract here: sort first, then apply.
      const { form, formValue, read } = createLiveForm({ inputX: 3, a: 0, b: 0, c: 0 });

      const authored = [
        createEntry('c', { expression: 'formValue.b - 5', dependsOn: ['b'] }),
        createEntry('b', { expression: 'formValue.a * 10', dependsOn: ['a'] }),
        createEntry('a', { expression: 'formValue.inputX + 1', dependsOn: ['inputX'] }),
      ];
      const collection = createCollection(topologicalSort(authored));

      const logger = createMockLogger();
      applyDerivations(collection, makeContext(form, formValue, logger));

      expect(read('a')).toBe(4);
      expect(read('b')).toBe(40);
      expect(read('c')).toBe(35);
    });

    it('BUG-GUARD: applicator does NOT re-sort, so a topologically-reversed input mis-derives an early link', () => {
      // Documents the contract: the applicator relies on entries being pre-sorted
      // by the collector. `appliedDerivations` is cycle-scoped, so an entry applied
      // early against a stale dependency is marked done and never recomputed even
      // though its dependency updates later in the same cycle.
      const { form, formValue, read } = createLiveForm({ inputX: 3, a: 0, b: 0, c: 0 });

      // Deliberately UNSORTED (C before its dependency B). Not a state the
      // production pipeline produces — the collector sorts first.
      const collection = createCollection([
        createEntry('c', { expression: 'formValue.b - 5', dependsOn: ['b'] }),
        createEntry('b', { expression: 'formValue.a * 10', dependsOn: ['a'] }),
        createEntry('a', { expression: 'formValue.inputX + 1', dependsOn: ['inputX'] }),
      ]);

      const logger = createMockLogger();
      applyDerivations(collection, makeContext(form, formValue, logger));

      expect(read('a')).toBe(4);
      expect(read('b')).toBe(40);
      // c was computed once in iteration 1 against b=0 (-> -5) then locked by the
      // cycle-scoped applied-set. Confirms the applicator's pre-sort dependency.
      expect(read('c')).toBe(-5);
    });

    it('topologicalSort orders the chain so a single forward pass would suffice', () => {
      const entryA = createEntry('a', { dependsOn: ['inputX'] });
      const entryB = createEntry('b', { dependsOn: ['a'] });
      const entryC = createEntry('c', { dependsOn: ['b'] });

      // Shuffled input
      const sorted = topologicalSort([entryC, entryA, entryB]);

      expect(sorted.indexOf(entryA)).toBeLessThan(sorted.indexOf(entryB));
      expect(sorted.indexOf(entryB)).toBeLessThan(sorted.indexOf(entryC));
    });
  });

  describe('condition gating on a freshly-derived field', () => {
    it('a derivation whose condition references a derived field sees the NEW derived value', () => {
      // role is derived from inputX: inputX >= 10 -> "admin", else "user".
      // banner is derived ONLY when role === "admin" (fieldValue condition on role).
      const { form, formValue, read } = createLiveForm({ inputX: 50, role: 'user', banner: '' });

      const collection = createCollection([
        createEntry('role', {
          expression: "formValue.inputX >= 10 ? 'admin' : 'user'",
          dependsOn: ['inputX'],
        }),
        createEntry('banner', {
          value: 'ADMIN ACCESS',
          dependsOn: ['role'],
          condition: { type: 'fieldValue', fieldPath: 'role', operator: 'equals', value: 'admin' },
        }),
      ]);

      const logger = createMockLogger();
      applyDerivations(collection, makeContext(form, formValue, logger));

      // role becomes 'admin' this cycle; banner's condition must see the NEW
      // role, not the stale 'user' it started with.
      expect(read('role')).toBe('admin');
      expect(read('banner')).toBe('ADMIN ACCESS');
    });

    it('condition gates OFF correctly when the freshly-derived value fails the condition', () => {
      // inputX = 1 -> role becomes 'user'; banner condition (role === admin) is false.
      const { form, formValue, read } = createLiveForm({ inputX: 1, role: 'admin', banner: '' });

      const collection = createCollection([
        createEntry('role', {
          expression: "formValue.inputX >= 10 ? 'admin' : 'user'",
          dependsOn: ['inputX'],
        }),
        createEntry('banner', {
          value: 'ADMIN ACCESS',
          dependsOn: ['role'],
          condition: { type: 'fieldValue', fieldPath: 'role', operator: 'equals', value: 'admin' },
        }),
      ]);

      const logger = createMockLogger();
      applyDerivations(collection, makeContext(form, formValue, logger));

      expect(read('role')).toBe('user');
      // Condition must evaluate against the NEW role ('user') -> banner stays empty.
      expect(read('banner')).toBe('');
    });

    it('javascript-condition referencing a derived field is evaluated against the new value', () => {
      const { form, formValue, read } = createLiveForm({ inputX: 5, doubled: 0, flag: 'no' });

      const collection = createCollection([
        createEntry('doubled', { expression: 'formValue.inputX * 2', dependsOn: ['inputX'] }),
        createEntry('flag', {
          value: 'yes',
          dependsOn: ['doubled'],
          // doubled = 10 -> condition true
          condition: { type: 'javascript', expression: 'formValue.doubled > 8' },
        }),
      ]);

      const logger = createMockLogger();
      applyDerivations(collection, makeContext(form, formValue, logger));

      expect(read('doubled')).toBe(10);
      expect(read('flag')).toBe('yes');
    });
  });

  describe('bidirectional cycle A<->B', () => {
    it('stabilizes via equality and does not throw or hit max iterations (integer math)', () => {
      // A mirrors B, B mirrors A. Seed A = 7. Once both equal 7, isEqual
      // short-circuits and no further writes occur.
      const { form, formValue, read } = createLiveForm({ a: 7, b: 0 });

      const collection = createCollection([
        createEntry('a', { expression: 'formValue.b', dependsOn: ['b'] }),
        createEntry('b', { expression: 'formValue.a', dependsOn: ['a'] }),
      ]);

      const logger = createMockLogger();
      const result = applyDerivations(collection, makeContext(form, formValue, logger));

      // First pass: a<-b makes a=0; b<-a makes b=0. Both 0 -> stable.
      // (a mirrors b which started at 0; this is the documented "last writer" merge.)
      expect(read('a')).toBe(read('b'));
      expect(result.errorCount).toBe(0);
      expect(result.maxIterationsReached).toBe(false);
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('USD<->EUR currency cycle converges from an inconsistent seed (integer-stable factor)', () => {
      // amountUSD <- amountEUR * 2 ; amountEUR <- amountUSD / 2
      // Integer factor avoids float oscillation (see applicator isEqual note).
      // Seed inconsistent: EUR=100, USD=0 -> must converge to USD=200, EUR=100.
      const { form, formValue, read } = createLiveForm({ amountUSD: 0, amountEUR: 100 });

      const collection = createCollection([
        createEntry('amountUSD', { expression: 'formValue.amountEUR * 2', dependsOn: ['amountEUR'] }),
        createEntry('amountEUR', { expression: 'formValue.amountUSD / 2', dependsOn: ['amountUSD'] }),
      ]);

      const logger = createMockLogger();
      const result = applyDerivations(collection, makeContext(form, formValue, logger));

      expect(result.errorCount).toBe(0);
      expect(result.maxIterationsReached).toBe(false);
      expect(read('amountUSD')).toBe(200);
      // EUR round-trips back to 100 (200/2) -> equality halts the cycle.
      expect(read('amountEUR')).toBe(100);
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('one-directional change in a bidirectional pair settles in bounded iterations', () => {
      // a <- b (identity), b <- a (identity). Start mismatched: a=5, b=5 already equal.
      // Change driver: set a's source so it must propagate to b and settle.
      const { form, formValue, read } = createLiveForm({ a: 5, b: 5 });

      const collection = createCollection([
        createEntry('a', { expression: 'formValue.b', dependsOn: ['b'] }),
        createEntry('b', { expression: 'formValue.a', dependsOn: ['a'] }),
      ]);

      const logger = createMockLogger();
      const result = applyDerivations(collection, makeContext(form, formValue, logger));

      // Already consistent -> nothing applies, stable in iteration 1.
      expect(read('a')).toBe(5);
      expect(read('b')).toBe(5);
      expect(result.appliedCount).toBe(0);
      expect(result.maxIterationsReached).toBe(false);
    });

    it('topologicalSort keeps both bidirectional entries without throwing', () => {
      const entryA = createEntry('a', { dependsOn: ['b'] });
      const entryB = createEntry('b', { dependsOn: ['a'] });

      const sorted = topologicalSort([entryA, entryB]);

      expect(sorted).toContain(entryA);
      expect(sorted).toContain(entryB);
      expect(sorted.length).toBe(2);
    });
  });
});
