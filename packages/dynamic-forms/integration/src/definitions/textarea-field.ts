import { BaseValueField, DynamicText } from '@ng-forge/dynamic-forms';
import { TextareaMeta } from './textarea-meta';

export interface TextareaProps {
  placeholder?: DynamicText;
  rows?: number;
  cols?: number | undefined;
}

export interface TextareaField<TProps = TextareaProps, TNullable extends boolean = boolean> extends BaseValueField<
  TProps,
  string,
  TextareaMeta,
  TNullable
> {
  type: 'textarea';
  maxLength?: number | undefined;
}
