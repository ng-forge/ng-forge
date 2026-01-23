import { z } from 'zod';

/**
 * Comparison operators for field value conditions.
 */
export const ComparisonOperatorSchema = z.enum([
  'equals',
  'notEquals',
  'greater',
  'less',
  'greaterOrEqual',
  'lessOrEqual',
  'contains',
  'startsWith',
  'endsWith',
  'matches',
]);

export type ComparisonOperator = z.infer<typeof ComparisonOperatorSchema>;

/**
 * Base schema for conditions that compare values.
 */
const BaseComparisonConditionSchema = z.object({
  operator: ComparisonOperatorSchema.optional(),
  value: z.unknown().optional(),
});

/**
 * Schema for field value conditions.
 * Compares a specific field's value against a target.
 */
export const FieldValueConditionSchema = BaseComparisonConditionSchema.extend({
  type: z.literal('fieldValue'),
  /**
   * Path to the field to check.
   * Supports dot notation for nested fields.
   */
  fieldPath: z.string(),
});

/**
 * Schema for form value conditions.
 * Evaluates against the entire form value.
 */
export const FormValueConditionSchema = BaseComparisonConditionSchema.extend({
  type: z.literal('formValue'),
});

/**
 * Schema for custom function conditions.
 * Uses a registered custom function for evaluation.
 */
export const CustomConditionSchema = z.object({
  type: z.literal('custom'),
  /**
   * JavaScript expression to evaluate.
   * Has access to: fieldValue, formValue, fieldPath
   */
  expression: z.string(),
});

/**
 * Schema for JavaScript expression conditions.
 * Evaluates a JavaScript expression directly.
 */
export const JavaScriptConditionSchema = z.object({
  type: z.literal('javascript'),
  /**
   * JavaScript expression to evaluate.
   * Has access to: fieldValue, formValue, fieldPath
   */
  expression: z.string(),
});

/**
 * Schema for ConditionalExpression - recursive discriminated union.
 *
 * Original interface:
 * ```typescript
 * interface ConditionalExpression {
 *   type: 'fieldValue' | 'formValue' | 'custom' | 'javascript' | 'and' | 'or';
 *   fieldPath?: string;
 *   operator?: ComparisonOperator;
 *   value?: unknown;
 *   expression?: string;
 *   conditions?: ConditionalExpression[];
 * }
 * ```
 *
 * Uses z.lazy() for recursive 'and' and 'or' conditions.
 */
export const ConditionalExpressionSchema: z.ZodType<ConditionalExpression> = z.lazy(() =>
  z.discriminatedUnion('type', [
    FieldValueConditionSchema,
    FormValueConditionSchema,
    CustomConditionSchema,
    JavaScriptConditionSchema,
    AndConditionSchema,
    OrConditionSchema,
  ]),
);

/**
 * Schema for AND composite conditions.
 * All sub-conditions must be true.
 */
export const AndConditionSchema = z.object({
  type: z.literal('and'),
  /**
   * Array of conditions that must all be true.
   */
  conditions: z.array(z.lazy(() => ConditionalExpressionSchema)),
});

/**
 * Schema for OR composite conditions.
 * At least one sub-condition must be true.
 */
export const OrConditionSchema = z.object({
  type: z.literal('or'),
  /**
   * Array of conditions where at least one must be true.
   */
  conditions: z.array(z.lazy(() => ConditionalExpressionSchema)),
});

/**
 * Inferred type for ConditionalExpression.
 */
export type ConditionalExpression =
  | z.infer<typeof FieldValueConditionSchema>
  | z.infer<typeof FormValueConditionSchema>
  | z.infer<typeof CustomConditionSchema>
  | z.infer<typeof JavaScriptConditionSchema>
  | {
      type: 'and';
      conditions: ConditionalExpression[];
    }
  | {
      type: 'or';
      conditions: ConditionalExpression[];
    };
