import { FieldDef } from '../../definitions/base/field-def';
import { FieldTypeDefinition } from '../../models/field-type';
import { flattenFields } from '../flattener/field-flattener';
import { getFieldDefaultValue } from '../default-value/default-value';
import { keyBy, memoize, mapValues } from '../object-utils';

/**
 * Creates memoized field processing functions shared across container components.
 *
 * These functions are used by both `FormStateManager` and `GroupFieldComponent`
 * to compute flattened fields, field lookups, and default values from field definitions.
 *
 * @returns Object containing memoized processing functions
 */
export function createContainerFieldProcessors() {
  const memoizedFlattenFields = memoize(
    (fields: readonly FieldDef<unknown>[], registry: Map<string, FieldTypeDefinition>) => flattenFields([...fields], registry),
    {
      resolver: (fields, registry) => {
        const fieldKeys = fields.map((f) => `${f.key || ''}:${f.type}`).join('|');
        const registryKeys = Array.from(registry.keys()).sort().join('|');
        return `${fieldKeys}__${registryKeys}`;
      },
      maxSize: 10,
    },
  );

  const memoizedKeyBy = memoize(<T extends { key: string }>(fields: T[]) => keyBy(fields, 'key'), {
    resolver: (fields) => fields.map((f) => f.key).join('|'),
    maxSize: 10,
  });

  const memoizedDefaultValues = memoize(
    <T extends FieldDef<unknown>>(fieldsById: Record<string, T>, registry: Map<string, FieldTypeDefinition>) =>
      mapValues(fieldsById, (field) => getFieldDefaultValue(field, registry)),
    {
      resolver: (fieldsById, registry) => {
        const fieldKeys = Object.keys(fieldsById).sort().join('|');
        const registryKeys = Array.from(registry.keys()).sort().join('|');
        return `defaults_${fieldKeys}__${registryKeys}`;
      },
      maxSize: 10,
    },
  );

  return { memoizedFlattenFields, memoizedKeyBy, memoizedDefaultValues };
}
