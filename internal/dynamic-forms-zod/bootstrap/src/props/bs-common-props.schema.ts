import { z } from 'zod';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';

/**
 * Bootstrap size options for form controls.
 */
export const BsSizeSchema = z.enum(['sm', 'lg']);

export type BsSize = z.infer<typeof BsSizeSchema>;

/**
 * Bootstrap button variants.
 */
export const BsButtonVariantSchema = z.enum(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link']);

export type BsButtonVariant = z.infer<typeof BsButtonVariantSchema>;

/**
 * Common Bootstrap form field props with floating labels and feedback.
 */
export const BsFormFieldPropsSchema = z.object({
  size: BsSizeSchema.optional(),
  floatingLabel: z.boolean().optional(),
  hint: DynamicTextSchema.optional(),
  validFeedback: DynamicTextSchema.optional(),
  invalidFeedback: DynamicTextSchema.optional(),
});

export type BsFormFieldPropsSchemaType = z.infer<typeof BsFormFieldPropsSchema>;
