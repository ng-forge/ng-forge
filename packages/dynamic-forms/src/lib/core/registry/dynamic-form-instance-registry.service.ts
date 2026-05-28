import { computed, Injectable, Signal, signal } from '@angular/core';

/**
 * Root-singleton count of mounted DynamicForm instances, driving auto-prefixing.
 * Counters only (no instance refs → no leak); the auto-id seq resets when the
 * count returns to 0, keeping ids bounded and deterministic per mount-wave.
 */
@Injectable({ providedIn: 'root' })
export class DynamicFormInstanceRegistry {
  private readonly _count = signal(0);
  private _seq = 0;

  readonly count: Signal<number> = this._count.asReadonly();
  readonly multiplePresent: Signal<boolean> = computed(() => this._count() > 1);

  /** Returns a stable, unique auto-id (`df-N`); seq strictly increases between resets. */
  register(): string {
    this._count.update((n) => n + 1);
    return `df-${++this._seq}`;
  }

  unregister(): void {
    this._count.update((n) => Math.max(0, n - 1));
    if (this._count() === 0) {
      this._seq = 0;
    }
  }
}
