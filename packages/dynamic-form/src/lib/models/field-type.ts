import { FieldDef } from '@ng-forge/dynamic-form';

export interface FieldTypeDefinition<T extends FieldDef<Record<string, unknown>>> {
  loadComponent?: () => Promise<T>;

  _fieldDef?: T;
}

export type DynamicFormConfigMap<T extends FieldDef<Record<string, unknown>>> = Record<string, FieldTypeDefinition<T>>;

export type FieldDefFromConfig<
  T extends FieldDef<Record<string, unknown>>,
  TMap extends DynamicFormConfigMap<T>,
  TType extends keyof TMap
> = NonNullable<TMap[TType]['_fieldDef']>;
