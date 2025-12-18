import type { SchemaPath, SchemaPathTree } from '@angular/forms/signals';
import {
  email,
  FieldContext,
  LogicFn,
  max,
  maxLength,
  min,
  minLength,
  pattern,
  required,
  validate,
  validateAsync,
  validateHttp,
  ValidationError,
} from '@angular/forms/signals';
import { inject } from '@angular/core';
import {
  AsyncValidatorConfig,
  BuiltInValidatorConfig,
  CustomValidatorConfig,
  HttpValidatorConfig,
  ValidatorConfig,
} from '../../models/validation/validator-config';
import { createLogicFunction } from '../expressions/logic-function-factory';
import { createDynamicValueFunction } from '../values/dynamic-value-factory';
import { ConditionalExpression } from '../../models/expressions/conditional-expression';
import { FunctionRegistryService } from '../registry/function-registry.service';
import { FieldContextRegistryService } from '../registry/field-context-registry.service';
import { ExpressionParser } from '../expressions/parser/expression-parser';
import { isCrossFieldValidator, isCrossFieldBuiltInValidator, hasCrossFieldWhenCondition } from '../cross-field/cross-field-detector';

// ============================================================================
// Type-safe validator application functions
// ============================================================================

/**
 * Applies the email validator to a string schema path.
 * This function is properly typed - no casts needed internally.
 */
function applyEmailValidator(path: SchemaPath<string>): void {
  email(path);
}

/**
 * Applies the min validator to a number schema path.
 * Supports both static values and dynamic expressions.
 */
function applyMinValidator(path: SchemaPath<number>, value: number, expression?: string): void {
  if (expression) {
    const dynamicMin = createDynamicValueFunction<string | number | null, number | undefined>(expression);
    min(path, dynamicMin);
  } else {
    min(path, value);
  }
}

/**
 * Applies the max validator to a number schema path.
 * Supports both static values and dynamic expressions.
 */
function applyMaxValidator(path: SchemaPath<number>, value: number, expression?: string): void {
  if (expression) {
    const dynamicMax = createDynamicValueFunction<string | number | null, number | undefined>(expression);
    max(path, dynamicMax);
  } else {
    max(path, value);
  }
}

/**
 * Applies the minLength validator to a string schema path.
 * Supports both static values and dynamic expressions.
 */
function applyMinLengthValidator(path: SchemaPath<string>, value: number, expression?: string): void {
  if (expression) {
    const dynamicMinLength = createDynamicValueFunction<string, number>(expression);
    minLength(path, dynamicMinLength);
  } else {
    minLength(path, value);
  }
}

/**
 * Applies the maxLength validator to a string schema path.
 * Supports both static values and dynamic expressions.
 */
function applyMaxLengthValidator(path: SchemaPath<string>, value: number, expression?: string): void {
  if (expression) {
    const dynamicMaxLength = createDynamicValueFunction<string, number>(expression);
    maxLength(path, dynamicMaxLength);
  } else {
    maxLength(path, value);
  }
}

/**
 * Applies the pattern validator to a string schema path.
 * Supports both static values and dynamic expressions.
 */
function applyPatternValidator(path: SchemaPath<string>, value: RegExp, expression?: string): void {
  if (expression) {
    const dynamicPattern = createDynamicValueFunction<string | undefined, RegExp | undefined>(expression);
    pattern(path, dynamicPattern as LogicFn<string | undefined, RegExp | undefined>);
  } else {
    pattern(path, value);
  }
}

/**
 * Helper to create conditional logic function from when expression.
 * Returns undefined if no when condition is specified.
 * Reduces duplication across validator types.
 */
function createConditionalLogic<TValue>(when: ConditionalExpression | undefined): LogicFn<TValue, boolean> | undefined {
  return when ? (createLogicFunction(when) as LogicFn<TValue, boolean>) : undefined;
}

