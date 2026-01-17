import { FormConfig, InferFormValue, NarrowFields, RegisteredFieldTypes } from '@ng-forge/dynamic-forms';

/**
 * PrimeNG-specific props that can be set at form level and cascade to all fields.
 *
 * These props override library-level defaults (from `withPrimeNGFields()`) but are
 * overridden by field-level props.
 *
 * The cascade hierarchy is: Library-level → Form-level → Field-level
 *
 * @remarks
 * These are the same properties available in `PrimeNGConfig` when using `withPrimeNGFields()`.
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
export interface PrimeFormProps {
  /**
   * Default size variant for form inputs
   * @default undefined
   */
  size?: 'small' | 'large';

  /**
   * Default visual variant for form inputs
   * @default 'outlined'
   */
  variant?: 'outlined' | 'filled';

  /**
   * Default severity for buttons
   * @default 'primary'
   */
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast';

  /**
   * Whether buttons should be text-only by default
   * @default false
   */
  text?: boolean;

  /**
   * Whether buttons should be outlined by default
   * @default false
   */
  outlined?: boolean;

  /**
   * Whether buttons should be raised by default
   * @default false
   */
  raised?: boolean;

  /**
   * Whether buttons should be rounded by default
   * @default false
   */
  rounded?: boolean;
}

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
