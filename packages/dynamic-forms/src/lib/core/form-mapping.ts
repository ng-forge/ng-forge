import {
  applyEach,
  applyWhen,
  disabled,
  email,
  hidden,
  max,
  maxLength,
  min,
  minLength,
  pattern,
  readonly,
  required,
  schema,
} from '@angular/forms/signals';
import type { FieldContext, SchemaPath, SchemaPathTree } from '@angular/forms/signals';
import { FieldDef } from '@ng-forge/dynamic-forms/internal';
import { FieldWithValidation } from '@ng-forge/dynamic-forms/internal';
import { applyValidator } from './validation/validator-factory';
import { applyLogic } from './logic/logic-applicator';
import { applySchema } from './schema-application';
import { isGroupField } from '@ng-forge/dynamic-forms/internal';
import { isArrayField } from '@ng-forge/dynamic-forms/internal';
import { isPageField } from '@ng-forge/dynamic-forms/internal';
import { isRowField } from '@ng-forge/dynamic-forms/internal';
import { isContainerTypedField } from '@ng-forge/dynamic-forms/internal';
import { getNormalizedArrayMetadata } from '../utils/array-field/normalized-array-metadata';
import { DynamicFormError } from '@ng-forge/dynamic-forms/internal';
import { isStateLogicConfig, LogicConfig } from '@ng-forge/dynamic-forms/internal';
import {
  combineAncestorHiddenLogics,
  FieldTreeMappingContext,
  resolveDescendantContext,
  resolveFieldOwnContext,
} from './field-tree-mapping-context';

/**
 * Default {@link FieldTreeMappingContext} used when no inherited context is provided.
 * Mirrors the global token defaults so callers that bypass `createSchemaFromFields`
 * (e.g. nested group forms) still get sensible behavior.
 */
const DEFAULT_FIELD_TREE_MAPPING_CONTEXT: FieldTreeMappingContext = {
  validateWhenHidden: false,
  ancestorAlwaysHidden: false,
  ancestorHiddenLogics: [],
};

// Type alias for schema path parameters
type AnySchemaPath = SchemaPath<unknown> | SchemaPathTree<unknown>;

// ============================================================================
// Type-safe validator application functions
// ============================================================================

interface StringValidationConfig {
  email?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string | RegExp;
}

interface NumberValidationConfig {
  min?: number;
  max?: number;
}

/**
 * Applies string-specific validators to a schema path.
 * This function is properly typed - no casts needed internally.
 */
function applyStringValidators(path: SchemaPath<string>, config: StringValidationConfig): void {
  if (config.email) {
    email(path);
  }
  if (config.minLength !== undefined) {
    minLength(path, config.minLength);
  }
  if (config.maxLength !== undefined) {
    maxLength(path, config.maxLength);
  }
  if (config.pattern) {
    let regex: RegExp;
    if (typeof config.pattern === 'string') {
      try {
        regex = new RegExp(config.pattern);
      } catch (e) {
        throw new DynamicFormError(`Invalid regex pattern: '${config.pattern}' — ${e instanceof Error ? e.message : String(e)}`);
      }
    } else {
      regex = config.pattern;
    }
    pattern(path, regex);
  }
}

/**
 * Applies number-specific validators to a schema path.
 * This function is properly typed - no casts needed internally.
 */
function applyNumberValidators(path: SchemaPath<number>, config: NumberValidationConfig): void {
  if (config.min !== undefined) {
    min(path, config.min);
  }
  if (config.max !== undefined) {
    max(path, config.max);
  }
}

/**
 * Extracts string validation config from a field definition.
 * Returns undefined if no string validators are configured.
 */
function getStringValidationConfig(fieldDef: FieldWithValidation): StringValidationConfig | undefined {
  if (!fieldDef.email && fieldDef.minLength === undefined && fieldDef.maxLength === undefined && !fieldDef.pattern) {
    return undefined;
  }
  return {
    email: fieldDef.email,
    minLength: fieldDef.minLength,
    maxLength: fieldDef.maxLength,
    pattern: fieldDef.pattern,
  };
}

/**
 * Extracts number validation config from a field definition.
 * Handles both 'min'/'max' (standard) and 'minValue'/'maxValue' (SliderField).
 * Returns undefined if no number validators are configured.
 */
function getNumberValidationConfig(fieldDef: FieldWithValidation): NumberValidationConfig | undefined {
  const minVal = fieldDef.min ?? (fieldDef as { minValue?: number }).minValue;
  const maxVal = fieldDef.max ?? (fieldDef as { maxValue?: number }).maxValue;

  if (minVal === undefined && maxVal === undefined) {
    return undefined;
  }
  return { min: minVal, max: maxVal };
}

