import { FieldDef } from '@ng-forge/dynamic-forms/internal';
import { ContainerValidation, isArrayField, isContainerField, isGroupField, WrapperConfig } from '@ng-forge/dynamic-forms/internal';

/** Wrapper type name — must match the `BUILT_IN_WRAPPERS` registration. */
const CONTAINER_ERRORS_WRAPPER = 'container-errors';

/**
 * Appends the `container-errors` wrapper to every `group` / `array` declaring `validators` (#568).
 *
 * Attaching here rather than auto-associating by field type leaves containers without
 * container validators with their exact current DOM. The wrapper goes last so it renders
 * innermost, inside any author-declared wrapper. Runs after `normalizeSimplifiedArrays`.
 */
export function attachContainerErrorWrappers(fields: FieldDef<unknown>[]): FieldDef<unknown>[] {
  return fields.map((field) => attachToField(field));
}

function attachToField(field: FieldDef<unknown>): FieldDef<unknown> {
  // Array items are either a single FieldDef (primitive) or an array of them (object).
  if (isArrayField(field)) {
    const items = field.fields as readonly (FieldDef<unknown> | readonly FieldDef<unknown>[])[];
    const nextItems = items.map((item) => {
      if (!Array.isArray(item)) return attachToField(item as FieldDef<unknown>);
      // Reuse the row when nothing beneath it changed — mapping always allocates,
      // so compare element-wise rather than trusting array identity.
      const row = item as readonly FieldDef<unknown>[];
      const nextRow = attachContainerErrorWrappers([...row]);
      return nextRow.some((child, i) => child !== row[i]) ? nextRow : item;
    });
    const changed = nextItems.some((item, i) => item !== items[i]);
    // Safe: only `fields` is replaced, with the same item shape the array already had.
    const base = changed ? ({ ...field, fields: nextItems } as unknown as FieldDef<unknown>) : field;
    return withErrorWrapper(base);
  }

  // Only groups can carry container validators; layout containers just recurse.
  if (isContainerField(field) && Array.isArray((field as { fields?: unknown }).fields)) {
    const children = (field as unknown as { fields: FieldDef<unknown>[] }).fields;
    const nextChildren = attachContainerErrorWrappers(children);
    const changed = nextChildren.some((child, i) => child !== children[i]);
    const base = changed ? ({ ...field, fields: nextChildren } as FieldDef<unknown>) : field;
    return isGroupField(field) ? withErrorWrapper(base) : base;
  }

  return field;
}

/** Appends the wrapper when the container declares validators and doesn't already have it. */
function withErrorWrapper(field: FieldDef<unknown>): FieldDef<unknown> {
  const { validators, validationMessages } = field as FieldDef<unknown> & ContainerValidation;
  if (!validators || validators.length === 0) return field;
  // `null` means "no wrappers at all" — an explicit opt-out, not an empty chain.
  if (field.wrappers === null) return field;

  const existing = field.wrappers ?? [];
  if (existing.some((w) => w.type === CONTAINER_ERRORS_WRAPPER)) return field;

  const errorWrapper = {
    type: CONTAINER_ERRORS_WRAPPER,
    ...(validationMessages !== undefined && { validationMessages }),
  } as WrapperConfig;

  return { ...field, wrappers: [...existing, errorWrapper] } as FieldDef<unknown>;
}
