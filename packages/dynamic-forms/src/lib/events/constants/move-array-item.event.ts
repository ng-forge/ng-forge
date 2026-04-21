import { FormEvent } from '../interfaces/form-event';

/**
 * Event dispatched to move an existing item from one index to another within an array field.
 *
 * This is an atomic reorder operation — the item at `fromIndex` is removed and
 * reinserted at `toIndex`. No template is required because the existing item
 * (resolved component, form value, and stored template) is preserved.
 *
 * @example
 * ```typescript
 * // Use the builder API (recommended)
 * eventBus.dispatch(arrayEvent('contacts').move(0, 2));
 *
 * // Or instantiate directly
 * eventBus.dispatch(new MoveArrayItemEvent('contacts', 0, 2));
 * ```
 */
export class MoveArrayItemEvent implements FormEvent {
  readonly type = 'move-array-item' as const;

  constructor(
    /** The key of the array field containing the item to move */
    public readonly arrayKey: string,
    /** The current index of the item to move */
    public readonly fromIndex: number,
    /** The target index to move the item to */
    public readonly toIndex: number,
  ) {}
}
