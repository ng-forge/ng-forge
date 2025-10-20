import { FieldConfig } from '@ng-forge/dynamic-form';
import { MatSubmitProps } from './mat-submit.type';

export function submitButton<TModel = unknown>(options: Partial<MatSubmitProps> = {}): FieldConfig<TModel> {
  return {
    type: 'submit',
    props: {
      label: options.label || 'Submit',
      color: options.color || 'primary',
      disabled: options.disabled || false,
      className: options.className || '',
      ...options,
    },
  } as FieldConfig<TModel>;
}
