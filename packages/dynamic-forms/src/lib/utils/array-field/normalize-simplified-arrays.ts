import { FieldDef } from '../../definitions/base/field-def';
import {
  isSimplifiedArrayField,
  SimplifiedArrayField,
  ArrayButtonConfig,
  ArrayField,
  isArrayField,
} from '../../definitions/default/array-field';
import { isPageField, PageField } from '../../definitions/default/page-field';
import { isRowField, RowField } from '../../definitions/default/row-field';
import { isGroupField, GroupField } from '../../definitions/default/group-field';
import { ArrayAllowedChildren } from '../../models/types/nesting-constraints';
import { ArrayItemDefinition } from '../../definitions/default/array-field';

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
  const result: FieldDef<unknown>[] = [];

  for (const field of fields) {
    // Recurse into containers that have nested fields
    if (isPageField(field)) {
      const normalizedChildren = normalizeSimplifiedArrays(field.fields as FieldDef<unknown>[]);
      result.push({ ...field, fields: normalizedChildren } as PageField as FieldDef<unknown>);
      continue;
    }

    if (isGroupField(field)) {
      const normalizedChildren = normalizeSimplifiedArrays(field.fields as FieldDef<unknown>[]);
      result.push({ ...field, fields: normalizedChildren } as GroupField as FieldDef<unknown>);
      continue;
    }

    if (isRowField(field)) {
      const normalizedChildren = normalizeSimplifiedArrays(field.fields as FieldDef<unknown>[]);
      result.push({ ...field, fields: normalizedChildren } as RowField as FieldDef<unknown>);
      continue;
    }

    // Full-API arrays may have simplified arrays nested inside their item templates
    if (isArrayField(field) && !isSimplifiedArrayField(field)) {
      const normalizedItems = field.fields.map((item: ArrayItemDefinition) => {
        if (Array.isArray(item)) {
          return normalizeSimplifiedArrays(item as FieldDef<unknown>[]);
        }
        return item;
      });
      result.push({ ...field, fields: normalizedItems } as ArrayField as FieldDef<unknown>);
      continue;
    }

    // Expand simplified array fields
    if (isSimplifiedArrayField(field)) {
      const { arrayField, addButton } = expandSimplifiedArray(field);
      result.push(arrayField);
      if (addButton) {
        result.push(addButton);
      }
      continue;
    }

    // Pass through all other fields unchanged
    result.push(field);
  }

  return result;
}

interface ExpandedArray {
  arrayField: FieldDef<unknown>;
  addButton?: FieldDef<unknown>;
}

/**
 * Expands a simplified array field into a full ArrayField + optional add button.
 */
function expandSimplifiedArray(field: SimplifiedArrayField): ExpandedArray {
  const { template, value = [], addButton, removeButton, key, logic } = field;
  const isObjectTemplate = Array.isArray(template);
  const values = value as unknown[];

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
  // on the array field itself. The array component renders remove buttons alongside
  // each item without wrapping in a row, preserving flat primitive form values.
  const hasAutoRemove = !isObjectTemplate && removeButton !== false;

  // Construct the full ArrayField — cast through unknown since we're building the shape manually
  const arrayField = {
    key,
    type: 'array' as const,
    fields: items,
    ...(logic && { logic }),
    ...(hasAutoRemove && { __autoRemoveButton: buildRemoveButton(removeButton) }),
  } as unknown as FieldDef<unknown>;

  // Construct the add button (sibling, placed after the array)
  let addButtonField: FieldDef<unknown> | undefined;
  if (addButton !== false) {
    const buttonConfig = (typeof addButton === 'object' ? addButton : {}) as ArrayButtonConfig;
    addButtonField = {
      key: `${key}__add`,
      type: 'addArrayItem',
      label: buttonConfig.label ?? 'Add',
      arrayKey: key,
      template: addTemplate,
      ...(buttonConfig.props && { props: buttonConfig.props }),
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
 * Remove buttons are handled separately via `__autoRemoveButton` on the array field,
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
        ...(templateField.key in valueObj && { value: valueObj[templateField.key] }),
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
  return {
    key: '__remove',
    type: 'removeArrayItem',
    label: buttonConfig.label ?? 'Remove',
    ...(buttonConfig.props && { props: buttonConfig.props }),
  } as unknown as ArrayAllowedChildren;
}
