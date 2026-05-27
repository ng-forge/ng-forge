import { afterNextRender, Injector } from '@angular/core';
import { EventBus } from '../../events/event.bus';
import { ComponentInitializedEvent } from '../../events/constants/component-initialized.event';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';

/** Component type for initialization events. */
export type InitializationComponentType = 'dynamic-form' | 'group' | 'page' | 'array' | 'container';

/**
 * Emits a component initialization event after the next render cycle.
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
  const logger = injector.get(DynamicFormLogger);

  afterNextRender(
    () => {
      try {
        eventBus.dispatch(ComponentInitializedEvent, componentType, componentKey);
      } catch (error: unknown) {
        logger.error(`Failed to emit initialization event for ${componentType} '${componentKey}'`, error);
      }
    },
    { injector },
  );
}
