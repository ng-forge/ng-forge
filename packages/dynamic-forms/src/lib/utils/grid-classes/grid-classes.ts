import { FieldDef } from '../../definitions/base/field-def';

/**
 * Generates CSS class string for responsive grid layout based on field column configuration.
 *
 * Creates Bootstrap-style column classes for implementing responsive form layouts.
 * Validates column values to ensure they fall within the standard 12-column grid system.
 *
 * @param fieldDef - Field definition containing column configuration
 * @returns CSS class string for grid layout, empty if no valid column configuration
 *
 * @example
 * ```typescript
 * // Full width field
 * const fullWidth = getGridClassString({ type: 'input', key: 'name', col: 12 });
 * // Returns: 'df-col-12'
 *
 * // Half width field
 * const halfWidth = getGridClassString({ type: 'input', key: 'email', col: 6 });
 * // Returns: 'df-col-6'
 *
 * // Invalid column value
 * const invalid = getGridClassString({ type: 'input', key: 'phone', col: 15 });
 * // Returns: ''
 * ```
 *
 * @public
 */
export function getGridClassString(fieldDef: FieldDef<unknown>): string {
  const col = fieldDef.col;
  if (typeof col === 'number' && Number.isInteger(col) && col > 0 && col <= 12) {
    return `df-col-${col}`;
  }
  return '';
}