/**
 * Maps a field definition to the Angular Signal Forms schema.
 *
 * @param fieldDef Field definition to map
 * @param fieldPath Schema path for this field
 * @param inheritedContext Cascading mapping context from the parent. Field-level
 *   overrides on `fieldDef` are merged on top and passed down to descendants. Defaults
 *   to {@link DEFAULT_FIELD_TREE_MAPPING_CONTEXT} when omitted.
 */
export function mapFieldToForm(
  fieldDef: FieldDef<unknown>,
  fieldPath: AnySchemaPath,
  inheritedContext: FieldTreeMappingContext = DEFAULT_FIELD_TREE_MAPPING_CONTEXT,
): void {
  const ownContext = resolveFieldOwnContext(fieldDef, inheritedContext);

  // Layout containers (page, row, container) - flatten children to current level.
  // Layout containers have no schema path of their own, so any hidden state on them
  // must be propagated to descendants through the cascade.
  if (isPageField(fieldDef) || isRowField(fieldDef) || isContainerTypedField(fieldDef)) {
    const descendantContext = resolveDescendantContext(fieldDef, ownContext);
    mapContainerChildren(fieldDef.fields as FieldDef<unknown>[] | undefined, fieldPath, descendantContext);
    return;
  }

  // Group fields - map children under the group's path. Groups have a schema path,
  // so Angular Signal Forms can propagate `hidden(path, ...)` calls to descendants —
  // but groups don't currently apply their own hidden state, so we still propagate
  // through the cascade as a belt-and-suspenders fallback.
  if (isGroupField(fieldDef)) {
    const descendantContext = resolveDescendantContext(fieldDef, ownContext);
    mapContainerChildren(fieldDef.fields, fieldPath, descendantContext);
    return;
  }

  // Array fields - use applyEach for item schema.
  if (isArrayField(fieldDef)) {
    const descendantContext = resolveDescendantContext(fieldDef, ownContext);
    mapArrayFieldToForm(fieldDef, fieldPath, descendantContext);
    return;
  }

  // Leaf field - apply validation, logic, and configuration. Use the field's OWN
  // context (no descendant propagation) because the leaf's own hidden state is
  // already exposed via `ctx.state.hidden()`.
  mapLeafField(fieldDef, fieldPath, ownContext);
}

/** Maps children of a container field (page, row, group) to the form schema. */
function mapContainerChildren(
  fields: readonly FieldDef<unknown>[] | undefined,
  parentPath: AnySchemaPath,
  inheritedContext: FieldTreeMappingContext,
): void {
  if (!fields) return;

  const pathRecord = parentPath as Record<string, AnySchemaPath>;

  for (const field of fields) {
    if (isPageField(field) || isRowField(field) || isContainerTypedField(field)) {
      // Layout containers can still carry their own cascading overrides that flow
      // down to their flattened descendants.
      const layoutOwn = resolveFieldOwnContext(field, inheritedContext);
      const layoutDescendant = resolveDescendantContext(field, layoutOwn);
      mapContainerChildren(field.fields as readonly FieldDef<unknown>[] | undefined, parentPath, layoutDescendant);
      continue;
    }

    if (!field.key) continue;

    const childPath = pathRecord[field.key];
    if (childPath) {
      mapFieldToForm(field, childPath, inheritedContext);
    }
  }
}

/**
 * Returns true for state logic that contributes validation (currently only `required`).
 * The other state logic types (`hidden`, `disabled`, `readonly`) must always apply,
 * even on hidden fields, so they're not gated by `validateWhenHidden`.
 */
function isValidationStateLogic(config: LogicConfig): boolean {
  return isStateLogicConfig(config) && config.type === 'required';
}

/**
 * Maps a leaf field (value-bearing field) to the form schema.
 *
 * @param context Resolved cascading context for this field. When
 *   `context.validateWhenHidden` is `false`, the field's validation block is wrapped
 *   in `applyWhen` keyed off `!ctx.state.hidden()`.
 */
