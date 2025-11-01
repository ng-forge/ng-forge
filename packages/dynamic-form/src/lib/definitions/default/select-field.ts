import { BaseValueField } from '../base';
import { FieldOption } from '../../models/field-option';

/**
 * Interface for select field fields
 */
export interface SelectField<T, TProps extends Record<string, unknown>> extends BaseValueField<TProps, T> {
  type: 'select';

  options: FieldOption<T>[];
}
