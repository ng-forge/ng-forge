import { FormEvent } from '../interfaces/form-event';

/**
 * Event dispatched to remove the FIRST item from an array field.
 *
 * Equivalent to JavaScript's `Array.shift()` - removes from the beginning.
 * For removing from the end, use {@link PopArrayItemEvent}.
 * For removing at a specific index, use {@link RemoveAtIndexEvent}.
 *
 * @example
 * ```typescript
 * // Use the builder API (recommended)
 * eventBus.dispatch(arrayEvent('contacts').shift());
 *
 * // Or instantiate directly
 * eventBus.dispatch(new ShiftArrayItemEvent('contacts'));
 * ```
 */
export class ShiftArrayItemEvent implements FormEvent {
  readonly type = 'shift-array-item' as const;

  constructor(
    /** The key of the array field to remove the first item from */
    public readonly arrayKey: string,
  ) {}
}
