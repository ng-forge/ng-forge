import { ArrayAllowedChildren, FieldComponent, FieldDef, FormEvent, LogicConfig } from '@ng-forge/dynamic-forms';
import { ButtonField } from '@ng-forge/dynamic-forms/integration';

export interface BsButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link';
  outline?: boolean;
  size?: 'sm' | 'lg';
  block?: boolean;
  active?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export type BsButtonField<TEvent extends FormEvent> = ButtonField<BsButtonProps, TEvent>;
export type BsButtonComponent<TEvent extends FormEvent> = FieldComponent<BsButtonField<TEvent>>;

/**
 * Specific button field types with preconfigured events
 */

/** Submit button field - automatically disabled when form is invalid */
export interface BsSubmitButtonField extends Omit<FieldDef<BsButtonProps>, 'event'> {
  type: 'submit';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: BsButtonProps;
  /** Logic rules for dynamic disabled state (overrides form-level defaults) */
  logic?: LogicConfig[];
}

/** Next page button field - with preconfigured NextPageEvent */
export interface BsNextButtonField extends Omit<FieldDef<BsButtonProps>, 'event'> {
  type: 'next';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: BsButtonProps;
  /** Logic rules for dynamic disabled state (overrides form-level defaults) */
  logic?: LogicConfig[];
}

/** Previous page button field - with preconfigured PreviousPageEvent */
export interface BsPreviousButtonField extends Omit<FieldDef<BsButtonProps>, 'event'> {
  type: 'previous';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: BsButtonProps;
}

/** Add array item button field - dispatches AppendArrayItemEvent */
export interface AddArrayItemButtonField extends Omit<FieldDef<BsButtonProps>, 'event'> {
  type: 'addArrayItem';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: BsButtonProps;
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
export interface PrependArrayItemButtonField extends Omit<FieldDef<BsButtonProps>, 'event'> {
  type: 'prependArrayItem';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: BsButtonProps;
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
export interface InsertArrayItemButtonField extends Omit<FieldDef<BsButtonProps>, 'event'> {
  type: 'insertArrayItem';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: BsButtonProps;
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
export interface RemoveArrayItemButtonField extends Omit<FieldDef<BsButtonProps>, 'event'> {
  type: 'removeArrayItem';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: BsButtonProps;
  /**
   * The key of the array field to remove items from.
   * Required when the button is placed outside the array.
   * When inside an array, this is automatically determined from context.
   */
  arrayKey?: string;
}

/** Pop array item button field - dispatches PopArrayItemEvent (removes last item) */
export interface PopArrayItemButtonField extends Omit<FieldDef<BsButtonProps>, 'event'> {
  type: 'popArrayItem';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: BsButtonProps;
  /**
   * The key of the array field to remove the last item from.
   * REQUIRED - must specify which array to pop from.
   */
  arrayKey: string;
}

/** Shift array item button field - dispatches ShiftArrayItemEvent (removes first item) */
export interface ShiftArrayItemButtonField extends Omit<FieldDef<BsButtonProps>, 'event'> {
  type: 'shiftArrayItem';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: BsButtonProps;
  /**
   * The key of the array field to remove the first item from.
   * REQUIRED - must specify which array to shift from.
   */
  arrayKey: string;
}
