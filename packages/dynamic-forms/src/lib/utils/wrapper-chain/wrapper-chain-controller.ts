import {
  ComponentRef,
  computed,
  DestroyRef,
  EnvironmentInjector,
  inject,
  Injector,
  Signal,
  ViewContainerRef,
  ViewRef,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { map, Observable, of, switchMap } from 'rxjs';
import { WRAPPER_COMPONENT_CACHE, WRAPPER_REGISTRY, WrapperConfig, WrapperTypeDefinition } from '@ng-forge/dynamic-forms/internal';
import { Logger } from '@ng-forge/dynamic-forms/internal';
import { DynamicFormLogger } from '@ng-forge/dynamic-forms/internal';
import { WrapperFieldInputs } from '@ng-forge/dynamic-forms/internal';
import { isSameWrapperChain } from '../resolve-wrappers/resolve-wrappers';
import { LoadedWrapper, loadWrapperComponents, renderWrapperChain, setInputIfDeclared } from './wrapper-chain';

export interface WrapperChainControllerOptions {
  /**
   * The outer slot where the wrapper chain is mounted. Sampled only at render
   * time — safe to pass a `viewChild.required` signal that resolves post-init.
   */
  readonly vcr: Signal<ViewContainerRef>;
  /**
   * Signal of the wrapper chain. Ref-stable memoisation (e.g.
   * `isSameWrapperChain`) is recommended — `WrapperConfig` entries should be
   * singletons so the controller can tell a real chain change from ref churn.
   */
  readonly wrappers: Signal<readonly WrapperConfig[]>;
  /**
   * Optional gating signal. When `false`, the chain is not mounted (initial)
   * or left untouched (post-mount flicker). `DfFieldOutlet` passes
   * `renderReady`; containers omit the gate.
   */
  readonly gate?: Signal<boolean>;
  /**
   * Optional mapper-outputs signal. When present, the controller pushes it to
   * each wrapper's `fieldInputs` input at render time AND on every subsequent
   * change. Must always produce a value once subscribed — don't emit undefined.
   * Containers render a children template (no field), so they omit this.
   */
  readonly fieldInputs?: Signal<WrapperFieldInputs>;
  /**
   * Optional extra rebuild trigger. `DfFieldOutlet` passes the innermost
   * component class so that a reconciled field with the same wrapper chain
   * but a different `component` forces a rebuild. Compared by identity.
   */
  readonly rebuildKey?: Signal<unknown>;
  /**
   * Optional field-level injector signal (e.g. `ResolvedField.injector`). When
   * provided, wrapper components see a merged injector — field tokens first
   * (`ARRAY_CONTEXT`, `FIELD_SIGNAL_CONTEXT`), element chain behind
   * (parent wrappers). Containers omit this.
   */
  readonly fieldInjector?: Signal<Injector>;
  /**
   * Grid classes (e.g. `df-col-6`) for the outermost wrapper host, sampled on
   * each structural rebuild. Containers omit this.
   */
  readonly outermostHostClasses?: Signal<string | undefined>;
  /**
   * Renders whatever belongs at the innermost slot (a field component, a children
   * template, …). Called each time the chain mounts or structurally rebuilds.
   */
  readonly renderInnermost: (slot: ViewContainerRef) => void;
  /**
   * Called right before the mounted chain is cleared on a structural change.
   * Lets the caller detach views it wants to preserve — e.g. `DfFieldOutlet`
   * detaches the innermost field's hostView so focus / caret / scroll survive
   * when only the wrapper chain changes. Return true when the caller owns the
   * controller's already-detached outer view and will reinsert it itself. Not
   * invoked on the pre-first-render path.
   */
  readonly beforeRebuild?: () => boolean | void;
}

/**
 * Owns the wrapper-chain lifecycle for a field or container: async component
 * loading, switchMap-based cancellation of stale loads, flicker-tolerant
 * rebuilds (only structural changes tear down), and `fieldInputs` push-through.
 * Must be called from a DI injection context.
 */
export function createWrapperChainController(opts: WrapperChainControllerOptions): void {
  const deps = injectChainDeps();
  const state = createStateSignal(opts);

  const mounted = { value: null as MountedChain | null };
  const detached = { value: null as ViewRef | null };
  let refs: ComponentRef<unknown>[] = [];

  // INVARIANT: toObservable schedules emissions as microtasks, so `renderInnermost`
  // runs outside any parent CD pass. Don't swap for sync signal wiring without
  // restoring df-field-outlet's detectChanges — NG0950 would re-surface.
  buildEmissionStream(state, deps)
    .pipe(takeUntilDestroyed(deps.destroyRef))
    .subscribe((emission) => {
      // Wrap the whole render path — a throw here (bad wrapper template,
      // caller's renderInnermost blew up, etc.) would otherwise terminate
      // the subscription and silently freeze subsequent chain updates.
      try {
        refs = applyEmission(emission, { opts, deps, mounted, refs, detached });
      } catch (err) {
        deps.logger.error('Wrapper chain render failed; tearing down partial state.', err);
        opts.vcr().clear();
        refs = [];
        mounted.value = null;
        // Same reason as the teardown branch: clear() cannot reach a detached view.
        detached.value?.destroy();
        detached.value = null;
      }
    });

  pushFieldInputsOnChange(opts, () => refs);
  deps.destroyRef.onDestroy(() => {
    detached.value?.destroy();
    opts.vcr().clear();
  });
}

interface ChainDeps {
  readonly registry: ReadonlyMap<string, WrapperTypeDefinition>;
  readonly cache: Map<string, import('@angular/core').Type<unknown>>;
  readonly logger: Logger;
  readonly destroyRef: DestroyRef;
  readonly environmentInjector: EnvironmentInjector;
}

interface ChainState {
  readonly open: boolean;
  readonly wrappers: readonly WrapperConfig[];
  readonly rebuildKey: unknown;
}

interface MountedChain {
  readonly wrappers: readonly WrapperConfig[];
  readonly rebuildKey: unknown;
}

interface ChainEmission {
  readonly state: ChainState;
  readonly loaded: readonly LoadedWrapper[] | null;
}

interface EmissionApplyContext {
  readonly opts: WrapperChainControllerOptions;
  readonly deps: ChainDeps;
  readonly mounted: { value: MountedChain | null };
  readonly refs: ComponentRef<unknown>[];
  /** View detached while the gate is closed, re-inserted when it reopens. */
  readonly detached: { value: ViewRef | null };
}

function injectChainDeps(): ChainDeps {
  return {
    registry: inject(WRAPPER_REGISTRY),
    cache: inject(WRAPPER_COMPONENT_CACHE),
    logger: inject(DynamicFormLogger),
    destroyRef: inject(DestroyRef),
    environmentInjector: inject(EnvironmentInjector),
  };
}

function createStateSignal(opts: WrapperChainControllerOptions): Signal<ChainState> {
  return computed(
    () => ({
      open: opts.gate?.() ?? true,
      wrappers: opts.wrappers(),
      rebuildKey: opts.rebuildKey?.(),
    }),
    { equal: (a, b) => a.open === b.open && a.rebuildKey === b.rebuildKey && isSameWrapperChain(a.wrappers, b.wrappers) },
  );
}

/**
 * Resolve a `ChainState` into a `ChainEmission`. `switchMap` cancellation
 * guarantees in-flight async loads are discarded when a newer state arrives.
 */
function buildEmissionStream(state: Signal<ChainState>, deps: ChainDeps): Observable<ChainEmission> {
  return toObservable(state).pipe(switchMap((s) => resolveLoadedWrappers(s, deps)));
}

function resolveLoadedWrappers(state: ChainState, deps: ChainDeps): Observable<ChainEmission> {
  if (!state.open) {
    return of({ state, loaded: null });
  }

  if (state.wrappers.every((w) => deps.cache.has(w.type))) {
    // Sync fast-path — the cache only holds SUCCESSFUL loads, so "every cached"
    // means every wrapper was previously resolved cleanly. No need to re-log.
    const loaded = state.wrappers.map((config) => ({ config, component: deps.cache.get(config.type)! }) satisfies LoadedWrapper);
    return of({ state, loaded });
  }

  return loadWrapperComponents(state.wrappers, deps.registry, deps.cache, deps.logger).pipe(map((loaded) => ({ state, loaded })));
}

/**
 * Diff what's mounted against the next state and act:
 *   - Gate-only flicker → no-op (preserve the mounted chain)
 *   - Structural change → beforeRebuild → vcr.clear → render fresh
 *   - Idempotent re-emission → no-op
 */
function applyEmission({ state, loaded }: ChainEmission, ctx: EmissionApplyContext): ComponentRef<unknown>[] {
  const { opts, deps, mounted, refs } = ctx;
  const vcr = opts.vcr();
  const structurallyChanged = isStructurallyDifferent(mounted.value, state);

  // Gate-only flicker after first mount — keep the chain alive so the user's
  // focus / caret / scroll survive, and detach it so it leaves the DOM and stops
  // taking change detection. Rebuilding instead costs ~5x the teardown.
  if (!structurallyChanged && !state.open) {
    if (vcr.length > 0) ctx.detached.value = vcr.detach(0) ?? ctx.detached.value;
    return refs;
  }

  // Re-opening a chain we detached rather than destroyed: put the view back.
  if (state.open && !structurallyChanged && mounted.value !== null && ctx.detached.value) {
    vcr.insert(ctx.detached.value);
    ctx.detached.value = null;
    return refs;
  }

  // Real structural change — tear down. Angular cascades destroy through
  // every nested ComponentRef, so walking `refs` manually is redundant.
  // `beforeRebuild` gives the caller a chance to detach views it wants to
  // preserve (e.g. the innermost field when only wrappers changed).
  if (structurallyChanged && mounted.value !== null) {
    // Preserve the innermost field before destroying a detached outer chain. Destroying the
    // ancestor first also destroys the field ref and leaves the caller holding a dead view.
    const preservesDetachedOuterView = opts.beforeRebuild?.() === true;
    // A view detached by an earlier gate close is not in the container, so vcr.clear() cannot
    // reach it. Once the preservable inner view is detached, destroy the remaining chain.
    if (ctx.detached.value && !preservesDetachedOuterView) ctx.detached.value.destroy();
    ctx.detached.value = null;
    vcr.clear();
    mounted.value = null;
  }

  if (!state.open || loaded === null) return [];
  // Same structure + already mounted — idempotent re-emission, nothing to do.
  if (mounted.value !== null) return refs;

  const newRefs = renderWrapperChain({
    outerContainer: vcr,
    loadedWrappers: loaded,
    environmentInjector: deps.environmentInjector,
    logger: deps.logger,
    fieldInputs: opts.fieldInputs?.(),
    fieldInjector: opts.fieldInjector?.(),
    outermostHostClasses: opts.outermostHostClasses?.(),
    renderInnermost: opts.renderInnermost,
  });
  mounted.value = { wrappers: state.wrappers, rebuildKey: state.rebuildKey };
  return newRefs;
}

function isStructurallyDifferent(mounted: MountedChain | null, next: ChainState): boolean {
  if (mounted === null) return true;
  if (mounted.rebuildKey !== next.rebuildKey) return true;
  return !isSameWrapperChain(mounted.wrappers, next.wrappers);
}

/**
 * Push the latest `fieldInputs` bag to every mounted wrapper whenever it
 * changes — without rebuilding the chain. No-op when the chain is empty
 * (gated off, or nothing rendered yet).
 */
function pushFieldInputsOnChange(opts: WrapperChainControllerOptions, getRefs: () => readonly ComponentRef<unknown>[]): void {
  if (!opts.fieldInputs) return;
  explicitEffect([opts.fieldInputs], ([fi]) => {
    for (const ref of getRefs()) setInputIfDeclared(ref, 'fieldInputs', fi);
  });
}
