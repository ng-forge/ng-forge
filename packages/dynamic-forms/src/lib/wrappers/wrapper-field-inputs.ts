import { ReadonlyFieldTree } from '@ng-forge/dynamic-forms/internal';

/** Input shape passed to a wrapper component via the `fieldInputs` input. */
export interface WrapperFieldInputs {
  readonly key: string;
  /** Field-type discriminant (mirrors `FieldDef.type`) — useful for kind-aware addons. */
  readonly type?: string;
  readonly label?: string;
  readonly placeholder?: string;
  readonly className?: string;
  readonly props?: Record<string, unknown>;
  readonly validationMessages?: Record<string, string>;
  readonly defaultValidationMessages?: Record<string, string>;
  readonly field?: ReadonlyFieldTree;
  /**
   * Write a value into the wrapped field's tree. Provided by `buildFieldInputs`
   * when a `FieldTree` is present. Addons (e.g., `prime-button` presets) use this
   * to mutate the host field; wrappers should treat the field as read-only.
   */
  readonly setValue?: (next: unknown) => void;
  readonly [key: string]: unknown;
}
