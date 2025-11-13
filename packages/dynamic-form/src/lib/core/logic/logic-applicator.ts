import { disabled, hidden, readonly, required } from '@angular/forms/signals';
import type { SchemaPath } from '@angular/forms/signals';
import { LogicConfig } from '../../models/logic';
import { ConditionalExpression } from '../../models';
import { createLogicFunction } from '../expressions';

/**
 * Apply logic configuration to field path
 */
export function applyLogic<TValue>(config: LogicConfig, fieldPath: SchemaPath<TValue>): void {
  const logicFn =
    typeof config.condition === 'boolean'
      ? () => config.condition as boolean
      : createLogicFunction(config.condition as ConditionalExpression);

  switch (config.type) {
    case 'hidden':
      hidden(fieldPath, logicFn);
      break;

    case 'readonly':
      readonly(fieldPath, logicFn);
      break;

    case 'disabled':
      disabled(fieldPath, logicFn);
      break;

    case 'required':
      required(fieldPath, { when: logicFn });
      break;
  }
}

/**
 * Apply multiple logic configurations to a field path
 */
export function applyMultipleLogic<TValue>(configs: LogicConfig[], fieldPath: SchemaPath<TValue>): void {
  configs.forEach((config) => applyLogic(config, fieldPath));
}
