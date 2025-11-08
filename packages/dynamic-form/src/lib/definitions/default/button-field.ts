import { FieldDef } from '../base';
import { FormEvent, FormEventConstructor } from '../../events';

/**
 * Interface for button fields
 */
export interface ButtonField<TProps, TEvent extends FormEvent> extends FieldDef<TProps> {
  event: FormEventConstructor<TEvent>;
}
