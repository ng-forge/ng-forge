import { ValidationMessages } from '../../models/validation-types';

/**
 * Renders the wrapped field's validation errors, for a leaf or a container.
 *
 * On a container it is the only thing that can render the message — a `group` / `array`
 * has no adapter field component — so it is appended automatically when the container
 * declares `validators`. On a leaf it is opt-in: adding it takes error rendering over
 * from the field component, which suppresses its own via `FIELD_ERROR_DISPLAY`.
 *
 * To restyle it, register a `WrapperTypeDefinition` with the same
 * `wrapperName: 'field-errors'` — the later registration wins, so an adapter or an app
 * can swap in its own component without touching config.
 */
export interface FieldErrorsWrapper {
  readonly type: 'field-errors';

  /** Messages keyed by error `kind`. Containers forward their own `validationMessages`. */
  readonly validationMessages?: ValidationMessages;
}
