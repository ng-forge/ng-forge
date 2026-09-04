import { inject, untracked } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import { DynamicFormLogger, EventBus, WebMcpToolOptions } from '@ng-forge/dynamic-forms/internal';
import { FormStateManager } from '../../state/form-state-manager';
import { FormSubmitEvent } from '../../events/constants/submit.event';
import { createPendingSubmission, SubmissionOutcome } from '../../utils/submission-handler/submission-outcome';
import { buildToolSchema } from './build-tool-schema';
import { collectFieldReports, FieldWalk } from './collect-field-reports';
import { buildFieldPlan } from './field-plan';
import { FormReport, renderFormReport, renderRejection, renderSubmitResult, toErrorReports } from './format-report';
import { findModelContext, isOverNameBudget, registerTool, ToolDescriptor } from './model-context';
import { parseAgentInput } from './parse-agent-input';
import { mergePatch, pickPaths, redactValues } from './patch-values';
import type { WebMcpStatus } from './web-mcp-gate';

/** Text returned when the agent's arguments could not be applied at all. */
const NOT_READY = 'The form is not ready yet. Try again shortly.';

/**
 * How long to wait for async validators before reporting on a form anyway.
 *
 * A tool call has to answer eventually, and an agent left holding an open call
 * cannot do anything useful. On expiry the report says validation is still
 * running rather than claiming the form is clean.
 */
const SETTLE_TIMEOUT_MS = 5_000;

/** Gap between checks of the form's pending-validators signal. */
const SETTLE_POLL_MS = 10;

/**
 * Registers this form's WebMCP tools for one registration epoch.
 *
 * Called from `web-mcp-gate.ts` inside the form's injection context, once per
 * epoch — a fresh epoch on every change to the effective options or the field
 * setup. `signal` is that epoch's `AbortController`; aborting it unregisters
 * everything registered here, which is how a config swap or a revoked
 * `allowSubmit` actually takes effect.
 *
 * Lives in its own module so the dynamic `import()` in the gate has a chunk
 * boundary to split on — forms that never opt in do not load this code.
 *
 * Deliberately does not use `provideExperimentalWebMcpForms()`. That path builds
 * its schema by walking runtime values (which throws on the `null` and
 * empty-array defaults ng-forge produces) and submits with `submit(formTree)`,
 * which throws because ng-forge routes submission through its `EventBus` instead
 * of `FormOptions.submission`. It does not use `declareExperimentalWebMcpTool()`
 * either: that helper calls `registerTool()` without awaiting the promise, so a
 * duplicate name, an invalid name or a permissions failure all look like success.
 *
 * @returns The status the gate should report for this epoch.
 *
 * @internal
 */
