import { FormConfig, InferFormValue, NarrowFields, RegisteredFieldTypes } from '@ng-forge/dynamic-forms';
import { IonicConfig } from '../models/ionic-config';

/**
 * Ionic-specific props that can be set at form level and cascade to all fields.
 *
 * This is the same type as `IonicConfig` used in `withIonicFields()`.
 * Using a single type ensures consistency between library-level and form-level configuration.
 *
 * The cascade hierarchy is: Library-level → Form-level → Field-level
 *
 * @example
 * ```typescript
 * const config: IonicFormConfig = {
 *   defaultProps: {
 *     fill: 'outline',
 *     labelPlacement: 'floating',
 *     color: 'tertiary',
 *   },
 *   fields: [
 *     { type: 'ionic-input', key: 'name', label: 'Name' },
 *   ],
 * };
 * ```
 */
export type IonicFormProps = IonicConfig;

/**
 * Ionic-specific FormConfig with type-safe defaultProps.
 *
 * Use this type alias when defining form configurations with Ionic components
 * to get IDE autocomplete and type checking for `defaultProps`.
 *
 * @example
 * ```typescript
 * const formConfig: IonicFormConfig = {
 *   defaultProps: {
 *     fill: 'outline',
 *     labelPlacement: 'floating',
 *     color: 'primary',
 *   },
 *   fields: [
 *     { type: 'ionic-input', key: 'name', label: 'Name' },  // Uses form defaultProps
 *     { type: 'ionic-input', key: 'email', props: { fill: 'solid' } },  // Override
 *   ],
 * };
 * ```
 */
export type IonicFormConfig<
  TFields extends NarrowFields | RegisteredFieldTypes[] = RegisteredFieldTypes[],
  TValue = InferFormValue<TFields extends readonly RegisteredFieldTypes[] ? TFields : RegisteredFieldTypes[]>,
> = FormConfig<TFields, TValue, IonicFormProps>;
