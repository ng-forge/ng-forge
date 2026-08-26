import { computed, Injector, Signal } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { EventBus } from '@ng-forge/dynamic-forms/internal';
import { emitComponentInitialized, InitializationComponentType } from '../emit-initialization/emit-initialization';
import { ResolvedField } from '../resolve-field/resolve-field';
import {
  FieldDef,
  hasChildFields,
  isArrayField,
  isGenericContainerField,
  isGroupField,
  isPageField,
  normalizeFieldsArray,
} from '@ng-forge/dynamic-forms/internal';

/** Event identity used by containers that participate in initialization readiness. */
export function initializationComponentKey(type: InitializationComponentType, key: string): string {
  return `${type}:${key}`;
}

/** Collects the initialization events expected from rendered container components. */
export function collectInitializingContainerKeys(fields: readonly FieldDef<unknown>[]): string[] {
  const keys: string[] = [];

  for (const field of fields) {
    let type: InitializationComponentType | undefined;
    if (isPageField(field)) type = 'page';
    else if (isGroupField(field)) type = 'group';
    else if (isArrayField(field)) type = 'array';
    else if (isGenericContainerField(field)) type = 'container';

    if (type && field.key) keys.push(initializationComponentKey(type, field.key));

    if (!hasChildFields(field)) continue;
    for (const child of normalizeFieldsArray(field.fields)) {
      keys.push(...collectInitializingContainerKeys((Array.isArray(child) ? child : [child]) as readonly FieldDef<unknown>[]));
    }
  }

  return keys;
}

/**
 * Computes the host class string for a container component.
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
 * @param resolvedFields - Signal of resolved fields
 * @param eventBus - EventBus for dispatching initialization events
 * @param componentType - Static type, or a getter evaluated at emission time
 * @param fieldKeyFn - Function returning the field's key
 * @param injector - Injector for afterNextRender scheduling
 */
export function setupContainerInitEffect(
  resolvedFields: Signal<ResolvedField[]>,
  eventBus: EventBus,
  componentType: InitializationComponentType | (() => InitializationComponentType),
  fieldKeyFn: () => string,
  injector: Injector,
): void {
  const allReady = computed(() => {
    const fields = resolvedFields();
    return fields.length > 0 && fields.every((field) => field.renderReady());
  });

  explicitEffect([allReady], ([ready]) => {
    if (ready) {
      const type = typeof componentType === 'function' ? componentType() : componentType;
      emitComponentInitialized(eventBus, type, fieldKeyFn(), injector);
    }
  });
}
