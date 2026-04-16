import { FieldDef } from '../../definitions/base/field-def';
import { WrapperConfig, WrapperTypeDefinition } from '../../models/wrapper-type';

/**
 * Resolves the effective wrapper chain for a field.
 *
 * Merge order (outermost → innermost):
 * 1. Auto-associations — wrappers whose `types` array includes this field's type
 * 2. Form-level defaults — `FormConfig.defaultWrappers`
 * 3. Field-level — `FieldDef.wrappers` (if non-null)
 *
 * Semantics of `field.wrappers`:
 * - `undefined` — inherit (use auto-associations + defaults)
 * - `null` — explicit opt-out (empty chain; ignore auto and defaults)
 * - `readonly WrapperConfig[]` — appended to the effective chain innermost
 *
 * The returned array is a fresh instance; callers may cache based on identity.
 */
export function resolveEffectiveWrappers(
  field: Pick<FieldDef<unknown>, 'type' | 'wrappers'>,
  defaultWrappers: readonly WrapperConfig[] | undefined,
  wrapperRegistry: ReadonlyMap<string, WrapperTypeDefinition>,
): readonly WrapperConfig[] {
  if (field.wrappers === null) {
    return [];
  }

  const autoWrappers: WrapperConfig[] = [];
  for (const [wrapperName, definition] of wrapperRegistry) {
    if (definition.types?.includes(field.type)) {
      autoWrappers.push({ type: wrapperName } as WrapperConfig);
    }
  }

  const defaults = defaultWrappers ?? [];
  const fieldLevel = field.wrappers ?? [];

  if (autoWrappers.length === 0 && defaults.length === 0 && fieldLevel.length === 0) {
    return [];
  }

  return [...autoWrappers, ...defaults, ...fieldLevel];
}
