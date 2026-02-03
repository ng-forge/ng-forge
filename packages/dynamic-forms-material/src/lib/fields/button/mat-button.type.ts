import { ArrayAllowedChildren, FieldComponent, FieldDef, FormEvent, LogicConfig } from '@ng-forge/dynamic-forms';
import { ButtonField } from '@ng-forge/dynamic-forms/integration';

export interface MatButtonProps {
  color?: 'primary' | 'accent' | 'warn';
  type?: 'button' | 'submit' | 'reset';
}

export type MatButtonField<TEvent extends FormEvent> = ButtonField<MatButtonProps, TEvent>;
export type MatButtonComponent<TEvent extends FormEvent> = FieldComponent<MatButtonField<TEvent>>;

/**
 * Specific button field types with preconfigured events
 */

/** Submit button field - automatically disabled when form is invalid */
export interface MatSubmitButtonField extends Omit<FieldDef<MatButtonProps>, 'event'> {
  type: 'submit';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: MatButtonProps;
  /** Logic rules for dynamic disabled state (overrides form-level defaults) */
  logic?: LogicConfig[];
}

/** Next page button field - with preconfigured NextPageEvent */
export interface MatNextButtonField extends Omit<FieldDef<MatButtonProps>, 'event'> {
  type: 'next';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: MatButtonProps;
  /** Logic rules for dynamic disabled state (overrides form-level defaults) */
  logic?: LogicConfig[];
}

/** Previous page button field - with preconfigured PreviousPageEvent */
export interface MatPreviousButtonField extends Omit<FieldDef<MatButtonProps>, 'event'> {
  type: 'previous';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: MatButtonProps;
}

/** Add array item button field - dispatches AppendArrayItemEvent */
export interface AddArrayItemButtonField extends Omit<FieldDef<MatButtonProps>, 'event'> {
  type: 'addArrayItem';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: MatButtonProps;
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
export interface PrependArrayItemButtonField extends Omit<FieldDef<MatButtonProps>, 'event'> {
  type: 'prependArrayItem';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: MatButtonProps;
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
export interface InsertArrayItemButtonField extends Omit<FieldDef<MatButtonProps>, 'event'> {
  type: 'insertArrayItem';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: MatButtonProps;
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
export interface RemoveArrayItemButtonField extends Omit<FieldDef<MatButtonProps>, 'event'> {
  type: 'removeArrayItem';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: MatButtonProps;
  /**
   * The key of the array field to remove items from.
   * Required when the button is placed outside the array.
   * When inside an array, this is automatically determined from context.
   */
  arrayKey?: string;
}

/** Pop array item button field - dispatches PopArrayItemEvent (removes last item) */
export interface PopArrayItemButtonField extends Omit<FieldDef<MatButtonProps>, 'event'> {
  type: 'popArrayItem';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: MatButtonProps;
  /**
   * The key of the array field to remove the last item from.
   * REQUIRED - must specify which array to pop from.
   */
  arrayKey: string;
}

/** Shift array item button field - dispatches ShiftArrayItemEvent (removes first item) */
export interface ShiftArrayItemButtonField extends Omit<FieldDef<MatButtonProps>, 'event'> {
  type: 'shiftArrayItem';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: MatButtonProps;
  /**
   * The key of the array field to remove the first item from.
   * REQUIRED - must specify which array to shift from.
   */
  arrayKey: string;
}
