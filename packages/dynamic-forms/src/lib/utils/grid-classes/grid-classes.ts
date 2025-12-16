import { FieldDef } from '../../definitions/base/field-def';

/**
 * Cache for computed grid class strings.
 * Uses WeakMap keyed by field definition object for automatic cleanup.
 */
const gridClassCache = new WeakMap<FieldDef<unknown>, string>();

/**
 * Generates CSS class string for responsive grid layout based on field column configuration.
 *
 * Creates Bootstrap-style column classes for implementing responsive form layouts.
 * Validates column values to ensure they fall within the standard 12-column grid system.
 *
 * Results are memoized using WeakMap to avoid recomputation for the same field definition.
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
export function getGridClassString(fieldDef: FieldDef<unknown>): string {
  // Check cache first
  const cached = gridClassCache.get(fieldDef);
  if (cached !== undefined) {
    return cached;
  }

  // Compute grid class string
  const classes: string[] = [];

  if (typeof fieldDef.col === 'number' && fieldDef.col > 0 && fieldDef.col <= 12) {
    classes.push(`df-col-${fieldDef.col}`);
  }

  const result = classes.join(' ');

  // Cache and return
  gridClassCache.set(fieldDef, result);
  return result;
}
