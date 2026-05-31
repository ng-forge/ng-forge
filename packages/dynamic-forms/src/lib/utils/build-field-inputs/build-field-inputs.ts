import { FieldTree } from '@angular/forms/signals';
import { ReadonlyFieldTree, toReadonlyFieldTreeCached, writeToFieldValue } from '@ng-forge/dynamic-forms/internal';
import { WrapperFieldInputs } from '@ng-forge/dynamic-forms/internal';

/**
 * Convert a field's raw mapper outputs into the {@link WrapperFieldInputs}
 * bag consumed by wrappers and addons.
 *
 * @param rawInputs Mapper outputs (`{ key, label, props, field?: FieldTree, ... }`).
 * @param cache     `WeakMap<FieldTree, ReadonlyFieldTree>` provided via
 *                  {@link READONLY_FIELD_TREE_CACHE}.
 * @param fieldType Optional field-type discriminant. Injected here (rather
 *                  than via the field mapper) because `type` is the
 *                  registry key, not a component input — but addons and
 *                  wrappers legitimately need it.
 */
export function buildFieldInputs(
  rawInputs: Record<string, unknown>,
  cache: WeakMap<FieldTree<unknown>, ReadonlyFieldTree<unknown>>,
  fieldType?: string,
): WrapperFieldInputs {
  const fieldTreeCandidate = rawInputs['field'];
  // FieldTree is callable: `(): FieldState`. Anything else (undefined,
  // primitive) means the field is rendered before the form is bound.
  const hasFieldTree = fieldTreeCandidate !== undefined && typeof fieldTreeCandidate === 'function';
  const readonlyField = hasFieldTree ? toReadonlyFieldTreeCached(cache, fieldTreeCandidate as FieldTree<unknown>) : undefined;
  // Lazy writer keyed on the raw FieldTree. Addons (e.g., `prime-button`
  // presets) call this to mutate the host field. `writeToFieldValue`
  // centralises the `Signal → WritableSignal` cast and warns at runtime
  // if Signal Forms ever changes the contract.
  const setValue = hasFieldTree
    ? (next: unknown) => writeToFieldValue((fieldTreeCandidate as FieldTree<unknown>)().value, next)
    : undefined;
  // Shallow spread — relies on the mapper contract (see WrapperFieldInputs)
  // that rawInputs are emitted as fresh snapshots, not mutated in place.
  return {
    ...rawInputs,
    type: fieldType,
    field: readonlyField,
    setValue,
  } as WrapperFieldInputs;
}
