import { FieldDef } from '@ng-forge/dynamic-forms/internal';
import { ContainerValidation, isArrayField, isContainerField, isGroupField, WrapperConfig } from '@ng-forge/dynamic-forms/internal';

/** Wrapper type name — must match the `BUILT_IN_WRAPPERS` registration. */
const CONTAINER_ERRORS_WRAPPER = 'container-errors';

/**
 * Appends the `container-errors` wrapper to every `group` / `array` that
 * declares its own `validators` (issue #568).
 *
 * A container has no native form element, so nothing would otherwise render the
 * message for a tree-level error. Attaching here rather than auto-associating
 * the wrapper by field type means containers WITHOUT container validators keep
 * their exact current DOM — no wrapper host element, no layout change.
 *
 * The wrapper goes last so it ends up innermost: the message renders directly
 * under the container's own content, inside any wrapper the author declared
 * (e.g. a card), rather than outside it.
 *
 * Runs after `normalizeSimplifiedArrays`, so simplified arrays have already
 * been expanded into full `ArrayField`s.
 */
export function attachContainerErrorWrappers(fields: FieldDef<unknown>[]): FieldDef<unknown>[] {
  return fields.map((field) => attachToField(field));
}

function attachToField(field: FieldDef<unknown>): FieldDef<unknown> {
  // Arrays recurse into item definitions, which are either a single FieldDef
  // (primitive item) or an array of FieldDefs (object item).
  if (isArrayField(field)) {
    const items = field.fields as readonly (FieldDef<unknown> | readonly FieldDef<unknown>[])[];
    const nextItems = items.map((item) =>
      Array.isArray(item)
        ? attachContainerErrorWrappers([...(item as readonly FieldDef<unknown>[])])
        : attachToField(item as FieldDef<unknown>),
    );
    const changed = nextItems.some((item, i) => item !== items[i]);
    const base = changed ? ({ ...field, fields: nextItems } as unknown as FieldDef<unknown>) : field;
    return withErrorWrapper(base);
  }

  // Groups and layout containers (page / row / container) recurse into `fields`.
  // Only groups can carry container validators — layout containers flatten into
  // their parent and have no schema path of their own.
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

  const existing = field.wrappers ?? [];
  if (existing.some((w) => w.type === CONTAINER_ERRORS_WRAPPER)) return field;

  const errorWrapper = {
    type: CONTAINER_ERRORS_WRAPPER,
    ...(validationMessages !== undefined && { validationMessages }),
  } as WrapperConfig;

  return { ...field, wrappers: [...existing, errorWrapper] } as FieldDef<unknown>;
}
