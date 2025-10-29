import { FieldDef } from '../definitions/base';
import { Schema } from '@angular/forms/signals';

/**
 * JSON-based: Simple field definitions with JSON validators (for API configs)
 */
export interface FormConfig<TFields extends readonly FieldDef<Record<string, unknown>>[] = readonly FieldDef<Record<string, unknown>>[], TValue = unknown> {
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
