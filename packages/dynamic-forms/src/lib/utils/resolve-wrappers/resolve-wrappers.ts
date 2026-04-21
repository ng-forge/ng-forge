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
 * Merge order (outermost → innermost): auto-associations, form defaults,
 * field-level wrappers. `wrappers: null` skips all three; `skipAutoWrappers` /
 * `skipDefaultWrappers` on the field opt out of individual layers. Fresh
 * array per call — downstream memoisation is on the consuming computed.
 */
export function resolveWrappers(
  field: Pick<FieldDef<unknown>, 'type' | 'wrappers' | 'skipAutoWrappers' | 'skipDefaultWrappers'>,
  defaultWrappers: readonly WrapperConfig[] | undefined,
  autoAssociations: WrapperAutoAssociations,
): readonly WrapperConfig[] {
  if (field.wrappers === null) {
    return EMPTY_WRAPPERS;
  }

  const autoWrappers = field.skipAutoWrappers ? EMPTY_WRAPPERS : (autoAssociations.get(field.type) ?? EMPTY_WRAPPERS);
  const defaults = field.skipDefaultWrappers ? EMPTY_WRAPPERS : (defaultWrappers ?? EMPTY_WRAPPERS);
  const fieldLevel = field.wrappers ?? EMPTY_WRAPPERS;

  if (autoWrappers.length === 0 && defaults.length === 0 && fieldLevel.length === 0) {
    return EMPTY_WRAPPERS;
  }

  return [...autoWrappers, ...defaults, ...fieldLevel];
}
