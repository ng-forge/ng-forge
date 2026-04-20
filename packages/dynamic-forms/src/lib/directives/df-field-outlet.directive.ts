import {
  ComponentRef,
  computed,
  DestroyRef,
  Directive,
  EnvironmentInjector,
  inject,
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
import { createWrapperAwareInjector, setInputIfDeclared } from '../utils/wrapper-chain/wrapper-chain';
import { createWrapperChainController } from '../utils/wrapper-chain/wrapper-chain-controller';
import { isSameWrapperChain, resolveWrappers } from '../utils/resolve-wrappers/resolve-wrappers';
import { READONLY_FIELD_TREE_CACHE, toReadonlyFieldTreeCached } from '../core/field-tree-utils';
import { WrapperFieldInputs } from '../wrappers/wrapper-field-inputs';

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
 * Rendering is gated by `field.renderReady()` — the directive waits until
 * the mapper produces the required inputs before instantiating the component.
 * Once rendered, a transient `renderReady → false` does *not* tear the chain
 * down; the controller keeps the mounted components alive and ignores the
 * flicker. Only a structural change (wrappers or component class) triggers
 * a rebuild.
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

  private fieldRef: ComponentRef<unknown> | undefined;
  /**
   * VCR the `fieldRef`'s host view is currently inserted into (either the outer
   * VCR when there are no wrappers, or the innermost wrapper's `#fieldComponent`
   * slot). Tracked so `beforeRebuild` can detach the view before the outer VCR
   * cascade-destroys it.
   */
  private fieldSlot: ViewContainerRef | undefined;
  /** Focus + caret captured during detach, replayed after re-insert. */
  private focusSnapshot: { element: HTMLElement; selectionStart: number | null; selectionEnd: number | null } | undefined;
  /**
   * Last rawInputs reference pushed to the innermost field. Used to dedupe the
   * rawInputs effect when the same snapshot was already applied as part of the
   * initial render — keeps per-keystroke input updates O(changed-keys) instead
   * of re-walking the whole input bag.
   */
  private lastPushedInputs: Record<string, unknown> | undefined;

  private readonly componentIdentity: Signal<Type<unknown>> = computed(() => this.dfFieldOutlet().component);
  private readonly renderReady: Signal<boolean> = computed(() => this.dfFieldOutlet().renderReady());
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
      beforeRebuild: () => this.detachFieldRef(),
      renderInnermost: (slot) => {
        const resolved = this.dfFieldOutlet();
        if (this.fieldRef && this.fieldRef.componentType === resolved.component) {
          // Same component class — re-insert the preserved hostView. Browser
          // loses focus on detach, so we replay the snapshot captured in
          // detachFieldRef. Input value persists on the DOM node itself.
          slot.insert(this.fieldRef.hostView);
          this.fieldSlot = slot;
          this.pushRawInputs(this.fieldRef, this.rawInputs());
          this.restoreFocusSnapshot();
          return;
        }
        // Different component class — discard the old ref and create fresh.
        // Merge field + element injectors so the field can inject ancestor
        // wrappers AND form-context tokens (ARRAY_CONTEXT etc.).
        // Clear state before createComponent — if it throws (bad provider,
        // invalid class) we don't want to leak a reference to a destroyed ref
        // that the same-component branch would later try to re-insert.
        this.focusSnapshot = undefined;
        this.lastPushedInputs = undefined;
        const previousRef = this.fieldRef;
        this.fieldRef = undefined;
        this.fieldSlot = undefined;
        previousRef?.destroy();
        this.fieldRef = slot.createComponent(resolved.component, {
          environmentInjector: this.fieldEnvInjector(),
          injector: createWrapperAwareInjector(resolved.injector, slot.injector),
        });
        this.fieldSlot = slot;
        this.pushRawInputs(this.fieldRef, this.rawInputs());
      },
    });

    // Push rawInputs to the innermost field. Safe mid-rebuild — renderInnermost
    // re-reads rawInputs synchronously on mount, so skipping here loses nothing.
    explicitEffect([this.rawInputs], ([rawInputs]) => {
      if (!this.fieldRef) return;
      if (this.lastPushedInputs === rawInputs) return;
      this.pushRawInputs(this.fieldRef, rawInputs);
    });

    this.destroyRef.onDestroy(() => {
      // Only destroy when detached — vcr.clear() cascades otherwise.
      if (this.fieldRef && !this.fieldSlot) this.fieldRef.destroy();
      this.fieldRef = undefined;
      this.fieldSlot = undefined;
      this.lastPushedInputs = undefined;
    });
  }

  private detachFieldRef(): void {
    if (!this.fieldRef) return;
    if (!this.fieldSlot) {
      // Stranded fieldRef — destroy to prevent a leak.
      this.fieldRef.destroy();
      this.fieldRef = undefined;
      return;
    }
    this.captureFocusSnapshot();
    const idx = this.fieldSlot.indexOf(this.fieldRef.hostView);
    if (idx >= 0) this.fieldSlot.detach(idx);
    this.fieldSlot = undefined;
  }

  /** Capture active element + selection before the hostView is detached from DOM. */
  private captureFocusSnapshot(): void {
    if (!this.fieldRef) return;
    const hostEl = this.fieldRef.location.nativeElement as HTMLElement;
    const active = document.activeElement;
    if (!(active instanceof HTMLElement) || !hostEl.contains(active)) return;
    const sel = active as HTMLInputElement & HTMLTextAreaElement;
    this.focusSnapshot = {
      element: active,
      selectionStart: typeof sel.selectionStart === 'number' ? sel.selectionStart : null,
      selectionEnd: typeof sel.selectionEnd === 'number' ? sel.selectionEnd : null,
    };
  }

  /** Re-apply the pre-detach focus + caret after the hostView is back in the DOM. */
  private restoreFocusSnapshot(): void {
    const snap = this.focusSnapshot;
    this.focusSnapshot = undefined;
    if (!snap || !snap.element.isConnected) return;
    snap.element.focus();
    if (snap.selectionStart !== null && snap.selectionEnd !== null && 'setSelectionRange' in snap.element) {
      (snap.element as HTMLInputElement).setSelectionRange(snap.selectionStart, snap.selectionEnd);
    }
  }

  private pushRawInputs(ref: ComponentRef<unknown>, rawInputs: Record<string, unknown>): void {
    // Ref-identity dedupe per key — mappers must emit immutable snapshots.
    const last = this.lastPushedInputs;
    for (const [key, value] of Object.entries(rawInputs)) {
      if (last && last[key] === value) continue;
      setInputIfDeclared(ref, key, value);
    }
    this.lastPushedInputs = rawInputs;
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
