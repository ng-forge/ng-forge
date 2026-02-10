import { z, ZodTypeAny } from 'zod';
import { DynamicTextSchema } from '../common/dynamic-text.schema';
import { FieldMetaSchema } from './field-meta.schema';

/**
 * Schema for base FieldDef properties shared by all field types.
 *
 * Original interface:
 * ```typescript
 * interface FieldDef<TProps, TMeta extends FieldMeta = FieldMeta> {
 *   key: string;
 *   type: string;
 *   label?: DynamicText;
 *   props?: TProps;
 *   meta?: TMeta;
 *   className?: string;
 *   disabled?: boolean;
 *   readonly?: boolean;
 *   hidden?: boolean;
 *   tabIndex?: number;
 *   col?: number;
 * }
 * ```
 */
export const BaseFieldDefSchema = z.object({
  /**
   * Unique field identifier within the form.
   * Used as the form control name and for targeting in logic expressions.
   */
  key: z.string(),

  /**
   * Field type discriminant.
   * Determines which component renders the field.
   */
  type: z.string(),

  /**
   * Human-readable label displayed next to the field.
   */
  label: DynamicTextSchema.optional(),

  /**
   * Native HTML attributes passed to the field element.
   * Supports data-*, aria-*, and other attributes.
   */
  meta: FieldMetaSchema.optional(),

  /**
   * CSS classes applied to the field wrapper (space-separated).
   */
  className: z.string().optional(),

  /**
   * Whether the field is disabled (non-interactive but visible).
   */
  disabled: z.boolean().optional(),

  /**
   * Whether the field is read-only (displays value but not editable).
   */
  readonly: z.boolean().optional(),

  /**
   * Whether the field is hidden from view.
   */
  hidden: z.boolean().optional(),

  /**
   * Tab order for keyboard navigation.
   */
  tabIndex: z.number().optional(),

  /**
   * Grid column width (1-12) in a 12-column layout system.
   */
  col: z.number().min(1).max(12).optional(),

  /**
   * Whether to exclude this field's value from submission output when hidden.
   * Overrides both the global and form-level settings.
   */
  excludeValueIfHidden: z.boolean().optional(),

  /**
   * Whether to exclude this field's value from submission output when disabled.
   * Overrides both the global and form-level settings.
   */
  excludeValueIfDisabled: z.boolean().optional(),

  /**
   * Whether to exclude this field's value from submission output when readonly.
   * Overrides both the global and form-level settings.
   */
  excludeValueIfReadonly: z.boolean().optional(),
});

/**
 * Creates a field definition schema with custom props.
 *
 * @param propsSchema - Schema for field-specific properties
 * @returns Combined field definition schema
 */
export function createFieldDefSchema<TProps extends ZodTypeAny>(propsSchema: TProps) {
  return BaseFieldDefSchema.extend({
    props: propsSchema.optional(),
  });
}

/**
 * Inferred type for base field definition.
 */
export type BaseFieldDefSchemaType = z.infer<typeof BaseFieldDefSchema>;
