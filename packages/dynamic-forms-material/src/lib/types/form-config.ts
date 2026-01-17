import { FormConfig, NarrowFields, RegisteredFieldTypes, InferFormValue } from '@ng-forge/dynamic-forms';
import { MaterialConfig } from '../models/material-config';

/**
 * Material-specific props that can be set at form level and cascade to all fields.
 *
 * This is the same type as `MaterialConfig` used in `withMaterialFields()`.
 * Using a single type ensures consistency between library-level and form-level configuration.
 *
 * The cascade hierarchy is: Library-level → Form-level → Field-level
 *
 * @example
 * ```typescript
 * const config: MatFormConfig = {
 *   defaultProps: {
 *     appearance: 'outline',
 *     subscriptSizing: 'dynamic',
 *     color: 'accent',
 *   },
 *   fields: [
 *     { type: 'mat-input', key: 'name', label: 'Name' },
 *   ],
 * };
 * ```
 */
export type MatFormProps = MaterialConfig;

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
