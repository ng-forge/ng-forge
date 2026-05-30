import { ArrayField, SimplifiedArrayField } from '../../definitions/default/array-field';
import { GroupField } from '../../definitions/default/group-field';
import { HiddenField } from '../../definitions/default/hidden-field';
import { PageField } from '../../definitions/default/page-field';
import { RowField } from '../../definitions/default/row-field';
import { TextField } from '../../definitions/default/text-field';
import { CssWrapper } from '../../wrappers/css/css-wrapper.type';
import { RowWrapper } from '../../wrappers/row/row-wrapper.type';
import { ContainerField } from '../../definitions/default/container-field';

/** Container fields registry - augment this interface to add custom container fields */
export interface FieldRegistryContainers {
  page: PageField;
  row: RowField;
  group: GroupField;
  array: ArrayField | SimplifiedArrayField;
  container: ContainerField;
}

/** Leaf fields registry - augment this interface to add custom leaf fields */
export interface FieldRegistryLeaves {
  text: TextField;
  hidden: HiddenField;
}

/** Wrapper type registry for module augmentation. */
export interface FieldRegistryWrappers {
  css: CssWrapper;
  row: RowWrapper;
}

/**
 * Global interface for dynamic form field definitions with categorization
 * This interface combines containers and leaves from their respective registries
 */
export interface DynamicFormFieldRegistry {
  /** Container fields that hold other fields (no value, have children) */
  containers: FieldRegistryContainers;

  /** Leaf fields that have values or display content */
  leaves: FieldRegistryLeaves;

  /** Field wrappers types */
  wrappers: FieldRegistryWrappers;
}

/** Union type of all registered container field definitions */
export type ContainerFieldTypes = DynamicFormFieldRegistry['containers'][keyof DynamicFormFieldRegistry['containers']];

/** Union type of all registered leaf field definitions */
export type LeafFieldTypes = DynamicFormFieldRegistry['leaves'][keyof DynamicFormFieldRegistry['leaves']];

/** Union type of all registered field definitions */
export type RegisteredFieldTypes = ContainerFieldTypes | LeafFieldTypes;

/** Extract field types that are available in the registry */
export type AvailableFieldTypes = keyof DynamicFormFieldRegistry['containers'] | keyof DynamicFormFieldRegistry['leaves'];

/** Extract wrapper types that are available in the registry */
export type RegisteredWrapperTypes = keyof DynamicFormFieldRegistry['wrappers'];

/**
 * Combined registry mapping type names to field definitions.
 * This flattens containers and leaves into a single mapping.
 */
type FieldTypeMap = DynamicFormFieldRegistry['containers'] & DynamicFormFieldRegistry['leaves'];

/**
 * Extract a specific field type from RegisteredFieldTypes based on the `type` discriminant.
 * This enables proper type narrowing when defining fields.
 */
export type ExtractField<T extends AvailableFieldTypes> = T extends keyof FieldTypeMap ? FieldTypeMap[T] : never;

/**
 * Narrow a field definition based on its `type` property.
 * Use this to get proper type inference when working with field unions.
 */
export type NarrowField<T> = T extends { type: infer TType } ? (TType extends AvailableFieldTypes ? ExtractField<TType> : T) : T;

/**
 * Narrow each field in an array based on its `type` property.
 * Use with `satisfies` to get proper type inference for field arrays.
 */
export type NarrowFields = readonly NarrowField<RegisteredFieldTypes>[];
