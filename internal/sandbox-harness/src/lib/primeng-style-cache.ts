/**
 * Clears PrimeNG's module-scoped style caches so styles are re-injected on the next render.
 *
 * PrimeNG tracks which component styles have been loaded using two module-level singletons:
 * - `Base` from `primeng/base` — tracks core CSS (base, component CSS)
 * - `Theme` from `@primeuix/styled` — tracks theme CSS (common, component theme, layer order)
 *
 * These are ES module singletons, NOT Angular DI services, so they persist across
 * `createApplication()` / `destroyApplication()` cycles. When a sandbox is destroyed
 * and a new one is created (e.g., switching adapters), the caches still report styles
 * as "loaded" even though the style elements were removed from the DOM.
 *
 * This function is intentionally resilient: if PrimeNG is not installed or the internal
 * API changes, it silently does nothing.
 */
export async function clearPrimeNGStyleCaches(): Promise<void> {
  // Dynamic import() expressions — sandbox-harness has no compile-time dependency on PrimeNG.
  // These resolve instantly since the modules are already loaded by the adapter factory.
  // Must be awaited so the caches are cleared BEFORE createApplication() runs —
  // otherwise PrimeNG's module-scoped singletons still report styles as "loaded"
  // and skip injection into the new shadow root.
  await Promise.all([clearCache('@primeuix/styled', 'Theme'), clearCache('primeng/base', 'Base')]);
}

async function clearCache(specifier: string, exportName: string): Promise<void> {
  try {
    const m = await import(/* @vite-ignore */ specifier);
    const target = m?.[exportName];
    if (target && typeof target.clearLoadedStyleNames === 'function') {
      target.clearLoadedStyleNames();
    }
  } catch {
    // PrimeNG not installed or API changed — silently skip.
  }
}
