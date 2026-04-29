import { getNestedValue } from '../expressions/value-utils';
import { ArrayPathInfo } from '../../utils/path-utils/path-utils';

/**
 * Returns the path to the parent of the given field path. Drops the last
 * `.`-delimited segment. Returns `undefined` when the field has no parent
 * in scope (single-segment root key).
 *
 * - `'address.state'` → `'address'`
 * - `'org.address.state'` → `'org.address'`
 * - `'state'` → `undefined`
 *
 * Used by the non-array evaluation context to populate `groupValue` from
 * the field's parent group on `formValue`.
 *
 * @internal
 */
export function getParentPathInScope(fieldKey: string): string | undefined {
  const lastDot = fieldKey.lastIndexOf('.');
  if (lastDot <= 0) return undefined;
  return fieldKey.slice(0, lastDot);
}

/**
 * Per-array-item scope values resolved from a parsed array path.
 *
 * @internal
 */
export interface ArrayItemScope {
  /** Path within the array item (everything after `'.$.'`); `''` for non-array entries. */
  readonly relativePath: string;
  /** Nearest parent of the leaf within the array item: the inner group's value when the leaf
   *  is nested under a group, otherwise the array item itself. */
  readonly groupValue: unknown;
  /** Leaf value addressed by `relativePath` within the array item, or the array item itself
   *  when the leaf has no relative path. */
  readonly fieldValue: unknown;
}

/**
 * Resolves the per-array-item scope shared by both derivation applicators.
 *
 * Both `derivation-applicator.ts` and `property-derivation-applicator.ts`
 * need the same fan-out from `(pathInfo, arrayItem)` to `fieldValue`,
 * `groupValue`, and `relativePath` when building an evaluation context for
 * an array item. Centralising here keeps the two pipelines from drifting.
 *
 * @internal
 */
export function resolveArrayItemScope(pathInfo: ArrayPathInfo, arrayItem: Record<string, unknown>): ArrayItemScope {
  const relativePath = pathInfo.isArrayPath ? pathInfo.relativePath : '';
  const innerParentPath = relativePath.includes('.') ? relativePath.slice(0, relativePath.lastIndexOf('.')) : '';
  const groupValue = innerParentPath ? getNestedValue(arrayItem, innerParentPath) : arrayItem;
  const fieldValue = relativePath ? getNestedValue(arrayItem, relativePath) : arrayItem;
  return { relativePath, groupValue, fieldValue };
}
