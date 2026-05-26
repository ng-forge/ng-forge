import { FieldDef } from '../../definitions/base/field-def';
import { FieldWithValidation } from '../../definitions/base/field-with-validation';
import { DynamicFormError } from '../../errors/dynamic-form-error';
import { DerivationLogicConfig, hasTargetProperty, isDerivationLogicConfig } from '../../models/logic/logic-config';
import { Logger } from '../../providers/features/logger/logger.interface';
import type { WarningTracker } from '../../utils/warning-tracker';
import { extractStringDependencies } from '../cross-field/cross-field-detector';
import { PropertyDerivationCollection, PropertyDerivationEntry } from '../property-derivation/property-derivation-types';
import { topologicalSort } from './derivation-sorter';
import { DerivationCollection, DerivationEntry } from './derivation-types';
import { extractDependenciesFromConfig } from './extract-dependencies';
import { extractInlineAsyncFn, extractInlineFn } from './extract-inline-fn';
import { traverseFieldsWithContext } from './field-traversal';
import {
  buildEffectiveFieldKey,
  CollectionContext,
  CONTEXT_TRAVERSAL_OPTIONS,
  resolveTokenDependencies,
  SELF_DEPENDENCY_TOKEN as _SELF_DEPENDENCY_TOKEN,
  GROUP_DEPENDENCY_TOKEN as _GROUP_DEPENDENCY_TOKEN,
} from './collection-context';

/** Re-exported for back-compat. See `./collection-context.ts` for the canonical declaration. */
export const SELF_DEPENDENCY_TOKEN = _SELF_DEPENDENCY_TOKEN;
/** Re-exported for back-compat. See `./collection-context.ts` for the canonical declaration. */
export const GROUP_DEPENDENCY_TOKEN = _GROUP_DEPENDENCY_TOKEN;

// ─────────────────────────────────────────────────────────────────────────────
// Public collectors
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Collects all VALUE derivation entries from field definitions.
 *
 * Traverses the field definition tree and extracts:
 * - Shorthand `derivation` properties on fields
 * - Full `logic` array entries with `type: 'derivation'` *without* `targetProperty`
 *   (entries WITH `targetProperty` are property derivations; see {@link collectAllDerivations}).
 *
 * The collected entries are sorted topologically so downstream processing
 * applies them in dependency order.
 *
 * Thin wrapper over {@link collectAllDerivations} that returns the value
 * slice. For forms that have both kinds of derivations, prefer the unified
 * collector — it walks the field tree once instead of twice.
 *
 * @param fields - Array of field definitions to traverse
 * @returns Collection containing sorted derivation entries
 *
 * @public
 */
export function collectDerivations(fields: FieldDef<unknown>[]): DerivationCollection {
  const entries: DerivationEntry[] = [];

  traverseFieldsWithContext<CollectionContext>(
    fields,
    {},
    (field, context) => collectValueEntriesFromField(field, entries, context),
    CONTEXT_TRAVERSAL_OPTIONS,
  );

  return { entries: topologicalSort(entries) };
}

/**
 * Single traversal that emits both value derivations (sorted topologically)
 * and property derivations (no sort — they don't chain among themselves).
 *
 * Replaces the previous pattern of calling {@link collectDerivations} and the
 * standalone `collectPropertyDerivations` separately — those walked the tree
 * twice and re-derived the array/group path tracking each time. This walks
 * once, dispatching each `type: 'derivation'` logic entry to the right
 * collection based on whether it carries a `targetProperty`.
 *
 * @public
 */
