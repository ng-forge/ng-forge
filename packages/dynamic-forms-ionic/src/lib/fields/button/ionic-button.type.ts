import { FieldComponent, FieldDef, FormEvent, LogicConfig } from '@ng-forge/dynamic-forms';
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
export type IonicButtonComponent<TEvent extends FormEvent> = FieldComponent<IonicButtonField<TEvent>>;

/**
 * Specific button field types with preconfigured events
 */

/** Submit button field - automatically disabled when form is invalid */
export interface IonicSubmitButtonField extends Omit<FieldDef<IonicButtonProps>, 'event'> {
  type: 'submit';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: IonicButtonProps;
  /** Logic rules for dynamic disabled state (overrides form-level defaults) */
  logic?: LogicConfig[];
}

/** Next page button field - with preconfigured NextPageEvent */
export interface IonicNextButtonField extends Omit<FieldDef<IonicButtonProps>, 'event'> {
  type: 'next';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: IonicButtonProps;
  /** Logic rules for dynamic disabled state (overrides form-level defaults) */
  logic?: LogicConfig[];
}

/** Previous page button field - with preconfigured PreviousPageEvent */
export interface IonicPreviousButtonField extends Omit<FieldDef<IonicButtonProps>, 'event'> {
  type: 'previous';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: IonicButtonProps;
}

/** Add array item button field - dispatches AppendArrayItemEvent */
export interface AddArrayItemButtonField extends Omit<FieldDef<IonicButtonProps>, 'event'> {
  type: 'addArrayItem';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: IonicButtonProps;
  /**
   * The key of the array field to add items to.
   * Required when the button is placed outside the array.
   * When inside an array, this is automatically determined from context.
   */
  arrayKey?: string;
}

/** Remove array item button field - dispatches RemoveAtIndexEvent or PopArrayItemEvent */
export interface RemoveArrayItemButtonField extends Omit<FieldDef<IonicButtonProps>, 'event'> {
  type: 'removeArrayItem';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: IonicButtonProps;
  /**
   * The key of the array field to remove items from.
   * Required when the button is placed outside the array.
   * When inside an array, this is automatically determined from context.
   */
  arrayKey?: string;
}
