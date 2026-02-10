import { WithInputSignals } from '../../models/component-type';
import { Prettify } from '../../models/prettify';
import { DynamicText } from '../../models/types/dynamic-text';
import { FieldMeta } from './field-meta';

/**
 * Base interface for all dynamic form field definitions.
 *
 * This interface defines the common properties that all field types must implement.
 * Field-specific properties are defined through the generic TProps parameter,
 * providing type safety for field-specific configuration.
 *
 * @example
 * ```typescript
 * // Basic text input field
 * const textField: FieldDef<{ placeholder: string }> = {
 *   key: 'email',
 *   type: 'input',
 *   label: 'Email Address',
 *   props: { placeholder: 'Enter your email' },
 *   col: 12
 * };
 * ```
 *
 * @example
 * ```typescript
 * // Complex field with conditional logic
 * const conditionalField: FieldDef<SelectProps> = {
 *   key: 'country',
 *   type: 'select',
 *   label: 'Country',
 *   props: {
 *     options: [
 *       { label: 'United States', value: 'us' },
 *       { label: 'Canada', value: 'ca' }
 *     ]
 *   },
 *   hidden: false,
 *   disabled: false,
 *   col: 6
 * };
 * ```
 *
 * @typeParam TProps - Field-specific properties interface
 * @typeParam TMeta - Native HTML attributes interface (extends FieldMeta)
 *
 * @public
 */
export interface FieldDef<TProps, TMeta extends FieldMeta = FieldMeta> {
  /**
   * Unique field identifier used for form binding and value tracking.
   *
   * This key is used to associate the field with form values and must be
   * unique within the form. It follows object property naming conventions.
   *
   * @example
   * ```typescript
   * // Simple field key
   * key: 'email'
   *
   * // Nested object notation
   * key: 'address.street'
   *
   * // Array notation
   * key: 'hobbies[0]'
   * ```
   */
  key: string;

  /**
   * Field type identifier for component selection.
   *
   * Determines which component will be rendered for this field.
   * Must match a registered field type name in the field registry.
   *
   * @example
   * ```typescript
   * type: 'input'     // Text input field
   * type: 'select'    // Dropdown selection
   * type: 'checkbox'  // Boolean checkbox
   * type: 'group'     // Field group container
   * ```
   */
  type: string;

  /**
   * Human-readable field label displayed to users.
   *
   * Provides accessible labeling for form fields and is typically
   * displayed above or beside the field input. Supports static strings,
   * translation keys, Observables, and Signals for dynamic content.
   *
   * @example
   * ```typescript
   * // Static string
   * label: 'Email Address'
   *
   * // Translation key (auto-detected)
   * label: 'form.email.label'
   *
   * // Observable from translation service
   * label: this.transloco.selectTranslate('form.email.label')
   *
   * // Signal-based
   * label: computed(() => this.translations().email.label)
   * ```
   */
  label?: DynamicText;

  /**
   * Field-specific properties and configuration options.
   *
   * Contains type-specific configuration that varies based on the field type.
   * The shape is defined by the TProps generic parameter.
   *
   * @example
   * ```typescript
   * // Input field props
   * props: { placeholder: 'Enter email', type: 'email' }
   *
   * // Select field props
   * props: { options: [{ label: 'Yes', value: true }], multiple: false }
   *
   * // Button field props
   * props: { buttonType: 'submit', variant: 'primary' }
   * ```
   */
  props?: TProps;

  /**
   * Native HTML attributes to pass through to the underlying element.
   *
   * Contains attributes that are applied directly to the native input/element.
   * Useful for accessibility, autocomplete hints, and custom attributes.
   * The shape is defined by the TMeta generic parameter, which extends FieldMeta.
   *
   * @example
   * ```typescript
   * // Input field meta
   * meta: {
   *   autocomplete: 'email',
   *   inputmode: 'email',
   *   'aria-describedby': 'email-help',
   *   'data-testid': 'email-input'
   * }
   *
   * // Textarea meta
   * meta: {
   *   wrap: 'soft',
   *   spellcheck: true,
   *   'aria-label': 'Description field'
   * }
   * ```
   */
  meta?: TMeta;

