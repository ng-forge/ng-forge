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
  DeclarativeHttpValidatorConfig,
  FunctionHttpValidatorConfig,
  isFunctionHttpValidator,
  ValidatorConfig,
} from '../../models/validation/validator-config';
import { resolveHttpRequest } from '../http/http-request-resolver';
import { evaluateHttpValidationResponse } from '../http/http-response-evaluator';
import { createLogicFunction } from '../expressions/logic-function-factory';
import { createDynamicValueFunction } from '../values/dynamic-value-factory';
import { ConditionalExpression } from '../../models/expressions/conditional-expression';
import { FunctionRegistryService } from '../registry/function-registry.service';
import { FieldContextRegistryService } from '../registry/field-context-registry.service';
import { ExpressionParser } from '../expressions/parser/expression-parser';
import { requiresTreeValidation } from '../cross-field/cross-field-detector';

// Safe cast target: the when LogicFn only reads FieldContext members that exist for every TValue
type WhenLogic = LogicFn<unknown, boolean> | undefined;

function applyEmailValidator(path: SchemaPath<string>, when?: WhenLogic): void {
  email(path, when ? { when: when as LogicFn<string, boolean> } : undefined);
}

function applyMinValidator(path: SchemaPath<number>, value: number, expression?: string, when?: WhenLogic): void {
  const opts = when ? { when: when as LogicFn<number, boolean> } : undefined;
  if (expression) {
    // Safe cast: the dynamic value fn only reads generic FieldContext members
    min(
      path,
      createDynamicValueFunction<string | number | null, number | undefined>(expression) as LogicFn<number, number | undefined>,
      opts,
    );
  } else {
    min(path, value, opts);
  }
}

function applyMaxValidator(path: SchemaPath<number>, value: number, expression?: string, when?: WhenLogic): void {
  const opts = when ? { when: when as LogicFn<number, boolean> } : undefined;
  if (expression) {
    // Safe cast: the dynamic value fn only reads generic FieldContext members
    max(
      path,
      createDynamicValueFunction<string | number | null, number | undefined>(expression) as LogicFn<number, number | undefined>,
      opts,
    );
  } else {
    max(path, value, opts);
  }
}

function applyMinLengthValidator(path: SchemaPath<string>, value: number, expression?: string, when?: WhenLogic): void {
  const opts = when ? { when: when as LogicFn<string, boolean> } : undefined;
  if (expression) {
    minLength(path, createDynamicValueFunction<string, number>(expression), opts);
  } else {
    minLength(path, value, opts);
  }
}

function applyMaxLengthValidator(path: SchemaPath<string>, value: number, expression?: string, when?: WhenLogic): void {
  const opts = when ? { when: when as LogicFn<string, boolean> } : undefined;
  if (expression) {
    maxLength(path, createDynamicValueFunction<string, number>(expression), opts);
  } else {
    maxLength(path, value, opts);
  }
}

function applyPatternValidator(path: SchemaPath<string>, value: RegExp, expression?: string, when?: WhenLogic): void {
  const opts = when ? { when: when as LogicFn<string, boolean> } : undefined;
  if (expression) {
    pattern(
      path,
      createDynamicValueFunction<string | undefined, RegExp | undefined>(expression) as LogicFn<string | undefined, RegExp | undefined>,
      opts,
    );
  } else {
    pattern(path, value, opts);
  }
}

