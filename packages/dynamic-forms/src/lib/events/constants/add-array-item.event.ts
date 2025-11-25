import { FormEvent } from '../interfaces/form-event';
import { ArrayAllowedChildren } from '../../models/types/nesting-constraints';

/**
 * Event dispatched to add a new item to an array field.
 *
 * This event is used to dynamically add items to array fields at runtime.
 * The array field component listens for this event and adds a new item
 * based on the provided field template, or uses the array's own template if not provided.
 *
 * @example
 * ```typescript
 * // Add item using array's own template
 * eventBus.dispatch(AddArrayItemEvent, 'contacts');
 *
 * // Add item with explicit field template
 * const fieldTemplate = { key: 'email', type: 'input' };
 * eventBus.dispatch(AddArrayItemEvent, 'contacts', fieldTemplate);
 *
 * // Add item at specific index
 * eventBus.dispatch(AddArrayItemEvent, 'contacts', fieldTemplate, 2);
 * ```
 */
export class AddArrayItemEvent implements FormEvent {
  readonly type = 'add-array-item' as const;

  constructor(
    /** The key of the array field to add an item to */
    public readonly arrayKey: string,
    /**
     * Optional field template definition to render for the new array item.
     * If not provided, the array field component will use its own template.
     */
    public readonly field?: ArrayAllowedChildren,
    /** Optional index where to insert the item (defaults to end of array) */
    public readonly index?: number,
  ) {}
}
