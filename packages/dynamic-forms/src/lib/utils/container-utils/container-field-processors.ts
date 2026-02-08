import { InjectionToken } from '@angular/core';
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
      // registry.size is a valid cache key proxy because the field registry is populated
      // once at bootstrap and never mutated at runtime. If the registry were mutable,
      // we would need a content-based hash instead.
      resolver: (fields, registry) => {
        let key = '';
        for (const f of fields) {
          key += (f.key ?? '') + ':' + (f.type ?? '') + '|';
        }
        return key + registry.size;
      },
      maxSize: 10,
    },
  );

  const memoizedKeyBy = memoize(<T extends { key: string }>(fields: T[]) => keyBy(fields, 'key'), {
    resolver: (fields) => {
      let key = '';
      for (const f of fields) {
        key += f.key + '|';
      }
      return key;
    },
    maxSize: 10,
  });

  const memoizedDefaultValues = memoize(
    <T extends FieldDef<unknown>>(fieldsById: Record<string, T>, registry: Map<string, FieldTypeDefinition>) =>
      mapValues(fieldsById, (field) => getFieldDefaultValue(field, registry)),
    {
      // registry.size is a valid cache key proxy because the field registry is populated
      // once at bootstrap and never mutated at runtime.
      resolver: (fieldsById, registry) => {
        const keys = Object.keys(fieldsById).sort();
        return keys.join('|') + '|' + registry.size;
      },
      maxSize: 10,
    },
  );

  return { memoizedFlattenFields, memoizedKeyBy, memoizedDefaultValues };
}

/**
 * Shared container field processors injection token.
 *
 * Provided at the DynamicForm component level via `provideDynamicFormDI()` so one
 * form + all its nested groups share a single memoize cache, while different form
 * instances stay isolated.
 *
 * The `providedIn: 'root'` factory is a fallback only — it ensures tests and
 * standalone containers (e.g. a bare GroupFieldComponent in a unit test) can
 * resolve the token without an explicit provider. In a running application, the
 * component-level provider from `provideDynamicFormDI()` always shadows this root
 * instance, so each form gets its own isolated cache.
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
