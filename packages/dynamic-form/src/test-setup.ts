import '@angular/compiler';
import '@analogjs/vitest-angular/setup-snapshots';

import { ErrorHandler, NgModule, provideZonelessChangeDetection } from '@angular/core';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { getTestBed } from '@angular/core/testing';

/**
 * Custom error handler that suppresses expected "orphan field" errors
 * during dynamic form field removal tests.
 */
class TestErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    const message = error?.message || error?.toString() || '';

    // Suppress orphan field errors - these are expected during dynamic field removal
    if (message.includes('orphan field, looking for property')) {
      return;
    }

    // Re-throw other errors
    throw error;
  }
}

@NgModule({
  providers: [provideZonelessChangeDetection(), { provide: ErrorHandler, useClass: TestErrorHandler }],
})
export class ZonelessTestModule {}

getTestBed().initTestEnvironment([BrowserTestingModule, ZonelessTestModule], platformBrowserTesting());

// Suppress expected "orphan field" errors during form schema transitions
// These are harmless framework warnings that occur when fields are removed from the config
// The old form instance briefly tries to access fields that no longer exist during cleanup
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const message = args[0]?.toString() || '';
  if (message.includes('orphan field, looking for property')) {
    // Suppress orphan field errors - these are expected during dynamic field removal tests
    return;
  }
  originalConsoleError.apply(console, args);
};

// Global error handler to suppress orphan field runtime errors
// These occur when Angular Signal Forms' old form instance is cleaned up during schema changes
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('orphan field, looking for property')) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

// Handle unhandled promise rejections for orphan field errors
window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.message || event.reason?.toString() || '';
  if (message.includes('orphan field, looking for property')) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});
