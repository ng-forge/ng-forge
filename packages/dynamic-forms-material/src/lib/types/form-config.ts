import { FormConfig, NarrowFields, RegisteredFieldTypes, InferFormValue } from '@ng-forge/dynamic-forms';
import type { MatFormFieldAppearance, SubscriptSizing } from '@angular/material/form-field';
import type { ThemePalette } from '@angular/material/core';

/**
 * Material-specific props that can be set at form level and cascade to all fields.
 *
 * These props override library-level defaults but are overridden by field-level props.
 * The cascade hierarchy is: Library-level → Form-level → Field-level
 */
export interface MatFormProps {
  /** Form field appearance (fill or outline) */
  appearance?: MatFormFieldAppearance;
  /** How to size the subscript area (fixed or dynamic) */
  subscriptSizing?: SubscriptSizing;
  /** Theme color for form controls */
  color?: ThemePalette;
  /** Whether to disable ripple effects */
  disableRipple?: boolean;
}

/**
 * Material-specific FormConfig with type-safe defaultProps.
 *
 * @example
 * ```typescript
 * const config: MatFormConfig = {
 *   defaultProps: {
 *     appearance: 'outline',
 *     subscriptSizing: 'dynamic',
 *   },
 *   fields: [
 *     { type: 'mat-input', key: 'name', label: 'Name' },
 *   ],
 * };
 * ```
 */
export type MatFormConfig<
  TFields extends NarrowFields | RegisteredFieldTypes[] = RegisteredFieldTypes[],
  TValue = InferFormValue<TFields extends readonly RegisteredFieldTypes[] ? TFields : RegisteredFieldTypes[]>,
> = FormConfig<TFields, TValue, MatFormProps>;
