import { FieldDef } from '@ng-forge/dynamic-forms/internal';
import { ContainerValidation, WrapperAutoAssociations, WrapperConfig, WrapperTypeDefinition } from '@ng-forge/dynamic-forms/internal';

/**
 * Shared empty chain — returned when no wrappers apply so callers get a
 * stable reference. Freezing makes accidental mutation observable.
 */
const EMPTY_WRAPPERS: readonly WrapperConfig[] = Object.freeze([]);

/** Wrapper type name — must match the `BUILT_IN_WRAPPERS` registration. */
const FIELD_ERRORS_WRAPPER = 'field-errors';

/** The subset of a field this resolver reads. */
type ResolvableField = Pick<FieldDef<unknown>, 'type' | 'wrappers' | 'skipAutoWrappers' | 'skipDefaultWrappers'> &
  Partial<ContainerValidation>;

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

/** Resolves the wrapper chain for a field. */
export function resolveWrappers(
  field: ResolvableField,
  defaultWrappers: readonly WrapperConfig[] | undefined,
  autoAssociations: WrapperAutoAssociations,
  wrapperRegistry: ReadonlyMap<string, WrapperTypeDefinition>,
): readonly WrapperConfig[] {
  // Absolute escape hatch: no wrappers at all, error message included.
  if (field.wrappers === null) {
    return EMPTY_WRAPPERS;
  }

  const autoWrappers = field.skipAutoWrappers ? EMPTY_WRAPPERS : (autoAssociations.get(field.type) ?? EMPTY_WRAPPERS);
  const defaults = field.skipDefaultWrappers ? EMPTY_WRAPPERS : (defaultWrappers ?? EMPTY_WRAPPERS);
  const fieldLevel = field.wrappers ?? EMPTY_WRAPPERS;

  const composed = [...autoWrappers, ...defaults, ...fieldLevel];

  // A container validator (#568) has no field component to render its message. Appended
  // after all layers compose, so a custom error wrapper counts from any of them.
  if (needsErrorWrapper(field, composed, wrapperRegistry)) {
    composed.push({ type: FIELD_ERRORS_WRAPPER } as WrapperConfig);
  }

  return composed.length === 0 ? EMPTY_WRAPPERS : composed;
}

/** Field types that own a schema path and so can carry their own validators (#568). */
const VALIDATABLE_CONTAINERS: ReadonlySet<string> = new Set(['group', 'array']);

/** True when the field declares container validators and nothing in the chain renders them. */
function needsErrorWrapper(
  field: ResolvableField,
  composed: readonly WrapperConfig[],
  wrapperRegistry: ReadonlyMap<string, WrapperTypeDefinition>,
): boolean {
  // Leaves render their own errors in the field component; only containers need the wrapper.
  if (!VALIDATABLE_CONTAINERS.has(field.type)) return false;
  if (!field.validators || field.validators.length === 0) return false;

  return !composed.some((w) => w.type === FIELD_ERRORS_WRAPPER || wrapperRegistry.get(w.type)?.rendersFieldErrors);
}
