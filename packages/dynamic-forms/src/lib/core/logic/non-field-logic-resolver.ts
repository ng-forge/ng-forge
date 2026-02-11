import { computed, Signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { FormOptions, NextButtonOptions, SubmitButtonOptions } from '../../models/form-config';
import { LogicConfig, FormStateCondition, isFormStateCondition } from '../../models/logic';
import { ConditionalExpression } from '../../models/expressions';
import { evaluateCondition } from '../expressions';
import type { Logger } from '../../providers/features/logger/logger.interface';

/**
 * No-op logger for when no logger is provided.
 * Used as fallback in button logic evaluation to avoid breaking downstream packages.
 */
const noOpLogger: Logger = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  debug: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  info: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  warn: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  error: () => {},
};

/**
 * Context for resolving button disabled state.
 *
 * @public
 */
export interface ButtonLogicContext {
  /** The form's FieldTree instance (supports both string and number keys for array indices) */
  form: FieldTree<unknown, string | number>;

  /** Form-level options */
  formOptions?: FormOptions;

  /** Field-level logic array (if provided) */
  fieldLogic?: LogicConfig[];

  /** Explicit disabled state from field definition */
  explicitlyDisabled?: boolean;

  /** Current page validity signal (for paged forms) */
  currentPageValid?: Signal<boolean>;

  /** Current form value for evaluating conditional expressions */
  formValue?: unknown;

  /** Optional logger for diagnostic output. Falls back to no-op logger if not provided. */
  logger?: Logger;
}

/**
 * Allowed logic types for non-form-bound elements (buttons, text fields, etc.).
 * These elements only support hidden and disabled states - not readonly or required
 * since they don't participate in form validation.
 *
 * @public
 */
export type NonFieldLogicType = 'hidden' | 'disabled';

/**
 * Logic config restricted to types valid for non-form-bound elements.
 * This is a subset of LogicConfig that only includes hidden and disabled types.
 *
 * @public
 */
export type NonFieldLogicConfig = LogicConfig & { type: NonFieldLogicType };

/**
 * Context for resolving state (hidden/disabled) for non-form-bound elements.
 *
 * This is a generalized context that can be used by any field mapper (buttons, text fields,
 * or any non-form-bound elements) to evaluate logic from a `logic` array.
 *
 * Note: While this context accepts the full `LogicConfig[]` for flexibility, the resolver
 * functions only process hidden and disabled types. Other logic types (readonly, required,
 * derivation) are ignored for non-form-bound elements.
 *
 * @public
 */
export interface NonFieldLogicContext {
  /** The form's FieldTree instance (supports both string and number keys for array indices) */
  form: FieldTree<unknown, string | number>;

  /**
   * Field-level logic array containing conditions.
   * Accepts full LogicConfig[] for compatibility, but only hidden and disabled types are processed.
   */
  fieldLogic?: LogicConfig[];

  /** Explicit state from field definition (e.g., `hidden: true` or `disabled: true`) */
  explicitValue?: boolean;

  /** Current form value for evaluating conditional expressions */
  formValue?: unknown;

  /** Optional logger for diagnostic output. Falls back to no-op logger if not provided. */
  logger?: Logger;
}

/**
 * Default options for submit button disabled behavior.
 */
const DEFAULT_SUBMIT_BUTTON_OPTIONS: Required<SubmitButtonOptions> = {
  disableWhenInvalid: true,
  disableWhileSubmitting: true,
};

/**
 * Default options for next button disabled behavior.
 */
const DEFAULT_NEXT_BUTTON_OPTIONS: Required<NextButtonOptions> = {
  disableWhenPageInvalid: true,
  disableWhileSubmitting: true,
};

/**
 * Evaluates a FormStateCondition against the current form/page state.
 *
 * @param condition - The form state condition to evaluate
 * @param ctx - The button logic context
 * @returns true if the condition is met (button should be disabled)
 */
function evaluateFormStateCondition(condition: FormStateCondition, ctx: ButtonLogicContext): boolean {
  const form = ctx.form();

  switch (condition) {
    case 'formInvalid':
      return !form.valid();

    case 'formSubmitting':
      return form.submitting();

    case 'pageInvalid':
      return ctx.currentPageValid ? !ctx.currentPageValid() : false;

    default:
      return false;
  }
}

/**
 * Evaluates a single logic condition (boolean, FormStateCondition, or ConditionalExpression).
 *
 * @param condition - The condition to evaluate
 * @param ctx - The button logic context
 * @returns true if the condition is met
 */
