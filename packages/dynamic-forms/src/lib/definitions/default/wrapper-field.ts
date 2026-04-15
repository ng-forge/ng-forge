import { FieldComponent, FieldDef } from '../base/field-def';
import { WrapperAllowedChildren } from '../../models/types/nesting-constraints';
import { ContainerLogicConfig } from '../base/container-logic-config';
import { RegisteredWrapperTypes } from '../../models/registry/field-registry';

/**
 * Configuration for a single wrapper applied to a wrapper field.
 *
 * Each wrapper config identifies a registered wrapper type and provides
 * any props that wrapper component expects as inputs.
 *
 * @example
 * ```typescript
 * const wrapper: WrapperConfig = {
 *   type: 'section',
 *   header: 'Contact Info',
 *   hint: 'Required fields'
 * };
 * ```
 */
export interface WrapperConfig<TWrappers extends RegisteredWrapperTypes = RegisteredWrapperTypes> {
  /** Registered wrapper type name */
  readonly type: TWrappers;
  /** Wrapper-specific props (passed as component inputs via setInput) */
  readonly [key: string]: unknown;
}

/**
 * Wrapper field interface for wrapping child fields with UI chrome.
 *
 * A wrapper field is a container that renders its children inside a chain
 * of wrapper components. Each wrapper provides visual decoration (sections,
 * headers, expand/collapse, styling) without affecting the form data structure.
 *
 * Like a row field, the wrapper field:
 * - Does not create a new form context
 * - Flattens child values into the parent form
 * - Is purely a visual/layout container
 *
 * Unlike a row field, the wrapper field:
 * - Supports a `wrappers` array that chains wrapper components around the children
 * - Uses imperative `ViewContainerRef.createComponent()` for the wrapper chain
 *
 * TypeScript cannot enforce field nesting rules due to circular dependency limitations.
 * For documentation: Wrappers follow the same nesting rules as rows — they should
 * contain groups and leaf fields, but NOT pages, other rows, or hidden fields.
 * Runtime validation enforces these rules.
 *
 * @example
 * ```typescript
 * const field: WrapperField = {
 *   type: 'wrapper',
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
 * const field: WrapperField = {
 *   type: 'wrapper',
 *   key: 'styledSection',
 *   fields: [{ key: 'name', type: 'input', value: '' }],
 *   wrappers: [
 *     { type: 'section', header: 'Details' },  // outermost
 *     { type: 'style', class: 'highlight' },    // innermost
 *   ]
 * };
 * ```
 */
export interface WrapperField<
  TFields extends readonly WrapperAllowedChildren[] = readonly WrapperAllowedChildren[],
> extends FieldDef<never> {
  type: 'wrapper';

  /** Child definitions to render within this wrapper */
  readonly fields: TFields;

  /**
   * Wrapper components to chain around the children.
   * Applied outermost-first: the first wrapper in the array is the outermost.
   * Each wrapper component receives the subsequent wrapper (or children) inside
   * its `#fieldComponent` ViewContainerRef slot.
   */
  readonly wrappers: readonly WrapperConfig[];

  /** Wrapper fields do not have a label property */
  readonly label?: never;

  /** Wrappers do not support meta — they have no native form element */
  readonly meta?: never;

  /**
   * Logic configurations for conditional wrapper visibility.
   * Only 'hidden' type logic is supported for wrappers.
   */
  readonly logic?: ContainerLogicConfig[];
}

/**
 * Type guard for WrapperField with proper type narrowing
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Type guard must accept any field type
export function isWrapperField(field: FieldDef<any>): field is WrapperField {
  return field.type === 'wrapper' && 'fields' in field && 'wrappers' in field;
}

export type WrapperComponent = FieldComponent<WrapperField<WrapperAllowedChildren[]>>;
