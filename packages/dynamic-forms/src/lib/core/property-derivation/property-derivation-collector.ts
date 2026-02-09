import { FieldDef } from '../../definitions/base/field-def';
import { FieldWithValidation } from '../../definitions/base/field-with-validation';
import { isPropertyDerivationLogicConfig, PropertyDerivationLogicConfig } from '../../models/logic/logic-config';
import { hasChildFields } from '../../models/types/type-guards';
import { normalizeFieldsArray } from '../../utils/object-utils';
import { extractExpressionDependencies, extractStringDependencies } from '../cross-field/cross-field-detector';
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
}

/**
 * Collects all property derivation entries from field definitions.
 *
 * Traverses the field definition tree and extracts `type: 'propertyDerivation'`
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
export function collectPropertyDerivations(fields: FieldDef<unknown>[]): PropertyDerivationCollection {
  const entries: PropertyDerivationEntry[] = [];
  const context: CollectionContext = {};

  traverseFields(fields, entries, context);

  return { entries };
}

/**
 * Recursively traverses field definitions to collect property derivations.
 *
 * @internal
 */
function traverseFields(fields: FieldDef<unknown>[], entries: PropertyDerivationEntry[], context: CollectionContext): void {
  for (const field of fields) {
    collectFromField(field, entries, context);

    // Recursively process container fields (page, row, group, array)
    if (hasChildFields(field)) {
      const childContext = { ...context };

      if (field.type === 'array') {
        childContext.arrayPath = field.key;

        const arrayItems = normalizeFieldsArray(field.fields) as (FieldDef<unknown> | FieldDef<unknown>[])[];
        const normalizedChildren: FieldDef<unknown>[] = [];

        for (const item of arrayItems) {
          if (Array.isArray(item)) {
            normalizedChildren.push(...item);
          } else {
            normalizedChildren.push(item);
          }
        }

        traverseFields(normalizedChildren, entries, childContext);
      } else {
        traverseFields(normalizeFieldsArray(field.fields) as FieldDef<unknown>[], entries, childContext);
      }
    }
  }
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
      if (isPropertyDerivationLogicConfig(logicConfig)) {
        const entry = createPropertyDerivationEntry(fieldKey, logicConfig, context);
        entries.push(entry);
      }
    }
  }
}

/**
 * Creates a property derivation entry from a `PropertyDerivationLogicConfig`.
 *
 * @internal
 */
function createPropertyDerivationEntry(
  fieldKey: string,
  config: PropertyDerivationLogicConfig,
  context: CollectionContext,
): PropertyDerivationEntry {
  const effectiveFieldKey = buildPropertyOverrideKey(context.arrayPath, context.arrayPath ? PLACEHOLDER_INDEX : undefined, fieldKey);
  const dependsOn = extractDependencies(config);
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
    trigger,
    debounceMs,
    debugName: config.debugName,
    originalConfig: config,
  };
}

/**
 * Extracts all field dependencies from a property derivation config.
 *
 * @internal
 */
function extractDependencies(config: PropertyDerivationLogicConfig): string[] {
  const deps = new Set<string>();

  if (config.dependsOn && config.dependsOn.length > 0) {
    config.dependsOn.forEach((dep) => deps.add(dep));
  } else {
    if (config.expression) {
      const exprDeps = extractStringDependencies(config.expression);
      exprDeps.forEach((dep) => deps.add(dep));
    }

    if (config.functionName) {
      deps.add('*');
    }
  }

  // Always extract from condition
  if (config.condition && config.condition !== true) {
    const conditionDeps = extractExpressionDependencies(config.condition);
    conditionDeps.forEach((dep) => deps.add(dep));
  }

  return Array.from(deps);
}