  /**
   * Additional CSS classes for custom styling.
   *
   * Space-separated string of CSS class names that will be applied
   * to the field container for custom styling.
   *
   * @example
   * ```typescript
   * className: 'highlight required-field'
   * className: 'mt-4 text-center'
   * ```
   */
  className?: string;

  /**
   * Whether the field is disabled and cannot be interacted with.
   *
   * When true, the field is rendered in a disabled state and cannot
   * receive user input. The value can still be modified programmatically.
   *
   * @value false
   */
  disabled?: boolean;

  /**
   * Whether the field is read-only.
   *
   * When true, the field displays its value but cannot be modified
   * by user interaction. Differs from disabled in styling and accessibility.
   *
   * @value false
   */
  readonly?: boolean;

  /**
   * Whether the field is hidden from view.
   *
   * When true, the field is not rendered in the UI but still participates
   * in form state and validation. Useful for conditional field display.
   *
   * @value false
   */
  hidden?: boolean;

  /**
   * Tab index for keyboard navigation.
   *
   * Controls the order in which fields receive focus when navigating
   * with the Tab key. Follows standard HTML tabindex behavior.
   *
   * @example
   * ```typescript
   * tabIndex: 1    // First field in tab order
   * tabIndex: -1   // Excluded from tab navigation
   * tabIndex: 0    // Natural tab order
   * ```
   */
  tabIndex?: number | undefined;

  /**
   * Whether to exclude this field's value from submission output when hidden.
   *
   * Overrides both the global `withValueExclusionDefaults()` and form-level `FormOptions` settings.
   *
   * @default undefined (uses form-level or global setting)
   */
  excludeValueIfHidden?: boolean;

  /**
   * Whether to exclude this field's value from submission output when disabled.
   *
   * Overrides both the global `withValueExclusionDefaults()` and form-level `FormOptions` settings.
   *
   * @default undefined (uses form-level or global setting)
   */
  excludeValueIfDisabled?: boolean;

  /**
   * Whether to exclude this field's value from submission output when readonly.
   *
   * Overrides both the global `withValueExclusionDefaults()` and form-level `FormOptions` settings.
   *
   * @default undefined (uses form-level or global setting)
   */
  excludeValueIfReadonly?: boolean;

  /**
   * Column sizing configuration for responsive grid layout.
   *
   * Specifies how many columns this field should span in a 12-column
   * grid system. Supports responsive behavior and field arrangement.
   *
   * @example
   * ```typescript
   * col: 12  // Full width
   * col: 6   // Half width
   * col: 4   // One third width
   * col: 3   // Quarter width
   * ```
   *
   * @value 12
   */
  col?: number;
}

type IncludedKeys = 'label' | 'className' | 'hidden' | 'tabIndex';

/**
 * Type utility for extracting component input properties from field definitions.
 *
 * Transforms field definition properties into Angular component input signals,
 * enabling type-safe component binding with automatic signal creation.
 *
 * @example
 * ```typescript
 * // Field definition
 * interface MyFieldDef extends FieldDef<MyProps> {
 *   customProp: string;
 * }
 *
 * // Component using FieldComponent type
 * @Component({...})
 * export class MyFieldComponent implements FieldComponent<MyFieldDef> {
 *   label = input<string>();
 *   className = input<string>();
 *   hidden = input<boolean>();
 *   tabIndex = input<number>();
 * }
 * ```
 *
 * @typeParam T - Field definition type to extract properties from
 *
 * @public
 */
export type FieldComponent<T extends FieldDef<unknown, FieldMeta>> = Prettify<WithInputSignals<Pick<T, IncludedKeys>>>;
