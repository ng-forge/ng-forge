import { FieldDef } from '../../definitions/base/field-def';
import { FieldWithValidation } from '../../definitions/base/field-with-validation';
import { DerivationLogicConfig, isDerivationLogicConfig, hasTargetProperty } from '../../models/logic/logic-config';
import { Logger } from '../../providers/features/logger/logger.interface';
import type { WarningTracker } from '../../utils/warning-tracker';
import { extractDependenciesFromConfig } from '../derivation/extract-dependencies';
import { traverseFieldsWithContext } from '../derivation/field-traversal';
import { buildPropertyOverrideKey, PLACEHOLDER_INDEX } from './property-override-key';
import { PropertyDerivationCollection, PropertyDerivationEntry } from './property-derivation-types';

/**
 * Context for collecting property derivations, tracking array path for relative references.
 *
 * @internal
 */
interface CollectionContext {
  /** Current array path for resolving relative field references. */
  arrayPath?: string;
  logger: Logger;
  tracker: WarningTracker;
}

/**
 * Collects all property derivation entries from field definitions.
 *
 * Traverses the field definition tree and extracts `type: 'derivation'` with `targetProperty`
 * entries from each field's `logic` array.
 *
 * No topological sort is needed because property derivations don't chain —
 * they read formValue and write to the property override store.
 *
 * @param fields - Array of field definitions to traverse
 * @returns Collection containing property derivation entries
 *
 * @public
 */
export function collectPropertyDerivations(
  fields: FieldDef<unknown>[],
  logger: Logger,
  tracker: WarningTracker,
): PropertyDerivationCollection {
  const entries: PropertyDerivationEntry[] = [];
  const context: CollectionContext = { logger, tracker };

  traverseFieldsWithContext<CollectionContext>(fields, context, (field, ctx) => collectFromField(field, entries, ctx), {
    onArrayChild: (_, field) => ({ arrayPath: field.key }),
    // Group and layout containers do not affect property-derivation paths.
  });

  return { entries };
}

/**
 * Collects property derivation entries from a single field.
 *
 * @internal
 */
function collectFromField(field: FieldDef<unknown>, entries: PropertyDerivationEntry[], context: CollectionContext): void {
  const fieldKey = field.key;
  if (!fieldKey) return;

  const validationField = field as FieldDef<unknown> & FieldWithValidation;

  if (validationField.logic) {
    for (const logicConfig of validationField.logic) {
      if (isDerivationLogicConfig(logicConfig) && hasTargetProperty(logicConfig)) {
        const entry = createPropertyDerivationEntryFromDerivation(fieldKey, logicConfig, context);
        entries.push(entry);
      }
    }
  }
}

/**
 * Creates a property derivation entry from a `DerivationLogicConfig` that has `targetProperty`.
 *
 * This handles the new unified path where `type: 'derivation'` configs with `targetProperty`
 * are routed to the property derivation pipeline.
 *
 * @internal
 */
function createPropertyDerivationEntryFromDerivation(
  fieldKey: string,
  config: DerivationLogicConfig & { targetProperty: string },
  context: CollectionContext,
): PropertyDerivationEntry {
  const effectiveFieldKey = buildPropertyOverrideKey(context.arrayPath, context.arrayPath ? PLACEHOLDER_INDEX : undefined, fieldKey);
  const dependsOn = extractDependenciesFromConfig(config);
  const condition = config.condition ?? true;
  const trigger = config.trigger ?? 'onChange';
  const debounceMs = trigger === 'debounced' ? (config as { debounceMs?: number }).debounceMs : undefined;

  return {
    fieldKey: effectiveFieldKey,
    targetProperty: config.targetProperty,
    dependsOn,
    condition,
    value: config.value,
    expression: config.expression,
    functionName: config.functionName,
    fn: (config as { fn?: PropertyDerivationEntry['fn'] }).fn,
    trigger,
    debounceMs,
    debugName: config.debugName,
    originalConfig: config,
  };
}