function mapLeafField(fieldDef: FieldDef<unknown>, fieldPath: AnySchemaPath, context: FieldTreeMappingContext): void {
  const validationField = fieldDef as FieldDef<unknown> & FieldWithValidation;
  const path = fieldPath as SchemaPath<unknown>;

  // Always-applied: state logic (hidden/disabled/readonly), schemas, and value derivations.
  // These must run regardless of hidden state — particularly the `hidden` logic itself,
  // which establishes the very signal `applyWhen` reads below.
  applyFieldState(fieldDef, path);

  if (validationField.logic) {
    for (const config of validationField.logic) {
      if (!isValidationStateLogic(config)) {
        applyLogic(config, fieldPath);
      }
    }
  }

  if (validationField.schemas) {
    for (const config of validationField.schemas) {
      applySchema(config, fieldPath);
    }
  }

  // Validation block — gated by `validateWhenHidden` when hidden.
  const applyValidation = (validationPath: SchemaPath<unknown>): void => {
    applySimpleValidationRules(validationField, validationPath);

    if (validationField.validators) {
      for (const config of validationField.validators) {
        applyValidator(config, validationPath);
      }
    }

    if (validationField.logic) {
      for (const config of validationField.logic) {
        if (isValidationStateLogic(config)) {
          applyLogic(config, validationPath);
        }
      }
    }
  };

  if (context.validateWhenHidden) {
    applyValidation(path);
    return;
  }

  // An ancestor is unconditionally hidden — there is no reactive case for the
  // validators to ever fire, so we simply do not apply them.
  if (context.ancestorAlwaysHidden) {
    return;
  }

  // applyWhen conditionally applies a sub-schema. The gate combines:
  // - the field's own `state.hidden()` (set by Angular Signal Forms whenever
  //   `hidden(path, ...)` was called for this field or any ancestor with a
  //   path); and
  // - any ancestor dynamic hidden logic that does NOT live on a schema path
  //   (layout containers — see field-tree-mapping-context for details).
  const ancestorHiddenLogic = combineAncestorHiddenLogics(context.ancestorHiddenLogics);
  applyWhen(
    path,
    (ctx: FieldContext<unknown>) => {
      if (ctx.state.hidden()) return false;
      if (ancestorHiddenLogic && ancestorHiddenLogic(ctx)) return false;
      return true;
    },
    schema<unknown>((subPath) => applyValidation(subPath as SchemaPath<unknown>)),
  );
}

/**
 * Applies simple validation rules from field properties.
 * Casts are isolated to the boundary between untyped field definitions and typed validator functions.
 */
function applySimpleValidationRules(fieldDef: FieldWithValidation, path: SchemaPath<unknown>): void {
  if (fieldDef.required) {
    required(path);
  }

  // String validators - single cast at boundary
  const stringConfig = getStringValidationConfig(fieldDef);
  if (stringConfig) {
    applyStringValidators(path as SchemaPath<string>, stringConfig);
  }

  // Number validators - single cast at boundary
  const numberConfig = getNumberValidationConfig(fieldDef);
  if (numberConfig) {
    applyNumberValidators(path as SchemaPath<number>, numberConfig);
  }
}

/** Applies field state configuration (disabled, readonly, hidden). */
function applyFieldState(fieldDef: FieldDef<unknown>, path: SchemaPath<unknown>): void {
  if (fieldDef.disabled) {
    disabled(path);
  }

  if (fieldDef.readonly) {
    readonly(path);
  }

  if (fieldDef.hidden) {
    hidden(path, () => true);
  }
}

