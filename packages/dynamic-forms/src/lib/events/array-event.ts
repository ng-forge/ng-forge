import { AppendArrayItemEvent, ArrayItemTemplate } from './constants/append-array-item.event';
import { PrependArrayItemEvent } from './constants/prepend-array-item.event';
import { InsertArrayItemEvent } from './constants/insert-array-item.event';
import { PopArrayItemEvent } from './constants/pop-array-item.event';
import { ShiftArrayItemEvent } from './constants/shift-array-item.event';
import { RemoveAtIndexEvent } from './constants/remove-at-index.event';

/**
 * Builder for array manipulation events.
 *
 * Provides a fluent, discoverable API for array operations.
 * Type `arrayEvent('key').` in your IDE to see all available operations.
 *
 * **BREAKING CHANGE**: Template is now required for add operations.
 *
 * @example
 * ```typescript
 * import { arrayEvent } from '@ng-forge/dynamic-forms';
 *
 * // Template is required for add operations
 * eventBus.dispatch(arrayEvent('contacts').append([
 *   { key: 'name', type: 'input', label: 'Name' },
 *   { key: 'email', type: 'input', label: 'Email' }
 * ]));
 *
 * // Other add operations
 * eventBus.dispatch(arrayEvent('contacts').prepend([
 *   { key: 'name', type: 'input', label: 'Name' }
 * ]));
 * eventBus.dispatch(arrayEvent('contacts').insertAt(2, [
 *   { key: 'name', type: 'input', label: 'Name' }
 * ]));
 *
 * // Removing items (no template needed)
 * eventBus.dispatch(arrayEvent('contacts').pop());      // Remove last
 * eventBus.dispatch(arrayEvent('contacts').shift());    // Remove first
 * eventBus.dispatch(arrayEvent('contacts').removeAt(2)); // Remove at index
 * ```
 *
 * @param arrayKey - The key of the array field to operate on
 * @returns An object with methods for all 6 array operations
 */
export function arrayEvent(arrayKey: string) {
  return {
    /**
     * Append a new item at the END of the array.
     * This is the most common operation for adding items.
     *
     * @param template - Template for the new item (REQUIRED)
     * @returns An AppendArrayItemEvent to dispatch
     *
     * @example
     * ```typescript
     * eventBus.dispatch(arrayEvent('contacts').append([
     *   { key: 'name', type: 'input', label: 'Name' }
     * ]));
     * ```
     */
    append: <T extends ArrayItemTemplate>(template: T) => new AppendArrayItemEvent(arrayKey, template),

    /**
     * Prepend a new item at the BEGINNING of the array.
     * Use when new items should appear at the start.
     *
     * @param template - Template for the new item (REQUIRED)
     * @returns A PrependArrayItemEvent to dispatch
     *
     * @example
     * ```typescript
     * eventBus.dispatch(arrayEvent('contacts').prepend([
     *   { key: 'name', type: 'input', label: 'Name' }
     * ]));
     * ```
     */
    prepend: <T extends ArrayItemTemplate>(template: T) => new PrependArrayItemEvent(arrayKey, template),

    /**
     * Insert a new item at a SPECIFIC INDEX in the array.
     * Use when you need precise control over item placement.
     *
     * @param index - The position at which to insert the new item
     * @param template - Template for the new item (REQUIRED)
     * @returns An InsertArrayItemEvent to dispatch
     *
     * @example
     * ```typescript
     * eventBus.dispatch(arrayEvent('contacts').insertAt(2, [
     *   { key: 'name', type: 'input', label: 'Name' }
     * ]));
     * ```
     */
    insertAt: <T extends ArrayItemTemplate>(index: number, template: T) => new InsertArrayItemEvent(arrayKey, index, template),

    /**
     * Remove the LAST item from the array.
     * Equivalent to JavaScript's `Array.pop()`.
     *
     * @returns A PopArrayItemEvent to dispatch
     *
     * @example
     * ```typescript
     * eventBus.dispatch(arrayEvent('contacts').pop());
     * ```
     */
    pop: () => new PopArrayItemEvent(arrayKey),

    /**
     * Remove the FIRST item from the array.
     * Equivalent to JavaScript's `Array.shift()`.
     *
     * @returns A ShiftArrayItemEvent to dispatch
     *
     * @example
     * ```typescript
     * eventBus.dispatch(arrayEvent('contacts').shift());
     * ```
     */
    shift: () => new ShiftArrayItemEvent(arrayKey),

    /**
     * Remove an item at a SPECIFIC INDEX from the array.
     * Use when you need to remove a specific item by position.
     *
     * @param index - The position of the item to remove
     * @returns A RemoveAtIndexEvent to dispatch
     *
     * @example
     * ```typescript
     * eventBus.dispatch(arrayEvent('contacts').removeAt(2));
     * ```
     */
    removeAt: (index: number) => new RemoveAtIndexEvent(arrayKey, index),
  };
}
