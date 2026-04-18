import { ComponentRef, computed, DestroyRef, EnvironmentInjector, inject, Injector, Signal, ViewContainerRef } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { of, switchMap } from 'rxjs';
import { WRAPPER_COMPONENT_CACHE, WRAPPER_REGISTRY, WrapperConfig } from '../../models/wrapper-type';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { WrapperFieldInputs } from '../../wrappers/wrapper-field-inputs';
import { isSameWrapperChain } from '../resolve-wrappers/resolve-wrappers';
import { LoadedWrapper, loadWrapperComponents, renderWrapperChain, setInputIfDeclared } from './wrapper-chain';

export interface WrapperChainControllerOptions {
  /**
   * The outer slot where the wrapper chain is mounted. Accepts a direct VCR
   * (e.g. `inject(ViewContainerRef)` in a directive) or a viewChild signal
   * (resolved on first emission, after view init).
   */
  readonly vcr: ViewContainerRef | Signal<ViewContainerRef>;
  /** Signal of the wrapper chain — ref-stable memoization (e.g. `isSameWrapperChain`) recommended. */
  readonly wrappers: Signal<readonly WrapperConfig[]>;
  /**
   * Optional gating signal. When `false`, the chain is torn down and nothing is rendered
   * until it flips back to `true`. Used by `DfFieldOutlet` to defer rendering until
   * `renderReady`. Containers omit the gate — they always render their children template.
   */
  readonly gate?: Signal<boolean>;
  /**
   * Either a concrete injector or a lazy getter — the getter form lets callers
   * resolve the injector from a required input (which cannot be read in the
   * constructor) at render time instead.
   */
  readonly environmentInjector: EnvironmentInjector | (() => EnvironmentInjector);
  readonly parentInjector: Injector | (() => Injector);
  /**
   * Optional mapper-outputs signal. When present, the controller pushes it to each
   * wrapper's `fieldInputs` input at render time AND on every subsequent change —
   * containers render a children template, not a field, so they don't need this.
   */
  readonly fieldInputs?: Signal<WrapperFieldInputs | undefined>;
  /**
   * Optional extra rebuild trigger. Read on every emission and compared by identity.
   * DfFieldOutlet passes the innermost component class so that a reconciled field
   * with the same wrapper chain but a different `component` forces a rebuild of
   * the innermost slot. Omit for callers where the innermost is stable.
   */
  readonly rebuildKey?: Signal<unknown>;
  /**
   * Renders whatever belongs at the innermost slot (a field component, a children
   * template, …). Called each time the chain rebuilds.
   */
  readonly renderInnermost: (slot: ViewContainerRef) => void;
}

/**
 * Owns the wrapper-chain lifecycle for a field or container.
 *
 * Wires together:
 * - Async lazy-loading of registered wrapper components (sync fast-path when all
 *   are cached)
 * - Cancellation of stale in-flight loads via `switchMap` — replaces the hand-rolled
 *   `rebuildVersion` counter that both `DfFieldOutlet` and `ContainerFieldComponent`
 *   previously maintained
 * - Push-through of `fieldInputs` to already-mounted wrappers without rebuilding the
 *   chain
 * - Teardown on destroy via `takeUntilDestroyed` + `onDestroy` on the VCR
 *
 * Must be called from a DI injection context (component/directive constructor).
 * Has no return — the controller lives for the lifetime of the owning injection
 * context, controlled by its `DestroyRef`.
 */
export function createWrapperChainController(opts: WrapperChainControllerOptions): void {
  const registry = inject(WRAPPER_REGISTRY);
  const cache = inject(WRAPPER_COMPONENT_CACHE);
  const logger = inject(DynamicFormLogger);
  const destroyRef = inject(DestroyRef);

  let refs: ComponentRef<unknown>[] = [];
  const resolveVcr = (): ViewContainerRef => (typeof opts.vcr === 'function' ? opts.vcr() : opts.vcr);
  const resolveEnvInjector = (): EnvironmentInjector =>
    typeof opts.environmentInjector === 'function' ? opts.environmentInjector() : opts.environmentInjector;
  const resolveParentInjector = (): Injector => (typeof opts.parentInjector === 'function' ? opts.parentInjector() : opts.parentInjector);

  // Bundle everything that triggers a rebuild into a single signal so toObservable
  // re-emits whenever ANY of them changes — gate flipping, wrapper chain shape
  // changing, or (optionally) the innermost component identity changing. Custom
  // equality keeps the signal ref-stable when nothing actually changed so
  // reconciled fields with an identical chain don't thrash the DOM.
  const chainKey = computed(
    () => ({
      open: opts.gate?.() ?? true,
      wrappers: opts.wrappers(),
      rebuildKey: opts.rebuildKey?.(),
    }),
    {
      equal: (a, b) => a.open === b.open && a.rebuildKey === b.rebuildKey && isSameWrapperChain(a.wrappers, b.wrappers),
    },
  );

  toObservable(chainKey)
    .pipe(
      switchMap(({ open, wrappers }) => {
        if (!open) return of<readonly LoadedWrapper[] | null>(null);
        if (wrappers.every((w) => cache.has(w.type))) {
          // Sync fast-path — every wrapper already resolved. Avoid the microtask hop.
          return of(wrappers.map((config) => ({ config, component: cache.get(config.type)! }) satisfies LoadedWrapper));
        }
        return loadWrapperComponents(wrappers, registry, cache, logger);
      }),
      takeUntilDestroyed(destroyRef),
    )
    .subscribe((loaded) => {
      const vcr = resolveVcr();
      // Clear the previous chain — Angular cascades destroy through every nested
      // ComponentRef, so walking `refs` manually would be redundant work.
      vcr.clear();
      refs = [];
      if (loaded === null) return;
      refs = renderWrapperChain({
        outerContainer: vcr,
        loadedWrappers: loaded,
        environmentInjector: resolveEnvInjector(),
        parentInjector: resolveParentInjector(),
        logger,
        fieldInputs: opts.fieldInputs?.(),
        renderInnermost: opts.renderInnermost,
      });
    });

  // When fieldInputs changes but the chain hasn't rebuilt, push the new bag to each
  // already-mounted wrapper. If the chain is empty (gated off, or none rendered yet)
  // the loop is a no-op.
  if (opts.fieldInputs) {
    explicitEffect([opts.fieldInputs], ([fi]) => {
      for (const ref of refs) setInputIfDeclared(ref, 'fieldInputs', fi);
    });
  }

  destroyRef.onDestroy(() => resolveVcr().clear());
}
