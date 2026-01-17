import { FormConfig, InferFormValue, NarrowFields, RegisteredFieldTypes } from '@ng-forge/dynamic-forms';

/**
 * Ionic-specific props that can be set at form level and cascade to all fields.
 *
 * These props override library-level defaults (from `withIonicFields()`) but are
 * overridden by field-level props.
 *
 * The cascade hierarchy is: Library-level → Form-level → Field-level
 *
 * @remarks
 * These are the same properties available in `IonicConfig` when using `withIonicFields()`.
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
export interface IonicFormProps {
  /**
   * Default fill style for form inputs
   * @default 'solid'
   */
  fill?: 'solid' | 'outline';

  /**
   * Default shape for form controls
   * @default undefined
   */
  shape?: 'round';

  /**
   * Default label placement for form inputs
   * @default 'start'
   */
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked' | 'floating';

  /**
   * Default color theme for form controls
   * @default 'primary'
   */
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark';

  /**
   * Default size for buttons
   * @default 'default'
   */
  size?: 'small' | 'default' | 'large';

  /**
   * Default expand behavior for buttons
   * @default undefined
   */
  expand?: 'full' | 'block';

  /**
   * Default fill style for buttons (overrides general fill if set)
   * @default 'solid'
   */
  buttonFill?: 'clear' | 'outline' | 'solid' | 'default';

  /**
   * Whether buttons should be strong (bold) by default
   * @default false
   */
  strong?: boolean;
}

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