/** Maps an array field to the form schema using applyEach. */
function mapArrayFieldToForm(arrayField: FieldDef<unknown>, fieldPath: AnySchemaPath, context: FieldTreeMappingContext): void {
  if (!isArrayField(arrayField)) {
    return;
  }

  // Apply array-level length validation
  if (arrayField.minLength !== undefined) {
    minLength(fieldPath as SchemaPath<unknown[]>, arrayField.minLength);
  }
  if (arrayField.maxLength !== undefined) {
    maxLength(fieldPath as SchemaPath<unknown[]>, arrayField.maxLength);
  }

  // Fields can be either FieldDef (primitive) or FieldDef[] (object)
  let itemDefinitions = arrayField.fields as readonly (FieldDef<unknown> | readonly FieldDef<unknown>[])[];

  // Simplified arrays initialized without `value` have empty `fields`; their
  // item shape only lives in Symbol metadata. Fall back to that template so
  // validators and logic declared inside it still apply when items are
  // materialized from a programmatically-set form value.
  if (!itemDefinitions || itemDefinitions.length === 0) {
    const metadataTemplate = getNormalizedArrayMetadata(arrayField)?.template;
    if (metadataTemplate) {
      itemDefinitions = [
        Array.isArray(metadataTemplate) ? [...(metadataTemplate as readonly FieldDef<unknown>[])] : (metadataTemplate as FieldDef<unknown>),
      ];
    }
  }

  // Empty array with no template metadata - items will be added via buttons with
  // their own templates. Create a minimal schema that just accepts any value.
  if (!itemDefinitions || itemDefinitions.length === 0) {
    const emptyItemSchema = schema<unknown>(() => {
      // No fields to map - items will be added dynamically via buttons
    });
    applyEach(fieldPath as SchemaPath<unknown[]>, emptyItemSchema);
    return;
  }

  // Analyze item definitions to determine schema type
  let hasPrimitiveItems = false;
  const allObjectFields: FieldDef<unknown>[] = [];

  for (const itemDef of itemDefinitions) {
    if (Array.isArray(itemDef)) {
      // Object item: collect fields for superset schema
      collectFieldsFromObjectItem(itemDef as readonly FieldDef<unknown>[], allObjectFields);
    } else if (
      isPageField(itemDef as FieldDef<unknown>) ||
      isRowField(itemDef as FieldDef<unknown>) ||
      isContainerTypedField(itemDef as FieldDef<unknown>)
    ) {
      // Layout container as a single-template item: its descendants describe
      // the item's object shape. Hand it to the object-item collector wrapped
      // as a 1-element array so the structured-item mapping path runs.
      collectFieldsFromObjectItem([itemDef as FieldDef<unknown>], allObjectFields);
    } else {
      // Primitive item: single FieldDef
      hasPrimitiveItems = true;
    }
  }

  // For pure primitive arrays, use a simple schema
  if (hasPrimitiveItems && allObjectFields.length === 0) {
    const primitiveItemSchema = schema<unknown>(() => {
      // Primitive items don't need field mapping - just accept any value
    });
    applyEach(fieldPath as SchemaPath<unknown[]>, primitiveItemSchema);
    return;
  }

  // For object or mixed arrays, use object schema with optional fields
  // Mixed arrays use the superset of all object fields (primitive items are just values)
  const itemSchema = schema<Record<string, unknown>>((itemPath) => {
    const pathRecord = itemPath as Record<string, AnySchemaPath>;

    // Map ALL unique template fields from all object items
    for (const templateField of allObjectFields) {
      if (isRowField(templateField) || isPageField(templateField) || isContainerTypedField(templateField)) {
        // Row/page/container templates flatten their children
        const layoutOwn = resolveFieldOwnContext(templateField, context);
        const layoutDescendant = resolveDescendantContext(templateField, layoutOwn);
        mapContainerChildren(templateField.fields as FieldDef<unknown>[] | undefined, itemPath, layoutDescendant);
      } else if (isGroupField(templateField)) {
        // Group template - access group's path first
        const groupKey = templateField.key;
        const groupOwn = resolveFieldOwnContext(templateField, context);
        const groupDescendant = resolveDescendantContext(templateField, groupOwn);
        if (groupKey) {
          const groupPath = pathRecord[groupKey];
          if (groupPath) {
            mapContainerChildren(templateField.fields, groupPath, groupDescendant);
          }
        } else {
          // No group key - apply children directly (edge case)
          mapContainerChildren(templateField.fields, itemPath, groupDescendant);
        }
      } else {
        // Simple field template - get the specific field's path
        const fieldKey = templateField.key;
        if (fieldKey) {
          const fieldPathForKey = pathRecord[fieldKey];
          if (fieldPathForKey) {
            mapFieldToForm(templateField, fieldPathForKey, context);
          }
        }
      }
    }
  });

  applyEach(fieldPath as SchemaPath<Record<string, unknown>[]>, itemSchema);
}

/**
 * Collects unique field definitions from an object item template.
 * Uses field key as the uniqueness identifier.
 * When the same key appears in multiple templates, uses the first occurrence.
 */
function collectFieldsFromObjectItem(itemFields: readonly FieldDef<unknown>[], allFields: FieldDef<unknown>[]): void {
  const seenKeys = new Set(allFields.map((f) => f.key).filter(Boolean));

  for (const field of itemFields) {
    // For row/page/container fields, we need to collect their children's keys
    if (isRowField(field) || isPageField(field) || isContainerTypedField(field)) {
      // Use a synthetic key for container fields to dedupe them
      const containerKey = `__container_${field.type}_${JSON.stringify(field.fields?.map((f) => f.key))}`;
      if (!seenKeys.has(containerKey)) {
        seenKeys.add(containerKey);
        allFields.push(field);
      }
    } else {
      const key = field.key;
      if (key && !seenKeys.has(key)) {
        seenKeys.add(key);
        allFields.push(field);
      }
    }
  }
}