function evaluateLogicCondition(condition: LogicConfig['condition'], ctx: ButtonLogicContext): boolean {
  // Boolean condition
  if (typeof condition === 'boolean') {
    return condition;
  }

  // FormStateCondition (string)
  if (isFormStateCondition(condition)) {
    return evaluateFormStateCondition(condition, ctx);
  }

  // ConditionalExpression
  const formValue = (ctx.formValue ?? ctx.form().value()) as Record<string, unknown>;
  const evaluationContext = {
    fieldValue: undefined,
    formValue,
    fieldPath: '',
    logger: ctx.logger ?? noOpLogger,
  };

  return evaluateCondition(condition as ConditionalExpression, evaluationContext);
}

/**
 * Checks if any disabled logic condition is met in the field's logic array.
 *
 * @param fieldLogic - Array of logic configurations
 * @param ctx - The button logic context
 * @returns true if any disabled condition is met
 */
function hasFieldLevelDisabledCondition(fieldLogic: LogicConfig[] | undefined, ctx: ButtonLogicContext): boolean {
  if (!fieldLogic || fieldLogic.length === 0) {
    return false;
  }

  return fieldLogic.filter((logic) => logic.type === 'disabled').some((logic) => evaluateLogicCondition(logic.condition, ctx));
}

/**
 * Checks if the field has custom logic of a specific type.
 *
 * @param fieldLogic - Array of logic configurations
 * @param logicType - The type of logic to check for ('hidden', 'disabled', 'readonly', 'required')
 * @returns true if field has logic of the specified type
 */
function hasCustomLogicOfType(fieldLogic: LogicConfig[] | undefined, logicType: LogicConfig['type']): boolean {
  if (!fieldLogic || fieldLogic.length === 0) {
    return false;
  }

  return fieldLogic.some((logic) => logic.type === logicType);
}

/**
 * Evaluates all logic conditions of a specific type and returns true if any condition is met.
 *
 * @param fieldLogic - Array of logic configurations
 * @param logicType - The type of logic to evaluate ('hidden', 'disabled', 'readonly', 'required')
 * @param ctx - Context containing form and formValue for evaluation
 * @returns true if any condition of the specified type is met
 */
function evaluateLogicOfType(
  fieldLogic: LogicConfig[] | undefined,
  logicType: LogicConfig['type'],
  ctx: { form: FieldTree<unknown, string | number>; formValue?: unknown; logger?: Logger },
): boolean {
  if (!fieldLogic || fieldLogic.length === 0) {
    return false;
  }

  const buttonCtx: ButtonLogicContext = {
    form: ctx.form,
    formValue: ctx.formValue,
    logger: ctx.logger,
  };

  return fieldLogic.filter((logic) => logic.type === logicType).some((logic) => evaluateLogicCondition(logic.condition, buttonCtx));
}

/**
 * Resolves the disabled state for a submit button.
 *
 * The disabled state is determined by (in order of precedence):
 * 1. Explicit `disabled: true` on the field definition
 * 2. Field-level `logic` array (if present, overrides form-level defaults)
 * 3. Form-level `options.submitButton` defaults
 *
 * @param ctx - The button logic context
 * @returns A computed signal that returns true when the button should be disabled
 *
 * @example
 * ```typescript
 * const disabled = resolveSubmitButtonDisabled({
 *   form: formInstance,
 *   formOptions: config.options,
 *   fieldLogic: buttonField.logic,
 *   explicitlyDisabled: buttonField.disabled,
 * });
 *
 * // Use in template
 * <button [disabled]="disabled()">Submit</button>
 * ```
 *
 * @public
 */
export function resolveSubmitButtonDisabled(ctx: ButtonLogicContext): Signal<boolean> {
  return computed(() => {
    // 1. Explicit disabled always wins
    if (ctx.explicitlyDisabled) {
      return true;
    }

    // 2. If field has custom disabled logic, use it exclusively
    if (hasCustomLogicOfType(ctx.fieldLogic, 'disabled')) {
      return hasFieldLevelDisabledCondition(ctx.fieldLogic, ctx);
    }

    // 3. Apply form-level defaults
    const options = {
      ...DEFAULT_SUBMIT_BUTTON_OPTIONS,
      ...ctx.formOptions?.submitButton,
    };

    const form = ctx.form();

    if (options.disableWhenInvalid && !form.valid()) {
      return true;
    }

    if (options.disableWhileSubmitting && form.submitting()) {
      return true;
    }

    return false;
  });
}

/**
 * Resolves the disabled state for a next page button.
 *
 * The disabled state is determined by (in order of precedence):
 * 1. Explicit `disabled: true` on the field definition
 * 2. Field-level `logic` array (if present, overrides form-level defaults)
 * 3. Form-level `options.nextButton` defaults
 *
 * @param ctx - The button logic context
 * @returns A computed signal that returns true when the button should be disabled
 *
 * @example
 * ```typescript
 * const disabled = resolveNextButtonDisabled({
 *   form: formInstance,
 *   formOptions: config.options,
 *   fieldLogic: buttonField.logic,
 *   explicitlyDisabled: buttonField.disabled,
 *   currentPageValid: pageOrchestrator.currentPageValid,
 * });
 * ```
 *
 * @public
 */
