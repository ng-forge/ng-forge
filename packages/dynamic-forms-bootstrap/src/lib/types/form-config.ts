import { FormConfig, InferFormValue, NarrowFields, RegisteredFieldTypes } from '@ng-forge/dynamic-forms';
import { BootstrapConfig } from '../models/bootstrap-config';

/**
 * Bootstrap-specific props that can be set at form level and cascade to all fields.
 *
 * This is the same type as `BootstrapConfig` used in `withBootstrapFields()`.
 * Using a single type ensures consistency between library-level and form-level configuration.
 *
 * The cascade hierarchy is: Library-level → Form-level → Field-level
 *
 * @example
 * ```typescript
 * const config: BsFormConfig = {
 *   defaultProps: {
 *     size: 'sm',
 *     floatingLabel: true,
 *   },
 *   fields: [
 *     { type: 'bs-input', key: 'name', label: 'Name' },
 *   ],
 * };
 * ```
 */
export type BsFormProps = BootstrapConfig;

/**
 * Bootstrap-specific FormConfig with type-safe defaultProps.
 *
 * Use this type alias when defining form configurations with Bootstrap components
 * to get IDE autocomplete and type checking for `defaultProps`.
 *
 * @example
 * ```typescript
 * const formConfig: BsFormConfig = {
 *   defaultProps: {
 *     size: 'sm',
 *     floatingLabel: true,
 *     variant: 'primary',
 *   },
 *   fields: [
 *     { type: 'bs-input', key: 'name', label: 'Name' },  // Uses form defaultProps
 *     { type: 'bs-input', key: 'email', props: { size: 'lg' } },  // Override
 *   ],
 * };
 * ```
 */
export type BsFormConfig<
  TFields extends NarrowFields | RegisteredFieldTypes[] = RegisteredFieldTypes[],
  TValue = InferFormValue<TFields extends readonly RegisteredFieldTypes[] ? TFields : RegisteredFieldTypes[]>,
> = FormConfig<TFields, TValue, BsFormProps>;
