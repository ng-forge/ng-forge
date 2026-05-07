import { FieldContext, LogicFn } from '@angular/forms/signals';
import { FieldDef } from '../definitions/base/field-def';
import { FieldWithValidation } from '../definitions/base/field-with-validation';
import { isStateLogicConfig } from '../models/logic/logic-config';
import { createLogicFunction } from './expressions/logic-function-factory';

/**
 * Cascading configuration that flows from parent to child during schema mapping.
 *
 * Each property here represents a setting whose effective value is
 *
 * 1. read from the field itself if defined,
 * 2. otherwise inherited from the parent's resolved value,
 * 3. otherwise the form-level value (root parent),
 * 4. otherwise the global default (used to seed the root context).
 *
 * Once a field overrides a value, the new value becomes the inherited baseline
 * for all of its descendants unless they override in turn.
 *
 * Add new cascading options here rather than threading additional parameters
 * through `mapFieldToForm` and friends.
 *
 * @internal
 */
export interface FieldTreeMappingContext {
  /**
   * Whether validators on this field run while the field (or any ancestor) is
   * hidden. Defaults to `false` at the global level.
   */
  readonly validateWhenHidden: boolean;

  /**
   * `true` when an ancestor is unconditionally hidden (`hidden: true` or
   * `logic: [{type: 'hidden', condition: true}]`). When set together with
   * `validateWhenHidden=false`, the descendant skips validator application
   * entirely — there's no reactive case to gate on.
   */
  readonly ancestorAlwaysHidden: boolean;

  /**
   * Reactive logic functions for ancestor-level dynamic hidden conditions
   * (`logic: [{type: 'hidden', condition: ...}]`). Layout containers do not
   * have a schema path, so Angular Signal Forms cannot propagate their hidden
   * state to descendants — this list does it manually. Each function evaluates
   * against the current form value through the field context.
   */
  readonly ancestorHiddenLogics: readonly LogicFn<unknown, boolean>[];
}

/**
 * Combines the inherited "is any ancestor hidden" check into a single LogicFn.
 * Returns `undefined` when no ancestor has dynamic hidden logic.
 *
 * @internal
 */
export function combineAncestorHiddenLogics(logics: readonly LogicFn<unknown, boolean>[]): LogicFn<unknown, boolean> | undefined {
  if (logics.length === 0) return undefined;
  if (logics.length === 1) return logics[0];
  return (ctx: FieldContext<unknown>) => logics.some((fn) => fn(ctx));
}

/**
 * Returns the `FieldTreeMappingContext` to use **for the field itself** — i.e.
 * for gating its own validators. Only applies overrides that affect the field
 * (currently `validateWhenHidden`). The field's own hidden state is NOT folded
 * into `ancestorAlwaysHidden`/`ancestorHiddenLogics` here — Angular Signal
 * Forms already exposes that through `ctx.state.hidden()`, which the gate
 * checks separately.
 *
 * Returns the parent context unchanged when the field defines no overrides —
 * saves an allocation on every leaf in the common case.
 *
 * @internal
 */
export function resolveFieldOwnContext(
  fieldDef: Pick<FieldDef<unknown>, 'validateWhenHidden'>,
  parentContext: FieldTreeMappingContext,
): FieldTreeMappingContext {
  if (fieldDef.validateWhenHidden === undefined) return parentContext;
  if (fieldDef.validateWhenHidden === parentContext.validateWhenHidden) return parentContext;
  return {
    ...parentContext,
    validateWhenHidden: fieldDef.validateWhenHidden,
  };
}

/**
 * Returns the `FieldTreeMappingContext` to use **for the field's descendants**.
 * Builds on top of `ownContext` by folding in the field's own hidden state so
 * children can correctly skip validation when this field hides them. Used for
 * groups, arrays, and layout containers that recurse into children.
 *
 * Behavior:
 * - `hidden: true` (static) → sets `ancestorAlwaysHidden`.
 * - `logic: [{type: 'hidden', condition: true}]` → sets `ancestorAlwaysHidden`.
 * - `logic: [{type: 'hidden', condition: false}]` → no effect.
 * - `logic: [{type: 'hidden', condition: <expr>}]` → appends a reactive
 *   `LogicFn` to `ancestorHiddenLogics`.
 *
 * @internal
 */
export function resolveDescendantContext(
  fieldDef: FieldDef<unknown> & Partial<Pick<FieldWithValidation, 'logic'>>,
  ownContext: FieldTreeMappingContext,
): FieldTreeMappingContext {
  let ancestorAlwaysHidden = ownContext.ancestorAlwaysHidden;
  let ancestorHiddenLogics = ownContext.ancestorHiddenLogics;
  let mutated = false;

  if (fieldDef.hidden === true && !ancestorAlwaysHidden) {
    ancestorAlwaysHidden = true;
    mutated = true;
  }

  if (fieldDef.logic) {
    for (const logic of fieldDef.logic) {
      if (!isStateLogicConfig(logic) || logic.type !== 'hidden') continue;

      const condition = logic.condition;

      if (condition === true) {
        if (!ancestorAlwaysHidden) {
          ancestorAlwaysHidden = true;
          mutated = true;
        }
        continue;
      }

      if (condition === false) continue;

      // FormStateCondition strings ('formInvalid', etc.) are intended for buttons —
      // they don't make sense as a "field hidden" trigger, so we skip them here.
      if (typeof condition === 'string') continue;

      // Dynamic — we need a reactive logic function. createLogicFunction
      // requires an injection context, which the schema build provides.
      const fn = createLogicFunction(condition) as LogicFn<unknown, boolean>;
      ancestorHiddenLogics = ancestorHiddenLogics.length === 0 ? [fn] : [...ancestorHiddenLogics, fn];
      mutated = true;
    }
  }

  if (!mutated) return ownContext;

  return {
    validateWhenHidden: ownContext.validateWhenHidden,
    ancestorAlwaysHidden,
    ancestorHiddenLogics,
  };
}
