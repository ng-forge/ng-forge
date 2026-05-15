import { FieldDef } from '../../definitions/base/field-def';
import { FieldWithValidation } from '../../definitions/base/field-with-validation';
import { DynamicFormError } from '../../errors/dynamic-form-error';
import { DerivationLogicConfig, hasTargetProperty, isDerivationLogicConfig } from '../../models/logic/logic-config';
import { extractStringDependencies } from '../cross-field/cross-field-detector';
import { topologicalSort } from './derivation-sorter';
import type { BaseDerivationEntry } from './derivation-entry-base';
import { DerivationCollection, DerivationEntry } from './derivation-types';
import { extractDependenciesFromConfig } from './extract-dependencies';
import { traverseFieldsWithContext } from './field-traversal';

/**
 * Token in `dependsOn` arrays that resolves to the current field's own
 * absolute path at collection time. Useful for self-derivations on fields
 * nested under groups, where the absolute path depends on ancestor keys
 * the config author may not know (e.g. factory-built field shapes).
 *
 * @public
 */
export const SELF_DEPENDENCY_TOKEN = '$self';

/**
 * Token in `dependsOn` arrays that resolves to the absolute path of the
 * field's nearest parent container (group or array) at collection time.
 *
 * Useful when a derivation should fire whenever any sibling under the
 * same parent container changes (e.g. "compute when anything in the
 * address group is edited") without enumerating each sibling explicitly.
 *
 * Resolution rules:
 * - Inside group(s) only: resolves to the dotted ancestor group path
 *   (e.g. `'address'` or `'org.address'`).
 * - Inside an array (no group between): resolves to the array key
 *   (e.g. `'items'`). Fires whenever any item changes.
 * - Inside group(s) inside an array: resolves to the array placeholder
 *   form including the inner groups (e.g. `'items.$.address'`).
 * - At form root: throws `DynamicFormError` (no parent to target).
 *
 * @public
 */
export const GROUP_DEPENDENCY_TOKEN = '$group';

/**
 * Context for collecting derivations, tracking the current array and group
 * paths so absolute field paths can be reconstructed for entries.
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

  /**
   * Dot-joined ancestor group keys for fields nested inside one or more
   * groups (e.g., 'address' or 'org.address'). Layout containers
   * (page, row, container) do not contribute to this path. Reset at
   * array boundaries — the array placeholder path takes over.
   */
  groupPath?: string;
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

  traverseFieldsWithContext<CollectionContext>(fields, {}, (field, context) => collectFromField(field, entries, context), {
    // Array boundary: the array placeholder path takes over and any
    // ancestor groupPath is reset for descendants (entries inside
    // array items use `arrayPath.$.fieldKey` form).
    onArrayChild: (_, field) => ({ arrayPath: field.key, groupPath: undefined }),
    onGroupChild: (parent, field) => {
      // Group establishes a model boundary; descend with the field's
      // key appended to the ancestor groupPath. Groups without a key
      // (rare) act like layout containers — leave context unchanged.
      if (!field.key) return {};
      return { groupPath: parent.groupPath ? `${parent.groupPath}.${field.key}` : field.key };
    },
    // Layout containers (page, row, container) leave context unchanged.
  });

  // Sort entries in topological order for efficient processing.
  // This ensures derivations are processed in dependency order,
  // reducing the number of iterations needed in the applicator.
  const sortedEntries = topologicalSort(entries);

  return { entries: sortedEntries };
}

/**
 * Builds the absolute field path for a derivation entry from the field's
 * key and the current collection context.
 *
 * - Inside an array AND inside one or more groups (groups nested under
 *   the array item): combines both as `${arrayPath}.$.${groupPath}.${fieldKey}`.
 * - Inside an array only: returns `${arrayPath}.$.${fieldKey}`.
 * - Inside one or more groups: returns `${groupPath}.${fieldKey}`.
 * - Otherwise returns `fieldKey` unchanged.
 *
 * `groupPath` is reset when entering an array (each array item is its own
 * model root); ancestor groups OUTSIDE the array are not part of the
 * entry path. Groups INSIDE the array are tracked via `groupPath` and
 * combined here.
 *
 * @internal
 */
function buildEffectiveFieldKey(fieldKey: string, context: CollectionContext): string {
  if (context.arrayPath && context.groupPath) {
    return `${context.arrayPath}.$.${context.groupPath}.${fieldKey}`;
  }
  if (context.arrayPath) {
    return `${context.arrayPath}.$.${fieldKey}`;
  }
  if (context.groupPath) {
    return `${context.groupPath}.${fieldKey}`;
  }
  return fieldKey;
}

/**
 * Resolves the absolute path of the field's nearest parent container
 * (group or array). Returns `undefined` when the field is at the form
 * root with no parent container.
 *
 * @internal
 */
function buildNearestGroupPath(context: CollectionContext): string | undefined {
  if (context.arrayPath && context.groupPath) {
    return `${context.arrayPath}.$.${context.groupPath}`;
  }
  return context.arrayPath ?? context.groupPath;
}

