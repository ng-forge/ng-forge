import { FieldDef } from '../../definitions/base/field-def';
import { FieldWithValidation } from '../../definitions/base/field-with-validation';
import { DynamicFormError } from '../../errors/dynamic-form-error';
import { DerivationLogicConfig, isDerivationLogicConfig, hasTargetProperty } from '../../models/logic/logic-config';
import { Logger } from '../../providers/features/logger/logger.interface';
import type { WarningTracker } from '../../utils/warning-tracker';
import { extractDependenciesFromConfig } from '../derivation/extract-dependencies';
import { extractInlineAsyncFn, extractInlineFn } from '../derivation/extract-inline-fn';
import { traverseFieldsWithContext } from '../derivation/field-traversal';
import { buildPropertyOverrideKey, PLACEHOLDER_INDEX } from './property-override-key';
import { PropertyDerivationCollection, PropertyDerivationEntry } from './property-derivation-types';

/**
 * Context for collecting property derivations, tracking array and group ancestry.
 *
 * @internal
 */
interface CollectionContext {
  /** Current array path for resolving relative field references. */
  arrayPath?: string;
  /**
   * Dot-joined ancestor group keys scoped to the current array item
   * (or top-level when not inside an array). Reset at array boundaries —
   * group ancestors OUTSIDE an array don't contribute to descendants'
   * store keys because the array placeholder `{arrayKey}.$.` already
   * encodes the field's location relative to each array item.
   */
  groupPath?: string;
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
    // Array boundary: each item is its own model root. Reset groupPath so
    // ancestor groups OUTSIDE the array don't bleed into per-item keys.
    onArrayChild: (_, field) => ({ arrayPath: field.key, groupPath: undefined }),
    onGroupChild: (parent, field) => {
      // Keyless groups (rare) act like layout containers — pass through.
      if (!field.key) return {};
      return { groupPath: parent.groupPath ? `${parent.groupPath}.${field.key}` : field.key };
    },
    // Layout containers (page, row, container) leave context unchanged.
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
  const effectiveFieldKey = buildPropertyOverrideKey(
    context.arrayPath,
    context.arrayPath ? PLACEHOLDER_INDEX : undefined,
    fieldKey,
    context.groupPath,
  );

  // HTTP and async function property derivations require explicit, non-wildcard
  // dependencies — mirrors the same guards on value-derivation HTTP/async sources.
  //
  // Type-level discriminants require these fields, but JSON-loaded configs can
  // bypass that — so we defensively guard against missing arrays and missing
  // HTTP fields here to fail fast with `DynamicFormError` instead of throwing
  // an opaque `TypeError` later.
  //
  // `targetProperty` is captured up front and `untypedConfig` is used inside
  // the source-narrowed blocks because TypeScript narrows `config` to `never`
  // once we negate a discriminant-required field (e.g. `!config.http` when
  // `source: 'http'` requires `http`).
  const errorLocation = `'${effectiveFieldKey}.${config.targetProperty}'`;
  const untypedConfig = config as {
    source?: string;
    http?: unknown;
    responseExpression?: string;
    asyncFunctionName?: string;
    asyncFn?: unknown;
    dependsOn?: unknown;
  };

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
