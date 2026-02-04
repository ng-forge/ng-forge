import { FormEvent } from '../interfaces/form-event';
import { ArrayItemDefinitionTemplate } from './append-array-item.event';

/**
 * Event dispatched to prepend a new item at the BEGINNING of an array field.
 *
 * Use this when new items should appear at the start of the list.
 * For appending to the end, use {@link AppendArrayItemEvent}.
 *
 * @example
 * ```typescript
 * // Object item: prepend { name } object
 * eventBus.dispatch(arrayEvent('contacts').prepend([
 *   { key: 'name', type: 'input', label: 'Name' }
 * ]));
 *
 * // Primitive item: prepend single value
 * eventBus.dispatch(arrayEvent('tags').prepend(
 *   { key: 'tag', type: 'input', label: 'Tag' }
 * ));
 * ```
 *
 * @typeParam TTemplate - The type of the template (single field or array of fields)
 */
export class PrependArrayItemEvent<TTemplate extends ArrayItemDefinitionTemplate = ArrayItemDefinitionTemplate> implements FormEvent {
  readonly type = 'prepend-array-item' as const;

  constructor(
    /** The key of the array field to prepend an item to */
    public readonly arrayKey: string,
    /**
     * Template for the new array item. REQUIRED.
     * - Single field (FieldDef): Creates a primitive item (field's value is extracted directly)
     * - Array of fields (FieldDef[]): Creates an object item (fields merged into object)
     */
    public readonly template: TTemplate,
  ) {}
}
