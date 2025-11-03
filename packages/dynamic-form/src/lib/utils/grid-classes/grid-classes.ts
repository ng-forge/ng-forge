import { FieldDef } from '../../definitions';

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
 * // Returns: 'col-12'
 *
 * // Half width field
 * const halfWidth = getGridClassString({ type: 'input', key: 'email', col: 6 });
 * // Returns: 'col-6'
 *
 * // Invalid column value
 * const invalid = getGridClassString({ type: 'input', key: 'phone', col: 15 });
 * // Returns: ''
 * ```
 *
 * @example
 * ```typescript
 * // Usage in component template
 * @Component({
 *   template: `
 *     <div [class]="getGridClassString(field)" class="form-field">
 *       <!-- Field content -->
 *     </div>
 *   `
 * })
 * export class FieldComponent {
 *   field: FieldDef<any>;
 *   getGridClassString = getGridClassString;
 * }
 * ```
 *
 * @public
 */
export function getGridClassString(fieldDef: FieldDef<Record<string, unknown>>): string {
  const classes: string[] = [];

  if (typeof fieldDef.col === 'number' && fieldDef.col > 0 && fieldDef.col <= 12) {
    classes.push(`col-${fieldDef.col}`);
  }

  return classes.join(' ');
}
