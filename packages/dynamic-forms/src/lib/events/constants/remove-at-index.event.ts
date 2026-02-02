import { FormEvent } from '../interfaces/form-event';

/**
 * Event dispatched to remove an item at a SPECIFIC INDEX from an array field.
 *
 * Use this when you need precise control over which item to remove.
 * For simpler operations, use {@link PopArrayItemEvent} or {@link ShiftArrayItemEvent}.
 *
 * @example
 * ```typescript
 * // Use the builder API (recommended)
 * eventBus.dispatch(arrayEvent('contacts').removeAt(2));
 *
 * // Or instantiate directly
 * eventBus.dispatch(new RemoveAtIndexEvent('contacts', 2));
 * ```
 */
export class RemoveAtIndexEvent implements FormEvent {
  readonly type = 'remove-at-index' as const;

  constructor(
    /** The key of the array field to remove an item from */
    public readonly arrayKey: string,
    /** The index of the item to remove */
    public readonly index: number,
  ) {}
}
