import { AppendArrayItemEvent, ArrayItemDefinitionTemplate } from './constants/append-array-item.event';
import { PrependArrayItemEvent } from './constants/prepend-array-item.event';
import { InsertArrayItemEvent } from './constants/insert-array-item.event';
import { MoveArrayItemEvent } from './constants/move-array-item.event';
import { PopArrayItemEvent } from './constants/pop-array-item.event';
import { ShiftArrayItemEvent } from './constants/shift-array-item.event';
import { RemoveAtIndexEvent } from './constants/remove-at-index.event';

/**
 * Builder for array manipulation events.
 *
 * @param arrayKey - The key of the array field to operate on
 * @returns An object with methods for all 7 array operations
 */
export function arrayEvent(arrayKey: string) {
  return {
    /**
     * Append a new item at the END of the array.
     * This is the most common operation for adding items.
     *
     * @param template - Template for the new item (REQUIRED)
     *   - Single field: Creates a primitive item (field's value is extracted directly)
     *   - Array of fields: Creates an object item (fields merged into object)
     * @returns An AppendArrayItemEvent to dispatch
     */
    append: <T extends ArrayItemDefinitionTemplate>(template: T) => new AppendArrayItemEvent(arrayKey, template),

    /**
     * Prepend a new item at the BEGINNING of the array.
     * Use when new items should appear at the start.
     *
     * @param template - Template for the new item (REQUIRED)
     *   - Single field: Creates a primitive item (field's value is extracted directly)
     *   - Array of fields: Creates an object item (fields merged into object)
     * @returns A PrependArrayItemEvent to dispatch
     */
    prepend: <T extends ArrayItemDefinitionTemplate>(template: T) => new PrependArrayItemEvent(arrayKey, template),

    /**
     * Insert a new item at a SPECIFIC INDEX in the array.
     * Use when you need precise control over item placement.
     *
     * @param index - The position at which to insert the new item
     * @param template - Template for the new item (REQUIRED)
     *   - Single field: Creates a primitive item (field's value is extracted directly)
     *   - Array of fields: Creates an object item (fields merged into object)
     * @returns An InsertArrayItemEvent to dispatch
     */
    insertAt: <T extends ArrayItemDefinitionTemplate>(index: number, template: T) => new InsertArrayItemEvent(arrayKey, index, template),

    /**
     * Remove the LAST item from the array.
     * Equivalent to JavaScript's `Array.pop()`.
     *
     * @returns A PopArrayItemEvent to dispatch
     */
    pop: () => new PopArrayItemEvent(arrayKey),

    /**
     * Remove the FIRST item from the array.
     * Equivalent to JavaScript's `Array.shift()`.
     *
     * @returns A ShiftArrayItemEvent to dispatch
     */
    shift: () => new ShiftArrayItemEvent(arrayKey),

    /**
     * Remove an item at a SPECIFIC INDEX from the array.
     * Use when you need to remove a specific item by position.
     *
     * @param index - The position of the item to remove
     * @returns A RemoveAtIndexEvent to dispatch
     */
    removeAt: (index: number) => new RemoveAtIndexEvent(arrayKey, index),

    /**
     * Move an existing item from one position to another within the array.
     * This is an atomic reorder — the item is NOT destroyed and recreated.
     * The resolved component, form value, and stored template are preserved.
     *
     * @param from - The current index of the item to move
     * @param to - The target index to move the item to
     * @returns A MoveArrayItemEvent to dispatch
     */
    move: (from: number, to: number) => new MoveArrayItemEvent(arrayKey, from, to),
  };
}
