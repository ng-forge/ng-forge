import { DynamicText } from '@ng-forge/dynamic-forms';
import { TextareaField, TextareaProps } from '@ng-forge/dynamic-forms/integration';

export interface NativeTextareaProps extends TextareaProps {
  hint?: DynamicText;
}

export type NativeTextareaField = TextareaField<NativeTextareaProps>;
