import { afterNextRender, Injector } from '@angular/core';
import { EventBus } from '../../events/event.bus';
import { ComponentInitializedEvent } from '../../events/constants/component-initialized.event';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import type { Logger } from '../../providers/features/logger/logger.interface';
import { NoopLogger } from '../../providers/features/logger/noop-logger';

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
 * B35 fix: Previously swallowed errors silently with a bare catch block.
 * Now logs errors via DynamicFormLogger so initialization failures are visible.
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
  // Try to get logger from the injector; fall back to noop if unavailable
  let logger: Logger;
  try {
    logger = injector.get(DynamicFormLogger);
  } catch {
    logger = new NoopLogger();
  }

  afterNextRender(
    () => {
      try {
        eventBus.dispatch(ComponentInitializedEvent, componentType, componentKey);
      } catch (error: unknown) {
        logger.error(`[Dynamic Forms] Failed to emit initialization event for ${componentType} '${componentKey}'`, error);
      }
    },
    { injector },
  );
}
