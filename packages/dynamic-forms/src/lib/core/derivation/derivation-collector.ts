import { FieldDef } from '../../definitions/base/field-def';
import { FieldWithValidation } from '../../definitions/base/field-with-validation';
import { DerivationLogicConfig, isDerivationLogicConfig } from '../../models/logic/logic-config';
import { hasChildFields } from '../../models/types/type-guards';
import { normalizeFieldsArray } from '../../utils/object-utils';
import { extractArrayPath, isArrayPlaceholderPath } from '../../utils/path-utils/path-utils';
import { extractExpressionDependencies, extractStringDependencies } from '../cross-field/cross-field-detector';
import { precomputeCachedCollections } from './derivation-cache';
import { topologicalSort } from './derivation-sorter';
import { DerivationCollection, DerivationEntry, createEmptyDerivationCollection } from './derivation-types';

/**
 * Context for collecting derivations, tracking the current array path for relative references.
 *
 * @internal
 */
interface CollectionContext {
  /**
   * Current array path for resolving relative field references.
   *
   * When inside an array field, this contains the path to the array item
   * (e.g., 'items[0]' or 'orders[1].lineItems[2]').
   */
  arrayPath?: string;
}

/**
 * Collects all derivation entries from field definitions.
 *
 * This function traverses the field definition tree and extracts:
 * - Shorthand `derivation` properties on fields
 * - Full `logic` array entries with `type: 'derivation'`
 *
 * The collected entries include dependency information for cycle detection
 * and reactive evaluation.
 *
 * @param fields - Array of field definitions to traverse
 * @returns Collection of all derivation entries with lookup maps
 *
 * @example
 * ```typescript
 * const fields = [
 *   {
 *     key: 'quantity',
 *     type: 'number',
 *   },
 *   {
 *     key: 'unitPrice',
 *     type: 'number',
 *   },
 *   {
 *     key: 'total',
 *     type: 'number',
 *     derivation: 'formValue.quantity * formValue.unitPrice',
 *   },
 * ];
 *
 * const collection = collectDerivations(fields);
 * // collection.entries has 1 entry for the 'total' field derivation
 * ```
 *
 * @public
 */
export function collectDerivations(fields: FieldDef<unknown>[]): DerivationCollection {
  const collection = createEmptyDerivationCollection();
  const context: CollectionContext = {};

  traverseFields(fields, collection, context);
  buildLookupMaps(collection);

  // Sort entries in topological order for efficient processing
  // This ensures derivations are processed in dependency order,
  // reducing the number of iterations needed in the applicator
  collection.entries = topologicalSort(collection);

  // Pre-compute cached sub-collections for onChange and debounced entries
  // This avoids expensive filtering operations at runtime
  precomputeCachedCollections(collection);

  return collection;
}

/**
 * Recursively traverses field definitions to collect derivations.
 *
 * @internal
 */
function traverseFields(fields: FieldDef<unknown>[], collection: DerivationCollection, context: CollectionContext): void {
  for (const field of fields) {
    collectFromField(field, collection, context);

    // Recursively process container fields (page, row, group, array)
    if (hasChildFields(field)) {
      const childContext = { ...context };

      // Update array path context if this is an array field
      if (field.type === 'array') {
        childContext.arrayPath = field.key;
      }

      traverseFields(normalizeFieldsArray(field.fields) as FieldDef<unknown>[], collection, childContext);
    }
  }
}

/**
 * Collects derivation entries from a single field.
 *
 * @internal
 */
function collectFromField(field: FieldDef<unknown>, collection: DerivationCollection, context: CollectionContext): void {
  const fieldKey = field.key;
  if (!fieldKey) return;

  const validationField = field as FieldDef<unknown> & FieldWithValidation;

  // Collect shorthand derivation property
  if (validationField.derivation) {
    const entry = createShorthandEntry(fieldKey, validationField.derivation);
    collection.entries.push(entry);
  }

  // Collect logic array derivations
  if (validationField.logic) {
    for (const logicConfig of validationField.logic) {
      if (isDerivationLogicConfig(logicConfig)) {
        const entry = createLogicEntry(fieldKey, logicConfig, context);
        collection.entries.push(entry);
      }
    }
  }
}

/**
 * Creates a derivation entry from the shorthand `derivation` property.
 *
 * Shorthand derivations:
 * - Always target the same field they're defined on
 * - Always apply (condition defaults to true)
 * - Always trigger on change
 *
 * @internal
 */
function createShorthandEntry(fieldKey: string, expression: string): DerivationEntry {
  return {
    sourceFieldKey: fieldKey,
    targetFieldKey: fieldKey,
    dependsOn: extractStringDependencies(expression),
    condition: true,
    expression,
    trigger: 'onChange',
    isShorthand: true,
  };
}

/**
 * Creates a derivation entry from a full `DerivationLogicConfig`.
 *
 * Handles:
 * - Condition extraction and dependency analysis
 * - Relative path resolution for array fields
 * - Multiple value source types (static, expression, function)
 * - Trigger and debounce configuration
 *
 * @internal
 */
