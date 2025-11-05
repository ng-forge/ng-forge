import { email, FieldPath, LogicFn, max, maxLength, min, minLength, pattern, required } from '@angular/forms/signals';
import { ValidatorConfig } from '../../models';
import { createLogicFunction } from '../expressions';
import { createDynamicValueFunction } from '../values';

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
  }
}

/**
 * Apply multiple validators to a field path
 */
export function applyValidators<TValue>(configs: ValidatorConfig[], fieldPath: FieldPath<TValue>): void {
  configs.forEach((config) => applyValidator(config, fieldPath));
}
