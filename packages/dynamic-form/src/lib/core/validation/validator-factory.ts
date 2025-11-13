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
  SchemaPathRules,
  PathKind,
} from '@angular/forms/signals';
import type { SchemaPath, SchemaPathTree } from '@angular/forms/signals';
import { inject } from '@angular/core';
import { AsyncValidatorConfig, CustomValidatorConfig, HttpValidatorConfig, ValidatorConfig } from '../../models';
import { createLogicFunction } from '../expressions';
import { createDynamicValueFunction } from '../values';
import { FunctionRegistryService } from '../registry/function-registry.service';
import { CustomValidator } from './validator-types';

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
  path: SchemaPath<TValue, any, TPathKind> | SchemaPathTree<TValue, TPathKind>
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
          const dynamicMin = createDynamicValueFunction<number, number>(config.expression);
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
          const dynamicMax = createDynamicValueFunction<number, number>(config.expression);
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
            dynamicPattern as LogicFn<string | undefined, RegExp | undefined>
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
 */
function applyCustomValidator(config: CustomValidatorConfig, fieldPath: SchemaPath<any, SchemaPathRules.Supported>): void {
  const registry = inject(FunctionRegistryService);

  // Get validator from registry
  const validatorFn = registry.getValidator(config.functionName);

  if (!validatorFn) {
    console.warn(`[DynamicForm] Custom validator "${config.functionName}" not found in registry. Did you forget to register it?`);
    return;
  }

  // Wrap validator to pass params if provided
  const wrappedValidator = (ctx: FieldContext<any>): ValidationError | ValidationError[] | null => {
    return validatorFn(ctx, config.params);
  };

  // Apply with conditional logic if specified
  if (config.when) {
    const whenLogic = createLogicFunction(config.when);
    const conditionalValidator = (ctx: FieldContext<any>) => {
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
function applyAsyncValidator(config: AsyncValidatorConfig, fieldPath: SchemaPath<any, SchemaPathRules.Supported>): void {
  const registry = inject(FunctionRegistryService);

  // Get async validator config from registry
  const validatorConfig = registry.getAsyncValidator(config.functionName);

  if (!validatorConfig) {
    console.warn(`[DynamicForm] Async validator "${config.functionName}" not found in registry. Did you forget to register it?`);
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
  if (config.when) {
    const whenLogic = createLogicFunction(config.when);
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
    console.warn(`[DynamicForm] HTTP validator "${config.functionName}" not found in registry. Did you forget to register it?`);
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
  if (config.when) {
    const whenLogic = createLogicFunction(config.when);
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
