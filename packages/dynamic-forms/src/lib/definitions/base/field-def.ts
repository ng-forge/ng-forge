import { AnyAddon } from '../../models/addon/addon-def';
import { WithInputSignals } from '../../models/component-type';
import { Prettify } from '../../models/prettify';
import { RegisteredFieldTypes } from '../../models/registry/field-registry';
import { DynamicText } from '../../models/types/dynamic-text';
import { WrapperConfig } from '../../models/wrapper-type';
import { FieldMeta } from './field-meta';

/**
 * Base interface for all dynamic form field definitions.
 *
 * @typeParam TProps - Field-specific properties interface
 * @typeParam TMeta - Native HTML attributes interface (extends FieldMeta)
 */
export interface FieldDef<TProps, TMeta extends FieldMeta = FieldMeta> {
  /** Unique field identifier used for form binding and value tracking. */
  key: string;

  /** Field type identifier for component selection. */
  type: RegisteredFieldTypes['type'] | (string & {});

  /** Human-readable field label displayed to users. */
  label?: DynamicText;

  /** Field-specific properties and configuration options. */
  props?: TProps;

  /** Native HTML attributes to pass through to the underlying element. */
  meta?: TMeta;

  /** Additional CSS classes for custom styling. */
  className?: string;

  /**
   * Whether the field is disabled and cannot be interacted with.
   *
   * @value false
   */
  disabled?: boolean;

  /**
   * Whether the field is read-only.
   *
   * @value false
   */
  readonly?: boolean;

  /**
   * Whether the field is hidden from view.
   *
   * @value false
   */
  hidden?: boolean;

  /** Tab index for keyboard navigation. */
  tabIndex?: number | undefined;

  /**
   * Whether to exclude this field's value from submission output when hidden.
   *
   * @default undefined (uses form-level or global setting)
   */
  excludeValueIfHidden?: boolean;

  /**
   * Whether to exclude this field's value from submission output when disabled.
   *
   * @default undefined (uses form-level or global setting)
   */
  excludeValueIfDisabled?: boolean;

  /**
   * Whether to exclude this field's value from submission output when readonly.
   *
   * @default undefined (uses form-level or global setting)
   */
  excludeValueIfReadonly?: boolean;

  /**
   * Whether to run validation when this field is hidden — statically (`hidden: true`),
   * via a `hidden` logic rule, or via any hidden ancestor.
   *
   * @default undefined — inherits from parent / form / global default (which is `false`)
   */
  validateWhenHidden?: boolean;

  /**
   * Column sizing configuration for responsive grid layout.
   *
   * @value 12
   */
  col?: number;

  /** Wrapper components to chain around this field. */
  wrappers?: readonly WrapperConfig[] | null;

  /**
   * Skip the auto-association layer (`WrapperTypeDefinition.types`) while
   * keeping form-level defaults and any field-level `wrappers`. Use when a
   * global wrapper auto-applies to this field type but isn't wanted here.
   */
  skipAutoWrappers?: boolean;

  /**
   * Skip the form-level `defaultWrappers` layer while keeping auto-associations
   * and any field-level `wrappers`.
   */
  skipDefaultWrappers?: boolean;

  /** Addons rendered inside this field's slots (typically `prefix` / `suffix`). */
  addons?: ReadonlyArray<AnyAddon>;
}

type IncludedKeys = 'label' | 'className' | 'hidden' | 'tabIndex';

/**
 * Type utility for extracting component input properties from field definitions.
 *
 * @Component({...})
 * export class MyFieldComponent implements FieldComponent<MyFieldDef> {
 *   label = input<string>();
 *   className = input<string>();
 *   hidden = input<boolean>();
 *   tabIndex = input<number>();
 * }
 * ```
 * @typeParam T - Field definition type to extract properties from
 */
export type FieldComponent<T extends FieldDef<unknown, FieldMeta>> = Prettify<WithInputSignals<Pick<T, IncludedKeys>>>;
