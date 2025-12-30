import { computed, inject, Injector, signal, Signal } from '@angular/core';
import { disabled, hidden, readonly, required, LogicFn, FieldContext } from '@angular/forms/signals';
import type { SchemaPath, SchemaPathTree } from '@angular/forms/signals';
import { LogicConfig, StateLogicConfig, isStateLogicConfig, LogicTrigger } from '../../models/logic/logic-config';
import { ConditionalExpression } from '../../models/expressions/conditional-expression';
import { createLogicFunction, createDebouncedLogicFunction } from '../expressions/logic-function-factory';
import { DEFAULT_DEBOUNCE_MS } from '../../utils/debounce/debounce';

type AnyLogicFn<TValue> = LogicFn<TValue, boolean> | (() => boolean);

/**
 * Extracts the trigger from a StateLogicConfig, handling the discriminated union.
 */
function getConfigTrigger(config: LogicConfig): LogicTrigger {
  if (!isStateLogicConfig(config)) {
    return 'onChange';
  }
  return config.trigger ?? 'onChange';
}

/**
 * Extracts debounceMs from a StateLogicConfig if trigger is 'debounced'.
 */
function getConfigDebounceMs(config: LogicConfig): number | undefined {
  if (!isStateLogicConfig(config)) {
    return undefined;
  }
  // Type narrowing: debounceMs only exists when trigger is 'debounced'
  if (config.trigger === 'debounced') {
    return config.debounceMs;
  }
  return undefined;
}

export function applyLogic<TValue>(config: LogicConfig, fieldPath: SchemaPath<TValue> | SchemaPathTree<TValue>): void {
  const path = fieldPath as SchemaPath<TValue>;
  const trigger = getConfigTrigger(config);
  const debounceMs = getConfigDebounceMs(config) ?? DEFAULT_DEBOUNCE_MS;

  if (typeof config.condition === 'boolean') {
    applyLogicFn(config.type, path, () => config.condition as boolean);
    return;
  }

  // Create appropriate logic function based on trigger
  const logicFn =
    trigger === 'debounced'
      ? createDebouncedLogicFunction(config.condition as ConditionalExpression, debounceMs)
      : createLogicFunction(config.condition as ConditionalExpression);

  applyLogicFn(config.type, path, logicFn);
}

function applyLogicFn<TValue>(type: LogicConfig['type'], path: SchemaPath<TValue>, logicFn: AnyLogicFn<TValue>): void {
  switch (type) {
    case 'hidden':
      hidden(path, logicFn);
      break;
    case 'readonly':
      readonly(path, logicFn);
      break;
    case 'disabled':
      disabled(path, logicFn);
      break;
    case 'required':
      required(path, { when: logicFn });
      break;
  }
}

export function applyMultipleLogic<TValue>(configs: LogicConfig[], fieldPath: SchemaPath<TValue> | SchemaPathTree<TValue>): void {
  configs.forEach((config) => applyLogic(config, fieldPath));
}
