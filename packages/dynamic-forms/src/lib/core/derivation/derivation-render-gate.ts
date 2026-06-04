import { computed, inject, Injector, InjectionToken, PendingTasks, runInInjectionContext, signal, Signal } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { DynamicFormLogger, FieldDef } from '@ng-forge/dynamic-forms/internal';
import { FormStateManager } from '../../state/form-state-manager';
import { configHasDerivations } from './config-has-derivations';

/**
 * Form-scoped signal that is `false` only while a derivation-bearing config is
 * still waiting for the lazily-loaded derivation engine to wire up. `DynamicForm`
 * ANDs this into `shouldRender`, so a form that uses derivations does not render
 * its fields until the orchestrator has loaded and registered its
 * value/property overrides — fields render already-derived, with no flash.
 *
 * For configs without derivations the gate is always `true` (no waiting, no
 * lazy load), and the heavy orchestrator module is never imported.
 *
 * @internal
 */
export const DERIVATION_RENDER_GATE = new InjectionToken<Signal<boolean>>('DERIVATION_RENDER_GATE');

/**
 * Factory for {@link DERIVATION_RENDER_GATE}. Watches the form setup and, the
 * first time it declares a derivation, dynamically imports the derivation engine
 * (the chunk boundary) and wires the orchestrator in the form's injection
 * context. Flips the gate open once that bootstrap has run.
 *
 * The lazy import runs inside an Angular `PendingTasks` task so server-side
 * rendering waits for the engine to wire before serializing — derivation-bearing
 * forms render server-side rather than as empty markup. If the chunk fails to
 * load the gate opens anyway (the form renders without derivations rather than
 * locking shut forever).
 *
 * Must be created within the form's injection context (it captures the form
 * `Injector` for the deferred `runInInjectionContext`).
 *
 * @internal
 */
export function createDerivationRenderGate(): Signal<boolean> {
  const stateManager = inject(FormStateManager);
  const injector = inject(Injector);
  const pendingTasks = inject(PendingTasks);
  const logger = inject(DynamicFormLogger);

  const hasDerivations = computed(() => {
    const setup = stateManager.formSetup();
    return !!setup && configHasDerivations(setup.schemaFields as FieldDef<unknown>[]);
  });

  // Single source of truth for the lazy engine's lifecycle. `idle` until a config
  // first needs it; `loading` once the import is in flight (guards against a
  // second orchestrator if derivations swap out and back in); `wired` once the
  // orchestrator is constructed; `failed` if the chunk could not be loaded.
  const engine = signal<'idle' | 'loading' | 'wired' | 'failed'>('idle');

  explicitEffect([hasDerivations], ([has]) => {
    if (!has || engine() !== 'idle') return;
    engine.set('loading');
    // Tracked as a pending task so SSR awaits the engine before serializing.
    pendingTasks.run(() =>
      import('./bootstrap-derivation-orchestrator')
        .then(({ bootstrapDerivationOrchestrator }) => {
          runInInjectionContext(injector, () => bootstrapDerivationOrchestrator());
          engine.set('wired');
        })
        .catch((error: unknown) => {
          // A failed chunk load must not lock the form shut — render it degraded
          // (derivations won't apply) and surface the failure.
          engine.set('failed');
          logger.error('[Dynamic Forms] Failed to load the derivation engine; derivations will not apply.', error);
        }),
    );
  });

  // Open when there are no derivations, once the engine is wired, or if it failed
  // to load (degraded render beats a permanently closed gate).
  return computed(() => {
    if (!hasDerivations()) return true;
    const state = engine();
    return state === 'wired' || state === 'failed';
  });
}
