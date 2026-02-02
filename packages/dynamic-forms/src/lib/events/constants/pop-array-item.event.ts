import { FormEvent } from '../interfaces/form-event';

/**
 * Event dispatched to remove the LAST item from an array field.
 *
 * Equivalent to JavaScript's `Array.pop()` - removes from the end.
 * For removing from the beginning, use {@link ShiftArrayItemEvent}.
 * For removing at a specific index, use {@link RemoveAtIndexEvent}.
 *
 * @example
 * ```typescript
 * // Use the builder API (recommended)
 * eventBus.dispatch(arrayEvent('contacts').pop());
 *
 * // Or instantiate directly
 * eventBus.dispatch(new PopArrayItemEvent('contacts'));
 * ```
 */
export class PopArrayItemEvent implements FormEvent {
  readonly type = 'pop-array-item' as const;

  constructor(
    /** The key of the array field to remove the last item from */
    public readonly arrayKey: string,
  ) {}
}
