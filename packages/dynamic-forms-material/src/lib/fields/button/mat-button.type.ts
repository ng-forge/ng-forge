import { ButtonField, FieldComponent, FieldDef, FormEvent } from '@ng-forge/dynamic-forms';

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
}

/** Next page button field - with preconfigured NextPageEvent */
export interface MatNextButtonField extends Omit<FieldDef<MatButtonProps>, 'event'> {
  type: 'next';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: MatButtonProps;
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

/** Add array item button field - with preconfigured AddArrayItemEvent */
export interface MatAddArrayItemButtonField extends Omit<FieldDef<MatButtonProps>, 'event'> {
  type: 'addArrayItem';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: MatButtonProps;
}

/** Remove array item button field - with preconfigured RemoveArrayItemEvent */
export interface MatRemoveArrayItemButtonField extends Omit<FieldDef<MatButtonProps>, 'event'> {
  type: 'removeArrayItem';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: MatButtonProps;
}
