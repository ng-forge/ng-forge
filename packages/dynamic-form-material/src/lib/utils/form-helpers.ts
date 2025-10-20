import { FieldConfig } from '@ng-forge/dynamic-form';

export interface MaterialSubmitProps {
  label: string;
  color?: 'primary' | 'accent' | 'warn';
  disabled?: boolean;
  className?: string;
}

/**
 * Helper function to create a submit button field configuration
 */
export function submitButton<TModel = unknown>(
  options: Partial<MaterialSubmitProps> = {}
): FieldConfig<TModel> {
  return {
    type: 'submit',
    props: {
      label: options.label || 'Submit',
      color: options.color || 'primary',
      disabled: options.disabled || false,
      className: options.className || '',
      ...options
    }
  } as FieldConfig<TModel>;
}

/**
 * Helper function to create an action button field configuration
 */
export function actionButton<TModel = unknown>(
  options: Partial<MaterialSubmitProps & { onClick?: () => void }> = {}
): FieldConfig<TModel> {
  return {
    type: 'submit',
    props: {
      label: options.label || 'Action',
      color: options.color || 'primary',
      disabled: options.disabled || false,
      className: options.className || '',
      onClick: options.onClick,
      ...options
    }
  } as FieldConfig<TModel>;
}