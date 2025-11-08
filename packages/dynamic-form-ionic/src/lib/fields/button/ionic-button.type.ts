import { ButtonField, FieldComponent, FieldDef, FormEvent } from '@ng-forge/dynamic-form';

export interface IonicButtonProps {
  expand?: 'full' | 'block';
  fill?: 'clear' | 'outline' | 'solid' | 'default';
  shape?: 'round';
  size?: 'small' | 'default' | 'large';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark';
  strong?: boolean;
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
}

/** Next page button field - with preconfigured NextPageEvent */
export interface IonicNextButtonField extends Omit<FieldDef<IonicButtonProps>, 'event'> {
  type: 'next';
  key: string;
  label: string;
  disabled?: boolean;
  className?: string;
  props?: IonicButtonProps;
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
