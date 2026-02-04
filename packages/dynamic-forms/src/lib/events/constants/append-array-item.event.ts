import { FormEvent } from '../interfaces/form-event';
import { ArrayAllowedChildren } from '../../models/types/nesting-constraints';

/**
 * Template type for OBJECT array items: array of field configurations.
 * Each field's value is merged into the item object.
 */
export type ArrayItemTemplate = ArrayAllowedChildren[];

/**
 * Template type for array items that can be either:
 * - A single field (ArrayAllowedChildren) for PRIMITIVE items - extracts field value directly
 * - An array of fields (ArrayItemTemplate) for OBJECT items - merges fields into object
 *
 * Examples:
 * - Primitive: `{ key: 'tag', type: 'input', value: 'angular' }` → 'angular'
 * - Object: `[{ key: 'name', type: 'input' }, { key: 'email', type: 'input' }]` → { name: '', email: '' }
 */
export type ArrayItemDefinitionTemplate = ArrayAllowedChildren | ArrayItemTemplate;

/**
 * Event dispatched to append a new item at the END of an array field.
 *
 * This is the most common array operation - adding items to the end.
 * For other positions, use {@link PrependArrayItemEvent} or {@link InsertArrayItemEvent}.
 *
 * @example
 * ```typescript
 * // Object item: append { name, email } object
 * eventBus.dispatch(arrayEvent('contacts').append([
 *   { key: 'name', type: 'input', label: 'Name' },
 *   { key: 'email', type: 'input', label: 'Email' }
 * ]));
 *
 * // Primitive item: append single value
 * eventBus.dispatch(arrayEvent('tags').append(
 *   { key: 'tag', type: 'input', label: 'Tag' }
 * ));
 * ```
 *
 * @typeParam TTemplate - The type of the template (single field or array of fields)
 */
export class AppendArrayItemEvent<TTemplate extends ArrayItemDefinitionTemplate = ArrayItemDefinitionTemplate> implements FormEvent {
  readonly type = 'append-array-item' as const;

  constructor(
    /** The key of the array field to append an item to */
    public readonly arrayKey: string,
    /**
     * Template for the new array item. REQUIRED.
     * - Single field (FieldDef): Creates a primitive item (field's value is extracted directly)
     * - Array of fields (FieldDef[]): Creates an object item (fields merged into object)
     */
    public readonly template: TTemplate,
  ) {}
}
