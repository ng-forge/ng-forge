import { ValidatorConfig } from '../../models/validation';
import { ValidationMessages } from '../../models/validation-types';

/**
 * Tree-level validation for container fields (`group` / `array`).
 *
 * Containers own a schema path, so a validator declared here runs against the
 * container's own subtree: `ctx.value()` is the group's object or the array's
 * item list. That makes cross-field rules expressible on the container they
 * belong to — `dateTo >= dateFrom` over a group's children, or "every row's
 * `to` is not before its `from`" over an array's items.
 *
 * Deliberately narrower than {@link FieldWithValidation}: the value-shaped leaf
 * shorthands (`email`, `pattern`, `min`, …) have no meaning on a subtree, and
 * arrays declare size bounds through their own `minLength`/`maxLength`. The one
 * shorthand that does carry over is `required`, which cascades to descendants
 * rather than validating the container itself.
 *
 * Layout containers (`page`, `row`, `container`) flatten into their parent and
 * have no schema path of their own, so they cannot carry these.
 */
export interface ContainerValidation {
  /**
   * Marks every descendant field as required.
   *
   * This is an inherited default, not a rule on the container itself: it flows
   * down to descendant leaves (through nested groups, rows, and array item
   * templates), and any descendant that declares its own `required` wins —
   * including `required: false`, which opts that field (and, on a nested
   * container, its whole subtree) back out.
   *
   * Gated by `validateWhenHidden` like any other validation, so a hidden
   * container does not make its children required.
   *
   * For "the array must have at least one item", use `minLength` instead.
   */
  readonly required?: boolean;

  /**
   * Validators applied to the container's own schema path.
   *
   * Gated by `validateWhenHidden` exactly like leaf validators: when the
   * container (or an ancestor) is hidden and `validateWhenHidden` is not set,
   * they do not run.
   */
  readonly validators?: ValidatorConfig[];

  /**
   * Messages keyed by error `kind`, resolved for errors raised by
   * {@link validators}.
   *
   * Containers have no native form element, so the message is rendered by the
   * `container-errors` wrapper, which is attached automatically when the
   * container declares `validators`. Register your own wrapper under the same
   * name to restyle it, or set `skipAutoWrappers` to opt out.
   */
  readonly validationMessages?: ValidationMessages;
}
