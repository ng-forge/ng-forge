declare const ngDevMode: boolean | undefined;

/**
 * Dev-mode guard for tree-shakeable diagnostics.
 *
 * Angular CLI's optimizer substitutes `ngDevMode` with `false` in production builds,
 * letting terser dead-code-eliminate branches gated by this constant. Non-Angular
 * consumers fall back to `true` so warnings still fire under their bundler.
 *
 * Note: `DEV_MODE` is evaluated at module-load time and captured into the constant,
 * so it does NOT reflect later runtime calls to Angular's `enableProdMode()`. For
 * the dead-code-elimination case this is intentional (the value must be known at
 * build time). If a runtime check is needed instead, use `isDevMode()` from
 * `@angular/core` directly.
 */
export const DEV_MODE: boolean = typeof ngDevMode === 'undefined' || !!ngDevMode;
