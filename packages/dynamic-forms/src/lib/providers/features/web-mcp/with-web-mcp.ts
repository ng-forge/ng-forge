import { createFeature, DynamicFormFeature } from '../dynamic-form-feature';
import { WEB_MCP_ENABLED } from './web-mcp.token';

/**
 * Enables WebMCP tool registration for forms that declare `options.webMcp`.
 *
 * @remarks
 * WebMCP lets an AI agent running in the browser discover and drive a form
 * through structured tools rather than by simulating clicks. Each opted-in form
 * registers `fill_{name}`, which applies a partial patch of values to the form
 * and reports back its current state and validation errors. Submission is a
 * separate, per-form opt-in (`options.webMcp.allowSubmit`); without it the agent
 * stages values and a human presses the button.
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
 * @returns A DynamicFormFeature enabling WebMCP registration.
 *
 * @example
 * ```typescript
 * provideDynamicForm(...withMaterialFields(), withWebMcp());
 *
 * const config: FormConfig = {
 *   options: { webMcp: { name: 'signup', description: 'Sign a new user up.' } },
 *   fields: [...],
 * };
 * ```
 */
export function withWebMcp(): DynamicFormFeature<'web-mcp'> {
  return createFeature('web-mcp', [{ provide: WEB_MCP_ENABLED, useValue: true }]);
}
