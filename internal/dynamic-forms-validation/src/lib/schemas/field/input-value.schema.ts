import { z } from 'zod';

/** An input's initial value: a number with `props.type: 'number'`, a string otherwise. */
export const InputValueSchema = z.union([z.string(), z.number()]).nullable().optional();

/**
 * Ties an input's value to its `props.type`, as `InputField` does: a number only with
 * `props.type: 'number'`, a string only without it. Other field types are unaffected.
 */
export const inputValueTypeRefine: (data: unknown, ctx: z.RefinementCtx) => void = (data, ctx) => {
  if (!data || typeof data !== 'object') return;
  const field = data as { type?: unknown; value?: unknown; props?: { type?: unknown } };
  if (field.type !== 'input') return;
  const numeric = field.props?.type === 'number';
  if (typeof field.value === 'number' && !numeric) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['value'],
      message: "A number value needs `props: { type: 'number' }`. Other input types hold strings.",
    });
  }
  if (typeof field.value === 'string' && numeric) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['value'],
      message: "An input with `props: { type: 'number' }` holds a number, not a string.",
    });
  }
};
