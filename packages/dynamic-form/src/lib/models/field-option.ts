/**
 * Shared interface for field options used across select, radio, and multi-checkbox fields
 */
export interface FieldOption<T = unknown> {
  label: string;
  value: T;
  disabled?: boolean;
}