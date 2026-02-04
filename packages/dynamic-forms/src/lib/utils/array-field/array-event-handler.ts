import { filter, map, Observable } from 'rxjs';
import { AppendArrayItemEvent } from '../../events/constants/append-array-item.event';
import { PrependArrayItemEvent } from '../../events/constants/prepend-array-item.event';
import { InsertArrayItemEvent } from '../../events/constants/insert-array-item.event';
import { PopArrayItemEvent } from '../../events/constants/pop-array-item.event';
import { ShiftArrayItemEvent } from '../../events/constants/shift-array-item.event';
import { RemoveAtIndexEvent } from '../../events/constants/remove-at-index.event';
import { EventBus } from '../../events/event.bus';
import { FieldDef } from '../../definitions/base/field-def';

/**
 * Union type of all array manipulation events.
 */
export type ArrayEvent =
  | AppendArrayItemEvent
  | PrependArrayItemEvent
  | InsertArrayItemEvent
  | PopArrayItemEvent
  | ShiftArrayItemEvent
  | RemoveAtIndexEvent;

/**
 * All array event type discriminants.
 */
const ARRAY_EVENT_TYPES: ArrayEvent['type'][] = [
  'append-array-item',
  'prepend-array-item',
  'insert-array-item',
  'pop-array-item',
  'shift-array-item',
  'remove-at-index',
];

/**
 * Normalized action representing an array manipulation.
 * Template can be:
 * - Single FieldDef for primitive items (field's value is extracted directly)
 * - Array of FieldDefs for object items (fields merged into object)
 */
export type ArrayAction =
  | { action: 'add'; template: FieldDef<unknown> | FieldDef<unknown>[]; index?: number }
  | { action: 'remove'; index?: number };

/**
 * Converts an array event to a normalized action.
 * Uses a switch for full type safety with discriminated union narrowing.
 */
function toArrayAction(event: ArrayEvent): ArrayAction {
  switch (event.type) {
    case 'append-array-item':
      return { action: 'add', template: event.template };
    case 'prepend-array-item':
      return { action: 'add', template: event.template, index: 0 };
    case 'insert-array-item':
      return { action: 'add', template: event.template, index: event.index };
    case 'pop-array-item':
      return { action: 'remove' };
    case 'shift-array-item':
      return { action: 'remove', index: 0 };
    case 'remove-at-index':
      return { action: 'remove', index: event.index };
  }
}

/**
 * Creates an observable stream of normalized array actions for a specific array key.
 *
 * @param eventBus - The event bus to subscribe to
 * @param arrayKey - Function returning the array key to filter events for
 * @returns Observable of normalized ArrayAction objects
 *
 * @example
 * ```typescript
 * observeArrayActions(this.eventBus, () => this.key())
 *   .pipe(takeUntilDestroyed())
 *   .subscribe(action => {
 *     if (action.action === 'add') {
 *       this.addItem(action.template, action.index);
 *     } else {
 *       this.removeItem(action.index);
 *     }
 *   });
 * ```
 */
export function observeArrayActions(eventBus: EventBus, arrayKey: () => string): Observable<ArrayAction> {
  return eventBus.on<ArrayEvent>(ARRAY_EVENT_TYPES).pipe(
    filter((event) => event.arrayKey === arrayKey()),
    map(toArrayAction),
  );
}
