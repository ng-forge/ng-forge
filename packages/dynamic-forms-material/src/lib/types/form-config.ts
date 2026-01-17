import { FormConfig, NarrowFields, RegisteredFieldTypes, InferFormValue } from '@ng-forge/dynamic-forms';
import type { MatFormFieldAppearance, SubscriptSizing } from '@angular/material/form-field';

/**
 * Material-specific props that can be set at form level and cascade to all fields.
 *
 * These props override library-level defaults (from `withMaterialFields()`) but are
 * overridden by field-level props.
 *
 * The cascade hierarchy is: Library-level → Form-level → Field-level
 *
 * @remarks
 * These are the same properties available in `MaterialConfig` when using `withMaterialFields()`.
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
export interface MatFormProps {
  /**
   * Default appearance for Material form fields
   * @default 'outline'
   */
  appearance?: MatFormFieldAppearance;

  /**
   * Default subscript sizing for Material form fields
   * @default 'dynamic'
   */
  subscriptSizing?: SubscriptSizing;

  /**
   * Whether to disable ripple effects by default
   * @default false
   */
  disableRipple?: boolean;
}

/**
 * Material-specific FormConfig with type-safe defaultProps.
 *
 * Use this type alias when defining form configurations with Material Design components
 * to get IDE autocomplete and type checking for `defaultProps`.
 *
 * @example
 * ```typescript
 * const formConfig: MatFormConfig = {
 *   defaultProps: {
 *     appearance: 'outline',
 *     subscriptSizing: 'dynamic',
 *   },
 *   fields: [
 *     { type: 'mat-input', key: 'name', label: 'Name' },  // Uses form defaultProps
 *     { type: 'mat-input', key: 'email', props: { appearance: 'fill' } },  // Override
 *   ],
 * };
 * ```
 */
export type MatFormConfig<
  TFields extends NarrowFields | RegisteredFieldTypes[] = RegisteredFieldTypes[],
  TValue = InferFormValue<TFields extends readonly RegisteredFieldTypes[] ? TFields : RegisteredFieldTypes[]>,
> = FormConfig<TFields, TValue, MatFormProps>;
