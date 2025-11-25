import { ButtonField, FieldComponent, FieldDef, FormEvent, LogicConfig } from '@ng-forge/dynamic-forms';

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
