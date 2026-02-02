import { ArrayAllowedChildren, FieldComponent, FieldDef, FormEvent, LogicConfig } from '@ng-forge/dynamic-forms';
import { ButtonField } from '@ng-forge/dynamic-forms/integration';

export interface PrimeButtonProps {
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'help' | 'contrast';
  text?: boolean;
  outlined?: boolean;
  raised?: boolean;
  rounded?: boolean;
  icon?: string;
  iconPos?: 'left' | 'right' | 'top' | 'bottom';
  type?: 'button' | 'submit' | 'reset';
}

export type PrimeButtonField<TEvent extends FormEvent = FormEvent> = ButtonField<PrimeButtonProps, TEvent>;
export type PrimeButtonComponent<TEvent extends FormEvent = FormEvent> = FieldComponent<PrimeButtonField<TEvent>>;

/**
 * Specific button field types with preconfigured events
 */

/** Submit button field - automatically disabled when form is invalid */
export interface PrimeSubmitButtonField extends Omit<FieldDef<PrimeButtonProps>, 'event'> {
  type: 'submit';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: PrimeButtonProps;
  /** Logic rules for dynamic disabled state (overrides form-level defaults) */
  logic?: LogicConfig[];
}

/** Next page button field - with preconfigured NextPageEvent */
export interface PrimeNextButtonField extends Omit<FieldDef<PrimeButtonProps>, 'event'> {
  type: 'next';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: PrimeButtonProps;
  /** Logic rules for dynamic disabled state (overrides form-level defaults) */
  logic?: LogicConfig[];
}

/** Previous page button field - with preconfigured PreviousPageEvent */
export interface PrimePreviousButtonField extends Omit<FieldDef<PrimeButtonProps>, 'event'> {
  type: 'previous';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: PrimeButtonProps;
}

/** Add array item button field - dispatches AppendArrayItemEvent */
export interface AddArrayItemButtonField extends Omit<FieldDef<PrimeButtonProps>, 'event'> {
  type: 'addArrayItem';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: PrimeButtonProps;
  /**
   * The key of the array field to add items to.
   * Required when the button is placed outside the array.
   * When inside an array, this is automatically determined from context.
   */
  arrayKey?: string;
  /**
   * Template for the new array item. REQUIRED.
   * Defines the field structure for new items added to the array.
   */
  template: readonly ArrayAllowedChildren[];
}

/** Prepend array item button field - dispatches PrependArrayItemEvent (adds at beginning) */
export interface PrependArrayItemButtonField extends Omit<FieldDef<PrimeButtonProps>, 'event'> {
  type: 'prependArrayItem';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: PrimeButtonProps;
  /**
   * The key of the array field to prepend items to.
   * Required when the button is placed outside the array.
   * When inside an array, this is automatically determined from context.
   */
  arrayKey?: string;
  /**
   * Template for the new array item. REQUIRED.
   * Defines the field structure for new items added to the array.
   */
  template: readonly ArrayAllowedChildren[];
}

/** Insert array item button field - dispatches InsertArrayItemEvent (adds at specific index) */
export interface InsertArrayItemButtonField extends Omit<FieldDef<PrimeButtonProps>, 'event'> {
  type: 'insertArrayItem';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: PrimeButtonProps;
  /**
   * The key of the array field to insert items into.
   * Required when the button is placed outside the array.
   * When inside an array, this is automatically determined from context.
   */
  arrayKey?: string;
  /**
   * The index at which to insert the new item.
   */
  index: number;
  /**
   * Template for the new array item. REQUIRED.
   * Defines the field structure for new items added to the array.
   */
  template: readonly ArrayAllowedChildren[];
}

/** Remove array item button field - dispatches RemoveAtIndexEvent or PopArrayItemEvent */
export interface RemoveArrayItemButtonField extends Omit<FieldDef<PrimeButtonProps>, 'event'> {
  type: 'removeArrayItem';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: PrimeButtonProps;
  /**
   * The key of the array field to remove items from.
   * Required when the button is placed outside the array.
   * When inside an array, this is automatically determined from context.
   */
  arrayKey?: string;
}
