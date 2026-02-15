import { FieldDef } from '../../definitions/base/field-def';

/**
 * Metadata attached to normalized array fields during simplified array expansion.
 *
 * Stored via a well-known Symbol property on the field object. This survives
 * object spreading (`{ ...field }`) since Symbol-keyed properties are copied
 * by the spread operator, while remaining invisible to `JSON.stringify`,
 * `Object.keys`, and `for...in` loops.
 */
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
