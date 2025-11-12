import { FormEvent } from '../interfaces/form-event';

/**
 * Event dispatched to add a new item to an array field.
 *
 * This event is used to dynamically add items to array fields at runtime.
 * The array field component listens for this event and adds a new item
 * based on the stored field template.
 *
 * @example
 * ```typescript
 * // Add item to 'contacts' array
 * eventBus.dispatch(AddArrayItemEvent, 'contacts');
 *
 * // Add item at specific index
 * eventBus.dispatch(AddArrayItemEvent, 'contacts', 2);
 * ```
 */
export class AddArrayItemEvent implements FormEvent {
  readonly type = 'add-array-item' as const;

  constructor(
    /** The key of the array field to add an item to */
    public readonly arrayKey: string,
    /** Optional index where to insert the item (defaults to end of array) */
    public readonly index?: number
  ) {}
}
