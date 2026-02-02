import { ArrayAllowedChildren, FieldDef, FormEvent, FormEventConstructor } from '@ng-forge/dynamic-forms';

/**
 * Event arguments that can contain static values or tokens to be resolved at runtime
 * Tokens supported: $key, $index, $arrayKey, $template, formValue
 */
export type EventArgs = readonly (string | number | boolean | null | undefined)[];

/**
 * Interface for button fields
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
   * - $template: The template for array item creation (requires `template` property)
   * - formValue: Access to the current form value for indexing
   *
   * @example
   * eventArgs: ['$arrayKey', '$index']
   * eventArgs: ['contacts', 0]
   * eventArgs: ['$arrayKey', '$template'] // For array events with templates
   */
  eventArgs?: EventArgs;
  /**
   * Template for array item creation events (AppendArrayItemEvent, PrependArrayItemEvent, InsertArrayItemEvent).
   * When provided, enables the $template token in eventArgs.
   *
   * @example
   * template: [{ key: 'name', type: 'input', label: 'Name' }]
   */
  template?: readonly ArrayAllowedChildren[];
}