export async function bootstrapWebMcp(options: WebMcpToolOptions, signal: AbortSignal): Promise<WebMcpStatus> {
  const stateManager = inject(FormStateManager);
  const eventBus = inject(EventBus);
  const logger = inject(DynamicFormLogger);

  const context = findModelContext();
  if (!context) {
    logger.debug('[Dynamic Forms] No WebMCP model context on this page; the form is not exposed to agents.');
    return 'unsupported';
  }

  const defaultMessages = untracked(() => stateManager.activeConfig()?.defaultValidationMessages);

  const setup = untracked(() => stateManager.formSetup());
  const plan = buildFieldPlan(setup?.schemaFields ?? [], setup?.registry ?? new Map(), (message) => logger.warn(message));
  const inputSchema = buildToolSchema(plan);

  const scope = options.readback === 'all' ? 'all' : 'changed';

  // Both tools echo form values back to the agent. Those values are user content
  // and can carry injected instructions, so they are flagged untrusted per
  // https://developer.chrome.com/docs/agents/security.
  const annotations = { untrustedContentHint: true };

  const descriptors: ToolDescriptor[] = [
    {
      name: `fill_${options.name}`,
      description:
        `Fill the "${options.name}" form: ${options.description} ` +
        `Accepts any subset of fields and leaves the rest untouched; a nested group is merged key by key, a list is replaced whole. ` +
        `Does not submit. Returns the values it set, which fields currently apply, which are still empty, and any validation errors. ` +
        `Call with no fields to see which apply, which are required and which are still empty, without changing anything.`,
      inputSchema,
      annotations,
      execute: (args) => fill(args),
    },
  ];

  // Submission is opt-in per form. Guidance is to avoid agent-triggered submits
  // for consequential actions unless the app has asked for it, and the platform's
  // own declarative forms API takes the same posture (manual submit by default,
  // `toolautosubmit` to opt in). Without this flag the agent can stage values and
  // a human presses the button.
  if (options.allowSubmit) {
    // Without a `submission.action` the page takes over at dispatch and the tool
    // cannot see what happened next. That is worth saying in the description
    // rather than only in the response: an agent that learns it after submitting
    // has already acted, and can only report the uncertainty after the fact.
    const reportsOutcome = untracked(() => stateManager.activeConfig()?.submission?.action) !== undefined;

    descriptors.push({
      name: `submit_${options.name}`,
      description:
        `Submit the "${options.name}" form: ${options.description} ` +
        `Applies any fields given, then submits and waits for the result. If validation fails nothing is submitted and the errors are ` +
        `returned; the values still remain in the form for correction. ` +
        (reportsOutcome
          ? `Reports whether the submission succeeded, was rejected by the server, or failed.`
          : `This page handles submission itself, so a successful call confirms the form was submitted but cannot report what came of it.`),
      inputSchema,
      annotations,
      execute: (args) => submitForm(args),
    });
  }

  const failures: string[] = [];

  for (const descriptor of descriptors) {
    if (isOverNameBudget(descriptor.name)) {
      logger.warn(
        `[Dynamic Forms] WebMCP tool name "${descriptor.name}" is longer than the ~30 characters agents can comfortably scan. ` +
          `A shorter \`webMcp.name\` reads better in a tool list.`,
      );
    }

    const result = await registerTool(context, descriptor, signal);
    if (!result.ok) failures.push(`${descriptor.name}: ${result.reason}`);
  }

  if (signal.aborted) return 'idle';

  if (failures.length) {
    logger.error(`[Dynamic Forms] WebMCP tool registration failed. ${failures.join(' ')}`);
    return 'failed';
  }

  return 'active';

  /**
   * Applies a validated patch to the live form and reports the result.
   *
   * Writing to the live form rather than a copy is deliberate: conditional logic
   * and cross-field validators resolve through an evaluation context bound to the
   * root registry, so only the live form can evaluate them correctly. It is also
   * what the user should see — an agent filling a form on their behalf is visible
   * work, not a side effect to hide.
   */
  async function fill(args: Record<string, unknown>): Promise<string> {
    const tree = untracked(() => stateManager.form());
    if (!tree) return NOT_READY;

    const applied = await apply(args, tree);
    if ('rejection' in applied) return applied.rejection;

    return renderFormReport(applied.report);
  }

  /**
   * Applies values, then submits through the form's normal submission path and
   * waits for it to finish.
   *
   * The wait is the point. `EventBus.dispatch` returns the instant the event is
   * on the bus, long before an HTTP action resolves, so returning there reported
   * success for submissions that were about to fail, be skipped, or be dropped.
   */
  async function submitForm(args: Record<string, unknown>): Promise<string> {
    const tree = untracked(() => stateManager.form());
    if (!tree) return NOT_READY;

    const applied = await apply(args, tree);
    if ('rejection' in applied) return applied.rejection;

    const report = applied.report;
    if (report.errors.length || report.validationPending) {
      return renderSubmitResult({ status: report.validationPending ? 'pending-validation' : 'validation-failed' }, report);
    }

    const outcome = await dispatchSubmit();

    // Re-read after the submission settled. Server errors are applied to the
    // fields by `submit()` once the action resolves, so the report taken before
    // dispatch would name the failure without saying what it was.
    return renderSubmitResult(outcome, reportNow(tree, report.changed));
  }

  /** Rebuilds the report from the form's current state. */
  function reportNow(tree: FieldTree<unknown>, changed: readonly string[]): FormReport {
    const walk = untracked(() => collectFieldReports(plan, tree));
    return buildReport(
      tree,
      walk,
      changed,
      untracked(() => tree().pending()),
    );
  }

  /** Dispatches a submit and resolves with what the pipeline actually did. */
  async function dispatchSubmit(): Promise<SubmissionOutcome> {
    const pending = createPendingSubmission();

    eventBus.dispatch(new FormSubmitEvent(pending.reply));

    // The bus is synchronous, so a reply still unclaimed here was dropped by the
    // pipeline's `exhaustMap` rather than merely not finished — the one way to
    // tell "already submitting" apart from "still running".
    if (!pending.accepted()) return { status: 'busy' };

    return pending.outcome;
  }

  /**
   * Validates, applies and reports in one place, since `fill` and `submit` need
   * exactly the same thing before they diverge.
   */
  async function apply(args: Record<string, unknown>, tree: FieldTree<unknown>): Promise<{ rejection: string } | { report: FormReport }> {
    // Live state first: a field the form has disabled or made readonly right now
    // is not writable, whatever the config said when the schema was built.
    const before = untracked(() => collectFieldReports(plan, tree));
    const parsed = parseAgentInput(plan, args, (path) => liveBlock(before, path));

    if (!parsed.ok) return { rejection: renderRejection(parsed.errors) };

    const changed = parsed.paths;
    if (changed.length) {
      stateManager.entity.update((current) => mergePatch((current ?? {}) as Record<string, unknown>, parsed.patch, plan) as never);
    }

    const validationPending = changed.length ? await settle(tree) : untracked(() => tree().pending());
    const walk = untracked(() => collectFieldReports(plan, tree));

    return { report: buildReport(tree, walk, changed, validationPending) };
  }

  function buildReport(tree: FieldTree<unknown>, walk: FieldWalk, changed: readonly string[], validationPending: boolean): FormReport {
    const readable = redactValues(
      untracked(() => stateManager.formValue()),
      plan,
    );

    return {
      values: scope === 'all' ? readable : pickPaths(readable, changed),
      fields: walk.reports,
      errors: toErrorReports(
        untracked(() => tree().errorSummary()),
        walk.paths,
        walk.messages,
        defaultMessages,
      ),
      changed,
      validationPending,
      scope,
    };
  }

  /** Reports why a path cannot be written right now, per the form's live state. */
  function liveBlock(walk: FieldWalk, path: string): string | undefined {
    const state = walk.state.get(path);
    if (state?.disabled) return 'the form has disabled it';
    if (state?.readonly) return 'the form has made it read-only';
    return undefined;
  }

  /**
   * Waits for the form to finish reacting to what was just written.
   *
   * One resolved microtask was never a settled boundary: derivations run through
   * effects, and an async validator is by definition not done in the same tick.
   * This yields to the macrotask queue so Angular can flush, then watches the
   * form's own `pending()` signal until validators resolve.
   *
   * @returns Whether validation was *still* pending when the wait gave up.
   */
  async function settle(tree: FieldTree<unknown>): Promise<boolean> {
    const deadline = Date.now() + SETTLE_TIMEOUT_MS;

    await nextTask();

    while (untracked(() => tree().pending())) {
      if (Date.now() >= deadline || signal.aborted) return true;
      await nextTask(SETTLE_POLL_MS);
    }

    return false;
  }
}

function nextTask(delayMs = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}
