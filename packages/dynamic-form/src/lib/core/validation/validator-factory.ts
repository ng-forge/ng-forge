import type { SchemaPath, SchemaPathTree } from '@angular/forms/signals';
import {
  email,
  FieldContext,
  LogicFn,
  max,
  maxLength,
  min,
  minLength,
  PathKind,
  pattern,
  required,
  SchemaPathRules,
  validate,
  validateAsync,
  validateHttp,
  ValidationError,
} from '@angular/forms/signals';
import { inject } from '@angular/core';
import { AsyncValidatorConfig, CustomValidatorConfig, HttpValidatorConfig, ValidatorConfig } from '../../models';
import { createLogicFunction } from '../expressions';
import { createDynamicValueFunction } from '../values';
import { ConditionalExpression } from '../../models/expressions/conditional-expression';
import { FunctionRegistryService } from '../registry/function-registry.service';
import { FieldContextRegistryService } from '../registry/field-context-registry.service';
import { ExpressionParser } from '../expressions/parser';

/**
 * Helper to create conditional logic function from when expression.
 * Returns undefined if no when condition is specified.
 * Reduces duplication across validator types.
 */
function createConditionalLogic<TValue>(when: ConditionalExpression | undefined): LogicFn<TValue, boolean> | undefined {
  return when ? (createLogicFunction(when) as LogicFn<TValue, boolean>) : undefined;
}

/**
 * Safely cast a SchemaPathTree to SchemaPath with Supported rules.
 *
 * This is safe when TValue is not an AbstractControl, because:
 * - SchemaPathTree<T> for non-AbstractControl is: SchemaPath<T, Supported> & {...nested}
 * - The intersection type is structurally compatible with SchemaPath<T, Supported>
 * - We only work with signal forms, never reactive forms (AbstractControl)
 *
 * TypeScript can't automatically narrow this because SchemaPathTree is defined as a
 * conditional type, but at runtime the value is always the correct type for our use case.
 */
