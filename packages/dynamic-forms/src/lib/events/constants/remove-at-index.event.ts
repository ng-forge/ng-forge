import { FormEvent } from '@ng-forge/dynamic-forms/internal';

/** Event dispatched to remove an item at a SPECIFIC INDEX from an array field. */
export class RemoveAtIndexEvent implements FormEvent {
  readonly type = 'remove-at-index' as const;

  constructor(
    /** The key of the array field to remove an item from */
    public readonly arrayKey: string,
    /** The index of the item to remove */
    public readonly index: number,
  ) {}
}
