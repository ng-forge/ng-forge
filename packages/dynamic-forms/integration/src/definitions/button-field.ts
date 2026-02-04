import { FieldDef, FormEvent, FormEventConstructor, StateLogicConfig } from '@ng-forge/dynamic-forms';

/**
 * Event arguments that can contain static values or tokens to be resolved at runtime.
 * Tokens supported: $key, $index, $arrayKey, $template, formValue
 *
 * Used by the generic button type when manually configuring events.
 */
export type EventArgs = readonly (string | number | boolean | null | undefined)[];

/**
 * Base interface for button fields.
 *
 * This is used by the generic 'button' type which requires explicit event configuration.
 * For specific button types (submit, next, previous, array buttons), use the
 * pre-configured types from the UI library instead.
 */
export interface ButtonField<TProps, TEvent extends FormEvent> extends FieldDef<TProps> {
  type: 'button';
  event: FormEventConstructor<TEvent>;
  /**
   * Optional arguments to pass to the event constructor.
   * Can contain special tokens that will be resolved at runtime:
   * - $key: The current field key
   * - $index: The array index (if inside an array field)
   * - $arrayKey: The parent array field key (if inside an array field)
   * - $template: The template for array item creation (for array add buttons)
   * - formValue: Access to the current form value for indexing
   *
   * @example
   * eventArgs: ['$arrayKey', '$index']
   * eventArgs: ['contacts', 0]
   */
  eventArgs?: EventArgs;
  /** Logic rules for dynamic disabled state (overrides form-level defaults) */
  logic?: StateLogicConfig[];
}
