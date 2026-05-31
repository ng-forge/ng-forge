import { FieldDef } from '../../definitions/base/field-def';

/**
 * Generates CSS class string for responsive grid layout based on field column configuration.
 *
 * @param fieldDef - Field definition containing column configuration
 * @returns CSS class string for grid layout, empty if no valid column configuration
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
 * @param fieldDef - Field definition containing className and col properties
 * @returns Combined class string, or undefined if no classes
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
