declare const ngDevMode: boolean | undefined;

/**
 * Dev-mode guard for tree-shakeable diagnostics.
 *
 * Angular CLI's optimizer substitutes `ngDevMode` with `false` in production builds,
 * letting terser dead-code-eliminate branches gated by this constant. Non-Angular
 * consumers fall back to `true` so warnings still fire under their bundler.
 */
export const DEV_MODE: boolean = typeof ngDevMode === 'undefined' || !!ngDevMode;
