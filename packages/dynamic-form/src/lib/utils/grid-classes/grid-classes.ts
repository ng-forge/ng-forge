import { FieldDef } from '../../definitions';

/**
 * Generates CSS class string for grid layout based on field column configuration
 * @param fieldDef Field definition containing column configuration
 * @returns CSS class string for grid layout
 */
export function getGridClassString(fieldDef: FieldDef<Record<string, unknown>>): string {
  const classes: string[] = [];

  if (typeof fieldDef.col === 'number' && fieldDef.col > 0 && fieldDef.col <= 12) {
    classes.push(`col-${fieldDef.col}`);
  }

  return classes.join(' ');
}
