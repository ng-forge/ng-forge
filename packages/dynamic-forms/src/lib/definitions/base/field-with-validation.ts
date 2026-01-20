import { ValidatorConfig } from '../../models/validation';
import { LogicConfig } from '../../models/logic';
import { SchemaApplicationConfig } from '../../models/schemas';
import { ValidationMessages } from '../../models/validation-types';

export interface FieldWithValidation {
  // Simple validation rules (for ease of use)
  readonly required?: boolean;
  readonly email?: boolean;
  readonly min?: number;
  readonly max?: number;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly pattern?: string | RegExp;

  // Advanced validation configuration
  readonly validators?: ValidatorConfig[];

  // Custom error messages
  readonly validationMessages?: ValidationMessages;

  // Logic rules (hidden, readonly, disabled, required, derivation)
  readonly logic?: LogicConfig[];

  /**
   * Shorthand for simple computed/derived fields.
   *
   * The expression is evaluated whenever its dependencies change,
   * and the result is set as this field's value.
   *
   * Has access to `formValue` object containing all form values.
   * Uses the same secure AST-based parser as other expressions.
   *
   * For conditional derivations or derivations targeting other fields,
   * use the full `logic` array with `{ type: 'derivation', ... }`.
   *
   * @example
   * ```typescript
   * // Compute total from quantity and price
   * {
   *   key: 'total',
   *   type: 'number',
   *   derivation: 'formValue.quantity * formValue.unitPrice'
   * }
   *
   * // Concatenate names
   * {
   *   key: 'fullName',
   *   type: 'input',
   *   derivation: 'formValue.firstName + " " + formValue.lastName'
   * }
   *
   * // Calculate discounted price
   * {
   *   key: 'discountedPrice',
   *   type: 'number',
   *   derivation: 'formValue.price * (1 - formValue.discountPercent / 100)'
   * }
   * ```
   */
  readonly derivation?: string;

  // Schema applications for complex configurations
  readonly schemas?: SchemaApplicationConfig[];
}
