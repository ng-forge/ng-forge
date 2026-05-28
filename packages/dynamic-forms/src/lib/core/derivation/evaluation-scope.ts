import { getNestedValue } from '../expressions/value-utils';
import { ArrayPathInfo } from '../../utils/path-utils/path-utils';

/**
 * Returns the path to the parent of the given field path. Drops the last
 * `.`-delimited segment. Returns `undefined` when the field has no parent
 * in scope (single-segment root key).
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
  readonly groupValue: unknown;
  readonly fieldValue: unknown;
}

/**
 * Resolves the per-array-item scope shared by both derivation applicators.
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
