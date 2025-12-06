import { afterNextRender, Injector } from '@angular/core';
import { EventBus } from '../../events/event.bus';
import { ComponentInitializedEvent } from '../../events/constants/component-initialized.event';

/**
 * Component type for initialization events.
 */
export type InitializationComponentType = 'dynamic-form' | 'group' | 'row' | 'page' | 'array';

/**
 * Emits a component initialization event after the next render cycle.
 *
 * This utility is used by container components (group, row, page, array) to signal
 * that their child fields have been resolved and rendered. The event is dispatched
 * through the EventBus and is used by the initialization tracking system.
 *
 * @param eventBus - The EventBus instance to dispatch the event on
 * @param componentType - The type of component being initialized
 * @param componentKey - The unique key/id of the component
 * @param injector - The injector to use for afterNextRender scheduling
 */
export function emitComponentInitialized(
  eventBus: EventBus,
  componentType: InitializationComponentType,
  componentKey: string,
  injector: Injector,
): void {
  afterNextRender(
    () => {
      try {
        eventBus.dispatch(ComponentInitializedEvent, componentType, componentKey);
      } catch {
        // Input not available - component may have been destroyed
      }
    },
    { injector },
  );
}
