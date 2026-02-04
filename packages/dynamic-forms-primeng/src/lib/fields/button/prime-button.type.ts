import {
  AppendArrayItemEvent,
  ArrayAllowedChildren,
  FieldComponent,
  FormEvent,
  InsertArrayItemEvent,
  NextPageEvent,
  PopArrayItemEvent,
  PrependArrayItemEvent,
  PreviousPageEvent,
  RemoveAtIndexEvent,
  ShiftArrayItemEvent,
} from '@ng-forge/dynamic-forms';
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
export type PrimeSubmitButtonField = Omit<PrimeButtonField<SubmitEvent>, 'event' | 'type' | 'eventArgs'> & {
  type: 'submit';
};

/** Next page button field - with preconfigured NextPageEvent */
export type PrimeNextButtonField = Omit<PrimeButtonField<NextPageEvent>, 'event' | 'type' | 'eventArgs'> & {
  type: 'next';
};

/** Previous page button field - with preconfigured PreviousPageEvent */
export type PrimePreviousButtonField = Omit<PrimeButtonField<PreviousPageEvent>, 'event' | 'type' | 'eventArgs'> & {
  type: 'previous';
};

/** Add array item button field - dispatches AppendArrayItemEvent */
export type AddArrayItemButtonField = Omit<PrimeButtonField<AppendArrayItemEvent>, 'event' | 'type' | 'eventArgs'> & {
  type: 'addArrayItem';
  /**
   * The key of the array field to add items to.
   * Required when the button is placed outside the array.
   * When inside an array, this is automatically determined from context.
   */
  arrayKey?: string;
  /**
   * Template for the new array item. REQUIRED.
   * - Single field (ArrayAllowedChildren): Creates a primitive item (field's value is extracted directly)
   * - Array of fields (ArrayAllowedChildren[]): Creates an object item (fields merged into object)
   */
  template: ArrayAllowedChildren | readonly ArrayAllowedChildren[];
};

/** Prepend array item button field - dispatches PrependArrayItemEvent (adds at beginning) */
export type PrependArrayItemButtonField = Omit<PrimeButtonField<PrependArrayItemEvent>, 'event' | 'type' | 'eventArgs'> & {
  type: 'prependArrayItem';
  /**
   * The key of the array field to prepend items to.
   * Required when the button is placed outside the array.
   * When inside an array, this is automatically determined from context.
   */
  arrayKey?: string;
  /**
   * Template for the new array item. REQUIRED.
   * - Single field (ArrayAllowedChildren): Creates a primitive item (field's value is extracted directly)
   * - Array of fields (ArrayAllowedChildren[]): Creates an object item (fields merged into object)
   */
  template: ArrayAllowedChildren | readonly ArrayAllowedChildren[];
};

/** Insert array item button field - dispatches InsertArrayItemEvent (adds at specific index) */
export type InsertArrayItemButtonField = Omit<PrimeButtonField<InsertArrayItemEvent>, 'event' | 'type' | 'eventArgs'> & {
  type: 'insertArrayItem';
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
   * - Single field (ArrayAllowedChildren): Creates a primitive item (field's value is extracted directly)
   * - Array of fields (ArrayAllowedChildren[]): Creates an object item (fields merged into object)
   */
  template: ArrayAllowedChildren | readonly ArrayAllowedChildren[];
};

/** Remove array item button field - dispatches RemoveAtIndexEvent or PopArrayItemEvent */
export type RemoveArrayItemButtonField = Omit<PrimeButtonField<RemoveAtIndexEvent>, 'event' | 'type' | 'eventArgs'> & {
  type: 'removeArrayItem';
  /**
   * The key of the array field to remove items from.
   * Required when the button is placed outside the array.
   * When inside an array, this is automatically determined from context.
   */
  arrayKey?: string;
};

/** Pop array item button field - dispatches PopArrayItemEvent (removes last item) */
export type PopArrayItemButtonField = Omit<PrimeButtonField<PopArrayItemEvent>, 'event' | 'type' | 'eventArgs'> & {
  type: 'popArrayItem';
  /**
   * The key of the array field to remove the last item from.
   * REQUIRED - must specify which array to pop from.
   */
  arrayKey: string;
};

/** Shift array item button field - dispatches ShiftArrayItemEvent (removes first item) */
export type ShiftArrayItemButtonField = Omit<PrimeButtonField<ShiftArrayItemEvent>, 'event' | 'type' | 'eventArgs'> & {
  type: 'shiftArrayItem';
  /**
   * The key of the array field to remove the first item from.
   * REQUIRED - must specify which array to shift from.
   */
  arrayKey: string;
};
