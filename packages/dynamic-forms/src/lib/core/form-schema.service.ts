import { Service } from '@angular/core';
import type { Schema } from '@angular/forms/signals';
import { DynamicFormError } from '@ng-forge/dynamic-forms/internal';
import type { FieldDef, FieldTypeDefinition } from '@ng-forge/dynamic-forms/internal';
import type { FormSchema } from '@ng-forge/dynamic-forms/schema';
import { createFormLevelSchema } from './form-schema-merger';
import { createSchemaFromFields } from './schema-builder';

export interface FormSchemaRequest {
  readonly fields: FieldDef<unknown>[];
  readonly registry: Map<string, FieldTypeDefinition>;
  readonly formLevelSchema: FormSchema<unknown> | undefined;
  readonly validateWhenHidden: boolean | undefined;
}

/**
 * Lazy schema compiler requested by a form when its first value-bearing field is encountered.
 *
 * The service is stateless and auto-provided so Angular's `injectAsync()` can keep this module,
 * including form mapping, validators, schemas, and expression logic, out of the eager graph.
 */
@Service()
export default class FormSchemaService {
  create({ fields, registry, formLevelSchema, validateWhenHidden }: FormSchemaRequest): Schema<unknown> {
    if (fields.length > 0) {
      return createSchemaFromFields(fields, registry, { formLevelSchema, validateWhenHidden });
    }

    if (formLevelSchema) {
      return createFormLevelSchema(formLevelSchema);
    }

    throw new DynamicFormError('The form schema service was requested without fields or a form-level schema.');
  }
}
