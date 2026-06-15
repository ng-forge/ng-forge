import {
  AppendArrayItemEvent,
  ArrayAllowedChildren,
  FieldComponent,
  FormEvent,
  FormSubmitEvent,
  InsertArrayItemEvent,
  NextPageEvent,
  PopArrayItemEvent,
  PrependArrayItemEvent,
  PreviousPageEvent,
  RemoveAtIndexEvent,
  ShiftArrayItemEvent,
} from '@ng-forge/dynamic-forms';
import { ButtonField } from '@ng-forge/dynamic-forms/integration';

export interface IonicButtonProps {
  expand?: 'full' | 'block';
  fill?: 'clear' | 'outline' | 'solid' | 'default';
  shape?: 'round';
  size?: 'small' | 'default' | 'large';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark';
  strong?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export type IonicButtonField<TEvent extends FormEvent> = ButtonField<IonicButtonProps, TEvent>;
/** @deprecated Scheduled for removal in 0.11.0. Use `injectNgForgeAction<TEvent>()` for typed access to a button component's action directive instance. */
export type IonicButtonComponent<TEvent extends FormEvent> = FieldComponent<IonicButtonField<TEvent>>;

/** Specific button field types with preconfigured events */

/** Submit button field - automatically disabled when form is invalid */
export type IonicSubmitButtonField = Omit<IonicButtonField<FormSubmitEvent>, 'event' | 'type' | 'eventArgs'> & {
  type: 'submit';
};

/** Next page button field - with preconfigured NextPageEvent */
export type IonicNextButtonField = Omit<IonicButtonField<NextPageEvent>, 'event' | 'type' | 'eventArgs'> & {
  type: 'next';
};

/** Previous page button field - with preconfigured PreviousPageEvent */
export type IonicPreviousButtonField = Omit<IonicButtonField<PreviousPageEvent>, 'event' | 'type' | 'eventArgs'> & {
  type: 'previous';
};

/** Add array item button field - dispatches AppendArrayItemEvent */
export type IonicAddArrayItemButtonField = Omit<IonicButtonField<AppendArrayItemEvent>, 'event' | 'type' | 'eventArgs'> & {
  type: 'add-array-item' | 'addArrayItem';
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
export type IonicPrependArrayItemButtonField = Omit<IonicButtonField<PrependArrayItemEvent>, 'event' | 'type' | 'eventArgs'> & {
  type: 'prepend-array-item' | 'prependArrayItem';
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
export type IonicInsertArrayItemButtonField = Omit<IonicButtonField<InsertArrayItemEvent>, 'event' | 'type' | 'eventArgs'> & {
  type: 'insert-array-item' | 'insertArrayItem';
  /**
   * The key of the array field to insert items into.
   * Required when the button is placed outside the array.
   * When inside an array, this is automatically determined from context.
   */
  arrayKey?: string;
  /** The index at which to insert the new item. */
  index: number;
  /**
   * Template for the new array item. REQUIRED.
   * - Single field (ArrayAllowedChildren): Creates a primitive item (field's value is extracted directly)
   * - Array of fields (ArrayAllowedChildren[]): Creates an object item (fields merged into object)
   */
  template: ArrayAllowedChildren | readonly ArrayAllowedChildren[];
};

/** Remove array item button field - dispatches RemoveAtIndexEvent or PopArrayItemEvent */
export type IonicRemoveArrayItemButtonField = Omit<IonicButtonField<RemoveAtIndexEvent>, 'event' | 'type' | 'eventArgs'> & {
  type: 'remove-array-item' | 'removeArrayItem';
  /**
   * The key of the array field to remove items from.
   * Required when the button is placed outside the array.
   * When inside an array, this is automatically determined from context.
   */
  arrayKey?: string;
};

/** Pop array item button field - dispatches PopArrayItemEvent (removes last item) */
export type IonicPopArrayItemButtonField = Omit<IonicButtonField<PopArrayItemEvent>, 'event' | 'type' | 'eventArgs'> & {
  type: 'pop-array-item' | 'popArrayItem';
  /**
   * The key of the array field to remove the last item from.
   * REQUIRED - must specify which array to pop from.
   */
  arrayKey: string;
};

/** Shift array item button field - dispatches ShiftArrayItemEvent (removes first item) */
export type IonicShiftArrayItemButtonField = Omit<IonicButtonField<ShiftArrayItemEvent>, 'event' | 'type' | 'eventArgs'> & {
  type: 'shift-array-item' | 'shiftArrayItem';
  /**
   * The key of the array field to remove the first item from.
   * REQUIRED - must specify which array to shift from.
   */
  arrayKey: string;
};
