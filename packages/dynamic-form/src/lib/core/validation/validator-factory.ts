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
 */
function applyCustomValidator<TValue>(config: CustomValidatorConfig, fieldPath: FieldPath<TValue>): void {
  const registry = inject(FunctionRegistryService);

  // Get validator from registry
  const validatorFn = registry.getValidator(config.functionName);

  if (!validatorFn) {
    console.warn(`[DynamicForm] Custom validator "${config.functionName}" not found in registry. Did you forget to register it?`);
    return;
  }

  // Wrap validator to pass params if provided
  const wrappedValidator = (ctx: FieldContext<TValue>): ValidationError | ValidationError[] | null => {
    return validatorFn(ctx, config.params);
  };

  // Apply with conditional logic if specified
  if (config.when) {
    const whenLogic = createLogicFunction(config.when);
    const conditionalValidator = (ctx: FieldContext<TValue>) => {
      if (!whenLogic(ctx)) {
        return null; // Condition not met, skip validation
      }
      return wrappedValidator(ctx);
    };
    validate(fieldPath, conditionalValidator);
  } else {
    validate(fieldPath, wrappedValidator);
  }
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
