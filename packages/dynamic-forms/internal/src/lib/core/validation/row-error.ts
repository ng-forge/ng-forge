import { FieldContext, ValidationError } from '@angular/forms/signals';

/** The error to raise, minus the `fieldTree` that {@link rowError} fills in. */
export interface RowErrorSpec {
  /** Error kind, matched against `validationMessages`. */
  readonly kind: string;
  /**
   * Message shown for this error. A row-targeted error needs its own, because the
   * container's `validationMessages` are keyed to the container, not to the child the
   * error moves to.
   */
  readonly message?: string;
  readonly [param: string]: unknown;
}

/**
 * Targets a validation error at one field of one row, from a validator declared on the
 * array (issue #568).
 *
 * A container validator sees the whole item list, which is what makes per-row rules
 * expressible at all — but one message for the list cannot say which row is wrong.
 * Returning the result of this helper puts the error on that row's own input, where the
 * adapter renders it like any other field error.
 *
 * ```typescript
 * const periodOrder: CustomValidator = (ctx) => {
 *   const rows = (ctx.value() ?? []) as { from?: string; to?: string }[];
 *   return rows.flatMap((row, i) =>
 *     row.from && row.to && row.to < row.from
 *       ? [rowError(ctx, i, 'to', { kind: 'periodOrder', message: 'The end must not be before the start.' })]
 *       : [],
 *   );
 * };
 * ```
 *
 * Returns the error untargeted when the row or field cannot be resolved, so it still
 * surfaces on the container rather than vanishing.
 */
export function rowError(ctx: FieldContext<unknown>, index: number, key: string, error: RowErrorSpec): ValidationError {
  // A `FieldTree` over an array is indexable by row and then by child key, but the
  // public type does not model that traversal — hence the single cast, kept here rather
  // than in every config that needs a per-row rule.
  const rows = ctx.fieldTree as unknown as Record<number, Record<string, unknown> | undefined> | undefined;
  const fieldTree = rows?.[index]?.[key];

  return fieldTree ? ({ ...error, fieldTree } as unknown as ValidationError) : (error as unknown as ValidationError);
}
