import { ButtonField, FieldComponent, FieldDef, FormEvent, LogicConfig } from '@ng-forge/dynamic-forms';

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

/** Add array item button field - with preconfigured AddArrayItemEvent */
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
}

/** Remove array item button field - with preconfigured RemoveArrayItemEvent */
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
