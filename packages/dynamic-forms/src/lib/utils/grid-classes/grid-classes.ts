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

/**
 * Builds a combined className string from a field definition.
 *
 * Combines user-provided className with generated grid classes into a single string.
 * Returns undefined if no classes are present (allowing conditional spreading in objects).
 *
 * @param fieldDef - Field definition containing className and col properties
 * @returns Combined class string, or undefined if no classes
 *
 * @example
 * ```typescript
 * // With both className and col
 * buildClassName({ key: 'test', type: 'group', className: 'my-class', col: 6 });
 * // Returns: 'df-col-6 my-class'
 *
 * // With only className
 * buildClassName({ key: 'test', type: 'group', className: 'my-class' });
 * // Returns: 'my-class'
 *
 * // With only col
 * buildClassName({ key: 'test', type: 'group', col: 6 });
 * // Returns: 'df-col-6'
 *
 * // With neither
 * buildClassName({ key: 'test', type: 'group' });
 * // Returns: undefined
 * ```
 *
 * @public
 */
export function buildClassName(fieldDef: FieldDef<unknown>): string | undefined {
  const gridClass = getGridClassString(fieldDef);
  const userClass = fieldDef.className;

  const classes: string[] = [];

  if (gridClass) {
    classes.push(gridClass);
  }

  if (userClass) {
    classes.push(userClass);
  }

  return classes.length > 0 ? classes.join(' ') : undefined;
}
