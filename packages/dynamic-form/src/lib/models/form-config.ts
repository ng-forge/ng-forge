import { Schema } from '@angular/forms/signals';
import { InferFormValue, RegisteredFieldTypes } from './types';
import { SchemaDefinition } from './schemas';
import { EvaluationContext } from './expressions';

/**
 * Form configuration interface that uses registered field types for type safety
 */
export interface FormConfig<
  TFields extends readonly RegisteredFieldTypes[] = readonly RegisteredFieldTypes[],
  TValue = InferFormValue<TFields>
> {
  readonly fields: TFields;
  readonly schema?: Schema<TValue>;
  readonly options?: FormOptions;

  /** Global schemas available to all fields */
  readonly schemas?: SchemaDefinition[];

  /** Signal forms adapter configuration */
  readonly signalFormsConfig?: SignalFormsConfig;
}

/**
 * Signal forms adapter configuration
 */
export interface SignalFormsConfig {
  /** Enable automatic migration from legacy validation */
  migrateLegacyValidation?: boolean;

  /** Custom evaluation functions */
  customFunctions?: Record<string, (context: EvaluationContext) => unknown>;

  /** Strict mode - throw errors for invalid expressions */
  strictMode?: boolean;
}

/**
 * Form options for global form behavior
 */
export interface FormOptions {
  readonly validateOnChange?: boolean;
  readonly validateOnBlur?: boolean;
  readonly disabled?: boolean;
}
