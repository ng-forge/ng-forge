import { z } from 'zod';
import { StateLogicConfigSchema } from './state-logic.schema';
import { DerivationLogicConfigSchema } from './derivation-logic.schema';

/**
 * Union schema for all logic configurations.
 *
 * Original type:
 * ```typescript
 * type LogicConfig = StateLogicConfig | DerivationLogicConfig;
 * ```
 *
 * Logic configs control:
 * - State: hidden, readonly, disabled, required (based on conditions)
 * - Derivation: computed values (based on other field values)
 */
export const LogicConfigSchema = z.union([StateLogicConfigSchema, DerivationLogicConfigSchema]);

/**
 * Schema for an array of logic configurations.
 */
export const LogicArraySchema = z.array(LogicConfigSchema);

/**
 * Inferred type for a single logic config.
 */
export type LogicConfigSchemaType = z.infer<typeof LogicConfigSchema>;

/**
 * Inferred type for an array of logic configs.
 */
export type LogicArraySchemaType = z.infer<typeof LogicArraySchema>;
