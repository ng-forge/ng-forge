import { FieldDef } from '../../definitions/base/field-def';
import { FieldWithValidation } from '../../definitions/base/field-with-validation';
import { DerivationLogicConfig, isDerivationLogicConfig } from '../../models/logic/logic-config';
import { hasChildFields } from '../../models/types/type-guards';
import { normalizeFieldsArray } from '../../utils/object-utils';
import { extractExpressionDependencies, extractStringDependencies } from '../cross-field/cross-field-detector';
import { topologicalSort } from './derivation-sorter';
import { DerivationCollection, DerivationEntry } from './derivation-types';

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
 * and reactive evaluation. Entries are sorted topologically so derivations
 * are processed in dependency order.
 *
 * Lookup maps (byTarget, byDependency, etc.) are NOT built here to
 * reduce the size of the returned collection.
 *
 * @param fields - Array of field definitions to traverse
 * @returns Collection containing sorted derivation entries
 *
 * @example
 * ```typescript
 * const fields = [
 *   { key: 'quantity', type: 'number' },
 *   { key: 'unitPrice', type: 'number' },
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
  const entries: DerivationEntry[] = [];
  const context: CollectionContext = {};

  traverseFields(fields, entries, context);

  // Sort entries in topological order for efficient processing.
  // This ensures derivations are processed in dependency order,
  // reducing the number of iterations needed in the applicator.
  const sortedEntries = topologicalSort(entries);

  return { entries: sortedEntries };
}

/**
 * Recursively traverses field definitions to collect derivations.
 *
 * @internal
 */
function traverseFields(fields: FieldDef<unknown>[], entries: DerivationEntry[], context: CollectionContext): void {
  for (const field of fields) {
    collectFromField(field, entries, context);

    // Recursively process container fields (page, row, group, array)
    if (hasChildFields(field)) {
      const childContext = { ...context };

      // Update array path context if this is an array field
      if (field.type === 'array') {
        childContext.arrayPath = field.key;

        // Array fields have items that can be either FieldDef (primitive) or FieldDef[] (object).
        // Normalize all items to arrays and flatten for traversal.
        const arrayItems = normalizeFieldsArray(field.fields) as (FieldDef<unknown> | FieldDef<unknown>[])[];
        const normalizedChildren: FieldDef<unknown>[] = [];

        for (const item of arrayItems) {
          if (Array.isArray(item)) {
            // Object item: FieldDef[] - add each field
            normalizedChildren.push(...item);
          } else {
            // Primitive item: single FieldDef - add directly
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
 * Collects derivation entries from a single field.
 *
 * @internal
 */
function collectFromField(field: FieldDef<unknown>, entries: DerivationEntry[], context: CollectionContext): void {
  const fieldKey = field.key;
  if (!fieldKey) return;

  const validationField = field as FieldDef<unknown> & FieldWithValidation;

  // Collect shorthand derivation property
  if (validationField.derivation) {
    const entry = createShorthandEntry(fieldKey, validationField.derivation, context);
    entries.push(entry);
  }

  // Collect logic array derivations
  if (validationField.logic) {
    for (const logicConfig of validationField.logic) {
      if (isDerivationLogicConfig(logicConfig)) {
        const entry = createLogicEntry(fieldKey, logicConfig, context);
        entries.push(entry);
      }
    }
  }
}

/**
 * Creates a derivation entry from the shorthand `derivation` property.
 *
 * Shorthand derivations:
 * - Target the same field they're defined on (self-targeting)
 * - Always apply (condition defaults to true)
 * - Always trigger on change
 *
 * @internal
 */
function createShorthandEntry(fieldKey: string, expression: string, context: CollectionContext): DerivationEntry {
  // Build the effective field key, including array path if in array context
  const effectiveFieldKey = context.arrayPath ? `${context.arrayPath}.$.${fieldKey}` : fieldKey;

  return {
    fieldKey: effectiveFieldKey,
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
 * All derivations are self-targeting: the derivation is defined on and targets
 * the same field (fieldKey). For array fields, the context is used to build
 * the array placeholder path.
 *
 * Handles:
 * - Condition extraction and dependency analysis
 * - Array field context for placeholder paths
 * - Multiple value source types (static, expression, function)
 * - Trigger and debounce configuration
 *
 * @internal
 */
function createLogicEntry(fieldKey: string, config: DerivationLogicConfig, context: CollectionContext): DerivationEntry {
  // Build the effective field key, including array path if in array context
  const effectiveFieldKey = context.arrayPath ? `${context.arrayPath}.$.${fieldKey}` : fieldKey;
  const dependsOn = extractDependencies(config);
  const condition = config.condition ?? true;
  const trigger = config.trigger ?? 'onChange';

  // Extract debounceMs from debounced configs
  // The type system ensures debounceMs is only present when trigger is 'debounced'
  const debounceMs = trigger === 'debounced' ? (config as { debounceMs?: number }).debounceMs : undefined;

  return {
    fieldKey: effectiveFieldKey,
    dependsOn,
    condition,
    value: config.value,
    expression: config.expression,
    functionName: config.functionName,
    trigger,
    debounceMs,
    isShorthand: false,
    originalConfig: config,
    debugName: config.debugName,
  };
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
