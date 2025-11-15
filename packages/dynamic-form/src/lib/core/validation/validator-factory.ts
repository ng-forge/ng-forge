import {
  email,
  FieldContext,
  FieldPath,
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
import { AsyncValidatorConfig, CustomValidatorConfig, HttpValidatorConfig, ValidatorConfig } from '../../models';
import { createLogicFunction } from '../expressions';
import { createDynamicValueFunction } from '../values';
import { FunctionRegistryService } from '../registry/function-registry.service';
import { FieldContextRegistryService } from '../registry/field-context-registry.service';
import { ExpressionParser } from '../expressions/parser';
import { CustomValidator } from './validator-types';

/**
 * Apply validator configuration to field path, following the logic pattern
 */
export function applyValidator<TValue>(config: ValidatorConfig, fieldPath: FieldPath<TValue>): void {
  switch (config.type) {
    case 'required':
      if (config.when) {
        const whenLogic = createLogicFunction(config.when);
        required(fieldPath, { when: whenLogic });
      } else {
        required(fieldPath);
      }
      break;

    case 'email':
      email(fieldPath as FieldPath<string>);
      break;

    case 'min':
      if (typeof config.value === 'number') {
        if (config.expression) {
          const dynamicMin = createDynamicValueFunction<number, number>(config.expression);
          min(fieldPath as FieldPath<number>, dynamicMin);
        } else {
          min(fieldPath as FieldPath<number>, config.value);
        }
      }
      break;

    case 'max':
      if (typeof config.value === 'number') {
        if (config.expression) {
          const dynamicMax = createDynamicValueFunction<number, number>(config.expression);
          max(fieldPath as FieldPath<number>, dynamicMax);
        } else {
          max(fieldPath as FieldPath<number>, config.value);
        }
      }
      break;

    case 'minLength':
      if (typeof config.value === 'number') {
        if (config.expression) {
          const dynamicMinLength = createDynamicValueFunction<string, number>(config.expression);
          minLength(fieldPath as FieldPath<string>, dynamicMinLength);
        } else {
          minLength(fieldPath as FieldPath<string>, config.value);
        }
      }
      break;

    case 'maxLength':
      if (typeof config.value === 'number') {
        if (config.expression) {
          const dynamicMaxLength = createDynamicValueFunction<string, number>(config.expression);
          maxLength(fieldPath as FieldPath<string>, dynamicMaxLength);
        } else {
          maxLength(fieldPath as FieldPath<string>, config.value);
        }
      }
      break;

    case 'pattern':
      if (config.value instanceof RegExp || typeof config.value === 'string') {
        const regexPattern = typeof config.value === 'string' ? new RegExp(config.value) : config.value;
        if (config.expression) {
          const dynamicPattern = createDynamicValueFunction<string | undefined, RegExp | undefined>(config.expression);
          pattern(fieldPath as FieldPath<string>, dynamicPattern as LogicFn<string | undefined, RegExp | undefined>);
        } else {
          pattern(fieldPath as FieldPath<string>, regexPattern);
        }
      }
      break;

    case 'custom':
      applyCustomValidator(config, fieldPath);
      break;

    case 'customAsync':
      applyAsyncValidator(config, fieldPath);
      break;

    case 'customHttp':
      applyHttpValidator(config, fieldPath);
      break;
  }
}

/**
 * Apply custom validator to field path using Angular's public validate() API
 * Supports both function-based and expression-based validators
 */
function applyCustomValidator<TValue>(config: CustomValidatorConfig, fieldPath: FieldPath<TValue>): void {
  // Determine validator type and create appropriate validator function
  let validatorFn: (ctx: FieldContext<TValue>) => ValidationError | ValidationError[] | null;

  if (config.expression) {
    // Expression-based validator
    validatorFn = createExpressionValidator<TValue>(config);
  } else if (config.functionName) {
    // Function-based validator
    validatorFn = createFunctionValidator<TValue>(config);
  } else {
    console.warn('[DynamicForm] Custom validator must have either "expression" or "functionName"');
    return;
  }

  // Apply with conditional logic if specified
  if (config.when) {
    const whenLogic = createLogicFunction(config.when);
    const conditionalValidator = (ctx: FieldContext<TValue>) => {
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
    console.warn(`[DynamicForm] Custom validator "${config.functionName}" not found in registry. Did you forget to register it?`);
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
            console.warn(`[DynamicForm] Error evaluating errorParam "${key}":`, expression, err);
          }
        });
      }

      return validationError;
    } catch (error) {
      // Gracefully degrade on errors (e.g., typos in field names, undefined functions)
      // Log to console for debugging while keeping form functional
      console.error('[DynamicForm] Error evaluating custom validator expression:', config.expression, error);
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
function applyAsyncValidator<TValue>(config: AsyncValidatorConfig, fieldPath: FieldPath<TValue>): void {
  const registry = inject(FunctionRegistryService);

  // Get async validator config from registry
  const validatorConfig = registry.getAsyncValidator(config.functionName);

  if (!validatorConfig) {
    console.warn(`[DynamicForm] Async validator "${config.functionName}" not found in registry. Did you forget to register it?`);
    return;
  }

  // Build Angular's AsyncValidatorOptions
  const asyncOptions = {
    params: (ctx: FieldContext<TValue>) => {
      return validatorConfig.params(ctx, config.params);
    },
    factory: validatorConfig.factory,
    onSuccess: validatorConfig.onSuccess,
    onError: validatorConfig.onError,
  };

  // Apply with conditional logic if specified
  if (config.when) {
    const whenLogic = createLogicFunction(config.when);
    // For conditional async validators, we wrap the params function
    const conditionalOptions = {
      ...asyncOptions,
      params: (ctx: FieldContext<TValue>) => {
        if (!whenLogic(ctx)) {
          return undefined; // Skip validation when condition not met
        }
        return asyncOptions.params(ctx);
      },
    };
    validateAsync(fieldPath, conditionalOptions as any);
  } else {
    validateAsync(fieldPath, asyncOptions as any);
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
function applyHttpValidator<TValue>(config: HttpValidatorConfig, fieldPath: FieldPath<TValue>): void {
  const registry = inject(FunctionRegistryService);

  // Get HTTP validator config from registry
  const httpValidatorConfig = registry.getHttpValidator(config.functionName);

  if (!httpValidatorConfig) {
    console.warn(`[DynamicForm] HTTP validator "${config.functionName}" not found in registry. Did you forget to register it?`);
    return;
  }

  // Build Angular's HttpValidatorOptions
  const httpOptions = {
    request: (ctx: FieldContext<TValue>) => {
      return httpValidatorConfig.request(ctx, config.params);
    },
    onSuccess: httpValidatorConfig.onSuccess,
    onError: httpValidatorConfig.onError,
  };

  // Apply with conditional logic if specified
  if (config.when) {
    const whenLogic = createLogicFunction(config.when);
    // For conditional HTTP validators, we wrap the request function
    const conditionalOptions = {
      ...httpOptions,
      request: (ctx: FieldContext<TValue>) => {
        if (!whenLogic(ctx)) {
          return undefined; // Skip validation when condition not met
        }
        return httpOptions.request(ctx);
      },
    };
    validateHttp(fieldPath, conditionalOptions as any);
  } else {
    validateHttp(fieldPath, httpOptions as any);
  }
}

/**
 * Apply multiple validators to a field path
 */
export function applyValidators<TValue>(configs: ValidatorConfig[], fieldPath: FieldPath<TValue>): void {
  configs.forEach((config) => applyValidator(config, fieldPath));
}
