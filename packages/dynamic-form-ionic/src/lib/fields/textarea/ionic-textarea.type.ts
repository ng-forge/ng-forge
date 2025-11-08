import { DynamicText, TextareaField, TextareaProps, ValueFieldComponent } from '@ng-forge/dynamic-form';

export interface IonicTextareaProps extends TextareaProps {
  rows?: number;
  autoGrow?: boolean;
  maxlength?: number;
  counter?: boolean;
  fill?: 'solid' | 'outline';
  shape?: 'round';
  labelPlacement?: 'start' | 'end' | 'fixed' | 'stacked' | 'floating';
  helperText?: DynamicText;
  errorText?: DynamicText;
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark';
}

export type IonicTextareaField = TextareaField<IonicTextareaProps>;

export type IonicTextareaComponent = ValueFieldComponent<IonicTextareaField>;
