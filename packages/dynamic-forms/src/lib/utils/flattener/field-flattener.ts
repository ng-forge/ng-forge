import { FieldDef } from '@ng-forge/dynamic-forms/internal';
import { isRowField } from '@ng-forge/dynamic-forms/internal';
import { isGroupField } from '@ng-forge/dynamic-forms/internal';
import { isArrayField } from '@ng-forge/dynamic-forms/internal';
import { isGenericContainerField } from '@ng-forge/dynamic-forms/internal';
import { FieldTypeDefinition, getFieldValueHandling } from '@ng-forge/dynamic-forms/internal';
import { normalizeFieldsArray } from '@ng-forge/dynamic-forms/internal';

/** Represents a field definition that has been processed through the flattening algorithm. */
export interface FlattenedField extends FieldDef<unknown> {
  /** Guaranteed non-empty key for form binding and field identification */
  readonly key: string;

  /**
   * Static hidden/disabled/readonly state inherited from a discarded flatten
   * container (page/row) ancestor. Set only when a hoisted child's ancestor
   * declared the state; the child's own state still wins for everything else.
   *
   * Read exclusively by the value-exclusion path (`filterFormValue`) so a hidden
   * page drops its hoisted children's values — mirroring how a hidden group
   * drops its preserved subtree. NOT consumed by schema building or rendering,
   * which keeps this purely a value-exclusion concern with no validation side
   * effects.
   */
  readonly inheritedExclusionState?: {
    readonly hidden?: boolean;
    readonly disabled?: boolean;
    readonly readonly?: boolean;
  };
}

/**
 * Propagates a discarded flatten-container's (page/row) exclusion-relevant config
 * onto a hoisted child so the value-exclusion path can still drop the child's value
 * when the container was hidden/disabled/readonly.
 *
 * - Static state (`hidden`/`disabled`/`readonly`) is OR-accumulated into the child's
 *   `inheritedExclusionState`, so nested flatten containers compound correctly.
 * - `excludeValueIf*` config is applied only where the child has not declared its own
 *   (child override wins), matching the group-cascade resolution model.
 *
 * Returns the child unchanged when the container carries no exclusion-relevant config,
 * preserving object identity for the common case.
 */
function inheritContainerExclusion(container: FieldDef<unknown>, child: FlattenedField): FlattenedField {
  const inheritedHidden = container.hidden === true || child.inheritedExclusionState?.hidden === true;
  const inheritedDisabled = container.disabled === true || child.inheritedExclusionState?.disabled === true;
  const inheritedReadonly = container.readonly === true || child.inheritedExclusionState?.readonly === true;

  const hasInheritedState = inheritedHidden || inheritedDisabled || inheritedReadonly;
  const containerExcludeConfig =
    container.excludeValueIfHidden !== undefined ||
    container.excludeValueIfDisabled !== undefined ||
    container.excludeValueIfReadonly !== undefined;

  if (!hasInheritedState && !containerExcludeConfig) {
    return child;
  }

  return {
    ...child,
    ...(hasInheritedState
      ? { inheritedExclusionState: { hidden: inheritedHidden, disabled: inheritedDisabled, readonly: inheritedReadonly } }
      : {}),
    // Child override wins; otherwise inherit the container's exclusion config.
    excludeValueIfHidden: child.excludeValueIfHidden ?? container.excludeValueIfHidden,
    excludeValueIfDisabled: child.excludeValueIfDisabled ?? container.excludeValueIfDisabled,
    excludeValueIfReadonly: child.excludeValueIfReadonly ?? container.excludeValueIfReadonly,
  };
}

/**
 * Flattens a hierarchical field structure into a linear array for form processing.
 *
 * @param fields - Array of field definitions that may contain nested structures
 * @param registry - Field type registry for determining value handling behavior
 * @param options - Configuration options for flattening behavior
 * @param options.preserveRows - When true, keep row fields in structure for DOM rendering (grid layout)
 * @returns Flattened array of field definitions with guaranteed keys
 */
