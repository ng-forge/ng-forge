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
  ValidationError,
} from '@angular/forms/signals';
import { inject } from '@angular/core';
import { CustomValidatorConfig, ValidatorConfig } from '../../models';
import { createLogicFunction } from '../expressions';
import { createDynamicValueFunction } from '../values';
import { FunctionRegistryService } from '../registry/function-registry.service';
import { ContextAwareValidator, SimpleCustomValidator } from './validator-types';

/**
 * Adapter that wraps simple validators to work with FieldContext
 * Allows simple validators (value, formValue) => error to work with Angular's validate() API
 */
function adaptSimpleValidator<TValue>(simpleValidator: SimpleCustomValidator<TValue>): ContextAwareValidator<TValue> {
  return (ctx: FieldContext<TValue>) => {
    const value = ctx.value();
    const formValue = ctx.root()().value();
    const result = simpleValidator(value, formValue);
    // Simple validators should return ValidationError | null, but type as unknown for flexibility
    return result as ValidationError | null;
  };
}

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
  }
}

/**
 * Apply custom validator to field path
 * Supports both simple validators and context-aware validators with auto-detection
 * Handles errorMessage injection if specified in config
 */
function applyCustomValidator<TValue>(config: CustomValidatorConfig, fieldPath: FieldPath<TValue>): void {
  const registry = inject(FunctionRegistryService);

  // Try context-aware validator first
  let validatorFn = registry.getContextValidator(config.functionName);

  // Fall back to simple validator with adapter
  if (!validatorFn) {
    const simpleValidator = registry.getSimpleValidator(config.functionName);
    if (simpleValidator) {
      validatorFn = adaptSimpleValidator(simpleValidator);
    }
  }

  if (!validatorFn) {
    console.warn(`[DynamicForm] Custom validator "${config.functionName}" not found in registry. Did you forget to register it?`);
    return;
  }

  // Wrap validator to:
  // 1. Pass params if provided
  // 2. Inject errorMessage if specified (overrides validator's message but can be overridden by field validationMessages)
  const wrappedValidator = (ctx: FieldContext<TValue>) => {
    const error = validatorFn(ctx, config.params);

    // If validator returned an error and config has errorMessage, inject it
    // This allows inline error messages: { type: 'custom', functionName: 'foo', errorMessage: 'Custom message' }
    // Field-level validationMessages still take precedence during error resolution
    if (error && config.errorMessage) {
      if (Array.isArray(error)) {
        // For tree validators returning multiple errors, apply message to all
        return error.map((e) => ({ ...e, message: config.errorMessage }));
      } else {
        // For single error, inject message
        return { ...error, message: config.errorMessage };
      }
    }

    return error;
  };

  // Apply with conditional logic if specified
  if (config.when) {
    const whenLogic = createLogicFunction(config.when);
    // Wrap validator with conditional logic
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
 * Apply multiple validators to a field path
 */
export function applyValidators<TValue>(configs: ValidatorConfig[], fieldPath: FieldPath<TValue>): void {
  configs.forEach((config) => applyValidator(config, fieldPath));
}
