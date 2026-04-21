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
 * Provides a fluent, discoverable API for array operations.
 * Type `arrayEvent('key').` in your IDE to see all available operations.
 *
 * **BREAKING CHANGE**: Template is now required for add operations.
 *
 * Supports both primitive and object array items:
 * - Primitive: Pass a single field definition → extracts field value directly
 * - Object: Pass an array of field definitions → merges fields into object
 *
 * @example
 * ```typescript
 * import { arrayEvent } from '@ng-forge/dynamic-forms';
 *
 * // Object item: append { name, email } object
 * eventBus.dispatch(arrayEvent('contacts').append([
 *   { key: 'name', type: 'input', label: 'Name' },
 *   { key: 'email', type: 'input', label: 'Email' }
 * ]));
 *
 * // Primitive item: append single value
 * eventBus.dispatch(arrayEvent('tags').append(
 *   { key: 'tag', type: 'input', label: 'Tag' }
 * ));
 *
 * // Removing items (no template needed)
 * eventBus.dispatch(arrayEvent('contacts').pop());      // Remove last
 * eventBus.dispatch(arrayEvent('contacts').shift());    // Remove first
 * eventBus.dispatch(arrayEvent('contacts').removeAt(2)); // Remove at index
 *
 * // Reordering items (no template needed, preserves item identity)
 * eventBus.dispatch(arrayEvent('contacts').move(0, 2)); // Move first to third
 * ```
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
     *
     * @example
     * ```typescript
     * // Object item
     * eventBus.dispatch(arrayEvent('contacts').append([
     *   { key: 'name', type: 'input', label: 'Name' }
     * ]));
     *
     * // Primitive item
     * eventBus.dispatch(arrayEvent('tags').append(
     *   { key: 'tag', type: 'input', label: 'Tag' }
     * ));
     * ```
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
     *
     * @example
     * ```typescript
     * // Object item
     * eventBus.dispatch(arrayEvent('contacts').prepend([
     *   { key: 'name', type: 'input', label: 'Name' }
     * ]));
     *
     * // Primitive item
     * eventBus.dispatch(arrayEvent('tags').prepend(
     *   { key: 'tag', type: 'input', label: 'Tag' }
     * ));
     * ```
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
     *
     * @example
     * ```typescript
     * // Object item at index 2
     * eventBus.dispatch(arrayEvent('contacts').insertAt(2, [
     *   { key: 'name', type: 'input', label: 'Name' }
     * ]));
     *
     * // Primitive item at index 2
     * eventBus.dispatch(arrayEvent('tags').insertAt(2,
     *   { key: 'tag', type: 'input', label: 'Tag' }
     * ));
     * ```
     */
    insertAt: <T extends ArrayItemDefinitionTemplate>(index: number, template: T) => new InsertArrayItemEvent(arrayKey, index, template),

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

    /**
     * Move an existing item from one position to another within the array.
     * This is an atomic reorder — the item is NOT destroyed and recreated.
     * The resolved component, form value, and stored template are preserved.
     *
     * @param from - The current index of the item to move
     * @param to - The target index to move the item to
     * @returns A MoveArrayItemEvent to dispatch
     *
     * @example
     * ```typescript
     * // Move item from index 0 to index 2
     * eventBus.dispatch(arrayEvent('contacts').move(0, 2));
     * ```
     */
    move: (from: number, to: number) => new MoveArrayItemEvent(arrayKey, from, to),
  };
}
