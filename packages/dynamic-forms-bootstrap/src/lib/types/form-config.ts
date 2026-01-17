import { FormConfig, InferFormValue, NarrowFields, RegisteredFieldTypes } from '@ng-forge/dynamic-forms';

/**
 * Bootstrap-specific props that can be set at form level and cascade to all fields.
 *
 * These props override library-level defaults but are overridden by field-level props.
 * The cascade hierarchy is: Library-level → Form-level → Field-level
 */
export interface BsFormProps {
  /** Input size (sm for small, lg for large) */
  size?: 'sm' | 'lg';
  /** Whether to use floating labels */
  floatingLabel?: boolean;
}

/**
 * Bootstrap-specific FormConfig with type-safe defaultProps.
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
export type BsFormConfig<
  TFields extends NarrowFields | RegisteredFieldTypes[] = RegisteredFieldTypes[],
  TValue = InferFormValue<TFields extends readonly RegisteredFieldTypes[] ? TFields : RegisteredFieldTypes[]>,
> = FormConfig<TFields, TValue, BsFormProps>;
