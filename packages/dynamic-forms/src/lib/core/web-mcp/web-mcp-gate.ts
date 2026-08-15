import { computed, inject, Injector, InjectionToken, PLATFORM_ID, runInInjectionContext, signal, Signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { DynamicFormLogger } from '@ng-forge/dynamic-forms/internal';
import { FormStateManager } from '../../state/form-state-manager';
import { WEB_MCP_ENABLED } from '../../providers/features/web-mcp/web-mcp.token';

/**
 * Form-scoped hook that lazy-loads and wires the WebMCP registrar the first
 * time a config declares `options.webMcp`.
 *
 * Deliberately NOT a render gate. Unlike the derivation engine, nothing about
 * a form's rendered output depends on whether an agent can see it, so this must
 * never hold `shouldRender` closed and must never register a `PendingTasks`
 * task (which would make SSR wait on a browser-only concern).
 *
 * @internal
 */
export const WEB_MCP_GATE = new InjectionToken<Signal<boolean>>('WEB_MCP_GATE');

/**
 * Factory for {@link WEB_MCP_GATE}. Returns a signal reporting whether the
 * registrar is wired — useful for tests and diagnostics; the real work is the
 * lazy import it performs as a side effect.
 *
 * Must be created within the form's injection context (it captures the form
 * `Injector` for the deferred `runInInjectionContext`).
 *
 * @internal
 */
export function createWebMcpGate(): Signal<boolean> {
  const enabled = inject(WEB_MCP_ENABLED);
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  const stateManager = inject(FormStateManager);
  const injector = inject(Injector);
  const logger = inject(DynamicFormLogger);

  // Registration touches `navigator.modelContext`, so it is browser-only. Bail
  // before touching the config so SSR never even evaluates the predicate.
  if (!enabled || !isBrowser) return computed(() => false);

  const toolOptions = computed(() => stateManager.activeConfig()?.options?.webMcp);

  const registrar = signal<'idle' | 'loading' | 'wired' | 'failed'>('idle');

  explicitEffect([toolOptions], ([options]) => {
    if (!options || registrar() !== 'idle') return;

    registrar.set('loading');
    void import('./bootstrap-web-mcp')
      .then(({ bootstrapWebMcp }) => {
        runInInjectionContext(injector, () => bootstrapWebMcp());
        registrar.set('wired');
      })
      .catch((error: unknown) => {
        // A failed chunk load must not break the form — it just stays invisible
        // to agents.
        registrar.set('failed');
        logger.error('[Dynamic Forms] Failed to load the WebMCP registrar; this form will not be exposed to agents.', error);
      });
  });

  return computed(() => registrar() === 'wired');
}
