import { DynamicFormConfigMap, FieldDefFromConfig, FieldTypeDefinition } from '../models/field-type';
import { FieldDef, GroupField, RowField } from '../definitions';

const createFieldConfig = <T extends FieldDef<any>>(config: FieldTypeDefinition<T>): FieldTypeDefinition<T> => config;

export const CoreDynamicFormConfig = {
  row: createFieldConfig<RowField<never>>({
    loadComponent: () => import('./row/row-field.component'),
  }),
  group: createFieldConfig<GroupField<never>>({
    loadComponent: () => import('./group/group-field.component'),
  }),
} satisfies DynamicFormConfigMap<any>;

export type GlobalDynamicFormFields = {
  [K in keyof typeof CoreDynamicFormConfig]: FieldDefFromConfig<typeof CoreDynamicFormConfig, K, any>;
}[keyof typeof CoreDynamicFormConfig];
