import { FormConfig, InferFormValue, NarrowFields, RegisteredFieldTypes } from '@ng-forge/dynamic-forms';

/**
 * Bootstrap-specific props that can be set at form level and cascade to all fields.
 *
 * These props override library-level defaults (from `withBootstrapFields()`) but are
 * overridden by field-level props.
 *
 * The cascade hierarchy is: Library-level → Form-level → Field-level
 *
 * @remarks
 * These are the same properties available in `BootstrapConfig` when using `withBootstrapFields()`.
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
export interface BsFormProps {
  /**
   * Default size for form controls
   * @default undefined
   */
  size?: 'sm' | 'lg';

  /**
   * Whether to use floating labels by default for inputs
   * @default false
   */
  floatingLabel?: boolean;

  /**
   * Default variant for buttons
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link';

  /**
   * Whether buttons should be outlined by default
   * @default false
   */
  outline?: boolean;

  /**
   * Whether buttons should be block-level by default
   * @default false
   */
  block?: boolean;
}

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
