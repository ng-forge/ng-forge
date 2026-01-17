import { FormConfig, InferFormValue, NarrowFields, RegisteredFieldTypes } from '@ng-forge/dynamic-forms';
import { PrimeNGConfig } from '../models/primeng-config';

/**
 * PrimeNG-specific props that can be set at form level and cascade to all fields.
 *
 * This is the same type as `PrimeNGConfig` used in `withPrimeNGFields()`.
 * Using a single type ensures consistency between library-level and form-level configuration.
 *
 * The cascade hierarchy is: Library-level → Form-level → Field-level
 *
 * @example
 * ```typescript
 * const config: PrimeFormConfig = {
 *   defaultProps: {
 *     size: 'small',
 *     variant: 'filled',
 *   },
 *   fields: [
 *     { type: 'prime-input', key: 'name', label: 'Name' },
 *   ],
 * };
 * ```
 */
export type PrimeFormProps = PrimeNGConfig;

/**
 * PrimeNG-specific FormConfig with type-safe defaultProps.
 *
 * Use this type alias when defining form configurations with PrimeNG components
 * to get IDE autocomplete and type checking for `defaultProps`.
 *
 * @example
 * ```typescript
 * const formConfig: PrimeFormConfig = {
 *   defaultProps: {
 *     size: 'small',
 *     variant: 'filled',
 *     severity: 'secondary',
 *   },
 *   fields: [
 *     { type: 'prime-input', key: 'name', label: 'Name' },  // Uses form defaultProps
 *     { type: 'prime-input', key: 'email', props: { variant: 'outlined' } },  // Override
 *   ],
 * };
 * ```
 */
export type PrimeFormConfig<
  TFields extends NarrowFields | RegisteredFieldTypes[] = RegisteredFieldTypes[],
  TValue = InferFormValue<TFields extends readonly RegisteredFieldTypes[] ? TFields : RegisteredFieldTypes[]>,
> = FormConfig<TFields, TValue, PrimeFormProps>;
