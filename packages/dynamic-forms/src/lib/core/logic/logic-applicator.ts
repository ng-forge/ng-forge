import { disabled, hidden, readonly, required, LogicFn } from '@angular/forms/signals';
import { DEV_MODE } from '../../utils/dev-mode';
import type { SchemaPath, SchemaPathTree } from '@angular/forms/signals';
import {
  LogicConfig,
  isStateLogicConfig,
  isDerivationLogicConfig,
  isFormStateCondition,
  LogicTrigger,
  type StateLogicType,
} from '@ng-forge/dynamic-forms/internal';
import { ConditionalExpression } from '@ng-forge/dynamic-forms/internal';
import { createLogicFunction, createDebouncedLogicFunction, createFormStateLogicFunction } from '@ng-forge/dynamic-forms/internal';
import { DEFAULT_DEBOUNCE_MS } from '../../utils/debounce/debounce';
import { DynamicFormError } from '@ng-forge/dynamic-forms/internal';

type AnyLogicFn<TValue> = LogicFn<TValue, boolean> | (() => boolean);

/** Extracts the trigger from a StateLogicConfig, handling the discriminated union. */
function getConfigTrigger(config: LogicConfig): LogicTrigger {
  if (!isStateLogicConfig(config)) {
    return 'onChange';
  }
  return config.trigger ?? 'onChange';
}

/** Extracts debounceMs from a StateLogicConfig if trigger is 'debounced'. */
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
  // Value derivations (including property derivations via targetProperty) are handled by their orchestrators — skip them.
  if (isDerivationLogicConfig(config)) return;

  // Guard against unrecognized logic types that may be added in the future.
  if (!isStateLogicConfig(config)) {
    if (DEV_MODE) {
      console.warn(
        `[Dynamic Forms] Unrecognized logic config type '${(config as { type: string }).type}' in applyLogic. ` +
          'This config will be ignored. If this is a new logic type, ensure it is handled explicitly.',
      );
    }
    return;
  }

  const path = fieldPath as SchemaPath<TValue>;
  const trigger = getConfigTrigger(config);
  const debounceMs = getConfigDebounceMs(config) ?? DEFAULT_DEBOUNCE_MS;

  if (typeof config.condition === 'boolean') {
    applyLogicFn(config.type, path, () => config.condition as boolean);
    return;
  }

  // Form-state conditions read root form state, not the expression evaluator.
  if (isFormStateCondition(config.condition)) {
    // formInvalid cycles against the field's own validity; pageInvalid has no leaf page context.
    // Only formSubmitting (an independent flag) is cycle-free on value fields.
    if (config.condition === 'formInvalid' || config.condition === 'pageInvalid') {
      const reason =
        config.condition === 'formInvalid'
          ? `it would create a validation cycle against the form's own validity`
          : `a value field has no page context for it to resolve against`;
      throw new DynamicFormError(
        `The '${config.condition}' form-state condition is not supported on value-field logic because ${reason}. ` +
          `Use 'formSubmitting', or apply this condition to a button or container instead.`,
      );
    }
    applyLogicFn(config.type, path, createFormStateLogicFunction(config.condition));
    return;
  }

  // Create appropriate logic function based on trigger
  const logicFn =
    trigger === 'debounced'
      ? createDebouncedLogicFunction(config.condition as ConditionalExpression, debounceMs)
      : createLogicFunction(config.condition as ConditionalExpression);

  applyLogicFn(config.type, path, logicFn);
}

function applyLogicFn<TValue>(type: StateLogicType, path: SchemaPath<TValue>, logicFn: AnyLogicFn<TValue>): void {
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
    default: {
      const _exhaustive: never = type;
      throw new DynamicFormError(`Unhandled state logic type: ${_exhaustive}`);
    }
  }
}

export function applyMultipleLogic<TValue>(configs: LogicConfig[], fieldPath: SchemaPath<TValue> | SchemaPathTree<TValue>): void {
  configs.forEach((config) => applyLogic(config, fieldPath));
}
