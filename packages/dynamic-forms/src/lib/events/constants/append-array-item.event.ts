import { FormEvent } from '../interfaces/form-event';
import { ArrayAllowedChildren } from '../../models/types/nesting-constraints';

/**
 * Template type for array items: array of field configurations.
 * Uses the same format as form config fields array.
 */
export type ArrayItemTemplate = ArrayAllowedChildren[];

/**
 * Event dispatched to append a new item at the END of an array field.
 *
 * This is the most common array operation - adding items to the end.
 * For other positions, use {@link PrependArrayItemEvent} or {@link InsertArrayItemEvent}.
 *
 * @example
 * ```typescript
 * // Use the builder API (recommended)
 * eventBus.dispatch(arrayEvent('contacts').append());
 *
 * // Or instantiate directly
 * eventBus.dispatch(new AppendArrayItemEvent('contacts'));
 *
 * // With custom template (overrides array's default template)
 * eventBus.dispatch(arrayEvent('contacts').append([
 *   { key: 'name', type: 'input', label: 'Name' },
 *   { key: 'email', type: 'input', label: 'Email' }
 * ]));
 * ```
 *
 * @typeParam TTemplate - The type of the template fields (for type safety)
 */
export class AppendArrayItemEvent<TTemplate extends ArrayItemTemplate = ArrayItemTemplate> implements FormEvent {
  readonly type = 'append-array-item' as const;

  constructor(
    /** The key of the array field to append an item to */
    public readonly arrayKey: string,
    /**
     * Optional template override for the new array item.
     * If not provided, the array field will use its own default template.
     */
    public readonly template?: TTemplate,
  ) {}
}
