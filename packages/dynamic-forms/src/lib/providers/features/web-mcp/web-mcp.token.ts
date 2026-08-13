import { InjectionToken } from '@angular/core';

/** Global WebMCP settings, set by `withWebMcp()`. */
export interface WebMcpSettings {
  /**
   * Whether a form's `inspect` dry run may run async and HTTP validators.
   *
   * Off by default: a dry run is speculative, and an agent probing a form must
   * not fire real requests at a uniqueness-check or availability endpoint. When
   * off, `inspect` reports sync validation only and tells the agent that
   * server-side checks run on submit.
   */
  allowAsyncValidation: boolean;
}

/**
 * Whether WebMCP tool registration is enabled at all. Absent (`false`) unless
 * `withWebMcp()` is provided, which is what keeps the registrar chunk out of
 * builds that never opt in.
 *
 * @internal
 */
export const WEB_MCP_ENABLED = new InjectionToken<boolean>('WEB_MCP_ENABLED', {
  providedIn: 'root',
  factory: () => false,
});

/** @internal */
export const WEB_MCP_SETTINGS = new InjectionToken<WebMcpSettings>('WEB_MCP_SETTINGS', {
  providedIn: 'root',
  factory: () => ({ allowAsyncValidation: false }),
});
