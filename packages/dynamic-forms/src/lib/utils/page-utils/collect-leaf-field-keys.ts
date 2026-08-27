import { isGenericContainerField, isRowField } from '@ng-forge/dynamic-forms/internal';
import type { FieldDef } from '@ng-forge/dynamic-forms/internal';

/**
 * Form-node keys owned by a page's fields.
 *
 * Layout containers (`row`, `container`) are flattened by `mapFieldToForm`, so no form node
 * exists under their own key — traverse their children instead. `group` and `array` own a node
 * whose `valid()` already aggregates descendants, so their key is used as-is.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- accepts any field shape for recursive traversal
export function collectLeafFieldKeys(fields: readonly FieldDef<any>[]): string[] {
  const keys: string[] = [];

  for (const field of fields) {
    if (isRowField(field) || isGenericContainerField(field)) {
      keys.push(...collectLeafFieldKeys(field.fields as readonly FieldDef<unknown>[]));
    } else if (field.key) {
      keys.push(field.key);
    }
  }

  return keys;
}
