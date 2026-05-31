import { ComponentRef, EnvironmentInjector, Injector, signal, Type, ViewContainerRef } from '@angular/core';
import { createWrapperAwareInjector, setInputIfDeclared } from '../../utils/wrapper-chain/wrapper-chain';
import type { WrapperFieldInputs } from '@ng-forge/dynamic-forms/internal';

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
 */
export type FieldSlotState =
  | { readonly phase: 'empty' }
  | {
      readonly phase: 'mounted';
      readonly ref: ComponentRef<unknown>;
      readonly slot: ViewContainerRef;
    }
  | {
      readonly phase: 'detached';
      readonly ref: ComponentRef<unknown>;
      readonly focusSnapshot: FocusSnapshot | null;
    };

const EMPTY_STATE: FieldSlotState = Object.freeze({ phase: 'empty' });

/**
 * Encapsulates the imperative `ViewContainerRef` / `ComponentRef` lifecycle
 * for the innermost field component. Pulled out of `DfFieldOutlet` so the
 * directive itself stays declarative — signals + constructor wiring — while
 * the unavoidable mutable bookkeeping (Angular's view container API is
 * imperative) lives in one place behind a small, focused surface.
 */
export class FieldComponentSlot {
  private readonly state = signal<FieldSlotState>(EMPTY_STATE);
  /**
   * Per-key cache for `pushInputs`. Lives outside the lifecycle state machine on
   * purpose — it's a `setInput`-call optimization that changes on every keystroke,
   * not a phase transition. Keeping it here means the `state` signal only emits
   * on real `empty ⇄ mounted ⇄ detached` transitions (≈ once per
   * mount/destroy cycle), not once per input emission.
   */
  private lastInputs: Record<string, unknown> | null = null;

  /** Read-only view of the lifecycle phase. Useful for tests and assertions. */
  readonly phase = () => this.state().phase;
  /** Read-only view of the full state. Exposed so tests can assert ref stability. */
  readonly snapshot = () => this.state();

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
    fieldInputs?: WrapperFieldInputs,
  ): void {
    const current = this.state();

    if (current.phase !== 'empty' && current.ref.componentType === component) {
      slot.insert(current.ref.hostView);
      this.lastInputs = null;
      this.state.set(Object.freeze({ phase: 'mounted', ref: current.ref, slot }));
      this.pushInputs(rawInputs, fieldInputs);
      if (current.phase === 'detached') this.replayFocus(current.focusSnapshot);
      return;
    }

    // Different component class — destroy the prior ref (if any) and create
    // a fresh one. The `empty` transition before `createComponent` ensures a
    // throw inside the factory doesn't leave a dangling ref the next mount
    // would try to re-insert.
    if (current.phase !== 'empty') current.ref.destroy();
    this.lastInputs = null;
    this.state.set(EMPTY_STATE);
    const ref = slot.createComponent(component, {
      environmentInjector,
      injector: createWrapperAwareInjector(fieldInjector, slot.injector),
    });
    this.state.set(Object.freeze({ phase: 'mounted', ref, slot }));
    this.pushInputs(rawInputs, fieldInputs);
  }

  /**
   * Push mapper inputs onto the mounted component. Per-key reference compare
   * skips `setInput` for unchanged values — necessary in dev mode where
   * `setInput` on unknown keys logs NG0303 per call (Angular 21 is lenient
   * at runtime but warns); without the cache, every emission would re-warn
   * for every undeclared mapper key.
   */
  pushInputs(rawInputs: Record<string, unknown>, fieldInputs?: WrapperFieldInputs): void {
    const current = this.state();
    if (current.phase !== 'mounted') return;
    const prev = this.lastInputs;
    if (prev === rawInputs) return;
    for (const [key, value] of Object.entries(rawInputs)) {
      if (prev && prev[key] === value) continue;
      current.ref.setInput(key, value);
    }
    // Side-channel forwarding for the `fieldInputs` bag — gated on
    // `setInputIfDeclared` so leaf fields that don't declare it (most
    // non-addon-aware components) skip silently rather than triggering
    // NG0303 in dev. Pushed unconditionally on every emission since the bag
    // changes identity when `rawInputs` does.
    if (fieldInputs !== undefined) {
      setInputIfDeclared(current.ref, 'fieldInputs', fieldInputs);
    }
    this.lastInputs = rawInputs;
  }

  /**
   * Detach the host view from its current slot, capturing focus + caret so the
   * next `mountOrReuse()` can replay them after re-inserting into the new
   * slot. A stranded `mounted` state with a bad slot index (re-entrancy during
   * a partial rebuild) is treated like `empty` to avoid leaks.
   */
  detach(): void {
    const current = this.state();
    if (current.phase !== 'mounted') return;
    const focusSnapshot = this.captureFocus(current.ref);
    const idx = current.slot.indexOf(current.ref.hostView);
    if (idx >= 0) current.slot.detach(idx);
    this.lastInputs = null;
    this.state.set(Object.freeze({ phase: 'detached', ref: current.ref, focusSnapshot }));
  }

  /**
   * Called on directive teardown. Only destroys when the host view is still
   * detached — otherwise the outer `vcr.clear()` cascade has already destroyed
   * it (calling `.destroy()` again would throw).
   */
  destroyOnTeardown(): void {
    const current = this.state();
    if (current.phase === 'detached') current.ref.destroy();
    this.lastInputs = null;
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
