import { InjectionToken } from '@angular/core';

/**
 * Multi-provider token. Each entry is resolved at form bootstrap purely for its
 * construction side effect — useful for orchestrators that need to wire reactive
 * streams before first render but don't need to be referenced at use-sites.
 *
 * Feature providers register their orchestrators here via `useExisting`, so the
 * DynamicForm component never has to know which orchestrators exist. Without a
 * feature provider, FORM_INITIALIZER is empty (no static reference to that
 * feature's orchestrator class).
 *
 * @internal
 */
export const FORM_INITIALIZER = new InjectionToken<readonly unknown[]>('FORM_INITIALIZER');
