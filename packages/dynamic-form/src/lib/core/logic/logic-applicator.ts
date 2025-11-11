import { inject } from '@angular/core';
import { FieldPath, hidden, readonly, required } from '@angular/forms/signals';
import { LogicConfig } from '../../models/logic';
import { ConditionalExpression } from '../../models';
import { createLogicFunction } from '../expressions';
import { DisabledLogicRegistryService } from '../registry';

/**
 * Apply logic configuration to field path
 */
export function applyLogic<TValue>(config: LogicConfig, fieldPath: FieldPath<TValue>): void {
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
      // Register disabled logic in the registry so components can access it
      try {
        const disabledLogicRegistry = inject(DisabledLogicRegistryService, { optional: true });
        if (disabledLogicRegistry) {
          // Extract field path string from FieldPath
          const pathString = getFieldPathString(fieldPath);
          disabledLogicRegistry.registerDisabledLogic(pathString, logicFn);
        } else {
          console.warn('DisabledLogicRegistryService not found. Disabled logic will not work.');
        }
      } catch (error) {
        console.warn('Failed to register disabled logic:', error);
      }
      break;

    case 'required':
      required(fieldPath, { when: logicFn });
      break;
  }
}

/**
 * Extract field path string from FieldPath
 * This uses the internal structure of FieldPath to get the path string
 */
function getFieldPathString(fieldPath: FieldPath<unknown>): string {
  // FieldPath has an internal pathSegments property that contains the path
  const pathSegments = (fieldPath as any).pathSegments;
  if (Array.isArray(pathSegments)) {
    return pathSegments.join('.');
  }
  // Fallback: try to extract from toString or other methods
  return String(fieldPath);
}

/**
 * Apply multiple logic configurations to a field path
 */
export function applyMultipleLogic<TValue>(configs: LogicConfig[], fieldPath: FieldPath<TValue>): void {
  configs.forEach((config) => applyLogic(config, fieldPath));
}
