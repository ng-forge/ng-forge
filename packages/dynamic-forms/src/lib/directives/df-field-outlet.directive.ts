import {
  ComponentRef,
  computed,
  DestroyRef,
  Directive,
  EnvironmentInjector,
  inject,
  Injector,
  input,
  Signal,
  signal,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { ResolvedField } from '../utils/resolve-field/resolve-field';
import { WRAPPER_AUTO_ASSOCIATIONS } from '../models/wrapper-type';
import { DEFAULT_WRAPPERS } from '../models/field-signal-context.token';
import { createWrapperAwareInjector } from '../utils/wrapper-chain/wrapper-chain';
import { createWrapperChainController } from '../utils/wrapper-chain/wrapper-chain-controller';
import { isSameWrapperChain, resolveWrappers } from '../utils/resolve-wrappers/resolve-wrappers';
import { READONLY_FIELD_TREE_CACHE, toReadonlyFieldTreeCached } from '../core/field-tree-utils';
import { WrapperFieldInputs } from '../wrappers/wrapper-field-inputs';

/**
 * Captured focus + caret for one detach/reinsert cycle. Tied to a single
 * mounted-detached-mounted round trip; never persisted across a component-
 * class swap (the fresh `Mounted` state starts with no snapshot).
 */
interface FocusSnapshot {
  readonly element: HTMLElement;
  readonly selectionStart: number | null;
  readonly selectionEnd: number | null;
}

/**
 * Explicit lifecycle states for `FieldComponentSlot`. The discriminant carries
 * exactly the data each phase needs, so nothing in the slot is "optional state
 * that might be undefined" — the type forces every code path to handle the
 * empty/mounted/detached cases distinctly.
 *
 * - `empty`     — no `ComponentRef` exists. Either initial state or post-teardown.
 * - `mounted`   — the ref is inserted into `slot`. Inputs are being pushed.
 * - `detached`  — the ref's host view has been pulled from its slot; held briefly
 *                 between `detach()` and the next `mountOrReuse()` so a same-class
 *                 reuse can re-insert it and replay focus.
 */
type FieldSlotState =
  | { readonly phase: 'empty' }
  | {
      readonly phase: 'mounted';
      readonly ref: ComponentRef<unknown>;
      readonly slot: ViewContainerRef;
      readonly lastInputs: Record<string, unknown> | null;
    }
  | {
      readonly phase: 'detached';
      readonly ref: ComponentRef<unknown>;
      readonly focusSnapshot: FocusSnapshot | null;
    };

const EMPTY_STATE: FieldSlotState = { phase: 'empty' };

/**
 * Encapsulates the imperative `ViewContainerRef` / `ComponentRef` lifecycle
 * for the innermost field component. Pulled out of `DfFieldOutlet` so the
 * directive itself stays declarative — signals + constructor wiring — while
 * the unavoidable mutable bookkeeping (Angular's view container API is
 * imperative) lives in one place behind a small, focused surface.
 *
 * State is held in a single `Signal<FieldSlotState>` discriminated union;
 * every mutation is an explicit `state.set(...)` transition. No nullable
 * instance fields, no `undefined`-initialized refs — each phase carries
 * exactly the data it owns.
 *
 * Responsibilities:
 * - Create the component (or reuse the same-class instance across a rebuild,
 *   preserving its DOM state, focus, and caret).
 * - Push mapper inputs via `setInput`, dedup'd per-key so dev-mode NG0303
 *   warnings for undeclared mapper keys don't replay on every emission.
 * - Detach cleanly before the outer VCR clears, so same-class reuse can
 *   re-insert the preserved `hostView`.
 * - Destroy on directive teardown when the host view is still detached.
 */
class FieldComponentSlot {
  private readonly state = signal<FieldSlotState>(EMPTY_STATE);

  /**
   * Mount the field component into `slot`. Reuses the existing `ComponentRef`
   * when its component type matches (preserving DOM/focus/caret across a
   * wrapper-chain rebuild); otherwise discards the old ref and creates a fresh
   * one.
   */
  mountOrReuse(
    slot: ViewContainerRef,
    component: Type<unknown>,
    fieldInjector: Injector,
    environmentInjector: EnvironmentInjector,
    rawInputs: Record<string, unknown>,
  ): void {
    const current = this.state();

    if (current.phase !== 'empty' && current.ref.componentType === component) {
      slot.insert(current.ref.hostView);
      this.state.set({ phase: 'mounted', ref: current.ref, slot, lastInputs: null });
      this.pushInputs(rawInputs);
      if (current.phase === 'detached') this.replayFocus(current.focusSnapshot);
      return;
    }

    // Different component class — destroy the prior ref (if any) and create
    // a fresh one. The `empty` transition before `createComponent` ensures a
    // throw inside the factory doesn't leave a dangling ref the next mount
    // would try to re-insert.
    if (current.phase !== 'empty') current.ref.destroy();
    this.state.set(EMPTY_STATE);
    const ref = slot.createComponent(component, {
      environmentInjector,
      injector: createWrapperAwareInjector(fieldInjector, slot.injector),
    });
    this.state.set({ phase: 'mounted', ref, slot, lastInputs: null });
    this.pushInputs(rawInputs);
  }

  /**
   * Push mapper inputs onto the mounted component. Per-key reference compare
   * skips `setInput` for unchanged values — necessary in dev mode where
   * `setInput` on unknown keys logs NG0303 per call (Angular 21 is lenient
   * at runtime but warns); without the cache, every emission would re-warn
   * for every undeclared mapper key.
   *
   * `reflectComponentType` does NOT include hostDirective-forwarded inputs
   * (angular/angular#49734), so a declared-input filter here would skip every
   * value flowing through `NgForgeFieldShell` / `NgForgeField` /
   * `NgForgeAction`. Mapper-as-contract is enforced by the `*_INPUTS`
   * lockstep type assertions, not at runtime here.
   */
  pushInputs(rawInputs: Record<string, unknown>): void {
    const current = this.state();
    if (current.phase !== 'mounted') return;
    const prev = current.lastInputs;
    if (prev === rawInputs) return;
    for (const [key, value] of Object.entries(rawInputs)) {
      if (prev && prev[key] === value) continue;
      current.ref.setInput(key, value);
    }
    this.state.set({ ...current, lastInputs: rawInputs });
  }

  /**
   * Detach the host view from its current slot, capturing focus + caret so the
   * next `mountOrReuse()` can replay them after re-inserting into the new
   * slot. A stranded `mounted` state with a bad slot index (re-entrancy
   * during a partial rebuild) is treated like `empty` to avoid leaks.
   */
  detach(): void {
    const current = this.state();
    if (current.phase !== 'mounted') return;
    const focusSnapshot = this.captureFocus(current.ref);
    const idx = current.slot.indexOf(current.ref.hostView);
    if (idx >= 0) current.slot.detach(idx);
    this.state.set({ phase: 'detached', ref: current.ref, focusSnapshot });
  }

  /**
   * Called on directive teardown. Only destroys when the host view is still
   * detached — otherwise the outer `vcr.clear()` cascade has already destroyed
   * it (calling `.destroy()` again would throw).
   */
  destroyOnTeardown(): void {
    const current = this.state();
    if (current.phase === 'detached') current.ref.destroy();
    this.state.set(EMPTY_STATE);
  }

  private captureFocus(ref: ComponentRef<unknown>): FocusSnapshot | null {
    const hostEl = ref.location.nativeElement as HTMLElement;
    const active = document.activeElement;
    if (!(active instanceof HTMLElement) || !hostEl.contains(active)) return null;
    const sel = active as HTMLInputElement & HTMLTextAreaElement;
    return {
      element: active,
      selectionStart: typeof sel.selectionStart === 'number' ? sel.selectionStart : null,
      selectionEnd: typeof sel.selectionEnd === 'number' ? sel.selectionEnd : null,
    };
  }

  private replayFocus(snap: FocusSnapshot | null): void {
    if (!snap || !snap.element.isConnected) return;
    snap.element.focus();
    if (snap.selectionStart !== null && snap.selectionEnd !== null && 'setSelectionRange' in snap.element) {
      (snap.element as HTMLInputElement).setSelectionRange(snap.selectionStart, snap.selectionEnd);
    }
  }
}

/**
 * Structural directive that renders a `ResolvedField` with its effective
 * wrapper chain.
 *
 * Replaces `*ngComponentOutlet` in field-rendering templates. When the field
 * has no wrappers, the component is created directly at the outlet position
 * (no extra DOM nesting). When wrappers apply, they chain outermost-first and
 * the field renders in the innermost slot.
 *
 * Effective wrappers are merged from (outermost → innermost):
 * 1. `WrapperTypeDefinition.types` auto-associations for the field's `type`
 * 2. `FormConfig.defaultWrappers`
 * 3. Field-level `FieldDef.wrappers` (`null` = explicit opt-out; `[]` does not
 *    opt out — auto + defaults still apply)
 *
 * Wrapper config keys (minus `type`) are pushed as individual Angular inputs;
 * every wrapper also receives `fieldInputs` — a `WrapperFieldInputs` bag that
 * includes the field's mapper outputs and a `ReadonlyFieldTree` view of its
 * form state.
 *
 * Rendering is gated by `field.renderReady() && !field.hidden()` — the
 * directive waits until the mapper produces the required inputs AND the
 * field isn't hidden before instantiating the component. Once rendered, a
 * transient `renderReady → false` does *not* tear the chain down; the
 * controller keeps the mounted components alive and ignores the flicker.
 * Only a structural change (wrappers or component class) triggers a rebuild.
 *
 * @example
 * ```html
 * \@for (field of resolvedFields(); track field.key) {
 *   <ng-container *dfFieldOutlet="field; environmentInjector: envInjector" />
 * }
 * ```
 */
@Directive({
  selector: '[dfFieldOutlet]',
})
export class DfFieldOutlet {
  // Named to match the structural directive microsyntax directly
  // (`*dfFieldOutlet="field; environmentInjector: env"`) so no aliasing is needed.
  readonly dfFieldOutlet = input.required<ResolvedField>();
  readonly dfFieldOutletEnvironmentInjector = input<EnvironmentInjector | undefined>(undefined);

  private readonly vcrRef = inject(ViewContainerRef);
  private readonly vcr: Signal<ViewContainerRef> = signal(this.vcrRef).asReadonly();
  private readonly destroyRef = inject(DestroyRef);
  private readonly wrapperAutoAssociations = inject(WRAPPER_AUTO_ASSOCIATIONS);
  private readonly defaultWrappersSignal = inject(DEFAULT_WRAPPERS, { optional: true });
  private readonly readonlyFieldCache = inject(READONLY_FIELD_TREE_CACHE);

  /** Encapsulates Angular's imperative ComponentRef / ViewContainerRef lifecycle. */
  private readonly fieldComponent = new FieldComponentSlot();

  private readonly componentIdentity: Signal<Type<unknown>> = computed(() => this.dfFieldOutlet().component);
  /**
   * Gate for the wrapper chain controller: true only when required inputs are populated AND the
   * field isn't hidden. Combining the two prevents an initial-mount race where the chain mounts
   * during the brief window between `renderReady` flipping true and `hidden()` settling — that
   * window is exactly where Angular Signal Forms' `[formField]` directive emits NG01916.
   */
  private readonly renderReady: Signal<boolean> = computed(() => this.dfFieldOutlet().renderReady() && !this.dfFieldOutlet().hidden());
  private readonly rawInputs = computed(() => this.dfFieldOutlet().inputs());

  /**
   * Effective wrapper chain. Element-wise identity comparison keeps the signal
   * stable across `ResolvedField` reference changes that don't actually change
   * the chain — avoids rebuilds on reconciled fields.
   */
  private readonly wrappers = computed(
    () => resolveWrappers(this.dfFieldOutlet().fieldDef, this.defaultWrappersSignal?.(), this.wrapperAutoAssociations),
    { equal: isSameWrapperChain },
  );

  /**
   * `fieldInputs` bag handed to every wrapper in the chain. Memoised on
   * `rawInputs` identity so repeated emissions with the same underlying object
   * return the same view and don't cascade OnPush re-evaluations.
   */
  private readonly fieldInputs = computed<WrapperFieldInputs>(() => this.buildFieldInputs(this.rawInputs()));

  private readonly defaultEnvInjector = inject(EnvironmentInjector);
  /** Environment injector for the innermost field component — `[environmentInjector]` input takes precedence over the directive's own DI. */
  private readonly fieldEnvInjector = computed(() => this.dfFieldOutletEnvironmentInjector() ?? this.defaultEnvInjector);
  /** Field-level injector (FIELD_SIGNAL_CONTEXT, ARRAY_CONTEXT, …). Threaded to the controller so wrappers can inject it too. */
  private readonly fieldInjector = computed(() => this.dfFieldOutlet().injector);

  constructor() {
    createWrapperChainController({
      vcr: this.vcr,
      wrappers: this.wrappers,
      gate: this.renderReady,
      rebuildKey: this.componentIdentity,
      fieldInputs: this.fieldInputs,
      fieldInjector: this.fieldInjector,
      beforeRebuild: () => this.fieldComponent.detach(),
      renderInnermost: (slot) => {
        const resolved = this.dfFieldOutlet();
        this.fieldComponent.mountOrReuse(slot, resolved.component, resolved.injector, this.fieldEnvInjector(), this.rawInputs());
      },
    });

    // Push rawInputs to the innermost field on every change. `setInput` is a no-op when the
    // value is unchanged, so no manual dedupe layer is needed here — the initial render's
    // synchronous push from `renderInnermost` and the effect's first fire converge cleanly.
    explicitEffect([this.rawInputs], ([rawInputs]) => this.fieldComponent.pushInputs(rawInputs));

    this.destroyRef.onDestroy(() => this.fieldComponent.destroyOnTeardown());
  }

  private buildFieldInputs(rawInputs: Record<string, unknown>): WrapperFieldInputs {
    const fieldTreeCandidate = rawInputs['field'];
    // A FieldTree is a callable (() => FieldState). We expose it to wrappers via a narrow
    // read-only view; raw FieldTree is still pushed to the innermost component for writes.
    const readonlyField =
      fieldTreeCandidate && typeof fieldTreeCandidate === 'function'
        ? toReadonlyFieldTreeCached(this.readonlyFieldCache, fieldTreeCandidate as never)
        : undefined;
    // Shallow spread — relies on the mapper contract (see WrapperFieldInputs)
    // that rawInputs are emitted as fresh snapshots, not mutated in place.
    return {
      ...(rawInputs as Record<string, unknown>),
      field: readonlyField,
    } as WrapperFieldInputs;
  }
}
