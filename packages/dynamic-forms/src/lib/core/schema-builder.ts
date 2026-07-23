import { inject } from '@angular/core';
import { Schema, schema } from '@angular/forms/signals';
import type { SchemaPath, SchemaPathTree } from '@angular/forms/signals';
import { FieldDef } from '@ng-forge/dynamic-forms/internal';
import { mapFieldToForm } from './form-mapping';
import { FieldTypeDefinition, getFieldValueHandling } from '@ng-forge/dynamic-forms/internal';
import { getFieldDefaultValue } from '../utils/default-value/default-value';
import { hasChildFields } from '@ng-forge/dynamic-forms/internal';
import { normalizeFieldsArray } from '@ng-forge/dynamic-forms/internal';
import { applyFormLevelSchema } from './form-schema-merger';
import type { FormSchema } from '@ng-forge/dynamic-forms/schema';
import { VALIDATION_EXECUTION_DEFAULTS } from '../providers/features/validation-execution/validation-execution.token';
import { FieldTreeMappingContext, resolveDescendantContext, resolveFieldOwnContext } from './field-tree-mapping-context';

/** Options for creating a schema from field definitions. */
export interface CreateSchemaOptions<TModel = unknown> {
  /** Optional form-level Standard Schema for additional validation. */
  formLevelSchema?: FormSchema<TModel>;

  /** Form-level `validateWhenHidden` setting (from `FormConfig.options.validateWhenHidden`). */
  validateWhenHidden?: boolean;
}

/**
 * Creates an Angular signal forms schema from field definitions
 * This is the single entry point at dynamic form level that replaces createSchemaFromFields
 * Uses the new modular signal forms adapter structure
 *
 * @param fields Field definitions to create schema from
 * @param registry Field type registry
 * @param options Optional configuration object
 */
export function createSchemaFromFields<TModel = unknown>(
  fields: FieldDef<unknown>[],
  registry: Map<string, FieldTypeDefinition>,
  options: CreateSchemaOptions<TModel> = {},
): Schema<TModel> {
  // Inject services for form-level schema construction
  // These will be available because createSchemaFromFields is called within runInInjectionContext
  const validationExecutionDefaults = inject(VALIDATION_EXECUTION_DEFAULTS);

  const { formLevelSchema } = options;
  const rootContext: FieldTreeMappingContext = {
    validateWhenHidden: options.validateWhenHidden ?? validationExecutionDefaults.validateWhenHidden,
    ancestorAlwaysHidden: false,
    ancestorHiddenLogics: [],
  };

  return schema<TModel>((path) => {
    for (const fieldDef of fields) {
      const valueHandling = getFieldValueHandling(fieldDef.type, registry);

      // Handle different value handling modes
      if (valueHandling === 'exclude') {
        // Skip fields that don't contribute to form values
        continue;
      }

      if (valueHandling === 'flatten' && hasChildFields(fieldDef)) {
        // A flatten container can still set its own cascading overrides that flow
        // down to its children — including its own hidden state which has no
        // schema path of its own.
        const flattenedOwn = resolveFieldOwnContext(fieldDef, rootContext);
        const flattenedContext = resolveDescendantContext(fieldDef, flattenedOwn);
        for (const childField of normalizeFieldsArray(fieldDef.fields)) {
          if (!childField.key) continue;

          const childPath = (path as Record<string, SchemaPath<unknown>>)[childField.key];
          if (childPath) {
            mapFieldToForm(childField, childPath, flattenedContext);
          }
        }
        continue;
      }

      // Regular field processing for 'include' fields
      const fieldPath = (path as Record<string, SchemaPath<unknown>>)[fieldDef.key];

      if (!fieldPath) {
        continue;
      }

      // Use the new modular form mapping function
      // This will progressively apply validators, logic, and schemas
      // Cross-field logic is handled automatically via RootFormRegistryService
      mapFieldToForm(fieldDef, fieldPath, rootContext);
    }

    // Apply form-level Standard Schema validation
    if (formLevelSchema) {
      applyFormLevelSchema(path as SchemaPathTree<TModel>, formLevelSchema);
    }
  });
}

/** Utility to convert field definitions to default values object */
export function fieldsToDefaultValues<TModel = unknown>(fields: FieldDef<unknown>[], registry: Map<string, FieldTypeDefinition>): TModel {
  const defaultValues: Record<string, unknown> = {};

  for (const field of fields) {
    if (!field.key) continue;

    // Skip flatten fields (row/page) at top level - they are presentational containers
    const valueHandling = getFieldValueHandling(field.type, registry);
    if (valueHandling === 'flatten') {
      continue;
    }

    const value = getFieldDefaultValue(field, registry);
    if (value !== undefined) {
      defaultValues[field.key] = value;
    }
  }

  return defaultValues as TModel;
}