/**
 * Apply validator configuration to field path, following the logic pattern.
 *
 * Accepts both SchemaPath and SchemaPathTree to support being called from both
 * individual field mappings and schema functions.
 *
 * Note: ValidatorConfig is runtime configuration that doesn't encode the field's
 * TypeScript type. The type assertions to specific types (string, number) are safe
 * because Angular's validators perform runtime value checks regardless of the static
 * type parameter.
 *
 * Cross-field validators (those referencing formValue.*) are skipped at field level.
 * They are collected by the parent form component using collectCrossFieldEntries
 * and executed at form level using validateTree.
 *
 * @param config The validator configuration
 * @param fieldPath The field path to apply the validator to
 * @param fieldKey Optional field key (used for logging)
 */
// Note: We use `any` for the fieldPath parameter because it needs to accept:
// - SchemaPath<T> with various value types from field definitions
// - SchemaPathTree<T> from schema functions
// Angular's type system uses internal markers that don't align well with `unknown`.
// The internal typed helper functions provide type safety where it matters.
export function applyValidator(config: ValidatorConfig, fieldPath: SchemaPath<any> | SchemaPathTree<any>, fieldKey?: string): void {
  // Cast to SchemaPath - safe because SchemaPathTree extends SchemaPath
  const path = fieldPath as SchemaPath<any>;

  // Check if this is a built-in validator with a cross-field expression
  // These are collected at form level - skip here
  if (isCrossFieldBuiltInValidator(config)) {
    // Cross-field validators are handled at form level via validateTree
    return;
  }

  // Check if the validator has a cross-field `when` condition
  // These are collected at form level - skip here
  if (hasCrossFieldWhenCondition(config)) {
    // Cross-field validators are handled at form level via validateTree
    return;
  }

  switch (config.type) {
    case 'required':
      // required() accepts any value type - no cast needed
      if (config.when) {
        const whenLogic = createLogicFunction(config.when);
        required(path, { when: whenLogic });
      } else {
        required(path);
      }
      break;

    case 'email':
      // Cast at boundary - applyEmailValidator is type-safe internally
      applyEmailValidator(fieldPath as SchemaPath<string>);
      break;

    case 'min':
      // Cast at boundary - applyMinValidator is type-safe internally
      if (typeof config.value === 'number') {
        applyMinValidator(fieldPath as SchemaPath<number>, config.value, config.expression);
      }
      break;

    case 'max':
      // Cast at boundary - applyMaxValidator is type-safe internally
      if (typeof config.value === 'number') {
        applyMaxValidator(fieldPath as SchemaPath<number>, config.value, config.expression);
      }
      break;

    case 'minLength':
      // Cast at boundary - applyMinLengthValidator is type-safe internally
      if (typeof config.value === 'number') {
        applyMinLengthValidator(fieldPath as SchemaPath<string>, config.value, config.expression);
      }
      break;

    case 'maxLength':
      // Cast at boundary - applyMaxLengthValidator is type-safe internally
      if (typeof config.value === 'number') {
        applyMaxLengthValidator(fieldPath as SchemaPath<string>, config.value, config.expression);
      }
      break;

    case 'pattern':
      // Cast at boundary - applyPatternValidator is type-safe internally
      if (config.value instanceof RegExp || typeof config.value === 'string') {
        const regexPattern = typeof config.value === 'string' ? new RegExp(config.value) : config.value;
        applyPatternValidator(fieldPath as SchemaPath<string>, regexPattern, config.expression);
      }
      break;

    case 'custom':
      // validate() accepts any value type - no cast needed for path
      applyCustomValidator(config, path, fieldKey);
      break;

    case 'customAsync':
      // validateAsync() accepts any value type - no cast needed for path
      applyAsyncValidator(config, path);
      break;

    case 'customHttp':
      // validateHttp() accepts any value type - no cast needed for path
      applyHttpValidator(config, path);
      break;
  }
}

/**
 * Apply custom validator to field path using Angular's public validate() API
 * Supports both function-based and expression-based validators.
 *
 * Cross-field validators (those referencing formValue.*) are skipped at field level.
 * They are collected at form level and executed via validateTree.
 *
 * @param config The custom validator configuration
 * @param fieldPath The field path to apply validation to
 * @param fieldKey Optional field key (used for logging)
 */
