import { declareExperimentalWebMcpTool, inject, Injector, signal, untracked } from '@angular/core';
import { FieldTree, form } from '@angular/forms/signals';
import { DynamicFormLogger, EventBus } from '@ng-forge/dynamic-forms/internal';
import { FormStateManager } from '../../state/form-state-manager';
import { WEB_MCP_SETTINGS } from '../../providers/features/web-mcp/web-mcp.token';
import { FormSubmitEvent } from '../../events/constants/submit.event';
import { buildToolSchema } from './build-tool-schema';
import { collectFieldReports } from './collect-field-reports';
import { renderInspectReport, renderSubmitResult, toErrorReports } from './format-report';

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
  const settings = inject(WEB_MCP_SETTINGS);
  const eventBus = inject(EventBus);
  const logger = inject(DynamicFormLogger);
  const injector = inject(Injector);

  const options = untracked(() => stateManager.activeConfig()?.options?.webMcp);
  if (!options) return;

  const setup = untracked(() => stateManager.formSetup());
  const fields = setup?.schemaFields ?? [];
  const registry = setup?.registry ?? new Map();

  // `JsonSchemaObject` mirrors the same subset as Angular's `JsonSchemaForInference`,
  // but the latter is a discriminated union over literal `type` values while the
  // builder assembles nodes with a widened `type`. The cast is safe because
  // `buildToolSchema` only ever emits members of that subset; it is confined to
  // this boundary so the builder stays ergonomic.
  const inputSchema = buildToolSchema(fields, registry, (message) => logger.warn(message)) as never;

  declareExperimentalWebMcpTool(
    {
      name: `${options.name}_inspect`,
      description:
        `Inspect the "${options.name}" form: ${options.description} ` +
        `Call with no arguments to read current values, which fields currently apply, and any validation errors. ` +
        `Call with "values" to check proposed values without submitting or modifying the form.`,
      inputSchema: {
        type: 'object',
        properties: { values: inputSchema },
        required: [],
        additionalProperties: false,
      },
      execute: (args) => inspect(args?.values),
    },
    injector,
  );

  declareExperimentalWebMcpTool(
    {
      name: `${options.name}_submit`,
      description:
        `Fill and submit the "${options.name}" form: ${options.description} ` +
        `Values are validated first; if validation fails nothing is submitted and the errors are returned. ` +
        `Use the inspect tool first if you are unsure which fields currently apply.`,
      inputSchema,
      execute: (args) => submitForm(args as Record<string, unknown>),
    },
    injector,
  );

  /** Reads live state, optionally dry-running proposed values first. */
  function inspect(values: unknown): string {
    const tree = untracked(() => stateManager.form());
    if (!tree) return NOT_READY;

    if (values === undefined || values === null) {
      const walk = untracked(() => collectFieldReports(fields, tree));
      return renderInspectReport({
        values: untracked(() => stateManager.formValue()),
        fields: walk.reports,
        errors: toErrorReports(
          untracked(() => tree().errorSummary()),
          walk.paths,
        ),
      });
    }

    return dryRun(tree, values as Record<string, unknown>);
  }

  /**
   * Validates proposed values on a throwaway form.
   *
   * Applying them to the live form and reverting would fire derivations, mark
   * fields dirty and flicker the UI, so this builds a separate form over the
   * same (already memoized) schema and discards it.
   *
   * Validation is evaluated on the shadow form, but *applicability* is read from
   * the live one. Conditional `hidden`/`disabled` logic resolves through the
   * form's evaluation context, which is bound to the live root registry, so a
   * shadow form's `hidden()` reflects the live values regardless of what was
   * proposed. Reporting live applicability is truthful; reporting the shadow's
   * would look proposal-aware while silently being the same live answer.
   */
  function dryRun(live: FieldTree<unknown>, values: Record<string, unknown>): string {
    const schema = untracked(() => stateManager.formSchema());
    const current = untracked(() => stateManager.formValue()) as Record<string, unknown>;
    const merged = { ...structuredClone(current), ...values };

    const model = signal(merged);
    const shadow = untracked(() => (schema ? form(model, schema, { injector }) : form(model, { injector })));

    const shadowWalk = untracked(() => collectFieldReports(fields, shadow));
    const errors = toErrorReports(
      untracked(() => shadow().errorSummary()),
      shadowWalk.paths,
    );

    const liveWalk = untracked(() => collectFieldReports(fields, live));

    return renderInspectReport({
      values: merged,
      fields: liveWalk.reports,
      errors,
      note: [
        'Which fields apply reflects the form as it stands now; sending values that change visibility may make other fields apply.',
        settings.allowAsyncValidation
          ? undefined
          : 'Only synchronous validation ran. Server-side checks (async and HTTP validators) run on submit.',
      ]
        .filter(Boolean)
        .join(' '),
    });
  }

  /** Applies values for real and submits through the form's normal path. */
  async function submitForm(values: Record<string, unknown>): Promise<string> {
    const tree = untracked(() => stateManager.form());
    if (!tree) return NOT_READY;

    stateManager.entity.update((current) => ({ ...(current as Record<string, unknown>), ...values }) as never);

    // Let the signal graph settle so validators see the new values before the
    // validity check below.
    await Promise.resolve();

    const walk = untracked(() => collectFieldReports(fields, tree));
    const errors = toErrorReports(
      untracked(() => tree().errorSummary()),
      walk.paths,
    );
    if (errors.length) return renderSubmitResult(errors);

    eventBus.dispatch(new FormSubmitEvent());

    return renderSubmitResult([]);
  }
}
