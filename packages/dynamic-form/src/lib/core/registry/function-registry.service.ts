import { Injectable } from '@angular/core';
import { CustomFunction } from '../expressions/custom-function-types';
import { ContextAwareValidator, SimpleCustomValidator, TreeValidator } from '../validation/validator-types';

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
 * 2. **Custom Validators** - For validation rules
 *    - Used in: validators array on fields
 *    - Return type: ValidationError | null
 *    - Example: `noSpaces: (value) => value.includes(' ') ? { kind: 'noSpaces' } : null`
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
 * registry.registerSimpleValidator('noSpaces', (value) => {
 *   return typeof value === 'string' && value.includes(' ')
 *     ? { kind: 'noSpaces', message: 'Spaces not allowed' }
 *     : null;
 * });
 *
 * // Use in field configuration
 * {
 *   key: 'username',
 *   validators: [{ type: 'custom', functionName: 'noSpaces' }]
 * }
 * ```
 */
@Injectable()
export class FunctionRegistryService {
  private readonly customFunctions = new Map<string, CustomFunction>();
  private readonly simpleValidators = new Map<string, SimpleCustomValidator>();
  private readonly contextValidators = new Map<string, ContextAwareValidator>();
  private readonly treeValidators = new Map<string, TreeValidator>();

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
   * Register a simple custom validator
   *
   * Simple validators are for validation logic that only needs the field value
   * and form value. They return ValidationError | null.
   *
   * @param name - Unique identifier for the validator
   * @param fn - Validator function (value, formValue) => ValidationError | null
   *
   * @example
   * ```typescript
   * registry.registerSimpleValidator('noSpaces', (value, formValue) => {
   *   if (typeof value === 'string' && value.includes(' ')) {
   *     return { kind: 'noSpaces', message: 'Spaces not allowed' };
   *   }
   *   return null;
   * });
   * ```
   */
  registerSimpleValidator(name: string, fn: SimpleCustomValidator): void {
    this.simpleValidators.set(name, fn);
  }

  /**
   * Register a context-aware validator
   *
   * Context-aware validators receive the full FieldContext, allowing access to:
   * - Field state (errors, touched, dirty, etc.)
   * - Other fields in the form (via ctx.root() or ctx.parent())
   * - Field metadata
   * - Parameters from JSON configuration
   *
   * @param name - Unique identifier for the validator
   * @param fn - Validator function (ctx, params?) => ValidationError | null
   *
   * @example
   * ```typescript
   * registry.registerContextValidator('lessThanField', (ctx, params) => {
   *   const value = ctx.value();
   *   const otherField = params?.field as string;
   *   const otherValue = ctx.root()[otherField]?.value();
   *
   *   if (otherValue !== undefined && value >= otherValue) {
   *     return { kind: 'notLessThan', message: `Must be less than ${otherField}` };
   *   }
   *   return null;
   * });
   * ```
   */
  registerContextValidator(name: string, fn: ContextAwareValidator): void {
    this.contextValidators.set(name, fn);
  }

  /**
   * Register a tree validator for cross-field validation
   *
   * Tree validators validate relationships between multiple fields and can
   * target errors to specific child fields.
   *
   * @param name - Unique identifier for the validator
   * @param fn - Validator function (ctx, params?) => ValidationError | ValidationError[] | null
   *
   * @example
   * ```typescript
   * registry.registerTreeValidator('passwordsMatch', (ctx, params) => {
   *   const password = ctx.password?.value();
   *   const confirmPassword = ctx.confirmPassword?.value();
   *
   *   if (password && confirmPassword && password !== confirmPassword) {
   *     return {
   *       field: ctx.confirmPassword,
   *       kind: 'passwordMismatch',
   *       message: 'Passwords must match'
   *     };
   *   }
   *   return null;
   * });
   * ```
   */
  registerTreeValidator(name: string, fn: TreeValidator): void {
    this.treeValidators.set(name, fn);
  }

  /**
   * Get a simple validator by name
   */
  getSimpleValidator(name: string): SimpleCustomValidator | undefined {
    return this.simpleValidators.get(name);
  }

  /**
   * Get a context-aware validator by name
   */
  getContextValidator(name: string): ContextAwareValidator | undefined {
    return this.contextValidators.get(name);
  }

  /**
   * Get a tree validator by name
   */
  getTreeValidator(name: string): TreeValidator | undefined {
    return this.treeValidators.get(name);
  }

  /**
   * Clear all validators
   */
  clearValidators(): void {
    this.simpleValidators.clear();
    this.contextValidators.clear();
    this.treeValidators.clear();
  }

  /**
   * Clear everything (functions and validators)
   */
  clearAll(): void {
    this.clearCustomFunctions();
    this.clearValidators();
  }
}
