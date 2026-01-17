import { FormConfig, InferFormValue, NarrowFields, RegisteredFieldTypes } from '@ng-forge/dynamic-forms';

/**
 * PrimeNG-specific props that can be set at form level and cascade to all fields.
 *
 * These props override library-level defaults but are overridden by field-level props.
 * The cascade hierarchy is: Library-level → Form-level → Field-level
 */
export interface PrimeFormProps {
  /** Input size (small or large) */
  size?: 'small' | 'large';
  /** Input variant (outlined or filled) */
  variant?: 'outlined' | 'filled';
}

/**
 * PrimeNG-specific FormConfig with type-safe defaultProps.
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
export type PrimeFormConfig<
  TFields extends NarrowFields | RegisteredFieldTypes[] = RegisteredFieldTypes[],
  TValue = InferFormValue<TFields extends readonly RegisteredFieldTypes[] ? TFields : RegisteredFieldTypes[]>,
> = FormConfig<TFields, TValue, PrimeFormProps>;
