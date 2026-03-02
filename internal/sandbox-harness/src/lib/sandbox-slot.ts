import { DestroyRef, inject } from '@angular/core';
import { SandboxRefImpl } from './sandbox-ref';
import { AdapterName, SandboxBootstrapOptions, SandboxRef } from './types';

/**
 * Bootstrap delegate signature used by {@link SandboxSlot} to create new sub-applications
 * without importing {@link SandboxHarness} directly (avoids circular dependency).
 */
export type SandboxBootstrapFn = (
  adapter: AdapterName,
  container: HTMLElement,
  options: SandboxBootstrapOptions,
  signal: AbortSignal,
) => Promise<SandboxRef>;

/**
 * Per-container sandbox cache with adapter visibility toggling.
 *
 * Created via {@link SandboxHarness.createSlot}. Caches one bootstrapped sub-application
 * per adapter so switching adapters re-uses already-running apps (show/hide) and only
 * navigates to the new route. New adapters are bootstrapped on first access.
 *
 * Auto-destroys all cached apps when the owning injection context (e.g. a directive)
 * is destroyed.
 */
export class SandboxSlot {
  private readonly cache = new Map<AdapterName, SandboxRefImpl>();

  constructor(
    private readonly container: HTMLElement,
    private readonly options: SandboxBootstrapOptions,
    private readonly bootstrapFn: SandboxBootstrapFn,
  ) {
    inject(DestroyRef).onDestroy(() => this.destroy());
  }

  /**
   * Mounts the given adapter at the specified route, using the cached app if available.
   *
   * - **Cache hit**: shows the cached host element and navigates to the new route.
   * - **Cache miss**: bootstraps a new sub-application and caches it.
   *
   * Abort semantics: if `signal` fires before an async step completes, the operation is
   * cancelled and an `AbortError` is thrown. Any partially-created app is cleaned up.
   */
  async mount(adapter: AdapterName, route: string, signal: AbortSignal): Promise<SandboxRef> {
    const cached = this.cache.get(adapter);
    if (cached) {
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
      this.showOnly(adapter);
      await cached.navigate(route);
      return cached;
    }

    const ref = await this.bootstrapFn(adapter, this.container, { ...this.options, route }, signal);
    // Post-bootstrap abort check: destroy the freshly-created ref if signal fired
    if (signal.aborted) {
      ref.destroy();
      throw new DOMException('Aborted', 'AbortError');
    }
    // bootstrap() returns SandboxRef (public interface) but always produces SandboxRefImpl
    const impl = ref as SandboxRefImpl;
    this.cache.set(adapter, impl);
    this.showOnly(adapter);
    return impl;
  }

  /** Destroys all cached sub-applications and clears the cache. */
  destroy(): void {
    this.cache.forEach((ref) => ref.destroy());
    this.cache.clear();
  }

  private showOnly(active: AdapterName): void {
    this.cache.forEach((ref, name) => {
      ref.hostElement.style.display = name === active ? '' : 'none';
    });
  }
}
