import { Injectable } from '@angular/core';
import { LocationStrategy } from '@angular/common';

/**
 * In-memory location strategy for sub-apps embedded in the docs.
 * Routes are tracked in memory without modifying window.location,
 * preventing sub-app navigation from polluting the browser URL or hash.
 */
@Injectable()
export class MemoryLocationStrategy extends LocationStrategy {
  private internalPath = '/';
  private internalState: unknown = {};
  private readonly popStateListeners: Array<(event: PopStateEvent) => void> = [];

  override path(): string {
    return this.internalPath;
  }

  override prepareExternalUrl(internal: string): string {
    return internal;
  }

  override pushState(state: unknown, _title: string, url: string, queryParams: string): void {
    this.internalPath = url + (queryParams ? `?${queryParams}` : '');
    this.internalState = state;
  }

  override replaceState(state: unknown, _title: string, url: string, queryParams: string): void {
    this.internalPath = url + (queryParams ? `?${queryParams}` : '');
    this.internalState = state;
  }

  override forward(): void {
    // Not supported in memory strategy
  }

  override back(): void {
    // Not supported in memory strategy
  }

  override onPopState(fn: (event: PopStateEvent) => void): void {
    this.popStateListeners.push(fn);
  }

  override getBaseHref(): string {
    return '';
  }

  override getState(): unknown {
    return this.internalState;
  }
}
