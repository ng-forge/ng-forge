import { FieldDef } from '../base';

/**
 * Interface for submit button field fields
 */
export interface SubmitField<TProps extends Record<string, unknown>> extends FieldDef<TProps> {
  type: 'submit';
}