export function collectAllDerivations(
  fields: FieldDef<unknown>[],
  logger: Logger,
  tracker: WarningTracker,
): { value: DerivationCollection; property: PropertyDerivationCollection } {
  const valueEntries: DerivationEntry[] = [];
  const propertyEntries: PropertyDerivationEntry[] = [];
  const ctx: CollectionContext = { logger, tracker };

  traverseFieldsWithContext<CollectionContext>(
    fields,
    ctx,
    (field, context) => {
      collectValueEntriesFromField(field, valueEntries, context);
      collectPropertyEntriesFromField(field, propertyEntries, context);
    },
    CONTEXT_TRAVERSAL_OPTIONS,
  );

  return {
    value: { entries: topologicalSort(valueEntries) },
    property: { entries: propertyEntries },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-field handlers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Collects value-derivation entries (shorthand + `logic[]` without
 * `targetProperty`) from a single field.
 *
 * @internal
 */
function collectValueEntriesFromField(field: FieldDef<unknown>, entries: DerivationEntry[], context: CollectionContext): void {
  const fieldKey = field.key;
  if (!fieldKey) return;

  const validationField = field as FieldDef<unknown> & FieldWithValidation;

  if (validationField.derivation) {
    entries.push(createShorthandEntry(fieldKey, validationField.derivation, context));
  }

  if (validationField.logic) {
    for (const logicConfig of validationField.logic) {
      if (!isDerivationLogicConfig(logicConfig)) continue;
      if (hasTargetProperty(logicConfig)) continue; // property entries handled by collectPropertyEntriesFromField
      entries.push(createValueLogicEntry(fieldKey, logicConfig, context));
    }
  }
}

/**
 * Collects property-derivation entries (`logic[]` with `targetProperty`) from
 * a single field.
 *
 * @internal
 */
function collectPropertyEntriesFromField(field: FieldDef<unknown>, entries: PropertyDerivationEntry[], context: CollectionContext): void {
  const fieldKey = field.key;
  if (!fieldKey) return;

  const validationField = field as FieldDef<unknown> & FieldWithValidation;

  if (!validationField.logic) return;

  for (const logicConfig of validationField.logic) {
    if (!isDerivationLogicConfig(logicConfig)) continue;
    if (!hasTargetProperty(logicConfig)) continue;
    entries.push(createPropertyLogicEntry(fieldKey, logicConfig, context));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry builders
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a value-derivation entry from a field's shorthand `derivation`
 * property.
 *
 * Shorthand derivations target the same field they're defined on, always
 * apply (condition `true`), and always trigger on change.
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
 * Creates a value-derivation entry from a `logic[]` `DerivationLogicConfig`
 * that does NOT have `targetProperty`.
 *
 * @internal
 */
function createValueLogicEntry(fieldKey: string, config: DerivationLogicConfig, context: CollectionContext): DerivationEntry {
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
  const debounceMs = trigger === 'debounced' ? (config as { debounceMs?: number }).debounceMs : undefined;

  return {
    fieldKey: effectiveFieldKey,
    dependsOn,
    condition,
    value: config.value,
    expression: config.expression,
    functionName: config.functionName,
    fn: extractInlineFn(config),
    http: config.http,
    responseExpression: config.responseExpression,
    asyncFunctionName: config.asyncFunctionName,
    asyncFn: extractInlineAsyncFn(config),
    trigger,
    debounceMs,
    isShorthand: false,
    originalConfig: config,
    debugName: config.debugName,
    stopOnUserOverride: config.stopOnUserOverride,
    reEngageOnDependencyChange: config.reEngageOnDependencyChange,
  };
}

/**
 * Creates a property-derivation entry from a `logic[]` `DerivationLogicConfig`
 * that has `targetProperty`. Effective key uses the same array/group ancestry
 * encoding as value entries via {@link buildEffectiveFieldKey} —
 * `buildPropertyOverrideKey` in the original property collector produced the
 * same shape.
 *
 * Includes the property-pipeline-specific runtime validation: source-vs-sync
 * field conflicts, HTTP/async cross-bleed, missing required HTTP fields, and
 * wildcard dependency guards. Mirrors the original
 * `createPropertyDerivationEntryFromDerivation` helper.
 *
 * @internal
 */
function createPropertyLogicEntry(
  fieldKey: string,
  config: DerivationLogicConfig & { targetProperty: string },
  context: CollectionContext,
): PropertyDerivationEntry {
  const effectiveFieldKey = buildEffectiveFieldKey(fieldKey, context);
  const errorLocation = `'${effectiveFieldKey}.${config.targetProperty}'`;

  // `targetProperty` is captured up front and `untypedConfig` is used inside
  // the source-narrowed blocks because TypeScript narrows `config` to `never`
  // once we negate a discriminant-required field (e.g. `!config.http` when
  // `source: 'http'` requires `http`).
  const untypedConfig = config as {
    source?: string;
    value?: unknown;
    expression?: unknown;
    functionName?: unknown;
    fn?: unknown;
    http?: unknown;
    responseExpression?: string;
    asyncFunctionName?: string;
    asyncFn?: unknown;
    dependsOn?: unknown;
  };

  // Reject configs that mix value-source fields with an explicit async source.
  if (untypedConfig.source === 'http' || untypedConfig.source === 'asyncFunction') {
    const conflictingSyncSources: string[] = [];
    if (untypedConfig.value !== undefined) conflictingSyncSources.push('value');
    if (untypedConfig.expression !== undefined) conflictingSyncSources.push('expression');
    if (untypedConfig.functionName !== undefined) conflictingSyncSources.push('functionName');
    if (untypedConfig.fn !== undefined) conflictingSyncSources.push('fn');
    if (conflictingSyncSources.length > 0) {
      throw new DynamicFormError(
        `Property derivation for ${errorLocation} sets 'source: ${JSON.stringify(untypedConfig.source)}' alongside ` +
          `sync value source(s) [${conflictingSyncSources.join(', ')}]. These are mutually exclusive — remove either ` +
          `the sync fields or the async source.`,
      );
    }
  }

  if (untypedConfig.source === 'http' && (untypedConfig.asyncFunctionName !== undefined || untypedConfig.asyncFn !== undefined)) {
    throw new DynamicFormError(
      `Property derivation for ${errorLocation} sets 'source: "http"' alongside an async function — these are mutually exclusive.`,
    );
  }
  if (untypedConfig.source === 'asyncFunction' && (untypedConfig.http !== undefined || untypedConfig.responseExpression !== undefined)) {
    throw new DynamicFormError(
      `Property derivation for ${errorLocation} sets 'source: "asyncFunction"' alongside HTTP fields — these are mutually exclusive.`,
    );
  }

  if (untypedConfig.source === 'http') {
    if (!untypedConfig.http) {
      throw new DynamicFormError(`HTTP property derivation for ${errorLocation} requires an 'http' config object.`);
    }
    if (typeof untypedConfig.responseExpression !== 'string' || untypedConfig.responseExpression.trim() === '') {
      throw new DynamicFormError(`HTTP property derivation for ${errorLocation} requires a non-empty 'responseExpression'.`);
    }
    if (!Array.isArray(untypedConfig.dependsOn) || untypedConfig.dependsOn.length === 0) {
      throw new DynamicFormError(
        `HTTP property derivation for ${errorLocation} requires explicit 'dependsOn'. ` +
          `Wildcard dependencies would trigger HTTP requests on every form change.`,
      );
    }
    if (untypedConfig.dependsOn.includes('*')) {
      throw new DynamicFormError(
        `HTTP property derivation for ${errorLocation} cannot use wildcard ('*') in 'dependsOn'. ` +
          `Wildcards would trigger HTTP requests on every form change. Specify explicit field dependencies instead.`,
      );
    }
  }

  if (untypedConfig.source === 'asyncFunction') {
    if (!untypedConfig.asyncFunctionName && !untypedConfig.asyncFn) {
      throw new DynamicFormError(`Async property derivation for ${errorLocation} requires either 'asyncFunctionName' or 'asyncFn'.`);
    }
    if (!Array.isArray(untypedConfig.dependsOn) || untypedConfig.dependsOn.length === 0) {
      throw new DynamicFormError(
        `Async property derivation for ${errorLocation} requires explicit 'dependsOn'. ` +
          `Wildcard dependencies would trigger async functions on every form change.`,
      );
    }
    if (untypedConfig.dependsOn.includes('*')) {
      throw new DynamicFormError(
        `Async property derivation for ${errorLocation} cannot use wildcard ('*') in 'dependsOn'. ` +
          `Wildcards would trigger async functions on every form change. Specify explicit field dependencies instead.`,
      );
    }
  }

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
    fn: extractInlineFn(config),
    http: config.http,
    responseExpression: config.responseExpression,
    asyncFunctionName: config.asyncFunctionName,
    asyncFn: extractInlineAsyncFn(config),
    trigger,
    debounceMs,
    debugName: config.debugName,
    originalConfig: config,
  };
}
