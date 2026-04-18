import { FieldComponent, FieldDef } from '../base/field-def';
import { ContainerAllowedChildren } from '../../models/types/nesting-constraints';
import { ContainerLogicConfig } from '../base/container-logic-config';
import { WrapperConfig } from '../../models/wrapper-type';

/**
 * Container field interface for wrapping child fields with UI chrome.
 *
 * A container field is a container that renders its children inside a chain
 * of wrapper components. Each wrapper provides visual decoration (sections,
 * headers, expand/collapse, styling) without affecting the form data structure.
 *
 * Like a row field, the container field:
 * - Does not create a new form context
 * - Flattens child values into the parent form
 * - Is purely a visual/layout container
 *
 * Unlike a row field, the container field:
 * - Supports a `wrappers` array that chains wrapper components around the children
 * - Uses imperative `ViewContainerRef.createComponent()` for the wrapper chain
 *
 * TypeScript cannot enforce field nesting rules due to circular dependency limitations.
 * For documentation: Containers follow the same nesting rules as rows — they should
 * contain groups and leaf fields, but NOT pages, other rows, or hidden fields.
 * Runtime validation enforces these rules.
 *
 * @example
 * ```typescript
 * const field: ContainerField = {
 *   type: 'container',
 *   key: 'contactSection',
 *   fields: [
 *     { key: 'email', type: 'input', value: '' },
 *     { key: 'phone', type: 'input', value: '' },
 *   ],
 *   wrappers: [
 *     { type: 'section', header: 'Contact Info' },
 *   ]
 * };
 * ```
 *
 * @example
 * ```typescript
 * // Multiple wrappers chain from outermost to innermost
 * const field: ContainerField = {
 *   type: 'container',
 *   key: 'styledSection',
 *   fields: [{ key: 'name', type: 'input', value: '' }],
 *   wrappers: [
 *     { type: 'section', header: 'Details' },  // outermost
 *     { type: 'style', class: 'highlight' },    // innermost
 *   ]
 * };
 * ```
 */
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

/**
 * Type guard for ContainerField with proper type narrowing
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Type guard must accept any field type
export function isContainerTypedField(field: FieldDef<any>): field is ContainerField {
  return field.type === 'container' && 'fields' in field && 'wrappers' in field;
}

export type ContainerComponent = FieldComponent<ContainerField<ContainerAllowedChildren[]>>;
