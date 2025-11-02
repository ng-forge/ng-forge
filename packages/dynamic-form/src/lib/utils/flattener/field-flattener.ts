import { FieldDef } from '../../definitions';
import { isRowField } from '../../definitions/default/row-field';
import { isGroupField } from '../../definitions/default/group-field';

export interface FlattenedField extends FieldDef<Record<string, unknown>> {
  readonly key: string;
}

/**
 * Flattens a hierarchical field structure, handling row and group fields differently:
 * - Row fields: Keep all child field properties at the root level (flat structure)
 * - Group fields: Create nested structure under the group's key
 * - Other fields: Pass through unchanged
 */
export function flattenFields(fields: readonly FieldDef<Record<string, unknown>>[]): FlattenedField[] {
  const result: FlattenedField[] = [];
  let autoKeyCounter = 0;

  for (const field of fields) {
    if (isRowField(field)) {
      const flattenedChildren = flattenFields(field.fields);
      result.push(...flattenedChildren);
    } else if (isGroupField(field)) {
      const childFieldsArray = Object.values(field.fields);
      const flattenedChildren = flattenFields(childFieldsArray);

      // Add only the group field with its flattened children, not the children separately
      result.push({
        ...field,
        fields: flattenedChildren,
        key: field.key || `auto_group_${autoKeyCounter++}`,
      } as FlattenedField);
    } else {
      // Ensure the field has a key, auto-generate if missing
      const key = field.key || `auto_field_${autoKeyCounter++}`;
      result.push({
        ...field,
        key,
      } as FlattenedField);
    }
  }

  return result;
}
