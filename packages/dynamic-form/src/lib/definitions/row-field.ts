import { FieldDef } from '../models/field-config';

/**
 * Row field interface for creating horizontal layouts
 * This is a special field type that contains other definitions arranged horizontally
 * The row itself doesn't have a value - it's a layout container
 * This is a programmatic field type only - users cannot customize this field type
 */
export interface RowField extends FieldDef {
  /** Field type identifier */
  readonly type: 'row';

  /** Display label for the row */
  readonly label: string;

  /** Child definitions to render within this row */
  readonly fields: readonly FieldDef[];

  /** Gap configuration for spacing between definitions */
  readonly gap?: {
    /** Horizontal gap between definitions (CSS gap value: px, rem, %, etc.) */
    readonly horizontal?: string;
    /** Vertical gap for wrapped content (CSS gap value: px, rem, %, etc.) */
    readonly vertical?: string;
  };

  /** Responsive breakpoint configuration - customizable by user */
  readonly breakpoints?: {
    /** Breakpoint at which definitions stack vertically (default: 'sm') */
    readonly stackAt?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  };

  /** Additional CSS classes for the row container */
  readonly className?: string;
}

/**
 * Extended field interface for definitions that can be used within rows
 * Adds column sizing support for responsive layouts
 */
export interface RowChildField extends FieldDef {
  /** Column sizing configuration for responsive behavior */
  readonly col?: {
    /** Default column span (1-12, undefined means full width) */
    readonly span?: number;
    /** Column span at small screens and up */
    readonly sm?: number;
    /** Column span at medium screens and up */
    readonly md?: number;
    /** Column span at large screens and up */
    readonly lg?: number;
    /** Column span at extra large screens and up */
    readonly xl?: number;
  };
}

/**
 * Helper function to create a row field with proper typing
 */
export function defineRowField(config: Omit<RowField, 'type'>): RowField {
  return {
    type: 'row' as const,
    ...config,
  };
}

/**
 * Helper function to create a field with column configuration
 */
export function defineFieldWithCol<TKey extends string, TValue = unknown>(
  config: FieldDef<TKey, TValue> & { col?: RowChildField['col'] }
): RowChildField {
  return config as RowChildField;
}

/**
 * Default gap values for consistent spacing
 */
export const DEFAULT_ROW_GAPS = {
  horizontal: '1rem',
  vertical: '0.75rem',
} as const;

/**
 * CSS breakpoint values matching common design systems - customizable by user
 */
export const BREAKPOINTS = {
  xs: '0px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
} as const;