function createConditionalLogic(when: ConditionalExpression | undefined): LogicFn<unknown, boolean> | undefined {
  return when ? (createLogicFunction(when) as LogicFn<unknown, boolean>) : undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic forms require any at the Angular API boundary
export function applyValidator(config: ValidatorConfig, fieldPath: SchemaPath<any> | SchemaPathTree<any>): void {
  const path = fieldPath as SchemaPath<unknown>;

  if (requiresTreeValidation(config)) {
    return;
  }

  switch (config.type) {
    case 'required':
      required(path, config.when ? { when: createConditionalLogic(config.when) } : undefined);
      break;
    case 'email':
      applyEmailValidator(fieldPath as SchemaPath<string>, createConditionalLogic(config.when));
      break;
    case 'min':
      if (typeof config.value === 'number') {
        applyMinValidator(fieldPath as SchemaPath<number>, config.value, config.expression, createConditionalLogic(config.when));
      }
      break;
    case 'max':
      if (typeof config.value === 'number') {
        applyMaxValidator(fieldPath as SchemaPath<number>, config.value, config.expression, createConditionalLogic(config.when));
      }
      break;
    case 'minLength':
      if (typeof config.value === 'number') {
        applyMinLengthValidator(fieldPath as SchemaPath<string>, config.value, config.expression, createConditionalLogic(config.when));
      }
      break;
    case 'maxLength':
      if (typeof config.value === 'number') {
        applyMaxLengthValidator(fieldPath as SchemaPath<string>, config.value, config.expression, createConditionalLogic(config.when));
      }
      break;
    case 'pattern':
      if (config.value instanceof RegExp || typeof config.value === 'string') {
        let regexPattern: RegExp;
        if (typeof config.value === 'string') {
          try {
            regexPattern = new RegExp(config.value);
          } catch (e) {
            throw new DynamicFormError(
              `Invalid regex pattern in validator: '${config.value}' — ${e instanceof Error ? e.message : String(e)}`,
            );
          }
        } else {
          regexPattern = config.value;
        }
        applyPatternValidator(fieldPath as SchemaPath<string>, regexPattern, config.expression, createConditionalLogic(config.when));
      }
      break;
    case 'custom':
      applyCustomValidator(config, path);
      break;
    case 'async':
      applyAsyncValidator(config, path);
      break;
    case 'http':
      applyUnifiedHttpValidator(config, path);
      break;
  }
}

function applyCustomValidator(config: CustomValidatorConfig, fieldPath: SchemaPath<unknown>): void {
  let validatorFn: (ctx: FieldContext<unknown>) => ValidationError | ValidationError[] | null;

  if (config.expression) {
    validatorFn = createExpressionValidator(config);
  } else if (config.fn || config.functionName) {
    validatorFn = createFunctionValidator(config);
  } else {
    throw new DynamicFormError('Custom validator requires one of "expression", "functionName", or "fn".');
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

  if (config.fn && config.functionName) {
    logger.warn('Both "fn" and "functionName" are set on custom validator. Inline "fn" takes precedence; "functionName" is ignored.');
  }

  if (config.fn) {
    const inlineFn = config.fn;
    return (ctx: FieldContext<unknown>) => inlineFn(ctx, config.params);
  }

  const functionName = config.functionName;
  if (!functionName) {
    throw new DynamicFormError('Custom validator requires one of "functionName" or "fn".');
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
    throw new DynamicFormError('Custom validator requires a non-empty "expression".');
  }

  const fieldContextRegistry = inject(FieldContextRegistryService);
  const functionRegistry = inject(FunctionRegistryService);

  return (ctx: FieldContext<unknown>) => {
    try {
      // Reactive context so a cross-field expression re-runs only when a field it
      // references changes (fine-grained via createFieldValueProxy).
      const evaluationContext = fieldContextRegistry.createReactiveEvaluationContext(ctx, functionRegistry.getCustomFunctions());
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

/** Apply async validator to field path using Angular's public validateAsync() API */
function applyAsyncValidator(config: AsyncValidatorConfig, fieldPath: SchemaPath<unknown>): void {
  if (config.fn && config.functionName) {
    const logger = inject(DynamicFormLogger);
    logger.warn('Both "fn" and "functionName" are set on async validator. Inline "fn" takes precedence; "functionName" is ignored.');
  }

  let validatorConfig: ReturnType<FunctionRegistryService['getAsyncValidator']>;
  if (config.fn) {
    validatorConfig = config.fn;
  } else if (config.functionName) {
    const registry = inject(FunctionRegistryService);
    validatorConfig = registry.getAsyncValidator(config.functionName);
    if (!validatorConfig) {
      throw new DynamicFormError(`Async validator "${config.functionName}" not found. Register it with customFnConfig.asyncValidators.`);
    }
  } else {
    // XOR type rejects this at compile time; JSON-loaded configs can still reach here at runtime.
    throw new DynamicFormError('Async validator requires one of "functionName" or "fn".');
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
 * Unified handler for `type: 'http'` — discriminates between function-based and declarative
 * based on property presence.
 */
function applyUnifiedHttpValidator(
  config: FunctionHttpValidatorConfig | DeclarativeHttpValidatorConfig,
  fieldPath: SchemaPath<unknown>,
): void {
  if (isFunctionHttpValidator(config)) {
    applyFunctionHttpValidator(config, fieldPath);
    return;
  }
  // Declarative path requires both `http` and `responseMapping` — reject early
  // for JSON-loaded configs that have neither side fully populated. The
  // discriminated union forbids this at compile time.
  const declarative = config as DeclarativeHttpValidatorConfig;
  if (!declarative.http || !declarative.responseMapping) {
    throw new DynamicFormError(
      'HTTP validator requires one of "functionName" / "fn" (function-based) or "http" + "responseMapping" (declarative).',
    );
  }
  applyDeclarativeHttpValidator(config, fieldPath);
}

/** Apply function-based HTTP validator to field path using Angular's public validateHttp() API. */
function applyFunctionHttpValidator(config: FunctionHttpValidatorConfig, fieldPath: SchemaPath<unknown>): void {
  if (config.fn && config.functionName) {
    const logger = inject(DynamicFormLogger);
    logger.warn('Both "fn" and "functionName" are set on HTTP validator. Inline "fn" takes precedence; "functionName" is ignored.');
  }

  let httpValidatorConfig: ReturnType<FunctionRegistryService['getHttpValidator']>;
  if (config.fn) {
    httpValidatorConfig = config.fn;
  } else if (config.functionName) {
    const registry = inject(FunctionRegistryService);
    httpValidatorConfig = registry.getHttpValidator(config.functionName);
    if (!httpValidatorConfig) {
      throw new DynamicFormError(`HTTP validator "${config.functionName}" not found. Register it with customFnConfig.httpValidators.`);
    }
  } else {
    // XOR type rejects this at compile time; JSON-loaded configs can still reach here at runtime.
    throw new DynamicFormError('HTTP validator requires one of "functionName" or "fn".');
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

/** Apply declarative HTTP validator — fully JSON-serializable, no function registration needed. */
function applyDeclarativeHttpValidator(config: DeclarativeHttpValidatorConfig, fieldPath: SchemaPath<unknown>): void {
  const fieldContextRegistry = inject(FieldContextRegistryService);
  const functionRegistry = inject(FunctionRegistryService);
  const logger = inject(DynamicFormLogger);
  const whenLogic = createConditionalLogic(config.when);

  validateHttp(fieldPath, {
    request: (ctx: FieldContext<unknown>) => {
      if (whenLogic && !whenLogic(ctx)) return undefined;
      // Use createReactiveEvaluationContext (not createEvaluationContext) because
      // validateHttp's request runs inside Angular's resource API — it NEEDS reactive
      // dependencies to re-trigger when the field value changes.
      const evalCtx = fieldContextRegistry.createReactiveEvaluationContext(ctx, functionRegistry.getCustomFunctions());
      // resolveHttpRequest returns null when a path param is undefined — convert to undefined to skip validation
      return resolveHttpRequest(config.http, evalCtx) ?? undefined;
    },
    onSuccess: (response: unknown) => {
      return evaluateHttpValidationResponse(response, config.responseMapping, logger);
    },
    onError: (error: unknown) => {
      logger.warn('HTTP validator request failed:', error);
      return { kind: config.responseMapping.errorKind };
    },
  } as Parameters<typeof validateHttp>[1]);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Dynamic forms require any at the Angular API boundary
export function applyValidators(configs: ValidatorConfig[], fieldPath: SchemaPath<any> | SchemaPathTree<any>): void {
  configs.forEach((config) => applyValidator(config, fieldPath));
}
