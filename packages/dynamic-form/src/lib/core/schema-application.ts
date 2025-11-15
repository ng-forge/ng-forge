import { inject } from '@angular/core';
import { apply, applyEach, applyWhen, applyWhenValue, FieldPath, SchemaOrSchemaFn } from '@angular/forms/signals';
import { SchemaApplicationConfig, SchemaDefinition } from '../models/schemas';
import { SchemaRegistryService } from './registry';
import { createLogicFunction } from './expressions';
import { createTypePredicateFunction } from './values';
import { applyValidator } from './validation';
import { applyLogic } from './logic';

/**
 * Apply schema configuration
 */
export function applySchema<TValue>(config: SchemaApplicationConfig, fieldPath: FieldPath<TValue>): void {
  const schemaRegistry = inject(SchemaRegistryService);
  const schema = schemaRegistry.resolveSchema(config.schema);

  if (!schema) {
    const availableSchemas = Array.from(schemaRegistry.getAllSchemas().keys()).join(', ') || '<none>';
    console.error(
      `[Schema] Schema not found: '${config.schema}'. ` +
        `Available schemas: ${availableSchemas}. ` +
        `Ensure the schema is registered in your schema registry.`,
    );
    return;
  }

  const schemaFn = createSchemaFunction(schema);

  switch (config.type) {
    case 'apply':
      apply(fieldPath, schemaFn);
      break;

    case 'applyWhen':
      if (config.condition) {
        const conditionFn = createLogicFunction(config.condition);
        applyWhen(fieldPath, conditionFn, schemaFn);
      }
      break;

    case 'applyWhenValue':
      if (config.typePredicate) {
        const predicate = createTypePredicateFunction(config.typePredicate);
        applyWhenValue(fieldPath, predicate, schemaFn);
      }
      break;

    case 'applyEach':
      applyEach(fieldPath as FieldPath<TValue[]>, schemaFn);
      break;
  }
}

/**
 * Create a schema function from schema definition
 */
export function createSchemaFunction<T = unknown>(schema: SchemaDefinition): SchemaOrSchemaFn<T> {
  return (path: FieldPath<T>) => {
    // Apply validators
    schema.validators?.forEach((validatorConfig) => {
      applyValidator(validatorConfig, path);
    });

    // Apply logic
    schema.logic?.forEach((logicConfig) => {
      applyLogic(logicConfig, path);
    });

    // Apply sub-schemas
    schema.subSchemas?.forEach((subSchemaConfig) => {
      applySchema(subSchemaConfig, path);
    });
  };
}
