import { BaseValueField, DynamicText } from '@ng-forge/dynamic-forms';
import { TextareaMeta } from './textarea-meta';

export interface TextareaProps {
  placeholder?: DynamicText;
  rows?: number;
  cols?: number | undefined;
}

export interface TextareaField<TProps = TextareaProps> extends BaseValueField<TProps, string, TextareaMeta> {
  type: 'textarea';
  maxLength?: number | undefined;
}
