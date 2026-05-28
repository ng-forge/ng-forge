import { FieldComponent, FieldDef } from '../base/field-def';
import { ContainerAllowedChildren } from '../../models/types/nesting-constraints';
import { ContainerLogicConfig } from '../base/container-logic-config';
import { WrapperConfig } from '../../models/wrapper-type';

/** Container field interface for wrapping child fields with UI chrome. */
export interface ContainerField<
  TFields extends readonly ContainerAllowedChildren[] = readonly ContainerAllowedChildren[],
  TWrapperConfigs extends readonly WrapperConfig[] = readonly WrapperConfig[],
> extends FieldDef<never> {
  type: 'container';

  /** Child definitions to render within this container */
  readonly fields: TFields;

  /**
   * Wrapper components to chain around the children.
   * Applied outermost-first: the first wrapper in the array is the outermost.
   * Each wrapper component receives the subsequent wrapper (or children) inside
   * its `#fieldComponent` ViewContainerRef slot.
   */
  readonly wrappers: TWrapperConfigs;

  /** Container fields do not have a label property */
  readonly label?: never;

  /** Containers do not support meta — they have no native form element */
  readonly meta?: never;

  /**
   * Logic configurations for conditional container visibility.
   * Only 'hidden' type logic is supported for containers.
   */
  readonly logic?: ContainerLogicConfig[];
}

/** Type guard for ContainerField with proper type narrowing. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Type guard must accept any field type
export function isContainerTypedField(field: FieldDef<any>): field is ContainerField {
  return (
    field.type === 'container' &&
    'wrappers' in field &&
    'fields' in field &&
    Array.isArray((field as ContainerField).wrappers) &&
    Array.isArray((field as ContainerField).fields)
  );
}

export type ContainerComponent = FieldComponent<ContainerField<ContainerAllowedChildren[]>>;
