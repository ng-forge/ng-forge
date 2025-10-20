import { Signal } from '@angular/core';
import { FormControlState } from '@angular/forms';

/**
 * Base field configuration interface
 */
export interface FieldConfig<TModel = unknown, TProps = unknown> {
  /** Unique identifier for the field */
  key?: string;

  /** Field type (input, select, checkbox, etc.) */
  type: string;

  /** Default value for the field */
  defaultValue?: unknown;

  /** Type-specific props */
  props?: TProps & BaseFieldProps & Record<string, unknown>;

  /** Validation rules */
  validators?: ValidatorConfig;

  /** Async validators */
  asyncValidators?: AsyncValidatorConfig;

  /** Expression-based rules for visibility, disabled state, etc. */
  expressions?: FieldExpressions<TModel>;

  /** Custom CSS classes */
  className?: string;

  /** Wrappers to apply to this field */
  wrappers?: string[];

  /** Child fields for field groups */
  fieldGroup?: FieldConfig<TModel>[];

  /** Field group configuration */
  fieldGroupClassName?: string;

  /** Hide field from rendering */
  hide?: boolean;

  /** Template options for backward compatibility */
  templateOptions?: Partial<TProps>;

  /** Hooks for field lifecycle events */
  hooks?: FieldHooks<TModel>;

  /** Custom data to pass to field */
  data?: Record<string, unknown>;

  /** Field ID (auto-generated if not provided) */
  id?: string;

  /** Parent field reference */
  parent?: FieldConfig<TModel>;
}

/**
 * Base props available to all field types
 */
export interface BaseFieldProps {
  /** Field label */
  label?: string;

  /** Placeholder text */
  placeholder?: string;

  /** Description or help text */
  description?: string;

  /** Hint text for additional guidance */
  hint?: string;

  /** Is field required */
  required?: boolean;

  /** Is field disabled */
  disabled?: boolean;

  /** Is field readonly */
  readonly?: boolean;

  /** Attributes to pass to the input element */
  attributes?: Record<string, unknown>;

  /** Tab index */
  tabIndex?: number;

  /** Focus field on init */
  focus?: boolean;

  /** Custom CSS classes */
  className?: string;

  /** Allow additional properties for field-specific props */
  [key: string]: unknown;
}

/**
 * Validator configuration
 */
export interface ValidatorConfig {
  [key: string]: ValidatorOption;
}

export type ValidatorOption = boolean | number | string | ValidatorFn | { value: unknown; message?: string };

export type ValidatorFn = (control: FormControlState<unknown>) => ValidationErrors | null;

export interface ValidationErrors {
  [key: string]: unknown;
}

/**
 * Async validator configuration
 */
export interface AsyncValidatorConfig {
  [key: string]: AsyncValidatorFn;
}

export type AsyncValidatorFn = (control: FormControlState<unknown>) => Promise<ValidationErrors | null>;

/**
 * Expression-based field behavior
 */
export interface FieldExpressions<TModel = unknown> {
  /** Expression to control field visibility */
  hide?: string | ((model: TModel) => boolean);

  /** Expression to control disabled state */
  'props.disabled'?: string | ((model: TModel) => boolean);

  /** Expression to control required state */
  'props.required'?: string | ((model: TModel) => boolean);

  /** Custom expressions */
  [key: string]: string | ((model: TModel) => unknown) | undefined;
}

/**
 * Field lifecycle hooks
 */
export interface FieldHooks<TModel = unknown> {
  /** Called when field is initialized */
  onInit?: (field: FieldConfig<TModel>) => void;

  /** Called when field value changes */
  onChange?: (field: FieldConfig<TModel>, value: unknown) => void;

  /** Called when field is destroyed */
  onDestroy?: (field: FieldConfig<TModel>) => void;
}

/**
 * Field state tracking
 */
export interface FieldState {
  /** Field touched state */
  touched: Signal<boolean>;

  /** Field dirty state */
  dirty: Signal<boolean>;

  /** Field valid state */
  valid: Signal<boolean>;

  /** Field errors */
  errors: Signal<ValidationErrors | null>;

  /** Field value */
  value: Signal<unknown>;
}