function applyCustomValidator(config: CustomValidatorConfig, fieldPath: SchemaPath<any>, fieldKey?: string): void {
  // Check if this is a cross-field validator - skip at field level
  if (isCrossFieldValidator(config)) {
    // Cross-field validators are handled at form level via validateTree
    return;
  }

  // Non-cross-field validators: apply at field level as before
  let validatorFn: (ctx: FieldContext<any>) => ValidationError | ValidationError[] | null;

  if (config.expression) {
    // Expression-based validator
    validatorFn = createExpressionValidator<any>(config);
  } else if (config.functionName) {
    // Function-based validator
    validatorFn = createFunctionValidator<any>(config);
  } else {
    console.warn('[Dynamic Forms] Custom validator must have either "expression" or "functionName"');
    return;
  }

  // Apply with conditional logic if specified
  const whenLogic = createConditionalLogic<any>(config.when);
  if (whenLogic) {
    const conditionalValidator = (ctx: FieldContext<any>) => {
      if (!whenLogic(ctx)) {
        return null; // Condition not met, skip validation
      }
      return validatorFn(ctx);
    };
    validate(fieldPath, conditionalValidator);
  } else {
    validate(fieldPath, validatorFn);
  }
}

/**
 * Create a function-based validator using registered validator functions
 */
function createFunctionValidator<TValue>(
  config: CustomValidatorConfig,
): (ctx: FieldContext<TValue>) => ValidationError | ValidationError[] | null {
  const registry = inject(FunctionRegistryService);
  const validatorFn = registry.getValidator(config.functionName!);

  if (!validatorFn) {
    console.warn(
      `[Dynamic Forms] Custom validator "${config.functionName}" not found in registry. ` +
        `Ensure it's registered using customFnConfig.validators or check the function name for typos.`,
    );
    return () => null;
  }

  return (ctx: FieldContext<TValue>): ValidationError | ValidationError[] | null => {
    return validatorFn(ctx, config.params);
  };
}

/**
 * Create an expression-based validator using secure AST evaluation
 */
function createExpressionValidator<TValue>(
  config: CustomValidatorConfig,
): (ctx: FieldContext<TValue>) => ValidationError | ValidationError[] | null {
  const fieldContextRegistry = inject(FieldContextRegistryService);
  const functionRegistry = inject(FunctionRegistryService);

  return (ctx: FieldContext<TValue>): ValidationError | ValidationError[] | null => {
    try {
      // Create evaluation context from FieldContext
      const evaluationContext = fieldContextRegistry.createEvaluationContext(ctx, functionRegistry.getCustomFunctions());

      // Evaluate expression securely using AST parser
      const result = ExpressionParser.evaluate(config.expression!, evaluationContext);

      // If expression returns truthy, validation passes (no error)
      // If expression returns falsy, validation fails
      if (result) {
        return null; // Validation passes
      }

      // Validation failed - return error with kind
      const kind = config.kind || 'custom';
      const validationError: ValidationError = { kind };

      // Evaluate and include errorParams for message interpolation
      if (config.errorParams) {
        Object.entries(config.errorParams).forEach(([key, expression]) => {
          try {
            (validationError as unknown as Record<string, unknown>)[key] = ExpressionParser.evaluate(expression, evaluationContext);
          } catch (err) {
            console.warn(`[Dynamic Forms] Error evaluating errorParam "${key}":`, expression, err);
          }
        });
      }

      return validationError;
    } catch (error) {
      // Gracefully degrade on errors (e.g., typos in field names, undefined functions)
      // Log to console for debugging while keeping form functional
      console.error('[Dynamic Forms] Error evaluating custom validator expression:', config.expression, error);
      return { kind: config.kind || 'custom' };
    }
  };
}

/**
 * Apply async validator to field path using Angular's public validateAsync() API
 *
 * Angular's validateAsync uses the resource API, which requires:
 * - params: Function that computes params from field context
 * - factory: Function that creates ResourceRef from params signal
 * - onSuccess: Maps resource result to validation errors
 * - onError: Optional handler for resource errors
 */
