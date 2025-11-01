import { FieldDef } from '../../definitions';

/**
 * Interface for column configuration
 */
export interface ColumnConfig {
  span?: number;
  start?: number;
  end?: number;
}

/**
 * Generates CSS classes for grid layout based on field column configuration
 * @param fieldDef Field definition containing column configuration
 * @returns Array of CSS classes to apply to the field
 */
export function generateGridClasses(fieldDef: FieldDef<Record<string, unknown>>): string[] {
  const classes: string[] = ['df-field'];

  // Handle basic col property (legacy support)
  if (typeof fieldDef.col === 'number' && fieldDef.col > 0) {
    classes.push(`df-col-${Math.min(fieldDef.col, 12)}`);
    return classes;
  }

  // Handle extended col configuration
  const colConfig = fieldDef.col as ColumnConfig | undefined;
  if (!colConfig) {
    // Default behavior - auto-size in row, full width outside row
    return classes;
  }

  // Generate span classes
  if (colConfig.span && colConfig.span > 0) {
    const span = Math.min(colConfig.span, 12);
    classes.push(`df-col-${span}`);
  }

  // Generate start classes
  if (colConfig.start && colConfig.start > 0) {
    const start = Math.min(colConfig.start, 12);
    classes.push(`df-col-start-${start}`);
  }

  // Generate end classes
  if (colConfig.end && colConfig.end > 0) {
    const end = Math.min(colConfig.end, 13); // End can be 13 for full span
    classes.push(`df-col-end-${end}`);
  }

  return classes;
}

/**
 * Generates responsive grid classes for different breakpoints
 * @param fieldDef Field definition containing responsive column configuration
 * @returns Array of responsive CSS classes
 */
export function generateResponsiveGridClasses(fieldDef: FieldDef<Record<string, unknown>>): string[] {
  const classes: string[] = [];

  // Check for responsive column configuration in props
  const props = fieldDef.props as any;
  if (!props) return classes;

  // Small screens (tablet)
  if (props.colSm) {
    if (typeof props.colSm === 'number') {
      classes.push(`df-col-sm-${Math.min(props.colSm, 6)}`);
    } else if (props.colSm.span) {
      classes.push(`df-col-sm-${Math.min(props.colSm.span, 6)}`);
    }
  }

  // Medium screens (small desktop)
  if (props.colMd) {
    if (typeof props.colMd === 'number') {
      classes.push(`df-col-md-${Math.min(props.colMd, 12)}`);
    } else if (props.colMd.span) {
      classes.push(`df-col-md-${Math.min(props.colMd.span, 12)}`);
    }
  }

  // Large screens (large desktop)
  if (props.colLg) {
    if (typeof props.colLg === 'number') {
      classes.push(`df-col-lg-${Math.min(props.colLg, 12)}`);
    } else if (props.colLg.span) {
      classes.push(`df-col-lg-${Math.min(props.colLg.span, 12)}`);
    }
  }

  return classes;
}

/**
 * Generates all grid-related CSS classes for a field
 * @param fieldDef Field definition
 * @returns Complete array of CSS classes for grid layout
 */
export function getAllGridClasses(fieldDef: FieldDef<Record<string, unknown>>): string[] {
  return [...generateGridClasses(fieldDef), ...generateResponsiveGridClasses(fieldDef)];
}

/**
 * Applies grid classes to a field component's host element
 * @param fieldDef Field definition
 * @param renderer Angular Renderer2 instance
 * @param elementRef Element reference to the field component
 */
export function applyGridClasses(fieldDef: FieldDef<Record<string, unknown>>, renderer: any, elementRef: any): void {
  const classes = getAllGridClasses(fieldDef);

  classes.forEach((className) => {
    renderer.addClass(elementRef.nativeElement, className);
  });
}

/**
 * Creates a class string from field definition for use in host bindings
 * @param fieldDef Field definition
 * @returns Space-separated string of CSS classes
 */
export function getGridClassString(fieldDef: FieldDef<Record<string, unknown>>): string {
  return getAllGridClasses(fieldDef).join(' ');
}
