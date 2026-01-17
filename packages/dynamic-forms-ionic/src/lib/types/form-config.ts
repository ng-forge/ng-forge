import { FormConfig, InferFormValue, NarrowFields, RegisteredFieldTypes } from '@ng-forge/dynamic-forms';

/**
 * Ionic-specific props that can be set at form level and cascade to all fields.
 *
 * These props override library-level defaults but are overridden by field-level props.
 * The cascade hierarchy is: Library-level → Form-level → Field-level
 */
export interface IonicFormProps {
  /** Input fill style (solid or outline) */
  fill?: 'solid' | 'outline';
  /** Input shape (round for rounded corners) */
  shape?: 'round';
  /** Label placement position */
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked' | 'floating';
  /** Theme color */
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark';
}

/**
 * Ionic-specific FormConfig with type-safe defaultProps.
 *
 * @example
 * ```typescript
 * const config: IonicFormConfig = {
 *   defaultProps: {
 *     fill: 'outline',
 *     labelPlacement: 'floating',
 *   },
 *   fields: [
 *     { type: 'ionic-input', key: 'name', label: 'Name' },
 *   ],
 * };
 * ```
 */
export type IonicFormConfig<
  TFields extends NarrowFields | RegisteredFieldTypes[] = RegisteredFieldTypes[],
  TValue = InferFormValue<TFields extends readonly RegisteredFieldTypes[] ? TFields : RegisteredFieldTypes[]>,
> = FormConfig<TFields, TValue, IonicFormProps>;
