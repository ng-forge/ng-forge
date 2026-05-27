import { signal, Signal } from '@angular/core';

/**
 * Explicit state for `ArrayFieldComponent`'s async-resolution lifecycle. Replaces
 * three ad-hoc signals (`updateVersion`, `pendingInitializationCycle`,
 * `settledInitializationCycle`) plus scattered `currentVersion !== updateVersion`
 * cancellation guards with one machine.
 *
 * @internal
 */
export type ArrayMachineKind = 'idle' | 'pending' | 'settled';

export type ArrayOperation =
  /** Form value emptied to length 0. Use `run.resolve()` if this clear should emit the init pulse. */
  | { kind: 'clear' }
  /** First resolution from an idle state (empty → N items). */
  | { kind: 'initial' }
  /** Dynamic add via event — bumps `runId` for cancellation but stays in the current state. */
  | { kind: 'append' }
  /** Full re-resolve (e.g. items removed mid-array — positions need full rebuild). */
  | { kind: 'recreate' };

export interface RunHandle {
  /** Unique id of this dispatch. Compared against `fsm.runId()` to detect staleness. */
  readonly id: number;
  /** True when a newer `dispatch()` has happened since this handle was created. */
  isStale(): boolean;
  /** Transition this run from `pending` → `settled`. No-op if stale or already settled. */
  resolve(): void;
}

export class ArrayFieldStateMachine {
  private readonly _state = signal<ArrayMachineKind>('idle');
  private readonly _runId = signal(0);
  private lastEmittedRunId = -1;
  private _hasEverEmitted = false;

  readonly state: Signal<ArrayMachineKind> = this._state.asReadonly();
  readonly runId: Signal<number> = this._runId.asReadonly();

  /** True after the first `componentInitialized` pulse has fired for this component. */
  get hasEverEmitted(): boolean {
    return this._hasEverEmitted;
  }

  dispatch(op: ArrayOperation): RunHandle {
    const nextId = this._runId() + 1;
    this._runId.set(nextId);

    switch (op.kind) {
      case 'clear':
      case 'initial':
      case 'recreate':
        this._state.set('pending');
        break;
      case 'append':
        // append doesn't reset state — mirrors today's behavior where
        // appendItems leaves the init-cycle tracking alone.
        break;
    }

    return {
      id: nextId,
      isStale: () => this._runId() !== nextId,
      resolve: () => {
        if (this._runId() === nextId && this._state() === 'pending') {
          this._state.set('settled');
        }
      },
    };
  }

  /**
   * Edge-trigger for the emit-effect. Returns true exactly once per `settled` run
   * when `allReady` is true. Side-effect: records the run as emitted and transitions
   * the state back to `idle`. Subsequent calls without a fresh dispatch return false.
   */
  shouldEmit(allReady: boolean): boolean {
    if (this._state() !== 'settled' || !allReady) return false;
    if (this.lastEmittedRunId === this._runId()) return false;
    this.lastEmittedRunId = this._runId();
    this._hasEverEmitted = true;
    this._state.set('idle');
    return true;
  }
}