function createLogicEntry(fieldKey: string, config: DerivationLogicConfig, context: CollectionContext): DerivationEntry {
  const targetFieldKey = resolveTargetFieldKey(config.targetField, fieldKey, context);
  const dependsOn = extractDependencies(config);
  const condition = config.condition ?? true;
  const trigger = config.trigger ?? 'onChange';

  // Extract debounceMs from debounced configs
  // The type system ensures debounceMs is only present when trigger is 'debounced'
  const debounceMs = trigger === 'debounced' ? (config as { debounceMs?: number }).debounceMs : undefined;

  return {
    sourceFieldKey: fieldKey,
    targetFieldKey,
    dependsOn,
    condition,
    value: config.value,
    expression: config.expression,
    functionName: config.functionName,
    trigger,
    debounceMs,
    isShorthand: false,
    originalConfig: config,
  };
}

/**
 * Resolves a target field key, handling relative paths for array fields.
 *
 * Relative paths start with '$.' and reference siblings at the same array index.
 *
 * @param targetField - The target field specification from config
 * @param sourceFieldKey - The source field key
 * @param context - Current collection context with array path info
 * @returns Resolved target field key
 *
 * @example
 * ```typescript
 * // Absolute path - returned as-is
 * resolveTargetFieldKey('phonePrefix', 'country', {})
 * // Returns: 'phonePrefix'
 *
 * // Relative path in array context
 * resolveTargetFieldKey('$.lineTotal', 'items[0].quantity', { arrayPath: 'items' })
 * // Returns: 'items.$.lineTotal'
 * ```
 *
 * @internal
 */
function resolveTargetFieldKey(targetField: string, sourceFieldKey: string, context: CollectionContext): string {
  // Check for relative path indicator
  if (targetField.startsWith('$.')) {
    // Extract the relative field name (after '$.')
    const relativePath = targetField.substring(2);

    if (context.arrayPath) {
      // Replace '$' with the array path for pattern matching
      return `${context.arrayPath}.$.${relativePath}`;
    }

    // If not in array context, try to extract array path from source field
    const arrayMatch = sourceFieldKey.match(/^(.+?)\[/);
    if (arrayMatch) {
      return `${arrayMatch[1]}.$.${relativePath}`;
    }

    // Fallback: keep relative path as-is (will be resolved at runtime)
    return targetField;
  }

  // Absolute path - return as-is
  return targetField;
}

/**
 * Extracts all field dependencies from a derivation config.
 *
 * Combines dependencies from:
 * - Explicit `dependsOn` array (if provided, takes precedence)
 * - Condition expression
 * - Value expression
 * - Function name (defaults to '*' if no explicit dependsOn)
 *
 * @internal
 */
function extractDependencies(config: DerivationLogicConfig): string[] {
  const deps = new Set<string>();

  // If explicit dependsOn is provided, use it as the primary source
  // This allows users to override automatic detection and control
  // when derivations are triggered
  if (config.dependsOn && config.dependsOn.length > 0) {
    config.dependsOn.forEach((dep) => deps.add(dep));
  } else {
    // Extract from expression (automatic dependency detection)
    if (config.expression) {
      const exprDeps = extractStringDependencies(config.expression);
      exprDeps.forEach((dep) => deps.add(dep));
    }

    // Custom functions assume full form access if no explicit dependsOn
    if (config.functionName) {
      deps.add('*');
    }
  }

  // Always extract from condition (these are additional runtime guards)
  if (config.condition && config.condition !== true) {
    const conditionDeps = extractExpressionDependencies(config.condition);
    conditionDeps.forEach((dep) => deps.add(dep));
  }

  return Array.from(deps);
}

/**
 * Builds lookup maps for quick access to derivation entries.
 *
 * @internal
 */
function buildLookupMaps(collection: DerivationCollection): void {
  for (const entry of collection.entries) {
    // Build byTarget map
    const targetEntries = collection.byTarget.get(entry.targetFieldKey) ?? [];
    targetEntries.push(entry);
    collection.byTarget.set(entry.targetFieldKey, targetEntries);

    // Build bySource map
    const sourceEntries = collection.bySource.get(entry.sourceFieldKey) ?? [];
    sourceEntries.push(entry);
    collection.bySource.set(entry.sourceFieldKey, sourceEntries);

    // Build byDependency map - key by each dependency field
    // Also track wildcard entries separately
    let hasWildcard = false;
    for (const dep of entry.dependsOn) {
      if (dep === '*') {
        hasWildcard = true;
      } else {
        const depEntries = collection.byDependency.get(dep) ?? [];
        depEntries.push(entry);
        collection.byDependency.set(dep, depEntries);
      }
    }

    // Add to wildcardEntries if has * dependency
    if (hasWildcard) {
      collection.wildcardEntries.push(entry);
    }

    // Build byArrayPath map for array derivations
    if (isArrayPlaceholderPath(entry.targetFieldKey)) {
      const arrayPath = extractArrayPath(entry.targetFieldKey);
      if (arrayPath) {
        const arrayEntries = collection.byArrayPath.get(arrayPath) ?? [];
        arrayEntries.push(entry);
        collection.byArrayPath.set(arrayPath, arrayEntries);
      }
    }
  }
}
