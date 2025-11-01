import { FieldDef } from '../base';
import { FormEvent, FormEventConstructor } from '../../events';

/**
 * Interface for button fields
 */
export interface ButtonField<TProps extends Record<string, unknown>, TEvent extends FormEvent> extends FieldDef<TProps> {
  type: 'button';
  event: FormEventConstructor<TEvent>;
}
