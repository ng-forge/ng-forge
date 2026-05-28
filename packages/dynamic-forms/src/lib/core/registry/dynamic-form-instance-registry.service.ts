import { computed, Injectable, Signal, signal } from '@angular/core';

const AUTO_ID_PREFIX = 'df-';

/**
 * Root-singleton tracking mounted DynamicForm instances, driving auto-prefixing.
 * Hands out the lowest free `df-N` slot and reclaims it on unregister, so a freed
 * number is reused (e.g. across navigation) instead of climbing — a persistent
 * form holds `df-1` while each page's form reuses `df-2`. Slots only, so no leak.
 */
@Injectable({ providedIn: 'root' })
export class DynamicFormInstanceRegistry {
  private readonly slots = new Set<number>();
  private readonly _count = signal(0);

  readonly count: Signal<number> = this._count.asReadonly();
  readonly multiplePresent: Signal<boolean> = computed(() => this._count() > 1);

  /** Claims the lowest free slot; the returned id is stable for the instance's lifetime. */
  register(): string {
    let slot = 1;
    while (this.slots.has(slot)) slot++;
    this.slots.add(slot);
    this._count.set(this.slots.size);
    return `${AUTO_ID_PREFIX}${slot}`;
  }

  /** Reclaims the slot so the next form reuses it. */
  unregister(id: string): void {
    this.slots.delete(Number(id.slice(AUTO_ID_PREFIX.length)));
    this._count.set(this.slots.size);
  }
}
