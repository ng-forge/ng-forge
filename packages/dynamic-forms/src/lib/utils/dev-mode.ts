declare const ngDevMode: boolean | undefined;

/** Dev-mode guard for tree-shakeable diagnostics. */
export const DEV_MODE: boolean = typeof ngDevMode === 'undefined' || !!ngDevMode;
