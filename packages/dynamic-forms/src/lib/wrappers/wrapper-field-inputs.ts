import { ReadonlyFieldTree } from '../core/field-tree-utils';

/**
 * Input shape passed to a wrapper component via the `fieldInputs` input.
 *
 * Carries the wrapped field's mapper outputs plus a `field` read-only view
 * (`ReadonlyFieldTree`). A wrapper component can observe field state
 * reactively through `fieldInputs.field.value()`, `fieldInputs.field.valid()`,
 * etc., but cannot mutate the field — writes are the field component's concern.
 *
 * The index signature `[key: string]: unknown` lets mappers pass additional
 * per-field metadata (e.g. adapter-specific hints) without the library knowing
 * about them; wrappers opt into specific keys they care about.
 *
 * Used by `DfFieldOutlet` and `ContainerFieldComponent` — wrappers receive their
 * own config via individual Angular `input()`s, and the mapper outputs via this
 * single `fieldInputs` input.
 */
export interface WrapperFieldInputs {
  readonly key: string;
  readonly label?: string;
  readonly placeholder?: string;
  readonly className?: string;
  readonly props?: Record<string, unknown>;
  readonly validationMessages?: Record<string, string>;
  readonly defaultValidationMessages?: Record<string, string>;
  readonly field?: ReadonlyFieldTree;
  readonly [key: string]: unknown;
}
