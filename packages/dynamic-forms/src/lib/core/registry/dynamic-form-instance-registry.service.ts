import { computed, Injectable, Signal, signal } from '@angular/core';

const AUTO_ID_PREFIX = 'df-';

/**
 * Root-singleton tracking mounted DynamicForm instances, driving auto-prefixing.
 *
 * Each form registers a `visible` signal (true while its host is rendered). Only
 * visible forms count toward "more than one present", so a cached but hidden page
 * — e.g. ionic's `ion-router-outlet` keeps the previous page in the DOM for
 * swipe-back — doesn't inflate the count. Counting signals (not the DOM) keeps
 * the computed pure; `_membership` only invalidates it on register/unregister,
 * since Map membership itself isn't reactive.
 *
 * Slots are recycled (lowest free `df-N`) so ids stay compact across navigation.
 */
@Injectable({ providedIn: 'root' })
export class DynamicFormInstanceRegistry {
  private readonly slots = new Map<number, Signal<boolean>>();
  private readonly _membership = signal(0);

  /** True while more than one VISIBLE form is mounted — the trigger for auto-prefixing. */
  readonly multiplePresent: Signal<boolean> = computed(() => {
    this._membership();
    let visible = 0;
    for (const isVisible of this.slots.values()) {
      if (isVisible()) {
        visible += 1;
        if (visible > 1) return true;
      }
    }
    return false;
  });

  /** Registers a form's visibility signal; returns a stable, recycled auto-id. */
  register(visible: Signal<boolean>): string {
    let slot = 1;
    while (this.slots.has(slot)) slot++;
    this.slots.set(slot, visible);
    this._membership.update((m) => m + 1);
    return `${AUTO_ID_PREFIX}${slot}`;
  }

  unregister(id: string): void {
    this.slots.delete(Number(id.slice(AUTO_ID_PREFIX.length)));
    this._membership.update((m) => m + 1);
  }
}