/**
 * Substitutes special tokens in a `dependsOn` array with their resolved
 * absolute paths. Currently supports:
 *
 * - `SELF_DEPENDENCY_TOKEN` ('$self') → the field's own absolute path
 * - `'$self.X'` → the field's own path joined with `.X` (e.g. for object-valued
 *   fields where you want to depend on a sub-property)
 * - `GROUP_DEPENDENCY_TOKEN` ('$group') → the field's nearest parent
 *   container path; throws if the field has no parent group/array.
 * - `'$group.sibling'` → the parent path joined with `.sibling`, useful to
 *   target a specific sibling without naming the parent group key.
 *
 * Non-token strings are passed through unchanged.
 *
 * @internal
 */
function resolveTokenDependencies(deps: string[], effectiveFieldKey: string, context: CollectionContext): string[] {
  return deps.map((dep) => {
    if (dep === SELF_DEPENDENCY_TOKEN) {
      return effectiveFieldKey;
    }
    if (dep.startsWith(`${SELF_DEPENDENCY_TOKEN}.`)) {
      return effectiveFieldKey + dep.slice(SELF_DEPENDENCY_TOKEN.length);
    }
    if (dep === GROUP_DEPENDENCY_TOKEN || dep.startsWith(`${GROUP_DEPENDENCY_TOKEN}.`)) {
      const groupPath = buildNearestGroupPath(context);
      if (!groupPath) {
        throw new DynamicFormError(
          `Derivation for '${effectiveFieldKey}' uses '${dep}' but the field has no parent group or array. ` +
            `'${GROUP_DEPENDENCY_TOKEN}' is only valid for fields nested inside a group or array container.`,
        );
      }
      if (dep === GROUP_DEPENDENCY_TOKEN) return groupPath;
      return groupPath + dep.slice(GROUP_DEPENDENCY_TOKEN.length);
    }
    return dep;
  });
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
        if (hasTargetProperty(logicConfig)) continue;
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
  const effectiveFieldKey = buildEffectiveFieldKey(fieldKey, context);

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
  const effectiveFieldKey = buildEffectiveFieldKey(fieldKey, context);

  // Runtime guards for HTTP and async derivations.
  // Mutual exclusivity and required fields are now enforced by TypeScript (via `source` discriminant).
  // The wildcard and empty-array checks below are not expressible in the type system.
  //
  // Note: `$group` / `$group.X` tokens are intentionally allowed for HTTP and async sources even
  // though they resolve to the parent path and therefore fire on any sibling change inside that
  // group/array. Unlike `*`, the token is structurally scoped (collection throws if the field has
  // no parent container) and an explicit opt-in. Consumers that want to bound request frequency
  // can use `trigger: 'debounced'` here, or rely on debouncing inside their async function.
  if (config.source === 'http') {
    if (config.dependsOn.length === 0) {
      throw new DynamicFormError(
        `HTTP derivation for '${effectiveFieldKey}' requires explicit 'dependsOn'. ` +
          `Wildcard dependencies would trigger HTTP requests on every form change.`,
      );
    }
    if (config.dependsOn.includes('*')) {
      throw new DynamicFormError(
        `HTTP derivation for '${effectiveFieldKey}' cannot use wildcard ('*') in 'dependsOn'. ` +
          `Wildcards would trigger HTTP requests on every form change. Specify explicit field dependencies instead.`,
      );
    }
  }

  if (config.source === 'asyncFunction') {
    if (config.dependsOn.length === 0) {
      throw new DynamicFormError(
        `Async derivation for '${effectiveFieldKey}' requires explicit 'dependsOn'. ` +
          `Wildcard dependencies would trigger async functions on every form change.`,
      );
    }
    if (config.dependsOn.includes('*')) {
      throw new DynamicFormError(
        `Async derivation for '${effectiveFieldKey}' cannot use wildcard ('*') in 'dependsOn'. ` +
          `Wildcards would trigger async functions on every form change. Specify explicit field dependencies instead.`,
      );
    }
  }

  const dependsOn = resolveTokenDependencies(extractDependenciesFromConfig(config), effectiveFieldKey, context);
  const condition = config.condition ?? true;
  const trigger = config.trigger ?? 'onChange';

  // Extract debounceMs from debounced configs
  // The type system ensures debounceMs is only present when trigger is 'debounced'
  const debounceMs = trigger === 'debounced' ? (config as { debounceMs?: number }).debounceMs : undefined;

  // `fn` / `asyncFn` only appear on the function-mode variants of the discriminated union, but
  // we copy them through unconditionally — they'll just be `undefined` for other modes.
  // Read-only access, no widening.
  return {
    fieldKey: effectiveFieldKey,
    dependsOn,
    condition,
    value: config.value,
    expression: config.expression,
    functionName: config.functionName,
    fn: (config as { fn?: BaseDerivationEntry['fn'] }).fn,
    http: config.http,
    responseExpression: config.responseExpression,
    asyncFunctionName: config.asyncFunctionName,
    asyncFn: (config as { asyncFn?: DerivationEntry['asyncFn'] }).asyncFn,
    trigger,
    debounceMs,
    isShorthand: false,
    originalConfig: config,
    debugName: config.debugName,
    stopOnUserOverride: config.stopOnUserOverride,
    reEngageOnDependencyChange: config.reEngageOnDependencyChange,
  };
}
