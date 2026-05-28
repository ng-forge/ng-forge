import { InjectionToken } from '@angular/core';
import { FieldDef } from '../../definitions/base/field-def';
import { FieldTypeDefinition } from '../../models/field-type';
import { flattenFields } from '../flattener/field-flattener';
import { getFieldDefaultValue } from '../default-value/default-value';
import { keyBy, mapValues } from '../object-utils';

/**
 * Creates memoized field processing functions shared across container components.
 *
 * @returns Object containing memoized processing functions
 */
export function createContainerFieldProcessors() {
  const flattenCache = new WeakMap<readonly FieldDef<unknown>[], FieldDef<unknown>[]>();
  const memoizedFlattenFields = (fields: readonly FieldDef<unknown>[], registry: Map<string, FieldTypeDefinition>): FieldDef<unknown>[] => {
    const cached = flattenCache.get(fields);
    if (cached !== undefined) {
      return cached;
    }
    const result = flattenFields([...fields], registry);
    flattenCache.set(fields, result);
    return result;
  };

  const flattenForRenderingCache = new WeakMap<readonly FieldDef<unknown>[], FieldDef<unknown>[]>();
  const memoizedFlattenFieldsForRendering = (
    fields: readonly FieldDef<unknown>[],
    registry: Map<string, FieldTypeDefinition>,
  ): FieldDef<unknown>[] => {
    const cached = flattenForRenderingCache.get(fields);
    if (cached !== undefined) {
      return cached;
    }
    const result = flattenFields([...fields], registry, { preserveRows: true });
    flattenForRenderingCache.set(fields, result);
    return result;
  };

  const keyByCache = new WeakMap<object[], Record<string, unknown>>();
  const memoizedKeyBy = <T extends { key: string }>(fields: T[]): Record<string, T> => {
    const cached = keyByCache.get(fields);
    if (cached !== undefined) {
      return cached as Record<string, T>;
    }
    const result = keyBy(fields, 'key');
    keyByCache.set(fields, result);
    return result;
  };

  const defaultValuesCache = new WeakMap<object, Record<string, unknown>>();
  const memoizedDefaultValues = <T extends FieldDef<unknown>>(
    fieldsById: Record<string, T>,
    registry: Map<string, FieldTypeDefinition>,
  ): Record<string, unknown> => {
    const cached = defaultValuesCache.get(fieldsById);
    if (cached !== undefined) {
      return cached;
    }
    const result = mapValues(fieldsById, (field) => getFieldDefaultValue(field, registry));
    defaultValuesCache.set(fieldsById, result);
    return result;
  };

  return { memoizedFlattenFields, memoizedFlattenFieldsForRendering, memoizedKeyBy, memoizedDefaultValues };
}

/**
 * Shared container field processors injection token.
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
