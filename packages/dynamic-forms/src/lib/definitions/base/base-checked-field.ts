import { FieldDef } from './field-def';
import { FieldMeta } from './field-meta';
import { FieldWithValidation } from './field-with-validation';
import { WithInputSignals } from '../../models/component-type';
import { Prettify } from '../../models/prettify';
import { DynamicText } from '../../models/types/dynamic-text';

export interface BaseCheckedField<TProps, TMeta extends FieldMeta = FieldMeta, TNullable extends boolean = false>
  extends FieldDef<TProps, TMeta>, FieldWithValidation {
  value?: TNullable extends true ? boolean | null : boolean;

  /**
   * Placeholder text displayed when the field is empty.
   * Supports static strings, Observables, and Signals for dynamic content.
   */
  placeholder?: DynamicText;

  required?: boolean;

  /**
   * Whether the field accepts `null` as a valid value.
   *
   * When `true`, `value` may be `null` and an omitted `value` resolves to `null`
   * (rather than the type-specific empty default of `false`). Orthogonal to `required`.
   *
   * The data model is decoupled from the UI: a null value is a legitimate
   * "undecided" state at the storage / OpenAPI layer. Whether the rendered
   * checkbox shows an indeterminate visual is controlled separately via
   * `props.indeterminate` and is not driven by this flag.
   *
   * @default false
   */
  nullable?: TNullable;
}

export function isCheckedField<TProps, TMeta extends FieldMeta = FieldMeta>(
  field: FieldDef<TProps, TMeta>,
): field is BaseCheckedField<TProps, TMeta, boolean> {
  return field.type === 'checkbox' || field.type === 'toggle';
}

// Note: 'meta' is NOT excluded - components must handle meta attributes
type ExcludedKeys =
  | 'type'
  | 'conditionals'
  | 'value'
  | 'nullable'
  | 'disabled'
  | 'readonly'
  | 'hidden'
  | 'col'
  | keyof FieldWithValidation
  // Value exclusion config (submission-only, not component inputs)
  | 'excludeValueIfHidden'
  | 'excludeValueIfDisabled'
  | 'excludeValueIfReadonly'
  // Validation execution config (schema-only, not component inputs)
  | 'validateWhenHidden'
  // Wrappers are consumed by DfFieldOutlet / ContainerFieldComponent, not individual fields
  | 'wrappers'
  | 'skipAutoWrappers'
  | 'skipDefaultWrappers'
  // Addons are an opt-in input — checkbox/toggle-style fields are Tier 3 and don't render them
  | 'addons';

export type CheckedFieldComponent<T extends BaseCheckedField<Record<string, unknown> | unknown, FieldMeta, boolean>> = Prettify<
  WithInputSignals<Omit<T, ExcludedKeys>>
>;
