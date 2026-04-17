import { FieldDef } from '../../definitions/base/field-def';
import { WrapperConfig } from '../../models/wrapper-type';

/**
 * Resolves the effective wrapper chain for a field.
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
 * - `readonly WrapperConfig[]` — **added** to the effective chain innermost;
 *   `[]` on a field does **not** opt out of defaults or auto-associations.
 *   Use `wrappers: null` to render bare.
 *
 * The returned array is a fresh instance; callers may cache based on identity.
 */
export function resolveEffectiveWrappers(
  field: Pick<FieldDef<unknown>, 'type' | 'wrappers'>,
  defaultWrappers: readonly WrapperConfig[] | undefined,
  autoAssociations: ReadonlyMap<string, readonly WrapperConfig[]>,
): readonly WrapperConfig[] {
  if (field.wrappers === null) {
    return [];
  }

  const autoWrappers = autoAssociations.get(field.type) ?? [];
  const defaults = defaultWrappers ?? [];
  const fieldLevel = field.wrappers ?? [];

  if (autoWrappers.length === 0 && defaults.length === 0 && fieldLevel.length === 0) {
    return [];
  }

  return [...autoWrappers, ...defaults, ...fieldLevel];
}
