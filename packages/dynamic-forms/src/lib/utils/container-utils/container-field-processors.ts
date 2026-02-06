import { InjectionToken } from '@angular/core';
import { FieldDef } from '../../definitions/base/field-def';
import { FieldTypeDefinition } from '../../models/field-type';
import { flattenFields } from '../flattener/field-flattener';
import { getFieldDefaultValue } from '../default-value/default-value';
import { keyBy, memoize, mapValues, simpleStringHash } from '../object-utils';

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
        let hash = fields.length;
        for (const f of fields) {
          hash = (hash * 31 + simpleStringHash(f.key ?? '')) | 0;
          hash = (hash * 31 + simpleStringHash(f.type)) | 0;
        }
        return hash ^ (registry.size * 0x01000193);
      },
      maxSize: 10,
    },
  );

  const memoizedKeyBy = memoize(<T extends { key: string }>(fields: T[]) => keyBy(fields, 'key'), {
    resolver: (fields) => {
      let hash = fields.length;
      for (const f of fields) {
        hash = (hash * 31 + simpleStringHash(f.key)) | 0;
      }
      return hash;
    },
    maxSize: 10,
  });

  const memoizedDefaultValues = memoize(
    <T extends FieldDef<unknown>>(fieldsById: Record<string, T>, registry: Map<string, FieldTypeDefinition>) =>
      mapValues(fieldsById, (field) => getFieldDefaultValue(field, registry)),
    {
      resolver: (fieldsById, registry) => {
        const keys = Object.keys(fieldsById).sort();
        let hash = keys.length;
        for (const k of keys) {
          hash = (hash * 31 + simpleStringHash(k)) | 0;
        }
        return hash ^ (registry.size * 0x01000193);
      },
      maxSize: 10,
    },
  );

  return { memoizedFlattenFields, memoizedKeyBy, memoizedDefaultValues };
}

/**
 * Shared container field processors injection token.
 * Provided at the DynamicForm component level so one form + all its nested groups
 * share a single memoize cache, while different form instances stay isolated.
 * The root-level factory acts as a fallback for standalone usage (e.g. tests).
 *
 * @internal
 */
export const CONTAINER_FIELD_PROCESSORS = new InjectionToken<ReturnType<typeof createContainerFieldProcessors>>(
  'CONTAINER_FIELD_PROCESSORS',
  {
    providedIn: 'root',
    factory: () => createContainerFieldProcessors(),
  },
);
