import { declareExperimentalWebMcpTool, inject, Injector, untracked } from '@angular/core';
import { DynamicFormLogger, EventBus } from '@ng-forge/dynamic-forms/internal';
import { FormStateManager } from '../../state/form-state-manager';
import { FormSubmitEvent } from '../../events/constants/submit.event';
import { buildToolSchema } from './build-tool-schema';
import { collectFieldReports } from './collect-field-reports';
import { renderFormReport, renderSubmitResult, toErrorReports } from './format-report';

/** Text returned when the agent's arguments could not be applied at all. */
const NOT_READY = 'The form is not ready yet. Try again shortly.';

/**
 * Registers this form's WebMCP tools.
 *
 * Called once per form, from `web-mcp-gate.ts`, inside the form's injection
 * context. Lives in its own module so the dynamic `import()` in the gate has a
 * chunk boundary to split on — forms that never opt in do not load this code.
 *
 * Deliberately does not use `provideExperimentalWebMcpForms()`. That path
 * builds its schema by walking runtime values (which throws on the `null` and
 * empty-array defaults ng-forge produces) and submits with `submit(formTree)`,
 * which throws because ng-forge routes submission through its `EventBus`
 * instead of `FormOptions.submission`.
 *
 * @internal
 */
export function bootstrapWebMcp(): void {
  const stateManager = inject(FormStateManager);
  const eventBus = inject(EventBus);
  const logger = inject(DynamicFormLogger);
  const injector = inject(Injector);

  const options = untracked(() => stateManager.activeConfig()?.options?.webMcp);
  if (!options) return;

  const defaultMessages = untracked(() => stateManager.activeConfig()?.defaultValidationMessages);

  const setup = untracked(() => stateManager.formSetup());
  const fields = setup?.schemaFields ?? [];
  const registry = setup?.registry ?? new Map();

  // `JsonSchemaObject` mirrors the same subset as Angular's `JsonSchemaForInference`,
  // but the latter is a discriminated union over literal `type` values while the
  // builder assembles nodes with a widened `type`. The cast is safe because
  // `buildToolSchema` only ever emits members of that subset; it is confined to
  // this boundary so the builder stays ergonomic.
  const valuesSchema = buildToolSchema(fields, registry, (message) => logger.warn(message)) as never;

  // Both tools echo form values back to the agent. Those values are user content
  // and can carry injected instructions, so they are flagged untrusted per
  // https://developer.chrome.com/docs/agents/security. `annotations` is not in
  // Angular's `ToolDescriptor` type yet, but `declareExperimentalWebMcpTool`
  // spreads the descriptor straight into `registerTool`, so it reaches the agent.
  const annotations = { untrustedContentHint: true };

  declareExperimentalWebMcpTool(
    {
      name: `fill_${options.name}`,
      description:
        `Fill the "${options.name}" form: ${options.description} ` +
        `Accepts any subset of fields and leaves the rest untouched. Does not submit. ` +
        `Returns the form's current values, which fields currently apply, and any validation errors. ` +
        `Call with no fields to read the form's current state without changing it.`,
      inputSchema: valuesSchema,
      annotations,
      execute: (args: Record<string, unknown>) => fill(args),
    } as never,
    injector,
  );

  // Submission is opt-in per form. Guidance is to avoid agent-triggered submits
  // for consequential actions unless the app has asked for it, and the platform's
  // own declarative forms API takes the same posture (manual submit by default,
  // `toolautosubmit` to opt in). Without this flag the agent can stage values and
  // a human presses the button.
  if (!options.allowSubmit) return;

  declareExperimentalWebMcpTool(
    {
      name: `submit_${options.name}`,
      description:
        `Submit the "${options.name}" form: ${options.description} ` +
        `Applies any fields given, then submits. If validation fails nothing is submitted and the errors are returned; ` +
        `the values still remain in the form for correction.`,
      inputSchema: valuesSchema,
      annotations,
      execute: (args: Record<string, unknown>) => submitForm(args),
    } as never,
    injector,
  );

  /**
   * Applies a partial patch to the live form and reports the result.
   *
   * Writing to the live form rather than a copy is deliberate: conditional logic
   * and cross-field validators resolve through an evaluation context bound to the
   * root registry, so only the live form can evaluate them correctly. It is also
   * what the user should see — an agent filling a form on their behalf is visible
   * work, not a side effect to hide.
   */
  async function fill(values: Record<string, unknown>): Promise<string> {
    const tree = untracked(() => stateManager.form());
    if (!tree) return NOT_READY;

    const changed = applyValues(values);
    if (changed) await settle();

    const walk = untracked(() => collectFieldReports(fields, tree));

    return renderFormReport({
      values: untracked(() => stateManager.formValue()),
      fields: walk.reports,
      errors: toErrorReports(
        untracked(() => tree().errorSummary()),
        walk.paths,
        walk.messages,
        defaultMessages,
      ),
      changed,
    });
  }

  /** Applies values, then submits through the form's normal submission path. */
  async function submitForm(values: Record<string, unknown>): Promise<string> {
    const tree = untracked(() => stateManager.form());
    if (!tree) return NOT_READY;

    const changed = applyValues(values);
    if (changed) await settle();

    const walk = untracked(() => collectFieldReports(fields, tree));
    const errors = toErrorReports(
      untracked(() => tree().errorSummary()),
      walk.paths,
      walk.messages,
      defaultMessages,
    );

    if (errors.length) return renderSubmitResult(errors, changed);

    eventBus.dispatch(new FormSubmitEvent());

    return renderSubmitResult([], changed);
  }

  /**
   * Merges a patch into the form model. Returns whether anything was written, so
   * a failure can tell the agent whether form state changed (guidance is that an
   * error should say so rather than leaving the agent to guess).
   */
  function applyValues(values: Record<string, unknown>): boolean {
    if (!values || Object.keys(values).length === 0) return false;

    stateManager.entity.update((current) => ({ ...(current as Record<string, unknown>), ...values }) as never);
    return true;
  }
}

/** Yields once so validators see the new values before state is read back. */
function settle(): Promise<void> {
  return Promise.resolve();
}
