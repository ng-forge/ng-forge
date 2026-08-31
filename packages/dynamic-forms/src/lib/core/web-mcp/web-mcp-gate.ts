import { computed, DestroyRef, inject, InjectionToken, Injector, PLATFORM_ID, runInInjectionContext, signal, Signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { DynamicFormLogger, WebMcpToolOptions } from '@ng-forge/dynamic-forms/internal';
import { FormStateManager } from '../../state/form-state-manager';
import { WEB_MCP_ENABLED } from '../../providers/features/web-mcp/web-mcp.token';

/**
 * What the WebMCP layer is currently doing for this form. Reported by
 * `DynamicForm.webMcpStatus()`; `'active'` is the only state in which an agent
 * can see the form.
 *
 * @experimental
 */
export type WebMcpStatus =
  /** `withExperimentalWebMcp()` is not provided, or this is the server. */
  | 'disabled'
  /** Enabled, but the current config does not declare `options.webMcp`. */
  | 'idle'
  /** Loading the registrar or awaiting `registerTool()`. */
  | 'registering'
  /** Tools are registered against the browser's model context. */
  | 'active'
  /** The browser exposes no model context, so there is nothing to register against. */
  | 'unsupported'
  /** Registration was attempted and rejected. See the console for the reason. */
  | 'failed';

/**
 * Form-scoped hook that keeps this form's WebMCP tools in step with its config.
 *
 * Deliberately NOT a render gate. Unlike the derivation engine, nothing about a
 * form's rendered output depends on whether an agent can see it, so this must
 * never hold `shouldRender` closed and must never register a `PendingTasks` task
 * (which would make SSR wait on a browser-only concern).
 *
 * @internal
 */
export const WEB_MCP_GATE = new InjectionToken<Signal<WebMcpStatus>>('WEB_MCP_GATE');

/**
 * Factory for {@link WEB_MCP_GATE}.
 *
 * Registration follows the *effective* form options, not the first config that
 * happened to declare them. A registration that only ever ran once outlives what
 * it describes: swap the config and `fill_first` keeps writing into a form whose
 * fields it no longer matches; turn `allowSubmit` off and `submit_first` stays
 * callable, which quietly leaves an agent holding submission authority the app
 * has just revoked. So every change to the options opens a new epoch: the
 * previous epoch's `AbortController` is aborted first, which unregisters its
 * tools, and only then are the new ones registered.
 *
 * Chrome's guidance is the same — register a tool only while it is useful in the
 * current page state.
 *
 * @see https://developer.chrome.com/docs/ai/webmcp/best-practices
 *
 * Must be created within the form's injection context (it captures the form
 * `Injector` for the deferred `runInInjectionContext`).
 *
 * @internal
 */
export function createWebMcpGate(): Signal<WebMcpStatus> {
  const enabled = inject(WEB_MCP_ENABLED);
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  const stateManager = inject(FormStateManager);
  const injector = inject(Injector);
  const destroyRef = inject(DestroyRef);
  const logger = inject(DynamicFormLogger);

  // Registration touches the browser's model context, so it is browser-only.
  // Bail before touching the config so SSR never even evaluates the predicate.
  if (!enabled || !isBrowser) return computed(() => 'disabled');

  /**
   * What a registration epoch is built from.
   *
   * The options come from the *effective* form options. `webMcp` is part of the
   * public `FormOptions`, so `[formOptions]` on the component is a legitimate
   * place to set it; reading `activeConfig().options` alone made that override
   * silently do nothing.
   *
   * `formSetup` is in here too, because a config swap that keeps the same tool
   * name and description still changes the form the tools describe. Without it,
   * the second config would be driven through the first one's schema.
   */
  const registration = computed(() => {
    const options = stateManager.effectiveFormOptions().webMcp;
    return options ? { options: options as WebMcpToolOptions, setup: stateManager.formSetup() } : undefined;
  });

  const status = signal<WebMcpStatus>('idle');

  /** Aborting this revokes the current epoch's tools. */
  let epoch: AbortController | undefined;
  /** Guards the lazy import: a resolution from a superseded epoch is discarded. */
  let epochId = 0;

  const closeEpoch = (): void => {
    epoch?.abort();
    epoch = undefined;
  };

  destroyRef.onDestroy(closeEpoch);

  explicitEffect([registration], ([input]) => {
    // Every change closes the previous epoch first: aborting its controller
    // unregisters the tools it owns, so nothing from the old config outlives it.
    closeEpoch();
    epochId += 1;
    const thisEpoch = epochId;

    if (!input) {
      status.set('idle');
      return;
    }

    const controller = new AbortController();
    epoch = controller;
    status.set('registering');

    void import('./bootstrap-web-mcp')
      .then(({ bootstrapWebMcp }) => {
        // The config may have changed again while the chunk was in flight.
        if (thisEpoch !== epochId || controller.signal.aborted) return;

        return runInInjectionContext(injector, () => bootstrapWebMcp(input.options, controller.signal));
      })
      .then((result) => {
        if (thisEpoch !== epochId || controller.signal.aborted) return;
        if (result) status.set(result);
      })
      .catch((error: unknown) => {
        if (thisEpoch !== epochId) return;
        // A failed chunk load must not break the form — it just stays invisible
        // to agents.
        status.set('failed');
        logger.error('[Dynamic Forms] Failed to load the WebMCP registrar; this form will not be exposed to agents.', error);
      });
  });

  return status.asReadonly();
}
