import { FormEvent } from '../interfaces/form-event';
import { ArrayItemDefinition, ArrayItemTemplate } from '../../definitions/default/array-field';

/**
 * Template type for array items used in events.
 * Canonical definition lives in {@link ArrayItemDefinition} — this alias
 * preserves the events-specific naming convention.
 */
export type ArrayItemDefinitionTemplate = ArrayItemDefinition;

// Re-export the canonical ArrayItemTemplate for backwards-compatible event API surface
export type { ArrayItemTemplate };

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
