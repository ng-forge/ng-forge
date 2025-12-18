import { disabled, hidden, readonly, required, LogicFn } from '@angular/forms/signals';
import type { SchemaPath, SchemaPathTree } from '@angular/forms/signals';
import { LogicConfig } from '../../models/logic/logic-config';
import { ConditionalExpression } from '../../models/expressions/conditional-expression';
import { createLogicFunction } from '../expressions/logic-function-factory';

type AnyLogicFn<TValue> = LogicFn<TValue, boolean> | (() => boolean);

export function applyLogic<TValue>(config: LogicConfig, fieldPath: SchemaPath<TValue> | SchemaPathTree<TValue>): void {
  const path = fieldPath as SchemaPath<TValue>;

  if (typeof config.condition === 'boolean') {
    applyLogicFn(config.type, path, () => config.condition as boolean);
    return;
  }

  const logicFn = createLogicFunction(config.condition as ConditionalExpression);
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
