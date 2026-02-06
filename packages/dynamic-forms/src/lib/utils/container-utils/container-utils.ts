import { Injector, Signal } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { EventBus } from '../../events/event.bus';
import { emitComponentInitialized, InitializationComponentType } from '../emit-initialization/emit-initialization';
import { ResolvedField } from '../resolve-field/resolve-field';

/**
 * Computes the host class string for a container component.
 *
 * All containers follow the pattern: `df-field df-{type}` + optional custom class.
 *
 * @param containerType - The CSS class suffix (e.g., 'group', 'row', 'page-field')
 * @param className - Optional custom class name to append
 * @returns The computed host class string
 */
export function computeContainerHostClasses(containerType: string, className: string | undefined): string {
  const base = `df-field df-${containerType}`;
  return className ? `${base} ${className}` : base;
}

/**
 * Sets up the initialization effect common to all container components.
 *
 * When resolved fields become non-empty, emits a ComponentInitializedEvent
 * via afterNextRender to signal the container is ready.
 *
 * @param resolvedFields - Signal of resolved fields
 * @param eventBus - EventBus for dispatching initialization events
 * @param componentType - The type of container component
 * @param fieldKeyFn - Function returning the field's key
 * @param injector - Injector for afterNextRender scheduling
 */
export function setupContainerInitEffect(
  resolvedFields: Signal<ResolvedField[]>,
  eventBus: EventBus,
  componentType: InitializationComponentType,
  fieldKeyFn: () => string,
  injector: Injector,
): void {
  explicitEffect([resolvedFields], ([fields]) => {
    if (fields.length > 0) {
      emitComponentInitialized(eventBus, componentType, fieldKeyFn(), injector);
    }
  });
}
