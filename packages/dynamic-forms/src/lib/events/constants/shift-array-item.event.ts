import { FormEvent } from '../interfaces/form-event';

/** Event dispatched to remove the FIRST item from an array field. */
export class ShiftArrayItemEvent implements FormEvent {
  readonly type = 'shift-array-item' as const;

  constructor(
    /** The key of the array field to remove the first item from */
    public readonly arrayKey: string,
  ) {}
}
