import { FieldDef } from '../../definitions/base/field-def';
import { ArrayAllowedChildren } from '../../models/types/nesting-constraints';

/** Metadata attached to normalized array fields during simplified array expansion. */
export interface NormalizedArrayMetadata {
  /**
   * Remove button FieldDef for primitive simplified arrays.
   * The array component renders this alongside each item without
   * wrapping in a row, preserving flat primitive form values.
   */
  readonly autoRemoveButton?: FieldDef<unknown>;
  /**
   * For primitive simplified arrays, the key of the value field template (e.g., 'value').
   * Stored during normalization so the array component doesn't need dynamic discovery.
   */
  readonly primitiveFieldKey?: string;
  /**
   * Copied from `SimplifiedArrayField.template` during normalization. Used as the
   * fallback template for any array item present in the form value that was not
   * added through the event handlers and is not covered by a positional entry in
   * `fields` — e.g., items introduced by external form-value updates.
   */
  readonly template?: ArrayAllowedChildren | readonly ArrayAllowedChildren[];
}

/**
 * Symbol key for storing normalization metadata on array field objects.
 * Using a Symbol ensures no collision with user-defined properties and
 * the property is excluded from JSON serialization and enumeration.
 */
export const NORMALIZED_ARRAY_METADATA = Symbol('normalizedArrayMetadata');

/**
 * Associates normalization metadata with an array field object.
 * Called during simplified array expansion.
 */
export function setNormalizedArrayMetadata(arrayField: Record<string | symbol, unknown>, metadata: NormalizedArrayMetadata): void {
  arrayField[NORMALIZED_ARRAY_METADATA] = metadata;
}

/**
 * Retrieves normalization metadata for an array field, if any.
 * Returns undefined for full-API arrays that were not normalized from a simplified definition.
 */
export function getNormalizedArrayMetadata(arrayField: object): NormalizedArrayMetadata | undefined {
  return (arrayField as Record<symbol, unknown>)[NORMALIZED_ARRAY_METADATA] as NormalizedArrayMetadata | undefined;
}
