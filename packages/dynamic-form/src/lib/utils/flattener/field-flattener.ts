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

  for (const field of fields) {
    if (isRowField(field)) {
      const flattenedChildren = flattenFields(field.fields);
      result.push(...flattenedChildren);
    } else if (isGroupField(field)) {
      const childFieldsArray = Object.values(field.fields);
      const flattenedChildren = flattenFields(childFieldsArray);

      result.push({
        ...field,
        fields: flattenedChildren,
      } as FlattenedField);

      result.push(...flattenedChildren);
    } else {
      result.push(field as FlattenedField);
    }
  }

  return result;
}
