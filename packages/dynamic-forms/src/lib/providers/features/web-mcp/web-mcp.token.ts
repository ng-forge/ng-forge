import { InjectionToken } from '@angular/core';

/**
 * Whether WebMCP tool registration is enabled at all. Absent (`false`) unless
 * `withExperimentalWebMcp()` is provided, which is what keeps the registrar chunk out of
 * builds that never opt in.
 *
 * @internal
 */
export const WEB_MCP_ENABLED = new InjectionToken<boolean>('WEB_MCP_ENABLED', {
  providedIn: 'root',
  factory: () => false,
});
