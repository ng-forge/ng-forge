import { Provider, Type } from '@angular/core';

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
