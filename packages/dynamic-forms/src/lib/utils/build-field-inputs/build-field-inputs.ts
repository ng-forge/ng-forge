import { FieldTree } from '@angular/forms/signals';
import { ReadonlyFieldTree, toReadonlyFieldTreeCached } from '../../core/field-tree-utils';
import { WrapperFieldInputs } from '../../wrappers/wrapper-field-inputs';

/**
 * Convert a field's raw mapper outputs into the {@link WrapperFieldInputs}
 * bag consumed by wrappers and addons.
 *
 * The transformation hides write access on the underlying `FieldTree` —
 * the bag's `field` slot is a {@link ReadonlyFieldTree} view. The raw
 * `FieldTree` is still pushed to the innermost field component (which
 * legitimately needs to write); intermediaries (wrappers, addons) are
 * read-only by contract.
 *
 * Pure, dependency-injection-free — caller supplies the cache so the same
 * `ReadonlyFieldTree` view is returned for the same source `FieldTree`
 * across renders. Each `<df-dynamic-form>` instance scopes its own cache
 * (SSR-safe).
 *
 * @param rawInputs Mapper outputs (`{ key, label, props, field?: FieldTree, ... }`).
 * @param cache     `WeakMap<FieldTree, ReadonlyFieldTree>` provided via
 *                  {@link READONLY_FIELD_TREE_CACHE}.
 */
export function buildFieldInputs(
  rawInputs: Record<string, unknown>,
  cache: WeakMap<FieldTree<unknown>, ReadonlyFieldTree<unknown>>,
): WrapperFieldInputs {
  const fieldTreeCandidate = rawInputs['field'];
  // FieldTree is callable: `(): FieldState`. Anything else (undefined,
  // primitive) means the field is rendered before the form is bound.
  const readonlyField =
    fieldTreeCandidate && typeof fieldTreeCandidate === 'function'
      ? toReadonlyFieldTreeCached(cache, fieldTreeCandidate as FieldTree<unknown>)
      : undefined;
  // Shallow spread — relies on the mapper contract (see WrapperFieldInputs)
  // that rawInputs are emitted as fresh snapshots, not mutated in place.
  return {
    ...rawInputs,
    field: readonlyField,
  } as WrapperFieldInputs;
}
