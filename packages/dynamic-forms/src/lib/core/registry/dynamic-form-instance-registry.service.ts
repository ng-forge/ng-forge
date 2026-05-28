import { computed, Injectable, Signal, signal } from '@angular/core';

/**
 * Root-singleton bookkeeping for how many DynamicForm instances are mounted at
 * once. Drives the automatic DOM-id prefixing decision: a lone form needs no
 * prefix (ids stay clean), but the moment a second form mounts every form must
 * scope its ids to avoid collisions — otherwise two forms built from the same
 * config steal each other's label focus (duplicate `id`/`for` across instances).
 *
 * Holds counters only — never references to the form instances themselves — so
 * it cannot leak. The monotonic seq that hands out auto-ids resets to 0 once
 * the live count returns to 0, keeping ids bounded and deterministic per
 * mount-wave instead of climbing forever across route navigations.
 */
@Injectable({ providedIn: 'root' })
export class DynamicFormInstanceRegistry {
  private readonly _count = signal(0);
  private _seq = 0;

  /** Number of DynamicForm instances currently mounted. */
  readonly count: Signal<number> = this._count.asReadonly();

  /** True while more than one form is mounted — the trigger for auto-prefixing. */
  readonly multiplePresent: Signal<boolean> = computed(() => this._count() > 1);

  /**
   * Registers a newly-mounted form. Returns a stable, unique auto-id for that
   * instance (e.g. `df-1`). seq strictly increases between resets, so no two
   * concurrently-live forms ever share an id. The id stays fixed for the
   * instance's lifetime.
   */
  register(): string {
    this._count.update((n) => n + 1);
    return `df-${++this._seq}`;
  }

  /**
   * Unregisters a destroyed form. When the last form unmounts, the auto-id seq
   * resets so the next mount-wave starts from `df-1` again.
   */
  unregister(): void {
    const next = this._count() - 1;
    this._count.set(next < 0 ? 0 : next);
    if (this._count() === 0) {
      this._seq = 0;
    }
  }
}
