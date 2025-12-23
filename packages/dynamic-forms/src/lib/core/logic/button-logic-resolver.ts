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
 * Checks if the field has explicit logic that should override form-level defaults.
 *
 * When a field has its own disabled logic defined, it indicates the user wants
 * custom control over the disabled state, so form-level defaults should be ignored.
 *
 * @param fieldLogic - Array of logic configurations
 * @returns true if field has its own disabled logic
 */
function hasCustomDisabledLogic(fieldLogic: LogicConfig[] | undefined): boolean {
  if (!fieldLogic || fieldLogic.length === 0) {
    return false;
  }

  return fieldLogic.some((logic) => logic.type === 'disabled');
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
    if (hasCustomDisabledLogic(ctx.fieldLogic)) {
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
    if (hasCustomDisabledLogic(ctx.fieldLogic)) {
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
