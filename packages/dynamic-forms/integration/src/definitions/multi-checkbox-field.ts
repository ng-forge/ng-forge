import { BaseValueField, FieldMeta, FieldOption } from '@ng-forge/dynamic-forms';

/**
 * Multi-checkbox field for selecting multiple values from a list of options.
 * The value is an array of selected option values.
 *
 * @example
 * const tagsField: MultiCheckboxField<string> = {
 *   type: 'multi-checkbox',
 *   key: 'tags',
 *   value: ['tag1', 'tag2'], // Array of selected values
 *   options: [
 *     { label: 'Tag 1', value: 'tag1' },
 *     { label: 'Tag 2', value: 'tag2' },
 *     { label: 'Tag 3', value: 'tag3' }
 *   ]
 * };
 */
export interface MultiCheckboxField<TValue, TProps = object, TNullable extends boolean = boolean> extends BaseValueField<
  TProps,
  TValue[],
  FieldMeta,
  TNullable
> {
  type: 'multi-checkbox';
  readonly options: readonly FieldOption<TValue>[];
}