export function flattenFields(
  fields: FieldDef<unknown>[],
  registry: Map<string, FieldTypeDefinition>,
  options: { preserveRows?: boolean } = {},
): FlattenedField[] {
  const result: FlattenedField[] = [];
  let autoKeyCounter = 0;

  // Process each field using appropriate strategy based on field type and configuration
  for (const field of fields) {
    // Step 1: Determine how this field type should handle its value in the form
    // valueHandling can be: 'include', 'exclude', or 'flatten'
    const valueHandling = getFieldValueHandling(field.type, registry);

    // Step 2: Check if this is a row or container field that should be preserved for DOM rendering
    // Row fields need to render their container element for grid layouts to work
    // Container fields need to render their container for the wrapper chain
    if (options.preserveRows && (isRowField(field) || isGenericContainerField(field))) {
      if (field.fields) {
        // Recursively flatten children while preserving row structure
        const flattenedChildren = flattenFields(normalizeFieldsArray(field.fields as FieldDef<unknown>[]), registry, options);

        // Keep the row/container field in the result with its flattened children
        // This allows the container component to render while children are flattened
        const autoPrefix = isRowField(field) ? 'auto_row' : 'auto_container';
        result.push({
          ...field,
          fields: flattenedChildren,
          key: field.key || `${autoPrefix}_${autoKeyCounter++}`,
        } as unknown as FlattenedField);
      }
    } else if (valueHandling === 'flatten' && 'fields' in field) {
      // Step 3: Handle fields with 'flatten' value handling (typically page/row fields)
      // These fields are pure containers - merge their children directly into the parent level
      if (field.fields) {
        const fields = field.fields as FieldDef<unknown>[] | Record<string, FieldDef<unknown>>;
        const flattenedChildren = flattenFields(normalizeFieldsArray(fields), registry, options);

        // Spread children directly into result - the container field itself is discarded.
        // Because the container (page/row) is dropped, its exclusion-relevant state would
        // otherwise be lost. Propagate it onto each hoisted child so a hidden/disabled/
        // readonly page drops its children's values during value exclusion — mirroring how
        // a hidden group drops its preserved subtree. The child's own config still wins.
        // This is used for page fields (form structure) and row fields (form values).
        result.push(...flattenedChildren.map((child) => inheritContainerExclusion(field, child)));
      }
    } else if (isGroupField(field)) {
      // Step 4: Handle group fields - preserve structure for nested form values
      // Group fields create a nested object in the form value: { groupKey: { field1: value1, ... } }
      const childFieldsArray = Object.values(field.fields) as FieldDef<unknown>[];
      const flattenedChildren = flattenFields(childFieldsArray, registry, options);

      // Keep the group field with its recursively flattened children nested under its key
      result.push({
        ...field,
        fields: flattenedChildren,
        key: field.key || `auto_group_${autoKeyCounter++}`,
      } as FlattenedField);
    } else if (isArrayField(field)) {
      // Step 5: Handle array fields - preserve structure for array form values
      // Array fields create an array in the form value: { arrayKey: [item1, item2, ...] }
      // field.fields is ArrayItemDefinition[] — each item is either:
      // - ArrayAllowedChildren (primitive item) → preserved as single FlattenedField
      // - ArrayItemTemplate (readonly ArrayAllowedChildren[]) → flattened as FlattenedField[]
      //
      // IMPORTANT: Preserve the primitive/object distinction so getFieldDefaultValue
      // can produce flat values (['angular']) vs nested values ([{value: 'angular'}]).
      const flattenedItemTemplates = field.fields.map((itemDef) => {
        if (!Array.isArray(itemDef)) {
          // Primitive item: single ArrayAllowedChildren → flatten, preserve non-array structure
          const flattened = flattenFields([itemDef as FieldDef<unknown>], registry, options);
          return flattened[0];
        }
        // Object item: ArrayItemTemplate (field[]) → flatten all fields as array
        return flattenFields([...(itemDef as FieldDef<unknown>[])], registry, options);
      });

      // Keep the array field with its flattened item templates nested under its key
      result.push({
        ...field,
        fields: flattenedItemTemplates,
        key: field.key || `auto_array_${autoKeyCounter++}`,
      } as FlattenedField);
    } else {
      // Step 6: Handle all other fields (inputs, buttons, etc.) - pass through unchanged
      // These fields are leaf nodes that don't contain children and map directly to form controls
      const key = field.key || `auto_field_${autoKeyCounter++}`;
      result.push({
        ...field,
        key,
      } as FlattenedField);
    }
  }

  return result;
}
