import { FormEvent } from '../interfaces/form-event';
import { ArrayItemTemplate } from './append-array-item.event';

/**
 * Event dispatched to prepend a new item at the BEGINNING of an array field.
 *
 * Use this when new items should appear at the start of the list.
 * For appending to the end, use {@link AppendArrayItemEvent}.
 *
 * @example
 * ```typescript
 * // Use the builder API (recommended)
 * eventBus.dispatch(arrayEvent('contacts').prepend([
 *   { key: 'name', type: 'input', label: 'Name' }
 * ]));
 *
 * // Or instantiate directly
 * eventBus.dispatch(new PrependArrayItemEvent('contacts', [
 *   { key: 'name', type: 'input', label: 'Name' }
 * ]));
 * ```
 *
 * @typeParam TTemplate - The type of the template fields (for type safety)
 */
export class PrependArrayItemEvent<TTemplate extends ArrayItemTemplate = ArrayItemTemplate> implements FormEvent {
  readonly type = 'prepend-array-item' as const;

  constructor(
    /** The key of the array field to prepend an item to */
    public readonly arrayKey: string,
    /**
     * Template for the new array item. REQUIRED.
     * Defines the field structure for the new item.
     */
    public readonly template: TTemplate,
  ) {}
}
