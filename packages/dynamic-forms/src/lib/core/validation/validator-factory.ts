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

function createConditionalLogic<TValue>(when: ConditionalExpression | undefined): LogicFn<TValue, boolean> | undefined {
  return when ? (createLogicFunction(when) as LogicFn<TValue, boolean>) : undefined;
}

export function applyValidator(config: ValidatorConfig, fieldPath: SchemaPath<any> | SchemaPathTree<any>): void {
  const path = fieldPath as SchemaPath<any>;

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

function applyCustomValidator(config: CustomValidatorConfig, fieldPath: SchemaPath<any>): void {
  if (isCrossFieldValidator(config)) {
    return;
  }

  let validatorFn: (ctx: FieldContext<any>) => ValidationError | ValidationError[] | null;

  if (config.expression) {
    validatorFn = createExpressionValidator<any>(config);
  } else if (config.functionName) {
    validatorFn = createFunctionValidator<any>(config);
  } else {
    console.warn('[Dynamic Forms] Custom validator must have either "expression" or "functionName"');
    return;
  }

  const whenLogic = createConditionalLogic<any>(config.when);
  if (whenLogic) {
    validate(fieldPath, (ctx: FieldContext<any>) => (whenLogic(ctx) ? validatorFn(ctx) : null));
  } else {
    validate(fieldPath, validatorFn);
  }
}

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

  return (ctx: FieldContext<TValue>) => validatorFn(ctx, config.params);
}

function createExpressionValidator<TValue>(
  config: CustomValidatorConfig,
): (ctx: FieldContext<TValue>) => ValidationError | ValidationError[] | null {
  const fieldContextRegistry = inject(FieldContextRegistryService);
  const functionRegistry = inject(FunctionRegistryService);

  return (ctx: FieldContext<TValue>) => {
    try {
      const evaluationContext = fieldContextRegistry.createEvaluationContext(ctx, functionRegistry.getCustomFunctions());
      const result = ExpressionParser.evaluate(config.expression!, evaluationContext);

      if (result) {
        return null;
      }

      const kind = config.kind || 'custom';
      const validationError: ValidationError = { kind };

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
      console.error('[Dynamic Forms] Error evaluating custom validator expression:', config.expression, error);
      return { kind: config.kind || 'custom' };
    }
  };
}

function applyAsyncValidator(config: AsyncValidatorConfig, fieldPath: SchemaPath<any>): void {
  const registry = inject(FunctionRegistryService);
  const validatorConfig = registry.getAsyncValidator(config.functionName);

  if (!validatorConfig) {
    console.warn(
      `[Dynamic Forms] Async validator "${config.functionName}" not found in registry. ` +
        `Ensure it's registered using customFnConfig.asyncValidators or check the function name for typos.`,
    );
    return;
  }

  const asyncOptions = {
    params: (ctx: FieldContext<any>) => validatorConfig.params(ctx, config.params),
    factory: validatorConfig.factory,
    onSuccess: validatorConfig.onSuccess,
    onError: validatorConfig.onError,
  };

  const whenLogic = createConditionalLogic<any>(config.when);
  if (whenLogic) {
    const conditionalOptions = {
      ...asyncOptions,
      params: (ctx: FieldContext<any>) => (whenLogic(ctx) ? asyncOptions.params(ctx) : undefined),
    };
    validateAsync(fieldPath, conditionalOptions as Parameters<typeof validateAsync>[1]);
  } else {
    validateAsync(fieldPath, asyncOptions as Parameters<typeof validateAsync>[1]);
  }
}

function applyHttpValidator(config: HttpValidatorConfig, fieldPath: SchemaPath<any>): void {
  const registry = inject(FunctionRegistryService);
  const httpValidatorConfig = registry.getHttpValidator(config.functionName);

  if (!httpValidatorConfig) {
    console.warn(
      `[Dynamic Forms] HTTP validator "${config.functionName}" not found in registry. ` +
        `Ensure it's registered using customFnConfig.httpValidators or check the function name for typos.`,
    );
    return;
  }

  const httpOptions = {
    request: (ctx: FieldContext<any>) => httpValidatorConfig.request(ctx, config.params),
    onSuccess: httpValidatorConfig.onSuccess,
    onError: httpValidatorConfig.onError,
  };

  const whenLogic = createConditionalLogic<any>(config.when);
  if (whenLogic) {
    const conditionalOptions = {
      ...httpOptions,
      request: (ctx: FieldContext<any>) => (whenLogic(ctx) ? httpOptions.request(ctx) : undefined),
    };
    validateHttp(fieldPath, conditionalOptions as Parameters<typeof validateHttp>[1]);
  } else {
    validateHttp(fieldPath, httpOptions as Parameters<typeof validateHttp>[1]);
  }
}

export function applyValidators(configs: ValidatorConfig[], fieldPath: SchemaPath<any> | SchemaPathTree<any>): void {
  configs.forEach((config) => applyValidator(config, fieldPath));
}
