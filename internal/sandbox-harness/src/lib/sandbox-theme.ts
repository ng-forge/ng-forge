import { InjectionToken, Signal } from '@angular/core';

/**
 * Injection token providing a reactive theme signal to sandbox sub-applications.
 *
 * Provided by {@link SandboxHarness} during bootstrap. The signal value is kept in sync
 * with `document.documentElement[data-theme]` via a MutationObserver running in the
 * host application's context.
 *
 * Components inside sandbox sub-apps can inject this token (optionally) to react to
 * theme changes without needing their own DOM observation or cross-app communication:
 *
 * ```typescript
 * private readonly sandboxTheme = inject(SANDBOX_THEME, { optional: true });
 * readonly isInSandbox = this.sandboxTheme !== null;
 * readonly theme = computed(() => this.sandboxTheme?.() ?? 'light');
 * ```
 *
 * The token is `null` when the component is NOT running inside a sandbox
 * (e.g. standalone app, SSR, or unit tests).
 */
export const SANDBOX_THEME = new InjectionToken<Signal<'dark' | 'light'>>('SANDBOX_THEME');
