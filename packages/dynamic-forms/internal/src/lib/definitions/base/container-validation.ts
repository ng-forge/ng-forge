import { ValidatorConfig } from '../../models/validation';
import { ValidationMessages } from '../../models/validation-types';

/**
 * Tree-level validation for container fields (`group` / `array`).
 *
 * A validator here runs against the container's own subtree: `ctx.value()` is the group's
 * object or the array's item list. Layout containers (`page`, `row`, `container`) flatten
 * into their parent and have no schema path, so they are excluded.
 */
export interface ContainerValidation {
  /**
   * Marks every descendant required. An inherited default, not a rule on the container —
   * a descendant's own `required` wins, including `false`. Use `minLength` for array size.
   */
  readonly required?: boolean;

  /** Validators applied to the container's own schema path. Gated by `validateWhenHidden`. */
  readonly validators?: ValidatorConfig[];

  /**
   * Messages keyed by error `kind`. Rendered by the `container-errors` wrapper, attached
   * automatically when the container declares `validators`.
   */
  readonly validationMessages?: ValidationMessages;
}
