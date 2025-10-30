import { Schema } from '@angular/forms/signals';
import { InferFormValue, RegisteredFieldTypes } from './global-types';

/**
 * Form configuration interface that uses registered field types for type safety
 */
export interface FormConfig<TFields extends readonly RegisteredFieldTypes[] = readonly RegisteredFieldTypes[], TValue = InferFormValue<TFields>> {
  readonly fields: TFields;
  readonly schema?: Schema<TValue>;
  readonly options?: FormOptions;
}

/**
 * Form options for global form behavior
 */
export interface FormOptions {
  // TODO: implement these options
  readonly validateOnChange?: undefined;
  readonly validateOnBlur?: undefined;
  readonly disabled?: boolean;
}
