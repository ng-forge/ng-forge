import { ValidationMessages } from '../../models/validation-types';

/**
 * Renders the validation errors raised by a container's own `validators`
 * (see `ContainerValidation`) as text below the container's content.
 *
 * Containers have no native form element, so there is no adapter field
 * component to render the message. This wrapper fills that gap: it is appended
 * automatically to a `group` / `array` that declares `validators`, and reads
 * the container's own `FieldTree` from `FIELD_SIGNAL_CONTEXT`.
 *
 * To restyle it, register a `WrapperTypeDefinition` with the same
 * `wrapperName: 'container-errors'` — the later registration wins, so an
 * adapter or an app can swap in its own component without touching config.
 */
export interface ContainerErrorsWrapper {
  readonly type: 'container-errors';

  /** Messages keyed by error `kind`, forwarded from the container's `validationMessages`. */
  readonly validationMessages?: ValidationMessages;
}
