import { ReadonlyFieldTree } from '../core/field-tree-utils';

/**
 * Input shape passed to a wrapper component via the `fieldInputs` input.
 *
 * Carries the wrapped field's mapper outputs plus an optional `field`
 * read-only view. Wrappers reached through a container path (which has
 * no FieldTree of its own) receive `fieldInputs === undefined`, so any
 * wrapper that reads `fieldInputs.field` must guard for it.
 *
 * Mappers must emit new rawInputs objects per tick rather than mutating
 * the previous one — this bag is a shallow spread, so mutations to shared
 * nested values leak to downstream wrappers.
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
