import { inject } from '@angular/core';
import { apply, applyEach, applyWhen, applyWhenValue, SchemaOrSchemaFn } from '@angular/forms/signals';
import type { SchemaPath, SchemaPathTree } from '@angular/forms/signals';
import { SchemaApplicationConfig, SchemaDefinition } from '@ng-forge/dynamic-forms/internal';
import { SchemaRegistryService } from './registry/schema-registry.service';
import { createLogicFunction } from '@ng-forge/dynamic-forms/internal';
import { createTypePredicateFunction } from './values/type-predicate-factory';
import { applyValidator } from '@ng-forge/dynamic-forms/internal';
import { requiresTreeValidation } from '@ng-forge/dynamic-forms/internal';
import { applyLogic } from './logic/logic-applicator';
import { DynamicFormLogger, type Logger } from '@ng-forge/dynamic-forms/internal';

/**
 * Apply schema configuration.
 * Accepts both SchemaPath and SchemaPathTree for flexibility.
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

  const schemaFn = createSchemaFunction(schema, logger);

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

/** Create a schema function from schema definition. */
export function createSchemaFunction(schema: SchemaDefinition, logger?: Logger): SchemaOrSchemaFn<unknown> {
  return (path: SchemaPathTree<unknown>) => {
    // Apply validators - path is SchemaPathTree which is accepted by applyValidator
    schema.validators?.forEach((validatorConfig) => {
      // Cross-field expressions are collected from field definitions only; schema
      // definition validators never reach the tree collector, so drop them loudly.
      if (requiresTreeValidation(validatorConfig)) {
        logger?.warn(
          `Validator "${validatorConfig.type}" in schema definition "${schema.name}" uses a cross-field expression, ` +
            `which is not supported on schema definition validators; it was skipped.`,
        );
        return;
      }
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