export function resolveNextButtonDisabled(ctx: ButtonLogicContext): Signal<boolean> {
  return computed(() => {
    // 1. Explicit disabled always wins
    if (ctx.explicitlyDisabled) {
      return true;
    }

    // 2. If field has custom disabled logic, use it exclusively
    if (hasCustomLogicOfType(ctx.fieldLogic, 'disabled')) {
      return hasFieldLevelDisabledCondition(ctx.fieldLogic, ctx);
    }

    // 3. Apply form-level defaults
    const options = {
      ...DEFAULT_NEXT_BUTTON_OPTIONS,
      ...ctx.formOptions?.nextButton,
    };

    const form = ctx.form();

    if (options.disableWhenPageInvalid && ctx.currentPageValid && !ctx.currentPageValid()) {
      return true;
    }

    if (options.disableWhileSubmitting && form.submitting()) {
      return true;
    }

    return false;
  });
}

/**
 * Evaluates the hidden state for non-form-bound elements synchronously.
 *
 * This is a pure function (no signal allocation) that can be called directly inside
 * an existing `computed()` block without creating ephemeral signal allocations.
 *
 * The hidden state is determined by (in order of precedence):
 * 1. Explicit `hidden: true` on the field definition
 * 2. Field-level `logic` array with `type: 'hidden'` conditions
 *
 * @param ctx - The context containing form, logic array, and explicit hidden state
 * @returns true when the element should be hidden
 *
 * @public
 */
export function evaluateNonFieldHidden(ctx: NonFieldLogicContext): boolean {
  // 1. Explicit hidden always wins
  if (ctx.explicitValue) {
    return true;
  }

  // 2. Evaluate hidden logic conditions
  if (hasCustomLogicOfType(ctx.fieldLogic, 'hidden')) {
    return evaluateLogicOfType(ctx.fieldLogic, 'hidden', {
      form: ctx.form,
      formValue: ctx.formValue,
      logger: ctx.logger,
    });
  }

  // 3. No hidden conditions - element is visible
  return false;
}

/**
 * Resolves the hidden state for non-form-bound elements as a reactive signal.
 *
 * Wraps {@link evaluateNonFieldHidden} in a `computed()` for use cases where a standalone
 * signal is needed. When calling from inside an existing `computed()`, prefer
 * {@link evaluateNonFieldHidden} directly to avoid ephemeral signal allocation.
 *
 * @param ctx - The context containing form, logic array, and explicit hidden state
 * @returns A computed signal that returns true when the element should be hidden
 *
 * @public
 */
export function resolveNonFieldHidden(ctx: NonFieldLogicContext): Signal<boolean> {
  return computed(() => evaluateNonFieldHidden(ctx));
}

/**
 * Evaluates the disabled state for non-form-bound elements synchronously.
 *
 * This is a pure function (no signal allocation) that can be called directly inside
 * an existing `computed()` block without creating ephemeral signal allocations.
 *
 * The disabled state is determined by (in order of precedence):
 * 1. Explicit `disabled: true` on the field definition
 * 2. Field-level `logic` array with `type: 'disabled'` conditions
 *
 * @param ctx - The context containing form, logic array, and explicit disabled state
 * @returns true when the element should be disabled
 *
 * @public
 */
export function evaluateNonFieldDisabled(ctx: NonFieldLogicContext): boolean {
  // 1. Explicit disabled always wins
  if (ctx.explicitValue) {
    return true;
  }

  // 2. Evaluate disabled logic conditions
  if (hasCustomLogicOfType(ctx.fieldLogic, 'disabled')) {
    return evaluateLogicOfType(ctx.fieldLogic, 'disabled', {
      form: ctx.form,
      formValue: ctx.formValue,
      logger: ctx.logger,
    });
  }

  // 3. No disabled conditions - element is enabled
  return false;
}

/**
 * Resolves the disabled state for non-form-bound elements as a reactive signal.
 *
 * Wraps {@link evaluateNonFieldDisabled} in a `computed()` for use cases where a standalone
 * signal is needed. When calling from inside an existing `computed()`, prefer
 * {@link evaluateNonFieldDisabled} directly to avoid ephemeral signal allocation.
 *
 * @param ctx - The context containing form, logic array, and explicit disabled state
 * @returns A computed signal that returns true when the element should be disabled
 *
 * @public
 */
export function resolveNonFieldDisabled(ctx: NonFieldLogicContext): Signal<boolean> {
  return computed(() => evaluateNonFieldDisabled(ctx));
}
