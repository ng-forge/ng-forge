import { inject } from '@angular/core';
import { apply, applyEach, applyWhen, applyWhenValue, FieldPath, SchemaOrSchemaFn } from '@angular/forms/signals';
import { SchemaApplicationConfig, SchemaDefinition } from '../models/schemas';
import { SchemaRegistryService } from './registry';
import { createLogicFunction } from './expressions';
import { createTypePredicateFunction } from './values';
import { createValidator } from './validation';
import { applyLogic } from './logic';

/**
 * Apply schema configuration
 */
export function applySchema<TValue>(config: SchemaApplicationConfig, fieldPath: FieldPath<TValue>): void {
  const schemaRegistry = inject(SchemaRegistryService);
  const schema = schemaRegistry.resolveSchema(config.schema);

  if (!schema) {
    console.error(`Schema not found: ${config.schema}`);
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
      createValidator(validatorConfig, path);
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
