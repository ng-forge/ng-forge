import { Injectable } from '@angular/core';
import { CustomFunction } from '../expressions/custom-function-types';
import { CustomValidator } from '../validation/validator-types';

/**
 * Registry service for custom functions and validators
 *
 * This service maintains two separate registries:
 *
 * 1. **Custom Functions** - For conditional expressions (when/readonly/disabled)
 *    - Used in: when conditions, readonly logic, disabled logic
 *    - Return type: any value (typically boolean)
 *    - Example: `isAdult: (ctx) => ctx.age >= 18`
 *
 * 2. **Custom Validators** - For validation rules using Angular's public FieldContext API
 *    - Used in: validators array on fields
 *    - Return type: ValidationError | ValidationError[] | null
 *    - Example: `noSpaces: (ctx) => ctx.value().includes(' ') ? { kind: 'noSpaces' } : null`
 *
 * @example
 * ```typescript
 * // Register a custom function for expressions
 * registry.registerCustomFunction('isAdult', (ctx) => ctx.age >= 18);
 *
 * // Use in field configuration
 * {
 *   key: 'alcoholPreference',
 *   when: { function: 'isAdult' }
 * }
 *
 * // Register a custom validator
 * registry.registerValidator('noSpaces', (ctx) => {
 *   const value = ctx.value();
 *   return typeof value === 'string' && value.includes(' ')
 *     ? { kind: 'noSpaces' }
 *     : null;
 * });
 *
 * // Use in field configuration
 * {
 *   key: 'username',
 *   validators: [{ type: 'custom', functionName: 'noSpaces' }],
 *   validationMessages: {
 *     noSpaces: 'Spaces are not allowed'
 *   }
 * }
 * ```
 */
@Injectable()
export class FunctionRegistryService {
  private readonly customFunctions = new Map<string, CustomFunction>();
  private readonly validators = new Map<string, CustomValidator>();

  /**
   * Register a custom function for conditional expressions
   *
   * Custom functions are used for control flow logic (when/readonly/disabled),
   * NOT for validation. They return any value, typically boolean.
   *
   * @param name - Unique identifier for the function
   * @param fn - Function that receives EvaluationContext and returns any value
   *
   * @example
   * ```typescript
   * registry.registerCustomFunction('isAdult', (ctx) => ctx.age >= 18);
   * registry.registerCustomFunction('fullName', (ctx) => `${ctx.firstName} ${ctx.lastName}`);
   * ```
   */
  registerCustomFunction(name: string, fn: CustomFunction): void {
    this.customFunctions.set(name, fn);
  }

  /**
   * Get all custom functions as an object
   */
  getCustomFunctions(): Record<string, CustomFunction> {
    return Object.fromEntries(this.customFunctions);
  }

  /**
   * Clear all custom functions
   */
  clearCustomFunctions(): void {
    this.customFunctions.clear();
  }

  /**
   * Register a custom validator using Angular's public FieldContext API
   *
   * Validators receive the full FieldContext, allowing access to:
   * - Current field value: `ctx.value()`
   * - Field state: `ctx.state` (errors, touched, dirty, etc.)
   * - Other field values: `ctx.valueOf(path)` (public API!)
   * - Other field states: `ctx.stateOf(path)`
   * - Parameters from JSON configuration via second argument
   *
   * @param name - Unique identifier for the validator
   * @param fn - Validator function (ctx, params?) => ValidationError | ValidationError[] | null
   *
   * @example Single Field Validation
   * ```typescript
   * registry.registerValidator('noSpaces', (ctx) => {
   *   const value = ctx.value();
   *   if (typeof value === 'string' && value.includes(' ')) {
   *     return { kind: 'noSpaces' };
   *   }
   *   return null;
   * });
   * ```
   *
   * @example Cross-Field Validation (Public API)
   * ```typescript
   * registry.registerValidator('lessThan', (ctx, params) => {
   *   const value = ctx.value();
   *   const compareToPath = params?.field as string;
   *
   *   // Use valueOf() to access other fields - public API!
   *   const otherValue = ctx.valueOf(compareToPath as any);
   *
   *   if (otherValue !== undefined && value >= otherValue) {
   *     return { kind: 'notLessThan' };
   *   }
   *   return null;
   * });
   * ```
   *
   * @example Multiple Errors (Cross-Field Validation)
   * ```typescript
   * registry.registerValidator('validateDateRange', (ctx) => {
   *   const errors: ValidationError[] = [];
   *   const startDate = ctx.valueOf('startDate' as any);
   *   const endDate = ctx.valueOf('endDate' as any);
   *
   *   if (!startDate) errors.push({ kind: 'startDateRequired' });
   *   if (!endDate) errors.push({ kind: 'endDateRequired' });
   *   if (startDate && endDate && startDate > endDate) {
   *     errors.push({ kind: 'invalidDateRange' });
   *   }
   *
   *   return errors.length > 0 ? errors : null;
   * });
   * ```
   */
  registerValidator(name: string, fn: CustomValidator): void {
    this.validators.set(name, fn);
  }

  /**
   * Get a validator by name
   */
  getValidator(name: string): CustomValidator | undefined {
    return this.validators.get(name);
  }

  /**
   * Clear all validators
   */
  clearValidators(): void {
    this.validators.clear();
  }

  /**
   * Clear everything (functions and validators)
   */
  clearAll(): void {
    this.clearCustomFunctions();
    this.clearValidators();
  }
}
