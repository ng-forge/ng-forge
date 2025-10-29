import { FieldDef } from '../models/field-config';

/**
 * Group field interface for creating logical field groupings that map to object values
 * Groups create nested form structures where child field values are collected into an object
 * This is a programmatic grouping only - users cannot customize this field type
 */
export interface GroupField extends FieldDef {
  /** Field type identifier */
  readonly type: 'group';

  /** Display label for the group */
  readonly label: string;

  /** Child definitions to render within this group */
  readonly fields: readonly FieldDef[];

  /** Gap configuration for spacing between child definitions */
  readonly gap?: {
    /** Vertical gap between definitions (CSS gap value: px, rem, %, etc.) */
    readonly vertical?: string;
    /** Horizontal gap if definitions are arranged horizontally */
    readonly horizontal?: string;
  };

  /** Additional CSS classes for the group container */
  readonly className?: string;
}

/**
 * Helper function to create a group field with proper typing
 */
export function defineGroupField(config: Omit<GroupField, 'type'>): GroupField {
  return {
    type: 'group' as const,
    ...config,
  };
}

/**
 * Default gap values for group definitions
 */
export const DEFAULT_GROUP_GAPS = {
  vertical: '1rem',
  horizontal: '1rem',
} as const;
