import { FieldDef } from '@ng-forge/dynamic-forms/internal';
import { collectAllDerivations } from '../derivation/derivation-collector';
import { PropertyDerivationCollection } from './property-derivation-types';

/** Collects all property derivation entries from field definitions. */
export function collectPropertyDerivations(fields: FieldDef<unknown>[]): PropertyDerivationCollection {
  return collectAllDerivations(fields).property;
}
