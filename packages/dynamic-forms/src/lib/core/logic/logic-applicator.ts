import { disabled, hidden, readonly, required, SchemaPathRules, PathKind, LogicFn } from '@angular/forms/signals';
import type { SchemaPath, SchemaPathTree } from '@angular/forms/signals';
import { LogicConfig } from '../../models/logic/logic-config';
import { ConditionalExpression } from '../../models/expressions/conditional-expression';
import { createLogicFunction } from '../expressions/logic-function-factory';

/**
 * A logic function that can be used with Angular Signal Forms.
 * Accepts either a simple () => boolean or a LogicFn that takes FieldContext.
 */
type AnyLogicFn<TValue> = LogicFn<TValue, boolean> | (() => boolean);

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
 *
 * Cross-field logic (referencing formValue.*) is handled automatically by
 * createLogicFunction which uses RootFormRegistryService to access the
 * root form value. No special context or pre-computed signals needed.
 *
 * @param config The logic configuration
 * @param fieldPath The Angular Signal Forms path
 */
export function applyLogic<TValue>(config: LogicConfig, fieldPath: SchemaPath<TValue> | SchemaPathTree<TValue>): void {
  const path = toSupportedPath(fieldPath);

  // Handle static boolean conditions
  if (typeof config.condition === 'boolean') {
    const staticLogicFn = () => config.condition as boolean;
    applyLogicFn(config.type, path, staticLogicFn);
    return;
  }

  // Create logic function from condition expression
  // Cross-field references (formValue.*) are handled automatically via RootFormRegistryService
  const condition = config.condition as ConditionalExpression;
  const logicFn = createLogicFunction(condition);
  applyLogicFn(config.type, path, logicFn);
}

/**
 * Applies a logic function to a path for a specific logic type.
 */
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

/**
 * Apply multiple logic configurations to a field path
 *
 * @param configs Array of logic configurations
 * @param fieldPath The Angular Signal Forms path
 */
export function applyMultipleLogic<TValue>(configs: LogicConfig[], fieldPath: SchemaPath<TValue> | SchemaPathTree<TValue>): void {
  configs.forEach((config) => applyLogic(config, fieldPath));
}
