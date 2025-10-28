// import { FieldConfig } from '@ng-forge/dynamic-form';
import { MatSubmitProps } from './mat-submit.type';

export function submitButton(options: Partial<MatSubmitProps> = {}): any {
  return {
    type: 'submit',
    props: {
      label: options.label || 'Submit',
      color: options.color || 'primary',
      disabled: options.disabled || false,
      className: options.className || '',
      ...options,
    },
  } as any;
}
