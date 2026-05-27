import { FormEvent } from '../interfaces/form-event';

/** Event dispatched to remove the LAST item from an array field. */
export class PopArrayItemEvent implements FormEvent {
  readonly type = 'pop-array-item' as const;

  constructor(
    /** The key of the array field to remove the last item from */
    public readonly arrayKey: string,
  ) {}
}
