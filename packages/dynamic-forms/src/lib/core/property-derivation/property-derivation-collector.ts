import { FieldDef } from '../../definitions/base/field-def';
import { collectAllDerivations } from '../derivation/derivation-collector';
import { PropertyDerivationCollection } from './property-derivation-types';

/**
 * Collects all property derivation entries from field definitions.
 *
 * Thin wrapper around `collectAllDerivations` that returns the property
 * slice. For forms that have both kinds of derivations, prefer calling
 * `collectAllDerivations` directly — it walks the field tree once instead
 * of twice (orchestrator already does this when both pipelines are active).
 *
 * @public
 */
export function collectPropertyDerivations(fields: FieldDef<unknown>[]): PropertyDerivationCollection {
  return collectAllDerivations(fields).property;
}
