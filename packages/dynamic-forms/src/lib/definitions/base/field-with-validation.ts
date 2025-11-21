import { ValidatorConfig } from '../../models/validation';
import { LogicConfig } from '../../models/logic';
import { SchemaApplicationConfig } from '../../models/schemas';
import { ConditionalExpression } from '../../models/expressions';
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

  // Logic rules (hidden, readonly, disabled, required)
  readonly logic?: LogicConfig[];

  // Schema applications for complex configurations
  readonly schemas?: SchemaApplicationConfig[];

  // Dynamic properties
  readonly dynamicProperties?: {
    [propertyName: string]: ConditionalExpression | unknown;
  };
}
