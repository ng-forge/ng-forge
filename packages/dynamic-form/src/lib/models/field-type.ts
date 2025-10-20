import { Provider, Type } from '@angular/core';
import { FieldConfig } from './field-config';

/**
 * Field type definition
 */
export interface FieldTypeDefinition<TProps = unknown> {
  /** Unique name for the field type */
  name: string;

  /** Component to render this field type (eager loading) */
  component?: Type<unknown>;

  /** Lazy load function for the component */
  loadComponent?: () => Promise<Type<unknown>>;

  /** Extend another field type */
  extends?: string;

  /** Default props for this field type */
  defaultProps?: Partial<TProps>;

  /** Default wrappers to apply */
  wrappers?: string[];

  /** Default validators */
  validators?: string[];

  /** Additional providers for this field type */
  providers?: Provider[];
}

/**
 * Field wrapper definition
 */
export interface FieldWrapperDefinition {
  /** Unique name for the wrapper */
  name: string;

  /** Component to render this wrapper */
  component: Type<unknown>;

  /** Priority for ordering wrappers (higher = outer) */
  priority?: number;
}

/**
 * Field component interface (deprecated - use FormValueControl/FormCheckboxControl directly)
 * @deprecated Use Angular's FormValueControl or FormCheckboxControl interfaces instead
 */
export interface FieldComponent<TProps = unknown> {
  /** Field configuration */
  field: FieldConfig<unknown, TProps>;

  /** Form model signal */
  model: unknown;

  /** On value change callback */
  onValueChange?: (value: unknown) => void;
}

/**
 * Wrapper component interface
 */
export interface WrapperComponent {
  /** Field configuration */
  field: FieldConfig;
}
