import { createFeature, DynamicFormFeature } from '../dynamic-form-feature';
import { WEB_MCP_ENABLED } from './web-mcp.token';

/**
 * Enables WebMCP tool registration for forms that declare `options.webMcp`.
 *
 * @experimental
 *
 * @remarks
 * WebMCP lets an AI agent running in the browser discover and drive a form
 * through structured tools rather than by simulating clicks. Each opted-in form
 * registers `fill_{name}`, which applies a partial patch of values to the form
 * and reports back what it set, which fields apply, which are still empty, and
 * any validation errors. Submission is a separate, per-form opt-in
 * (`options.webMcp.allowSubmit`); without it the agent stages values and a human
 * presses the button.
 *
 * The tool schema is generated from the form config, so agents see labels,
 * option enums with their human titles, and static validator constraints rather
 * than the bare types value-shape inference would produce. Agent arguments are
 * validated in code before anything is written, and a call that does not parse
 * is rejected whole rather than half-applied.
 *
 * Nothing is registered unless a form opts in, and the registrar module is
 * dynamically imported, so a form without `options.webMcp` never loads it — the
 * feature itself, the token and the form-scoped hook that decides are part of
 * the main bundle. Registration is browser-only and no-ops where the page
 * exposes no model context.
 *
 * Named `experimental` on purpose: WebMCP is a proposed standard, in an origin
 * trial as of Chrome 149, and the browser surface underneath this may still
 * change. Expect breaking changes outside a major version.
 *
 * @returns A DynamicFormFeature enabling WebMCP registration.
 *
 * @example
 * ```typescript
 * provideDynamicForm(...withMaterialFields(), withExperimentalWebMcp());
 *
 * const config = {
 *   options: { webMcp: { name: 'signup', description: 'Sign a new user up.' } },
 *   fields: [...],
 * } as const satisfies FormConfig;
 * ```
 */
export function withExperimentalWebMcp(): DynamicFormFeature<'web-mcp'> {
  return createFeature('web-mcp', [{ provide: WEB_MCP_ENABLED, useValue: true }]);
}
