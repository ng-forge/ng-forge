import { FieldDef } from '@ng-forge/dynamic-forms/internal';
import { hasChildFields } from '@ng-forge/dynamic-forms/internal';
import { getNormalizedArrayMetadata } from '../../utils/array-field/normalized-array-metadata';
import { normalizeFieldsArray } from '@ng-forge/dynamic-forms/internal';

/**
 * Visitor invoked for every field encountered during traversal.
 *
 * @internal
 */
export type FieldVisitor<TContext> = (field: FieldDef<unknown>, context: TContext) => void;

/**
 * Hooks for mutating the traversal context when crossing container boundaries.
 *
 * @internal
 */
export interface FieldTraversalHooks<TContext> {
  /** Called when descending into an `array` field. */
  onArrayChild?: (parent: TContext, field: FieldDef<unknown>) => Partial<TContext>;
  /** Called when descending into a `group` field. */
  onGroupChild?: (parent: TContext, field: FieldDef<unknown>) => Partial<TContext>;
  /** Called when descending into a layout container (page, row, container). */
  onLayoutChild?: (parent: TContext, field: FieldDef<unknown>) => Partial<TContext>;
}

/**
 * Recursively walks a field-definition tree, invoking `visitor` for each field.
 *
 * @internal
 */
export function traverseFieldsWithContext<TContext>(
  fields: FieldDef<unknown>[],
  context: TContext,
  visitor: FieldVisitor<TContext>,
  hooks?: FieldTraversalHooks<TContext>,
): void {
  for (const field of fields) {
    visitor(field, context);

    if (!hasChildFields(field)) continue;

    if (field.type === 'array') {
      const childContext = mergeContext(context, hooks?.onArrayChild?.(context, field));
      const arrayChildren = collectArrayChildren(field);
      traverseFieldsWithContext(arrayChildren, childContext, visitor, hooks);
      continue;
    }

    const overrides = field.type === 'group' ? hooks?.onGroupChild?.(context, field) : hooks?.onLayoutChild?.(context, field);
    const childContext = mergeContext(context, overrides);
    traverseFieldsWithContext(normalizeFieldsArray(field.fields) as FieldDef<unknown>[], childContext, visitor, hooks);
  }
}

/**
 * Returns `true` as soon as `predicate` holds for any field in the tree,
 * short-circuiting the walk. Resolves children exactly like
 * {@link traverseFieldsWithContext} (including array-item templates), so a
 * presence check stays in lockstep with the full traversal.
 *
 * @internal
 */
export function someField(fields: readonly FieldDef<unknown>[], predicate: (field: FieldDef<unknown>) => boolean): boolean {
  return fields.some((field) => {
    if (predicate(field)) return true;
    if (!hasChildFields(field)) return false;
    const children = field.type === 'array' ? collectArrayChildren(field) : (normalizeFieldsArray(field.fields) as FieldDef<unknown>[]);
    return someField(children, predicate);
  });
}

/**
 * Returns the flattened list of children for an array field, falling back
 * to the Symbol metadata template when `fields` is empty.
 *
 * @internal
 */
function collectArrayChildren(
  field: FieldDef<unknown> & { fields: FieldDef<unknown>[] | Record<string, FieldDef<unknown>> },
): FieldDef<unknown>[] {
  let arrayItems = normalizeFieldsArray(field.fields) as (FieldDef<unknown> | FieldDef<unknown>[])[];

  if (arrayItems.length === 0) {
    const metadataTemplate = getNormalizedArrayMetadata(field)?.template;
    if (metadataTemplate) {
      arrayItems = [
        Array.isArray(metadataTemplate) ? [...(metadataTemplate as readonly FieldDef<unknown>[])] : (metadataTemplate as FieldDef<unknown>),
      ];
    }
  }

  const flattened: FieldDef<unknown>[] = [];
  for (const item of arrayItems) {
    if (Array.isArray(item)) {
      flattened.push(...item);
    } else {
      flattened.push(item);
    }
  }
  return flattened;
}

/** @internal */
function mergeContext<TContext>(base: TContext, overrides: Partial<TContext> | undefined): TContext {
  return overrides ? { ...base, ...overrides } : { ...base };
}