function applyAsyncValidator(config: AsyncValidatorConfig, fieldPath: SchemaPath<any>): void {
  const registry = inject(FunctionRegistryService);

  // Get async validator config from registry
  const validatorConfig = registry.getAsyncValidator(config.functionName);

  if (!validatorConfig) {
    console.warn(
      `[Dynamic Forms] Async validator "${config.functionName}" not found in registry. ` +
        `Ensure it's registered using customFnConfig.asyncValidators or check the function name for typos.`,
    );
    return;
  }

  // Build Angular's AsyncValidatorOptions
  const asyncOptions = {
    params: (ctx: FieldContext<any>) => {
      return validatorConfig.params(ctx, config.params);
    },
    factory: validatorConfig.factory,
    onSuccess: validatorConfig.onSuccess,
    onError: validatorConfig.onError,
  };

  // Apply with conditional logic if specified
  const whenLogic = createConditionalLogic<any>(config.when);
  if (whenLogic) {
    // For conditional async validators, we wrap the params function
    const conditionalOptions = {
      ...asyncOptions,
      params: (ctx: FieldContext<any>) => {
        if (!whenLogic(ctx)) {
          return undefined; // Skip validation when condition not met
        }
        return asyncOptions.params(ctx);
      },
    };
    // TypeScript needs help with the ResourceRef generic - the types are correct at runtime
    validateAsync(fieldPath, conditionalOptions as Parameters<typeof validateAsync>[1]);
  } else {
    validateAsync(fieldPath, asyncOptions as Parameters<typeof validateAsync>[1]);
  }
}

/**
 * Apply HTTP validator to field path using Angular's public validateHttp() API
 *
 * Angular's validateHttp requires:
 * - request: Function that returns URL string or HttpResourceRequest
 * - onSuccess: Maps HTTP response to validation errors (inverted logic!)
 * - onError: Optional handler for HTTP errors
 */
function applyHttpValidator(config: HttpValidatorConfig, fieldPath: SchemaPath<any>): void {
  const registry = inject(FunctionRegistryService);

  // Get HTTP validator config from registry
  const httpValidatorConfig = registry.getHttpValidator(config.functionName);

  if (!httpValidatorConfig) {
    console.warn(
      `[Dynamic Forms] HTTP validator "${config.functionName}" not found in registry. ` +
        `Ensure it's registered using customFnConfig.httpValidators or check the function name for typos.`,
    );
    return;
  }

  // Build Angular's HttpValidatorOptions
  const httpOptions = {
    request: (ctx: FieldContext<any>) => {
      return httpValidatorConfig.request(ctx, config.params);
    },
    onSuccess: httpValidatorConfig.onSuccess,
    onError: httpValidatorConfig.onError,
  };

  // Apply with conditional logic if specified
  const whenLogic = createConditionalLogic<any>(config.when);
  if (whenLogic) {
    // For conditional HTTP validators, we wrap the request function
    const conditionalOptions = {
      ...httpOptions,
      request: (ctx: FieldContext<any>) => {
        if (!whenLogic(ctx)) {
          return undefined; // Skip validation when condition not met
        }
        return httpOptions.request(ctx);
      },
    };
    // TypeScript needs help with the HttpResourceRequest generic - the types are correct at runtime
    validateHttp(fieldPath, conditionalOptions as Parameters<typeof validateHttp>[1]);
  } else {
    validateHttp(fieldPath, httpOptions as Parameters<typeof validateHttp>[1]);
  }
}

/**
 * Apply multiple validators to a field path
 *
 * @param configs Array of validator configurations
 * @param fieldPath The field path to apply validators to
 * @param fieldKey Optional field key (used for logging)
 */
export function applyValidators(configs: ValidatorConfig[], fieldPath: SchemaPath<any> | SchemaPathTree<any>, fieldKey?: string): void {
  configs.forEach((config) => applyValidator(config, fieldPath, fieldKey));
}
