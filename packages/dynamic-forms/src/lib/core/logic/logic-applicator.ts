import { disabled, hidden, readonly, required, SchemaPathRules, PathKind } from '@angular/forms/signals';
import type { SchemaPath, SchemaPathTree } from '@angular/forms/signals';
import { LogicConfig } from '../../models/logic/logic-config';
import { ConditionalExpression } from '../../models/expressions/conditional-expression';
import { createLogicFunction } from '../expressions/logic-function-factory';

/**
 * Safely cast a SchemaPathTree to SchemaPath with Supported rules.
 * See validator-factory.ts for detailed explanation of why this is safe.
 */
function toSupportedPath<TValue, TPathKind extends PathKind = PathKind.Root>(
  path: SchemaPath<TValue, any, TPathKind> | SchemaPathTree<TValue, TPathKind>,
): SchemaPath<TValue, SchemaPathRules.Supported, TPathKind> {
  return path as SchemaPath<TValue, SchemaPathRules.Supported, TPathKind>;
}

/**
 * Apply logic configuration to field path.
 * Accepts both SchemaPath and SchemaPathTree for flexibility.
 */
export function applyLogic<TValue>(config: LogicConfig, fieldPath: SchemaPath<TValue> | SchemaPathTree<TValue>): void {
  const path = toSupportedPath(fieldPath);
  const logicFn =
    typeof config.condition === 'boolean'
      ? () => config.condition as boolean
      : createLogicFunction(config.condition as ConditionalExpression);

  switch (config.type) {
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

/**
 * Apply multiple logic configurations to a field path
 */
export function applyMultipleLogic<TValue>(configs: LogicConfig[], fieldPath: SchemaPath<TValue> | SchemaPathTree<TValue>): void {
  configs.forEach((config) => applyLogic(config, fieldPath));
}
