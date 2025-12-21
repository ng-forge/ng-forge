import { inject } from '@angular/core';
import { apply, applyEach, applyWhen, applyWhenValue, SchemaOrSchemaFn } from '@angular/forms/signals';
import type { SchemaPath, SchemaPathTree } from '@angular/forms/signals';
import { SchemaApplicationConfig, SchemaDefinition } from '../models/schemas/schema-definition';
import { SchemaRegistryService } from './registry/schema-registry.service';
import { createLogicFunction } from './expressions/logic-function-factory';
import { createTypePredicateFunction } from './values/type-predicate-factory';
import { applyValidator } from './validation/validator-factory';
import { applyLogic } from './logic/logic-applicator';
import { DynamicFormLogger } from '../providers/features/logger/logger.token';

/**
 * Apply schema configuration.
 * Accepts both SchemaPath and SchemaPathTree for flexibility.
 *
 * Note: We cast fieldPath to suppress TypeScript's union type errors. This is safe because:
 * 1. We only use signal forms (not AbstractControl), so SchemaPathTree is always the supported branch
 * 2. The Angular apply functions accept SchemaPath with any value type
 * 3. The actual schema application happens at runtime via the schema function
 */
export function applySchema(config: SchemaApplicationConfig, fieldPath: SchemaPath<unknown> | SchemaPathTree<unknown>): void {
  const logger = inject(DynamicFormLogger);
  const schemaRegistry = inject(SchemaRegistryService);
  const schema = schemaRegistry.resolveSchema(config.schema);

  if (!schema) {
    const availableSchemas = Array.from(schemaRegistry.getAllSchemas().keys()).join(', ') || '<none>';
    logger.error(
      `Schema not found: '${config.schema}'. ` +
        `Available schemas: ${availableSchemas}. ` +
        `Ensure the schema is registered in your schema registry.`,
    );
    return;
  }

  const schemaFn = createSchemaFunction(schema);

  // Cast to suppress union type errors - safe because we only use signal forms (see function docs)
  const path = fieldPath as SchemaPath<unknown>;

  switch (config.type) {
    case 'apply':
      apply(path, schemaFn);
      break;

    case 'applyWhen':
      if (config.condition) {
        const conditionFn = createLogicFunction(config.condition);
        applyWhen(path, conditionFn, schemaFn);
      }
      break;

    case 'applyWhenValue':
      if (config.typePredicate) {
        const predicate = createTypePredicateFunction(config.typePredicate, logger);
        applyWhenValue(path, predicate, schemaFn);
      }
      break;

    case 'applyEach':
      applyEach(path as SchemaPath<unknown[]>, schemaFn);
      break;
  }
}

/**
 * Create a schema function from schema definition.
 *
 * Schema functions receive SchemaPathTree which includes both the base SchemaPath
 * and nested child access properties. The validator/logic/schema application functions
 * accept SchemaPath | SchemaPathTree, so we can pass the path directly.
 */
export function createSchemaFunction(schema: SchemaDefinition): SchemaOrSchemaFn<unknown> {
  return (path: SchemaPathTree<unknown>) => {
    // Apply validators - path is SchemaPathTree which is accepted by applyValidator
    schema.validators?.forEach((validatorConfig) => {
      applyValidator(validatorConfig, path);
    });

    // Apply logic - path is SchemaPathTree which is accepted by applyLogic
    schema.logic?.forEach((logicConfig) => {
      applyLogic(logicConfig, path);
    });

    // Apply sub-schemas - path is SchemaPathTree which is accepted by applySchema
    schema.subSchemas?.forEach((subSchemaConfig) => {
      applySchema(subSchemaConfig, path);
    });
  };
}
