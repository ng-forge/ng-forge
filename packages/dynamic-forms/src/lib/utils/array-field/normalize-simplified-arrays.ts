import { FieldDef } from '../../definitions/base/field-def';
import {
  isSimplifiedArrayField,
  SimplifiedArrayField,
  ArrayButtonConfig,
  ArrayField,
  isArrayField,
} from '../../definitions/default/array-field';
import { isContainerField, hasChildFields } from '../../models/types/type-guards';
import { ArrayAllowedChildren } from '../../models/types/nesting-constraints';
import { ArrayItemDefinition } from '../../definitions/default/array-field';
import { setNormalizedArrayMetadata } from './normalized-array-metadata';
import { DynamicFormError } from '../../errors/dynamic-form-error';

/**
 * Normalizes simplified array fields into full array field definitions.
 *
 * Walks the field tree and expands any `SimplifiedArrayField` (those with a `template` property)
 * into a standard `ArrayField` with proper item definitions and add/remove button fields.
 *
 * This is a pure function with no DI dependencies. It is idempotent — calling it on
 * already-normalized output produces the same result.
 */
export function normalizeSimplifiedArrays(fields: FieldDef<unknown>[]): FieldDef<unknown>[] {
  return fields.flatMap((field): FieldDef<unknown>[] => {
    // Recurse into non-array containers (page, group, row) that have child fields
    if (isContainerField(field) && !isArrayField(field) && hasChildFields(field)) {
      return [{ ...field, fields: normalizeSimplifiedArrays(field.fields as FieldDef<unknown>[]) } as FieldDef<unknown>];
    }

    // Full-API arrays may have simplified arrays nested inside their item templates
    if (isArrayField(field) && !isSimplifiedArrayField(field)) {
      const normalizedItems = field.fields.map((item: ArrayItemDefinition) =>
        Array.isArray(item) ? normalizeSimplifiedArrays(item as FieldDef<unknown>[]) : item,
      );
      return [{ ...field, fields: normalizedItems } as ArrayField as FieldDef<unknown>];
    }

    // Expand simplified array fields
    if (isSimplifiedArrayField(field)) {
      const { arrayField, addButton } = expandSimplifiedArray(field);
      return addButton ? [arrayField, addButton] : [arrayField];
    }

    // Pass through all other fields unchanged
    return [field];
  });
}

interface ExpandedArray {
  arrayField: FieldDef<unknown>;
  addButton?: FieldDef<unknown>;
}

/**
 * Invalid field types that are not allowed as array children.
 * TypeScript enforces this via ArrayAllowedChildren at compile time,
 * but runtime validation is needed for JavaScript users and dynamic configs.
 */
const INVALID_ARRAY_CHILD_TYPES = new Set(['page', 'array']);

/**
 * Validates a simplified array field's template configuration.
 * Throws DynamicFormError for invalid configurations that would silently produce broken output.
 */
function validateSimplifiedTemplate(field: SimplifiedArrayField): void {
  const { template, key } = field;
  const isObjectTemplate = Array.isArray(template);

  if (isObjectTemplate) {
    const templateFields = template as readonly ArrayAllowedChildren[];
    for (const tmpl of templateFields) {
      // Cast to FieldDef for runtime check — TypeScript prevents this statically,
      // but dynamic configs (e.g., from JSON) may violate the constraint.
      if (INVALID_ARRAY_CHILD_TYPES.has((tmpl as FieldDef<unknown>).type)) {
        throw new DynamicFormError(
          `Simplified array "${key}" template contains a '${tmpl.type}' field (key: '${tmpl.key}'). ` +
            `Only leaf fields, rows, and groups are allowed as array children.`,
        );
      }
    }
  } else {
    const singleTemplate = template as FieldDef<unknown>;
    if (INVALID_ARRAY_CHILD_TYPES.has(singleTemplate.type)) {
      throw new DynamicFormError(
        `Simplified array "${key}" template has type '${singleTemplate.type}'. ` +
          `Only leaf fields, rows, and groups are allowed as array children.`,
      );
    }
  }
}

/**
 * Expands a simplified array field into a full ArrayField + optional add button.
 */
