import { computed, inject, Injector, InjectionToken, runInInjectionContext, signal, Signal } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { FieldDef } from '@ng-forge/dynamic-forms/internal';
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
 * Must be created within the form's injection context (it captures the form
 * `Injector` for the deferred `runInInjectionContext`).
 *
 * @internal
 */
export function createDerivationRenderGate(): Signal<boolean> {
  const stateManager = inject(FormStateManager);
  const injector = inject(Injector);

  const hasDerivations = computed(() => {
    const setup = stateManager.formSetup();
    return !!setup && configHasDerivations(setup.schemaFields as FieldDef<unknown>[]);
  });

  // Single source of truth for the lazy engine's lifecycle. `idle` until a config
  // first needs it; `loading` once the import is in flight (guards against a
  // second orchestrator if derivations swap out and back in); `wired` once the
  // orchestrator is constructed.
  const engine = signal<'idle' | 'loading' | 'wired'>('idle');

  explicitEffect([hasDerivations], ([has]) => {
    if (!has || engine() !== 'idle') return;
    engine.set('loading');
    void import('./bootstrap-derivation-orchestrator').then(({ bootstrapDerivationOrchestrator }) => {
      runInInjectionContext(injector, () => bootstrapDerivationOrchestrator());
      engine.set('wired');
    });
  });

  // Open unless a derivation-bearing config is still waiting for its engine.
  return computed(() => !hasDerivations() || engine() === 'wired');
}
