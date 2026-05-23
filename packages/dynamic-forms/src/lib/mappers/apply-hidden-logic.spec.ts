import { describe, it, expect } from 'vitest';
import { signal } from '@angular/core';
import { applyHiddenLogic } from './apply-hidden-logic';
import { RootFormRegistryService } from '../core/registry/root-form-registry.service';
import { LogicConfig } from '../models/logic';

function makeRegistry(formValue: Record<string, unknown>, rootForm: unknown): RootFormRegistryService {
  return new RootFormRegistryService(signal(formValue), signal(rootForm) as never);
}

describe('applyHiddenLogic', () => {
  describe('when rootForm is null (initial-render race)', () => {
    it('defaults hidden=true when the field has hidden logic but no form is registered yet', () => {
      // The mapper's computed can fire before the form registers. Without this
      // guard we'd briefly emit `inputs.hidden=undefined` (treated as false by
      // consumers), letting wrapper chrome flash on screen for one tick before
      // the form registers and the condition is evaluable.
      const inputs: Record<string, unknown> = {};
      const fieldDef = {
        logic: [{ type: 'hidden', condition: { type: 'fieldValue', fieldPath: 'x', operator: 'equals', value: 1 } }] as LogicConfig[],
      };
      const registry = makeRegistry({}, null);

      applyHiddenLogic(inputs, fieldDef, registry);

      expect(inputs['hidden']).toBe(true);
    });

    it('defaults hidden=true for explicit hidden:true when no form is registered yet', () => {
      const inputs: Record<string, unknown> = {};
      const registry = makeRegistry({}, null);

      applyHiddenLogic(inputs, { hidden: true }, registry);

      expect(inputs['hidden']).toBe(true);
    });

    it('leaves hidden untouched when the field has NO hidden logic — bare fields stay visible', () => {
      // Don't pessimize fields that never participate in hidden logic.
      const inputs: Record<string, unknown> = {};
      const registry = makeRegistry({}, null);

      applyHiddenLogic(inputs, {}, registry);

      expect('hidden' in inputs).toBe(false);
    });
  });

  describe('when rootForm is registered', () => {
    function fakeForm(value: Record<string, unknown>): unknown {
      // Minimal FieldTree-shaped callable: invoking it returns the FieldState
      // whose `value()` getter the logic resolver falls back to. The hidden
      // resolver actually consumes `ctx.formValue` first (which we pass), so
      // the callable is here for shape consistency with the production type.
      return () => ({ value: () => value });
    }

    it('evaluates the condition and sets hidden=true when it matches', () => {
      const inputs: Record<string, unknown> = {};
      const fieldDef = {
        logic: [
          {
            type: 'hidden',
            condition: { type: 'fieldValue', fieldPath: 'fillType', operator: 'notEquals', value: 'KEEP_PRIVATE' },
          },
        ] as LogicConfig[],
      };
      const value = { fillType: 'ALLOW_ANYONE_TO_APPLY' };
      const registry = makeRegistry(value, fakeForm(value));

      applyHiddenLogic(inputs, fieldDef, registry);

      expect(inputs['hidden']).toBe(true);
    });

    it('evaluates the condition and sets hidden=false when it does NOT match', () => {
      const inputs: Record<string, unknown> = {};
      const fieldDef = {
        logic: [
          {
            type: 'hidden',
            condition: { type: 'fieldValue', fieldPath: 'fillType', operator: 'notEquals', value: 'KEEP_PRIVATE' },
          },
        ] as LogicConfig[],
      };
      const value = { fillType: 'KEEP_PRIVATE' };
      const registry = makeRegistry(value, fakeForm(value));

      applyHiddenLogic(inputs, fieldDef, registry);

      expect(inputs['hidden']).toBe(false);
    });

    it('honours explicit hidden=true regardless of logic', () => {
      const inputs: Record<string, unknown> = {};
      const value = { fillType: 'KEEP_PRIVATE' };
      const registry = makeRegistry(value, fakeForm(value));

      applyHiddenLogic(inputs, { hidden: true }, registry);

      expect(inputs['hidden']).toBe(true);
    });
  });
});