function toSupportedPath<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, any, TPathKind> | SchemaPathTree<TValue, TPathKind>,
): SchemaPath<TValue, SchemaPathRules.Supported, TPathKind> {
  // The cast is safe because SchemaPathTree extends SchemaPath, and we constrain TValue
  // to exclude AbstractControl in our public APIs (we never pass reactive form controls)
  return path as SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>;
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
 */
export function applyValidator(config: ValidatorConfig, fieldPath: SchemaPath<any> | SchemaPathTree<any>): void {
  const path = toSupportedPath(fieldPath);
  switch (config.type) {
    case 'required':
      if (config.when) {
        const whenLogic = createLogicFunction(config.when);
        required(path, { when: whenLogic });
      } else {
        required(path);
      }
      break;

    case 'email':
      // Email validator expects SchemaPath<string>
      email(fieldPath as SchemaPath<string, SchemaPathRules.Supported>);
      break;

    case 'min':
      if (typeof config.value === 'number') {
        if (config.expression) {
          const dynamicMin = createDynamicValueFunction<string | number | null, number | undefined>(config.expression);
          // Min validator expects SchemaPath<number>
          min(fieldPath as SchemaPath<number, SchemaPathRules.Supported>, dynamicMin);
        } else {
          min(fieldPath as SchemaPath<number, SchemaPathRules.Supported>, config.value);
        }
      }
      break;

    case 'max':
      if (typeof config.value === 'number') {
        if (config.expression) {
          const dynamicMax = createDynamicValueFunction<string | number | null, number | undefined>(config.expression);
          // Max validator expects SchemaPath<number>
          max(fieldPath as SchemaPath<number, SchemaPathRules.Supported>, dynamicMax);
        } else {
          max(fieldPath as SchemaPath<number, SchemaPathRules.Supported>, config.value);
        }
      }
      break;

    case 'minLength':
      if (typeof config.value === 'number') {
        if (config.expression) {
          const dynamicMinLength = createDynamicValueFunction<string, number>(config.expression);
          // MinLength validator expects SchemaPath<string>
          minLength(fieldPath as SchemaPath<string, SchemaPathRules.Supported>, dynamicMinLength);
        } else {
          minLength(fieldPath as SchemaPath<string, SchemaPathRules.Supported>, config.value);
        }
      }
      break;

    case 'maxLength':
      if (typeof config.value === 'number') {
        if (config.expression) {
          const dynamicMaxLength = createDynamicValueFunction<string, number>(config.expression);
          // MaxLength validator expects SchemaPath<string>
          maxLength(fieldPath as SchemaPath<string, SchemaPathRules.Supported>, dynamicMaxLength);
        } else {
          maxLength(fieldPath as SchemaPath<string, SchemaPathRules.Supported>, config.value);
        }
      }
      break;

    case 'pattern':
      if (config.value instanceof RegExp || typeof config.value === 'string') {
        const regexPattern = typeof config.value === 'string' ? new RegExp(config.value) : config.value;
        if (config.expression) {
          const dynamicPattern = createDynamicValueFunction<string | undefined, RegExp | undefined>(config.expression);
          // Pattern validator expects SchemaPath<string>
          pattern(
            fieldPath as SchemaPath<string, SchemaPathRules.Supported>,
            dynamicPattern as LogicFn<string | undefined, RegExp | undefined>,
          );
        } else {
          pattern(fieldPath as SchemaPath<string, SchemaPathRules.Supported>, regexPattern);
        }
      }
      break;

    case 'custom':
      applyCustomValidator(config, path);
      break;

    case 'customAsync':
      applyAsyncValidator(config, path);
      break;

    case 'customHttp':
      applyHttpValidator(config, path);
      break;
  }
}

/**
 * Apply custom validator to field path using Angular's public validate() API
 * Supports both function-based and expression-based validators
 */
function applyCustomValidator(config: CustomValidatorConfig, fieldPath: SchemaPath<any, SchemaPathRules.Supported>): void {
  // Determine validator type and create appropriate validator function
  let validatorFn: (ctx: FieldContext<any>) => ValidationError | ValidationError[] | null;

  if (config.expression) {
    // Expression-based validator
    validatorFn = createExpressionValidator<any>(config);
  } else if (config.functionName) {
    // Function-based validator
    validatorFn = createFunctionValidator<any>(config);
  } else {
    console.warn('[DynamicForm] Custom validator must have either "expression" or "functionName"');
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
      `[DynamicForm] Custom validator "${config.functionName}" not found in registry. ` +
        `Use expression-based validators instead (type: 'custom', expression: '...', kind: '...').`,
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
function applyAsyncValidator(config: AsyncValidatorConfig, fieldPath: SchemaPath<any, SchemaPathRules.Supported>): void {
  const registry = inject(FunctionRegistryService);

  // Get async validator config from registry
  const validatorConfig = registry.getAsyncValidator(config.functionName);

  if (!validatorConfig) {
    console.warn(
      `[DynamicForm] Async validator "${config.functionName}" not found in registry. ` +
        `Register validators using FunctionRegistryService or check the function name for typos.`,
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
function applyHttpValidator(config: HttpValidatorConfig, fieldPath: SchemaPath<any, SchemaPathRules.Supported>): void {
  const registry = inject(FunctionRegistryService);

  // Get HTTP validator config from registry
  const httpValidatorConfig = registry.getHttpValidator(config.functionName);

  if (!httpValidatorConfig) {
    console.warn(
      `[DynamicForm] HTTP validator "${config.functionName}" not found in registry. ` +
        `Register validators using FunctionRegistryService or check the function name for typos.`,
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
 */
export function applyValidators(configs: ValidatorConfig[], fieldPath: SchemaPath<any> | SchemaPathTree<any>): void {
  configs.forEach((config) => applyValidator(config, fieldPath));
}
