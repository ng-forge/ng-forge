import { z } from 'zod';

/**
 * Cross-field refinement that enforces the `nullable` contract:
 * `value: null` is only valid when `nullable: true`.
 *
 * Apply via `.superRefine(nullableValueRefine)` on a leaf-field discriminated
 * union. Fields without a `value` or `nullable` property are unaffected.
 *
 * @example
 * ```ts
 * export const MatLeafFieldSchema = z
 *   .discriminatedUnion('type', [MatInputFieldSchema, ...])
 *   .superRefine(nullableValueRefine);
 * ```
 */
export const nullableValueRefine: (data: unknown, ctx: z.RefinementCtx) => void = (data, ctx) => {
  if (!data || typeof data !== 'object') return;
  const field = data as { value?: unknown; nullable?: boolean };
  if (field.value === null && field.nullable !== true) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['value'],
      message: 'value: null is only allowed when nullable is true. Add `nullable: true` or remove the null value.',
    });
  }
};
