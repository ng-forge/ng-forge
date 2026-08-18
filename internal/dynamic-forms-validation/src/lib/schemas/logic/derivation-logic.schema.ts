import { z } from 'zod';
import { ConditionalExpressionSchema } from './conditional-expression.schema';

/**
 * Schema for immediate derivation logic (evaluates on change).
 *
 * Derivations are self-targeting: they compute and set the value
 * of the field they are defined on.
 *
 * Original interface:
 * ```typescript
 * interface OnChangeDerivationLogicConfig extends BaseDerivationLogicConfig {
 *   trigger?: 'onChange';
 *   debounceMs?: never;
 * }
 * ```
 */
export const OnChangeDerivationLogicConfigSchema = z.object({
  /**
   * Discriminant for derivation logic.
   */
  type: z.literal('derivation'),

  /**
   * Debug name for logging and troubleshooting.
   */
  debugName: z.string().optional(),

  /**
   * Condition for when this derivation should run.
   * Defaults to true (always runs).
   */
  condition: z.union([ConditionalExpressionSchema, z.boolean()]).optional(),

  /**
   * Static value to set. Mutually exclusive with expression/functionName.
   */
  value: z.unknown().optional(),

  /**
   * JavaScript expression to evaluate for the value.
   * Has access to: fieldValue, formValue, fieldPath
   */
  expression: z.string().optional(),

  /**
   * Name of a registered derivation function.
   * The function must be registered in customFnConfig.derivations.
   */
  functionName: z.string().optional(),

  /**
   * Explicit dependencies for determining when to re-evaluate.
   * If omitted, dependencies are auto-detected from the expression.
   */
  dependsOn: z.array(z.string()).optional(),

  /**
   * Trigger type - defaults to 'onChange' for immediate evaluation.
   */
  trigger: z.literal('onChange').optional(),
});

/**
 * Schema for debounced derivation logic (evaluates after delay).
 *
 * Derivations are self-targeting: they compute and set the value
 * of the field they are defined on.
 *
 * Original interface:
 * ```typescript
 * interface DebouncedDerivationLogicConfig extends BaseDerivationLogicConfig {
 *   trigger: 'debounced';
 *   debounceMs?: number;
 * }
 * ```
 */
export const DebouncedDerivationLogicConfigSchema = z.object({
  /**
   * Discriminant for derivation logic.
   */
  type: z.literal('derivation'),

  /**
   * Debug name for logging and troubleshooting.
   */
  debugName: z.string().optional(),

  /**
   * Condition for when this derivation should run.
   */
  condition: z.union([ConditionalExpressionSchema, z.boolean()]).optional(),

  /**
   * Static value to set.
   */
  value: z.unknown().optional(),

  /**
   * JavaScript expression to evaluate for the value.
   */
  expression: z.string().optional(),

  /**
   * Name of a registered derivation function.
   */
  functionName: z.string().optional(),

  /**
   * Explicit dependencies for determining when to re-evaluate.
   */
  dependsOn: z.array(z.string()).optional(),

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
 * Union schema for derivation logic configurations.
 *
 * Original type:
 * ```typescript
 * type DerivationLogicConfig = OnChangeDerivationLogicConfig | DebouncedDerivationLogicConfig;
 * ```
 */
export const DerivationLogicConfigSchema = z.union([OnChangeDerivationLogicConfigSchema, DebouncedDerivationLogicConfigSchema]);

export type DerivationLogicConfigSchemaType = z.infer<typeof DerivationLogicConfigSchema>;
