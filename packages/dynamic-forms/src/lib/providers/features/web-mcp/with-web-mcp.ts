import { createFeature, DynamicFormFeature } from '../dynamic-form-feature';
import { WEB_MCP_ENABLED, WEB_MCP_SETTINGS } from './web-mcp.token';

/** Options accepted by {@link withWebMcp}. */
export interface WebMcpFeatureOptions {
  /**
   * Allow a form's `inspect` dry run to run async and HTTP validators.
   *
   * Leave off unless you know every async validator on your forms is safe to
   * call speculatively. An agent may call `inspect` repeatedly while it works
   * out what to submit, and each call would hit those endpoints.
   *
   * @default false
   */
  allowAsyncValidation?: boolean;
}

/**
 * Enables WebMCP tool registration for forms that declare `options.webMcp`.
 *
 * @remarks
 * WebMCP lets an AI agent running in the browser discover and drive a form
 * through structured tools rather than by simulating clicks. Each opted-in form
 * registers two tools: `{name}_inspect` (read current state, or dry-run values
 * and get validation feedback) and `{name}_submit` (fill and submit through the
 * form's normal submission path).
 *
 * The tool schema is generated from the form config, so agents see labels,
 * option enums, and static validator constraints rather than the bare types
 * value-shape inference would produce.
 *
 * Nothing is registered unless a form opts in, and the registrar module is
 * dynamically imported, so forms without `options.webMcp` pay no bundle cost.
 * Registration is browser-only and no-ops when no agent is connected.
 *
 * Experimental: WebMCP is an emerging standard and the underlying Angular APIs
 * are experimental, so this may change outside a major version.
 *
 * @param options - Feature options. See {@link WebMcpFeatureOptions}.
 * @returns A DynamicFormFeature enabling WebMCP registration.
 *
 * @example
 * ```typescript
 * provideDynamicForm(...withMaterialFields(), withWebMcp());
 *
 * const config: FormConfig = {
 *   options: { webMcp: { name: 'create-invoice', description: 'Fill and submit the invoice form.' } },
 *   fields: [...],
 * };
 * ```
 */
export function withWebMcp(options: WebMcpFeatureOptions = {}): DynamicFormFeature<'web-mcp'> {
  return createFeature('web-mcp', [
    { provide: WEB_MCP_ENABLED, useValue: true },
    { provide: WEB_MCP_SETTINGS, useValue: { allowAsyncValidation: options.allowAsyncValidation ?? false } },
  ]);
}
