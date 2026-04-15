import { FieldComponent, FieldDef } from '../base/field-def';
import { WrapperAllowedChildren } from '../../models/types/nesting-constraints';
import { ContainerLogicConfig } from '../base/container-logic-config';
import { FieldRegistryWrappers, RegisteredWrapperTypes } from '../../models/registry/field-registry';

/**
 * Resolves a wrapper type name to its registered config interface.
 *
 * When `TWrappers` is a specific registered key (e.g., `'css'`), resolves to
 * the full config type from `FieldRegistryWrappers` (e.g., `CssWrapper`),
 * providing type-safe access to wrapper-specific properties like `cssClasses`.
 *
 * When `TWrappers` is the full `RegisteredWrapperTypes` union, distributes
 * to produce a discriminated union of all registered wrapper configs.
 *
 * @example
 * ```typescript
 * // Resolves to CssWrapper — cssClasses is typed
 * type CssConfig = WrapperConfig<'css'>;
 *
 * // Union of all registered wrapper configs
 * type AnyConfig = WrapperConfig;
 * ```
 */
export type WrapperConfig<TWrappers extends RegisteredWrapperTypes = RegisteredWrapperTypes> = TWrappers extends keyof FieldRegistryWrappers
  ? FieldRegistryWrappers[TWrappers]
  : { readonly type: TWrappers };

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
  TWrapperConfigs extends readonly WrapperConfig[] = readonly WrapperConfig[],
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
  readonly wrappers: TWrapperConfigs;

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
