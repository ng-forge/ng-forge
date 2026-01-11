/**
 * Core types for ng-forge form validation
 *
 * These types are used by the validation logic and can be imported
 * by external consumers (e.g., Amplify AI tools).
 */

/**
 * Represents a validation issue found in a FormConfig
 */
export interface ValidationIssue {
  /** JSON path to the problematic location */
  path: string;
  /** Severity of the issue */
  type: 'error' | 'warning';
  /** Human-readable description of the issue */
  message: string;
}

/**
 * Result of validating a FormConfig
 */
export interface ValidationResult {
  /** Whether the config is valid (no errors) */
  valid: boolean;
  /** Number of errors found */
  errorCount: number;
  /** Number of warnings found */
  warningCount: number;
  /** List of error issues */
  errors: Array<{ path: string; message: string }>;
  /** List of warning issues */
  warnings: Array<{ path: string; message: string }>;
  /** Human-readable summary */
  summary: string;
}

/**
 * Field configuration within a FormConfig
 */
export interface FieldConfig {
  key?: string;
  type?: string;
  label?: string;
  required?: boolean;
  email?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  options?: unknown[];
  fields?: FieldConfig[];
  template?: FieldConfig[];
  props?: Record<string, unknown>;
  validators?: unknown[];
  expressions?: Record<string, string>;
  logic?: unknown[];
  [key: string]: unknown;
}

/**
 * Root form configuration object
 */
export interface FormConfig {
  fields?: FieldConfig[];
  defaultValidationMessages?: Record<string, string>;
  [key: string]: unknown;
}
