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
export function clearPrimeNGStyleCaches(): void {
  // Dynamic import() expressions — sandbox-harness has no compile-time dependency on PrimeNG.
  // These resolve instantly since the modules are already loaded by the adapter factory.
  clearCache('@primeuix/styled', 'Theme');
  clearCache('primeng/base', 'Base');
}

function clearCache(specifier: string, exportName: string): void {
  try {
    void import(/* @vite-ignore */ specifier).then(
      (m) => {
        const target = m?.[exportName];
        if (target && typeof target.clearLoadedStyleNames === 'function') {
          target.clearLoadedStyleNames();
        }
      },
      () => {},
    );
  } catch {
    // Module not available.
  }
}
