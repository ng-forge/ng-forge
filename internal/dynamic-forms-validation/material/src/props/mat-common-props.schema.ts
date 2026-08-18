import { z } from 'zod';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';

/**
 * Material form field appearance options.
 */
export const MatFormFieldAppearanceSchema = z.enum(['fill', 'outline']);

export type MatFormFieldAppearance = z.infer<typeof MatFormFieldAppearanceSchema>;

/**
 * Material subscript sizing options.
 */
export const SubscriptSizingSchema = z.enum(['fixed', 'dynamic']);

export type SubscriptSizing = z.infer<typeof SubscriptSizingSchema>;

/**
 * Material theme palette options.
 */
export const ThemePaletteSchema = z.enum(['primary', 'accent', 'warn']);

export type ThemePalette = z.infer<typeof ThemePaletteSchema>;

/**
 * Label position options for checkboxes, radios, toggles.
 */
export const LabelPositionSchema = z.enum(['before', 'after']);

export type LabelPosition = z.infer<typeof LabelPositionSchema>;

/**
 * Common Material form field props shared across multiple field types.
 */
export const MatFormFieldPropsSchema = z.object({
  /**
   * Form field appearance style.
   */
  appearance: MatFormFieldAppearanceSchema.optional(),

  /**
   * How to size the subscript (hint/error area).
   */
  subscriptSizing: SubscriptSizingSchema.optional(),

  /**
   * Hint text displayed below the field.
   */
  hint: DynamicTextSchema.optional(),
});

/**
 * Common props for ripple-enabled components.
 */
export const RipplePropsSchema = z.object({
  /**
   * Whether to disable the ripple effect.
   */
  disableRipple: z.boolean().optional(),
});

/**
 * Common props for color-themed components.
 */
export const ColorPropsSchema = z.object({
  /**
   * Material theme color.
   */
  color: ThemePaletteSchema.optional(),
});

export type MatFormFieldPropsSchemaType = z.infer<typeof MatFormFieldPropsSchema>;
