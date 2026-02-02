import { FormEvent } from '../interfaces/form-event';
import { ArrayItemTemplate } from './append-array-item.event';

/**
 * Event dispatched to insert a new item at a SPECIFIC INDEX in an array field.
 *
 * Use this when you need precise control over where the new item appears.
 * For simpler operations, use {@link AppendArrayItemEvent} or {@link PrependArrayItemEvent}.
 *
 * @example
 * ```typescript
 * // Use the builder API (recommended)
 * eventBus.dispatch(arrayEvent('contacts').insertAt(2, [
 *   { key: 'name', type: 'input', label: 'Name' }
 * ]));
 *
 * // Or instantiate directly
 * eventBus.dispatch(new InsertArrayItemEvent('contacts', 2, [
 *   { key: 'name', type: 'input', label: 'Name' }
 * ]));
 * ```
 *
 * @typeParam TTemplate - The type of the template fields (for type safety)
 */
export class InsertArrayItemEvent<TTemplate extends ArrayItemTemplate = ArrayItemTemplate> implements FormEvent {
  readonly type = 'insert-array-item' as const;

  constructor(
    /** The key of the array field to insert an item into */
    public readonly arrayKey: string,
    /** The index at which to insert the new item */
    public readonly index: number,
    /**
     * Template for the new array item. REQUIRED.
     * Defines the field structure for the new item.
     */
    public readonly template: TTemplate,
  ) {}
}
