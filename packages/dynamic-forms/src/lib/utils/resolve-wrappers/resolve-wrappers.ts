import { FieldDef } from '../../definitions/base/field-def';
import { WrapperAutoAssociations, WrapperConfig } from '../../models/wrapper-type';

/**
 * Shared empty chain — returned when no wrappers apply so callers get a
 * stable reference. Freezing makes accidental mutation observable.
 */
const EMPTY_WRAPPERS: readonly WrapperConfig[] = Object.freeze([]);

/**
 * Element-wise identity (`===`) comparator for wrapper chains. Used as the
 * `equal` option on signal memoisation so reconciled `FieldDef`s with the
 * same chain don't churn downstream — relies on `WrapperConfig` objects
 * being stable across ticks, which holds for configs declared in
 * `FormConfig` / `createWrappers(...)`.
 */
export function isSameWrapperChain(a: readonly WrapperConfig[], b: readonly WrapperConfig[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Resolves the wrapper chain for a field.
 *
 * Merge order is **outermost → innermost**, most-global to most-specific:
 *   1. Auto-associations — from `WRAPPER_AUTO_ASSOCIATIONS` (registration-time).
 *   2. Form-level defaults — `FormConfig.defaultWrappers`.
 *   3. Field-level — `FieldDef.wrappers` (if non-null).
 *
 * Rationale: auto-associations are "the library says this wrapper must be on
 * every X", so they sit outside everything. Defaults are form-wide chrome.
 * Field-level wrappers are the field's own concern and render closest to it.
 *
 * `field.wrappers`:
 * - `undefined` — inherit (auto + defaults).
 * - `null` — skip **all three** layers; render bare. This is blunt — there's
 *   no per-layer opt-out today (e.g. skip auto but keep defaults). If you
 *   need that, it's a feature request, not a workaround.
 * - `[]` — **does not** opt out; auto + defaults still apply.
 *
 * A fresh array is allocated per call; downstream memoisation is via
 * `isSameWrapperChain` on the consuming computed's `equal`, not here.
 */
export function resolveWrappers(
  field: Pick<FieldDef<unknown>, 'type' | 'wrappers'>,
  defaultWrappers: readonly WrapperConfig[] | undefined,
  autoAssociations: WrapperAutoAssociations,
): readonly WrapperConfig[] {
  if (field.wrappers === null) {
    return EMPTY_WRAPPERS;
  }

  const autoWrappers = autoAssociations.get(field.type) ?? EMPTY_WRAPPERS;
  const defaults = defaultWrappers ?? EMPTY_WRAPPERS;
  const fieldLevel = field.wrappers ?? EMPTY_WRAPPERS;

  if (autoWrappers.length === 0 && defaults.length === 0 && fieldLevel.length === 0) {
    return EMPTY_WRAPPERS;
  }

  return [...autoWrappers, ...defaults, ...fieldLevel];
}
