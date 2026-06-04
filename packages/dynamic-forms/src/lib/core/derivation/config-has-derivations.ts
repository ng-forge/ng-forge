import { FieldDef, FieldWithValidation, isDerivationLogicConfig } from '@ng-forge/dynamic-forms/internal';
import { someField } from './field-traversal';

/**
 * Cheap, eager predicate: does any field in the config declare a value or
 * property derivation — the shorthand `derivation` string, or a `logic[]` entry
 * of `type: 'derivation'` (the latter covers both value derivations and
 * `targetProperty` property derivations)?
 *
 * Deliberately reuses the collector's child resolution ({@link someField} shares
 * it with `traverseFieldsWithContext`) and detection predicate
 * ({@link isDerivationLogicConfig}) so this gate can never diverge from what
 * `createDerivationOrchestrator` would actually wire — including derivations
 * nested in containers and array-item templates.
 *
 * Stays lightweight (no dependency on the heavy derivation-orchestrator module)
 * so it can run eagerly to decide whether the orchestrator needs to be
 * lazy-loaded at all. Forms without derivations never pull the engine.
 *
 * @internal
 */
export function configHasDerivations(fields: FieldDef<unknown>[]): boolean {
  return someField(fields, (field) => {
    // Match the collector's keyless guard (derivation-collector.ts): a keyless
    // field never produces a derivation entry, so it must not trip the gate.
    // `someField` still recurses into its children.
    if (!field.key) return false;
    const validationField = field as FieldDef<unknown> & FieldWithValidation;
    return !!validationField.derivation || !!validationField.logic?.some(isDerivationLogicConfig);
  });
}
