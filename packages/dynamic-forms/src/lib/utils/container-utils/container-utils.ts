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
  isRowField,
  normalizeFieldsArray,
} from '@ng-forge/dynamic-forms/internal';

/** Event identity used by containers that participate in initialization readiness. */
export function initializationComponentKey(type: InitializationComponentType, key: string): string {
  return `${type}:${key}`;
}

/** Joins a container's local key to its group scope for initialization identity. */
export function initializationComponentPath(key: string, groupPath?: string): string {
  return groupPath ? `${groupPath}.${key}` : key;
}

/** Component-initialization identity emitted by a rendered container field. */
export function initializationComponentType(field: FieldDef<unknown>): InitializationComponentType | undefined {
  if (isPageField(field)) return 'page';
  if (isGroupField(field)) return 'group';
  if (isArrayField(field)) return 'array';
  if (isRowField(field) || isGenericContainerField(field)) return 'container';
  return undefined;
}

export interface InitializationComponentIdentity {
  readonly type: InitializationComponentType;
  readonly path: string;
}

/** Collects the initialization identities expected from rendered container components. */
export function collectInitializingContainers(fields: readonly FieldDef<unknown>[], groupPath = ''): InitializationComponentIdentity[] {
  const identities: InitializationComponentIdentity[] = [];

  for (const field of fields) {
    // A statically hidden container never mounts, and neither can its descendants.
    if (field.hidden === true) continue;

    const type = initializationComponentType(field);
    const componentPath = initializationComponentPath(field.key, groupPath);
    if (type && field.key) identities.push({ type, path: componentPath });

    if (!hasChildFields(field)) continue;
    const childGroupPath = isGroupField(field) ? componentPath : groupPath;
    for (const child of normalizeFieldsArray(field.fields)) {
      identities.push(
        ...collectInitializingContainers((Array.isArray(child) ? child : [child]) as readonly FieldDef<unknown>[], childGroupPath),
      );
    }
  }

  return identities;
}

/** Collects the initialization events expected from rendered container components. */
export function collectInitializingContainerKeys(fields: readonly FieldDef<unknown>[], groupPath = ''): string[] {
  return collectInitializingContainers(fields, groupPath).map(({ type, path }) => initializationComponentKey(type, path));
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
