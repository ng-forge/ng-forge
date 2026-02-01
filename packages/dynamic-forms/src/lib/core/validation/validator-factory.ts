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
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { DynamicFormError } from '../../errors/dynamic-form-error';
import {
  AsyncValidatorConfig,
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

function applyEmailValidator(path: SchemaPath<string>): void {
  email(path);
}

function applyMinValidator(path: SchemaPath<number>, value: number, expression?: string): void {
  if (expression) {
    min(path, createDynamicValueFunction<string | number | null, number | undefined>(expression));
  } else {
    min(path, value);
  }
}

function applyMaxValidator(path: SchemaPath<number>, value: number, expression?: string): void {
  if (expression) {
    max(path, createDynamicValueFunction<string | number | null, number | undefined>(expression));
  } else {
    max(path, value);
  }
}

function applyMinLengthValidator(path: SchemaPath<string>, value: number, expression?: string): void {
  if (expression) {
    minLength(path, createDynamicValueFunction<string, number>(expression));
  } else {
    minLength(path, value);
  }
}

function applyMaxLengthValidator(path: SchemaPath<string>, value: number, expression?: string): void {
  if (expression) {
    maxLength(path, createDynamicValueFunction<string, number>(expression));
  } else {
    maxLength(path, value);
  }
}

function applyPatternValidator(path: SchemaPath<string>, value: RegExp, expression?: string): void {
  if (expression) {
    pattern(
      path,
      createDynamicValueFunction<string | undefined, RegExp | undefined>(expression) as LogicFn<string | undefined, RegExp | undefined>,
    );
  } else {
    pattern(path, value);
  }
}

function createConditionalLogic(when: ConditionalExpression | undefined): LogicFn<unknown, boolean> | undefined {
  return when ? (createLogicFunction(when) as LogicFn<unknown, boolean>) : undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic forms require any at the Angular API boundary
export function applyValidator(config: ValidatorConfig, fieldPath: SchemaPath<any> | SchemaPathTree<any>): void {
  const path = fieldPath as SchemaPath<unknown>;

  if (isCrossFieldBuiltInValidator(config) || hasCrossFieldWhenCondition(config)) {
    return;
  }

  switch (config.type) {
    case 'required':
      if (config.when) {
        required(path, { when: createLogicFunction(config.when) });
      } else {
        required(path);
      }
      break;
    case 'email':
      applyEmailValidator(fieldPath as SchemaPath<string>);
      break;
    case 'min':
      if (typeof config.value === 'number') {
        applyMinValidator(fieldPath as SchemaPath<number>, config.value, config.expression);
      }
      break;
    case 'max':
      if (typeof config.value === 'number') {
        applyMaxValidator(fieldPath as SchemaPath<number>, config.value, config.expression);
      }
      break;
    case 'minLength':
      if (typeof config.value === 'number') {
        applyMinLengthValidator(fieldPath as SchemaPath<string>, config.value, config.expression);
      }
      break;
    case 'maxLength':
      if (typeof config.value === 'number') {
        applyMaxLengthValidator(fieldPath as SchemaPath<string>, config.value, config.expression);
      }
      break;
    case 'pattern':
      if (config.value instanceof RegExp || typeof config.value === 'string') {
        const regexPattern = typeof config.value === 'string' ? new RegExp(config.value) : config.value;
        applyPatternValidator(fieldPath as SchemaPath<string>, regexPattern, config.expression);
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

function applyCustomValidator(config: CustomValidatorConfig, fieldPath: SchemaPath<unknown>): void {
  if (isCrossFieldValidator(config)) {
    return;
  }

  let validatorFn: (ctx: FieldContext<unknown>) => ValidationError | ValidationError[] | null;

  if (config.expression) {
    validatorFn = createExpressionValidator(config);
  } else if (config.functionName) {
    validatorFn = createFunctionValidator(config);
  } else {
    const logger = inject(DynamicFormLogger);
    logger.warn('Custom validator must have either "expression" or "functionName"');
    return;
  }

  const whenLogic = createConditionalLogic(config.when);
  validate(fieldPath, (ctx: FieldContext<unknown>) => {
    if (whenLogic && !whenLogic(ctx)) return null;
    return validatorFn(ctx);
  });
}

function createFunctionValidator(
  config: CustomValidatorConfig,
): (ctx: FieldContext<unknown>) => ValidationError | ValidationError[] | null {
  const logger = inject(DynamicFormLogger);
  const functionName = config.functionName;
  if (!functionName) {
    logger.warn('Custom validator missing functionName');
    return () => null;
  }

  const registry = inject(FunctionRegistryService);
  const validatorFn = registry.getValidator(functionName);

  if (!validatorFn) {
    throw new DynamicFormError(`Custom validator "${functionName}" not found. Register it with customFnConfig.validators.`);
  }

  return (ctx: FieldContext<unknown>) => validatorFn(ctx, config.params);
}

function createExpressionValidator(
  config: CustomValidatorConfig,
): (ctx: FieldContext<unknown>) => ValidationError | ValidationError[] | null {
  const logger = inject(DynamicFormLogger);
  const expression = config.expression;
  if (!expression) {
    logger.warn('Custom validator missing expression');
    return () => null;
  }

  const fieldContextRegistry = inject(FieldContextRegistryService);
  const functionRegistry = inject(FunctionRegistryService);

  return (ctx: FieldContext<unknown>) => {
    try {
      const evaluationContext = fieldContextRegistry.createEvaluationContext(ctx, functionRegistry.getCustomFunctions());
      const result = ExpressionParser.evaluate(expression, evaluationContext);

      if (result) {
        return null;
      }

      const kind = config.kind || 'custom';
      const validationError: ValidationError & Record<string, unknown> = { kind };

      if (config.errorParams) {
        Object.entries(config.errorParams).forEach(([key, expression]) => {
          try {
            validationError[key] = ExpressionParser.evaluate(expression, evaluationContext);
          } catch (err) {
            logger.warn(`Error evaluating errorParam "${key}":`, expression, err);
          }
        });
      }

      return validationError;
    } catch (error) {
      // Gracefully degrade on errors (e.g., typos in field names, undefined functions)
      // Log for debugging while keeping form functional
      logger.error('Error evaluating custom validator expression:', expression, error);
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
function applyAsyncValidator(config: AsyncValidatorConfig, fieldPath: SchemaPath<unknown>): void {
  const registry = inject(FunctionRegistryService);
  const validatorConfig = registry.getAsyncValidator(config.functionName);

  if (!validatorConfig) {
    throw new DynamicFormError(`Async validator "${config.functionName}" not found. Register it with customFnConfig.asyncValidators.`);
  }

  const whenLogic = createConditionalLogic(config.when);
  const asyncOptions = {
    params: (ctx: FieldContext<unknown>) => {
      if (whenLogic && !whenLogic(ctx)) return undefined;
      return validatorConfig.params(ctx, config.params);
    },
    factory: validatorConfig.factory,
    onSuccess: validatorConfig.onSuccess,
    onError: validatorConfig.onError,
  };

  validateAsync(fieldPath, asyncOptions as Parameters<typeof validateAsync>[1]);
}

/**
 * Apply HTTP validator to field path using Angular's public validateHttp() API
 *
 * Angular's validateHttp requires:
 * - request: Function that returns URL string or HttpResourceRequest
 * - onSuccess: Maps HTTP response to validation errors (inverted logic!)
 * - onError: Optional handler for HTTP errors
 */
function applyHttpValidator(config: HttpValidatorConfig, fieldPath: SchemaPath<unknown>): void {
  const registry = inject(FunctionRegistryService);
  const httpValidatorConfig = registry.getHttpValidator(config.functionName);

  if (!httpValidatorConfig) {
    throw new DynamicFormError(`HTTP validator "${config.functionName}" not found. Register it with customFnConfig.httpValidators.`);
  }

  const whenLogic = createConditionalLogic(config.when);
  const httpOptions = {
    request: (ctx: FieldContext<unknown>) => {
      if (whenLogic && !whenLogic(ctx)) return undefined;
      return httpValidatorConfig.request(ctx, config.params);
    },
    onSuccess: httpValidatorConfig.onSuccess,
    onError: httpValidatorConfig.onError,
  };

  validateHttp(fieldPath, httpOptions as Parameters<typeof validateHttp>[1]);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic forms require any at the Angular API boundary
export function applyValidators(configs: ValidatorConfig[], fieldPath: SchemaPath<any> | SchemaPathTree<any>): void {
  configs.forEach((config) => applyValidator(config, fieldPath));
}
