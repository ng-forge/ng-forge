import { Injectable } from '@angular/core';
import { LocationStrategy } from '@angular/common';

/**
 * In-memory location strategy for sub-apps embedded in the docs.
 * Routes are tracked in a history stack without modifying window.location,
 * preventing sub-app navigation from polluting the browser URL or hash.
 * back() and forward() move the cursor and dispatch popstate to registered listeners.
 */
@Injectable()
export class MemoryLocationStrategy extends LocationStrategy {
  private readonly history: Array<{ path: string; state: unknown }> = [{ path: '/', state: {} }];
  private cursor = 0;
  private readonly popStateListeners: Array<(event: PopStateEvent) => void> = [];

  override path(): string {
    return this.history[this.cursor].path;
  }

  override prepareExternalUrl(internal: string): string {
    return internal;
  }

  override pushState(state: unknown, _title: string, url: string, queryParams: string): void {
    const path = url + (queryParams ? `?${queryParams}` : '');
    // Discard any forward history beyond the current cursor.
    this.history.splice(this.cursor + 1);
    this.history.push({ path, state });
    this.cursor = this.history.length - 1;
  }

  override replaceState(state: unknown, _title: string, url: string, queryParams: string): void {
    const path = url + (queryParams ? `?${queryParams}` : '');
    this.history[this.cursor] = { path, state };
  }

  override forward(): void {
    if (this.cursor < this.history.length - 1) {
      this.cursor++;
      this.dispatchPopState();
    }
  }

  override back(): void {
    if (this.cursor > 0) {
      this.cursor--;
      this.dispatchPopState();
    }
  }

  override onPopState(fn: (event: PopStateEvent) => void): void {
    this.popStateListeners.push(fn);
  }

  override getBaseHref(): string {
    return '';
  }

  override getState(): unknown {
    const state = this.history[this.cursor].state;
    // Return a deep copy so callers cannot mutate the stored state reference.
    try {
      return structuredClone(state);
    } catch {
      return state;
    }
  }

  private dispatchPopState(): void {
    const event = new PopStateEvent('popstate', { state: this.getState() });
    for (const fn of this.popStateListeners) fn(event);
  }
}
