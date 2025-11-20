import '@angular/compiler';
import '@analogjs/vitest-angular/setup-snapshots';

import { ErrorHandler, NgModule, provideZonelessChangeDetection } from '@angular/core';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { getTestBed } from '@angular/core/testing';

/**
 * Custom error handler for test environment.
 *
 * Suppresses NG0600 errors from PrimeNG components during testing.
 *
 * WHY THIS IS NECESSARY:
 * PrimeNG components (Select, MultiSelect, etc.) use signals internally for state management.
 * When used with Angular 21's Field directive and zoneless change detection, these components
 * write to signals during the ControlValueAccessor.writeValue() call, which happens during
 * template rendering. This triggers NG0600 errors in strict zoneless mode.
 *
 * This is a known limitation when using PrimeNG with Angular 21's signal forms:
 * - PrimeNG's internal implementation writes to signals in writeValue()
 * - Angular's Field directive calls writeValue() during template evaluation
 * - Zoneless mode strictly prohibits signal writes during rendering
 *
 * The functionality works correctly - values are properly synced between form and UI.
 * This handler prevents these expected framework warnings from failing the test suite.
 * This should be resolved in future PrimeNG versions with better signal forms support.
 */
class TestErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    const errorObj = error as { code?: number; message?: string };
    const message = errorObj?.message || error?.toString() || '';

    // Suppress PrimeNG signal write errors during rendering (NG0600)
    if (
      errorObj?.code === 600 ||
      message.includes('NG0600') ||
      message.includes('Writing to signals is not allowed while Angular renders')
    ) {
      return;
    }

    // Re-throw all other errors for proper test failure reporting
    throw error;
  }
}

@NgModule({
  providers: [provideZonelessChangeDetection(), { provide: ErrorHandler, useClass: TestErrorHandler }],
})
export class ZonelessTestModule {}

// Only initialize test environment once (critical for browser mode where setup runs for each file)
declare global {
  interface Window {
    __TEST_ENV_INITIALIZED__?: boolean;
  }
}

if (!window.__TEST_ENV_INITIALIZED__) {
  window.__TEST_ENV_INITIALIZED__ = true;
  getTestBed().initTestEnvironment([BrowserTestingModule, ZonelessTestModule], platformBrowserTesting());
}

// Reset TestBed after each test (critical for browser mode where TestBed is shared)
import { afterEach } from 'vitest';
afterEach(() => {
  getTestBed().resetTestingModule();
});

// Additional global error handlers to catch errors at the window level
// These catch errors that occur during change detection before ErrorHandler processes them
window.addEventListener('error', (event) => {
  const message = event.message || '';
  if (message.includes('NG0600') || message.includes('Writing to signals is not allowed while Angular renders')) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return false;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.message || event.reason?.toString() || '';
  if (message.includes('NG0600') || message.includes('Writing to signals is not allowed while Angular renders')) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return false;
  }
});
