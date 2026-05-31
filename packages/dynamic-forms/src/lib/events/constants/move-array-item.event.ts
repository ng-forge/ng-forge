import { FormEvent } from '@ng-forge/dynamic-forms/internal';

/** Event dispatched to move an existing item from one index to another within an array field. */
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
