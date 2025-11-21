import { FormEvent } from '../interfaces/form-event';

/**
 * Event dispatched to remove an item from an array field.
 *
 * This event is used to dynamically remove items from array fields at runtime.
 * The array field component listens for this event and removes the item
 * at the specified index.
 *
 * @example
 * ```typescript
 * // Remove item at index 1 from 'contacts' array
 * eventBus.dispatch(RemoveArrayItemEvent, 'contacts', 1);
 *
 * // Remove last item
 * eventBus.dispatch(RemoveArrayItemEvent, 'contacts');
 * ```
 */
export class RemoveArrayItemEvent implements FormEvent {
  readonly type = 'remove-array-item' as const;

  constructor(
    /** The key of the array field to remove an item from */
    public readonly arrayKey: string,
    /** Index of the item to remove (defaults to last item) */
    public readonly index?: number,
  ) {}
}
