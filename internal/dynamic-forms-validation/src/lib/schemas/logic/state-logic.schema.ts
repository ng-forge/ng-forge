import { z } from 'zod';
import { ConditionalExpressionSchema } from './conditional-expression.schema';

/**
 * State logic types that control field visibility and interactivity.
 */
export const StateLogicTypeSchema = z.enum(['hidden', 'readonly', 'disabled', 'required']);

export type StateLogicType = z.infer<typeof StateLogicTypeSchema>;

/**
 * Form state conditions for quick checks.
 */
export const FormStateConditionSchema = z.enum(['formInvalid', 'formSubmitting', 'pageInvalid']);

export type FormStateCondition = z.infer<typeof FormStateConditionSchema>;

/**
 * Schema for the condition property - can be:
 * - ConditionalExpression: Complex condition
 * - boolean: Static true/false
 * - FormStateCondition: Quick form state check
 */
export const StateConditionSchema = z.union([ConditionalExpressionSchema, z.boolean(), FormStateConditionSchema]);

export type StateCondition = z.infer<typeof StateConditionSchema>;

/**
 * Trigger types for logic evaluation.
 */
export const LogicTriggerSchema = z.enum(['onChange', 'debounced']);

export type LogicTrigger = z.infer<typeof LogicTriggerSchema>;

/**
 * Schema for immediate state logic (evaluates on change).
 *
 * Original interface:
 * ```typescript
 * interface ImmediateStateLogicConfig extends BaseStateLogicConfig {
 *   trigger?: 'onChange';
 *   debounceMs?: never;
 * }
 * ```
 */
export const ImmediateStateLogicConfigSchema = z.object({
  /**
   * The state property to control.
   */
  type: StateLogicTypeSchema,

  /**
   * Condition that determines when the state is applied.
   */
  condition: StateConditionSchema,

  /**
   * Trigger type - defaults to 'onChange' for immediate evaluation.
   */
  trigger: z.literal('onChange').optional(),
});

/**
 * Schema for debounced state logic (evaluates after delay).
 *
 * Original interface:
 * ```typescript
 * interface DebouncedStateLogicConfig extends BaseStateLogicConfig {
 *   trigger: 'debounced';
 *   debounceMs?: number;
 * }
 * ```
 */
export const DebouncedStateLogicConfigSchema = z.object({
  /**
   * The state property to control.
   */
  type: StateLogicTypeSchema,

  /**
   * Condition that determines when the state is applied.
   */
  condition: StateConditionSchema,

  /**
   * Trigger type - must be 'debounced' for delayed evaluation.
   */
  trigger: z.literal('debounced'),

  /**
   * Debounce duration in milliseconds. Defaults to 500.
   */
  debounceMs: z.number().positive().optional(),
});

/**
 * Union schema for state logic configurations.
 *
 * Original type:
 * ```typescript
 * type StateLogicConfig = ImmediateStateLogicConfig | DebouncedStateLogicConfig;
 * ```
 */
export const StateLogicConfigSchema = z.union([ImmediateStateLogicConfigSchema, DebouncedStateLogicConfigSchema]);

export type StateLogicConfigSchemaType = z.infer<typeof StateLogicConfigSchema>;
