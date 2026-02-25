/**
 * Default field type choices when running in non-interactive (CI) mode.
 * Maps ambiguous scopes to their default field types.
 */
export const DEFAULT_FIELD_CHOICES: Record<string, string> = {
  'text-input': 'input',
  'single-select': 'select',
  numeric: 'input',
  boolean: 'checkbox',
};