function expandSimplifiedArray(field: SimplifiedArrayField): ExpandedArray {
  const { template, value = [], addButton, removeButton, key, logic } = field;
  const isObjectTemplate = Array.isArray(template);
  const values = value as unknown[];

  // Validate template before expansion
  validateSimplifiedTemplate(field);

  // Build items from values
  const items: ArrayItemDefinition[] = values.map((v) => {
    if (isObjectTemplate) {
      return buildObjectItem(template as readonly ArrayAllowedChildren[], v as Record<string, unknown>, removeButton);
    }
    return buildPrimitiveItem(template as ArrayAllowedChildren, v);
  });

  // Build the add button template (item structure without values)
  // For primitive arrays, the add template is a single field (not wrapped in array)
  // so that handleAddFromEvent treats it as a primitive item
  const addTemplate: ArrayAllowedChildren | readonly ArrayAllowedChildren[] = isObjectTemplate
    ? buildObjectItemTemplate(template as readonly ArrayAllowedChildren[], removeButton)
    : (template as ArrayAllowedChildren);

  // For primitive arrays with remove buttons, store the remove button config
  // via Symbol metadata. The array component renders remove buttons alongside
  // each item without wrapping in a row, preserving flat primitive form values.
  const hasAutoRemove = !isObjectTemplate && removeButton !== false;

  // Construct the full ArrayField
  const arrayFieldObj: Record<string, unknown> = {
    key,
    type: 'array' as const,
    fields: items,
  };
  if (logic) {
    arrayFieldObj['logic'] = logic;
  }

  // Safe cast: we're constructing a valid ArrayField shape with key, type, and fields
  const arrayField = arrayFieldObj as unknown as FieldDef<unknown>;

  // Store normalization metadata via Symbol property instead of a runtime property
  const primitiveFieldKey = !isObjectTemplate ? (template as ArrayAllowedChildren).key : undefined;
  if (hasAutoRemove || primitiveFieldKey) {
    setNormalizedArrayMetadata(arrayFieldObj, {
      ...(hasAutoRemove && { autoRemoveButton: buildRemoveButton(removeButton) }),
      ...(primitiveFieldKey && { primitiveFieldKey }),
    });
  }

  // Construct the add button (sibling, placed after the array)
  let addButtonField: FieldDef<unknown> | undefined;
  if (addButton !== false) {
    const buttonConfig = (typeof addButton === 'object' ? addButton : {}) as ArrayButtonConfig;
    // Safe cast: we're constructing a valid addArrayItem field shape
    addButtonField = {
      key: `${key}__add`,
      type: 'addArrayItem',
      label: buttonConfig.label ?? 'Add',
      arrayKey: key,
      template: addTemplate,
      ...(buttonConfig.props && { props: buttonConfig.props }),
      // Logic is intentionally shared with the array field so the add button
      // hides/shows together with the array (e.g., when a hidden condition applies).
      ...(logic && { logic }),
    } as unknown as FieldDef<unknown>;
  }

  return { arrayField, addButton: addButtonField };
}

/**
 * Builds a primitive array item as a single FieldDef (not wrapped in array).
 *
 * This ensures the form schema creates FormControls (not FormGroups) for each item,
 * producing flat primitive values like `['angular', 'typescript']` instead of
 * `[{ value: 'angular' }, { value: 'typescript' }]`.
 *
 * Remove buttons are handled separately via Symbol metadata on the array field,
 * which the array component renders alongside each item without affecting form values.
 */
function buildPrimitiveItem(template: ArrayAllowedChildren, value: unknown): ArrayItemDefinition {
  return { ...template, value } as ArrayAllowedChildren;
}

/**
 * Builds an object array item: template fields with values merged + optional remove button.
 */
function buildObjectItem(
  template: readonly ArrayAllowedChildren[],
  valueObj: Record<string, unknown>,
  removeButton: ArrayButtonConfig | false | undefined,
): ArrayItemDefinition {
  const fieldsWithValues = template.map(
    (templateField) =>
      ({
        ...templateField,
        ...(Object.hasOwn(valueObj, templateField.key) && { value: valueObj[templateField.key] }),
      }) as ArrayAllowedChildren,
  );

  if (removeButton === false) {
    return fieldsWithValues;
  }

  return [...fieldsWithValues, buildRemoveButton(removeButton)];
}

/**
 * Builds the add button template for object items (template fields without values + remove button).
 */
function buildObjectItemTemplate(
  template: readonly ArrayAllowedChildren[],
  removeButton: ArrayButtonConfig | false | undefined,
): readonly ArrayAllowedChildren[] {
  if (removeButton === false) {
    return template;
  }

  return [...template, buildRemoveButton(removeButton)];
}

/**
 * Builds a remove button field definition.
 */
function buildRemoveButton(config: ArrayButtonConfig | undefined): ArrayAllowedChildren {
  const buttonConfig = (typeof config === 'object' ? config : {}) as ArrayButtonConfig;
  // Safe cast: removeArrayItem fields are valid ArrayAllowedChildren but not in the static union
  return {
    key: '__remove',
    type: 'removeArrayItem',
    label: buttonConfig.label ?? 'Remove',
    ...(buttonConfig.props && { props: buttonConfig.props }),
  } as unknown as ArrayAllowedChildren;
}
