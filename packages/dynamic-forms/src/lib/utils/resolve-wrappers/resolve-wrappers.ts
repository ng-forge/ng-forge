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
 * Merge order (outermost → innermost):
 * 1. Auto-associations — wrappers whose `types` array includes this field's type.
 *    Looked up from the pre-computed `WRAPPER_AUTO_ASSOCIATIONS` map that
 *    `provideDynamicForm(...)` builds at registration time.
 * 2. Form-level defaults — `FormConfig.defaultWrappers`
 * 3. Field-level — `FieldDef.wrappers` (if non-null)
 *
 * Semantics of `field.wrappers`:
 * - `undefined` — inherit (use auto-associations + defaults)
 * - `null` — explicit opt-out (empty chain; ignore auto and defaults)
 * - `readonly WrapperConfig[]` — **added** to the chain innermost;
 *   `[]` on a field does **not** opt out of defaults or auto-associations.
 *   Use `wrappers: null` to render bare.
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
