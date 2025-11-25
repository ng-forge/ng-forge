import { ButtonField, FieldComponent, FieldDef, FormEvent } from '@ng-forge/dynamic-forms';

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
}

/** Next page button field - with preconfigured NextPageEvent */
export interface BsNextButtonField extends Omit<FieldDef<BsButtonProps>, 'event'> {
  type: 'next';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: BsButtonProps;
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

/** Add array item button field - with preconfigured AddArrayItemEvent */
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
}

/** Remove array item button field - with preconfigured RemoveArrayItemEvent */
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
