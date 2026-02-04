import { FormEvent } from '../interfaces/form-event';
import { ArrayItemDefinitionTemplate } from './append-array-item.event';

/**
 * Event dispatched to insert a new item at a SPECIFIC INDEX in an array field.
 *
 * Use this when you need precise control over where the new item appears.
 * For simpler operations, use {@link AppendArrayItemEvent} or {@link PrependArrayItemEvent}.
 *
 * @example
 * ```typescript
 * // Object item: insert { name } object at index 2
 * eventBus.dispatch(arrayEvent('contacts').insertAt(2, [
 *   { key: 'name', type: 'input', label: 'Name' }
 * ]));
 *
 * // Primitive item: insert single value at index 2
 * eventBus.dispatch(arrayEvent('tags').insertAt(2,
 *   { key: 'tag', type: 'input', label: 'Tag' }
 * ));
 * ```
 *
 * @typeParam TTemplate - The type of the template (single field or array of fields)
 */
export class InsertArrayItemEvent<TTemplate extends ArrayItemDefinitionTemplate = ArrayItemDefinitionTemplate> implements FormEvent {
  readonly type = 'insert-array-item' as const;

  constructor(
    /** The key of the array field to insert an item into */
    public readonly arrayKey: string,
    /** The index at which to insert the new item */
    public readonly index: number,
    /**
     * Template for the new array item. REQUIRED.
     * - Single field (FieldDef): Creates a primitive item (field's value is extracted directly)
     * - Array of fields (FieldDef[]): Creates an object item (fields merged into object)
     */
    public readonly template: TTemplate,
  ) {}
}
