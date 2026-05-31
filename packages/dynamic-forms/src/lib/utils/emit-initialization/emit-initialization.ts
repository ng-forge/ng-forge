import { afterNextRender, Injector } from '@angular/core';
import { EventBus } from '@ng-forge/dynamic-forms/internal';
import { ComponentInitializedEvent } from '@ng-forge/dynamic-forms/internal';
import { DynamicFormLogger } from '@ng-forge/dynamic-forms/internal';

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
