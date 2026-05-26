import { FieldDef } from '../../definitions/base/field-def';
import { Logger } from '../../providers/features/logger/logger.interface';
import type { WarningTracker } from '../../utils/warning-tracker';
import { collectAllDerivations } from '../derivation/derivation-collector';
import { PropertyDerivationCollection } from './property-derivation-types';

/**
 * Collects all property derivation entries from field definitions.
 *
 * Thin wrapper around {@link collectAllDerivations} that returns the
 * property slice. For forms that have both kinds of derivations, prefer
 * calling `collectAllDerivations` directly — it walks the field tree once
 * instead of twice.
 *
 * @public
 */
export function collectPropertyDerivations(
  fields: FieldDef<unknown>[],
  logger: Logger,
  tracker: WarningTracker,
): PropertyDerivationCollection {
  return collectAllDerivations(fields, logger, tracker).property;
}
