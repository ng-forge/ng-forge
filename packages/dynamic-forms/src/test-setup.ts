import '@angular/compiler';
import '@analogjs/vitest-angular/setup-snapshots';

import { NgModule, provideZonelessChangeDetection, untracked } from '@angular/core';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { getTestBed } from '@angular/core/testing';
// Reset TestBed after each test (critical for browser mode where TestBed is shared)
import { afterEach } from 'vitest';
import { DynamicFormLogger } from './lib/providers/features/logger/logger.token';
import { ConsoleLogger } from './lib/providers/features/logger/console-logger';

@NgModule({
  providers: [
    provideZonelessChangeDetection(),
    // Provide console logger for all tests to see diagnostic output
    { provide: DynamicFormLogger, useValue: new ConsoleLogger() },
  ],
})
export class ZonelessTestModule {}

// Only initialize test environment once (critical for browser mode where setup runs for each file)
declare global {
  interface Window {
    __TEST_ENV_INITIALIZED__?: boolean;
  }
}

// Use Vitest's environment detection
// Browser mode is detected by checking if we're actually in a browser environment
// with vitest-specific browser globals, not just window existing
const isBrowserMode =
  typeof window !== 'undefined' &&
  typeof navigator !== 'undefined' &&
  typeof document !== 'undefined' &&
  // Check for vitest browser-specific global
  (import.meta.env?.MODE === 'test' || typeof (globalThis as Record<string, unknown>).__vitest_browser__ !== 'undefined');

if (isBrowserMode && typeof window !== 'undefined') {
  // In browser mode with parallel file execution, only initialize once
  if (!window.__TEST_ENV_INITIALIZED__) {
    window.__TEST_ENV_INITIALIZED__ = true;
    try {
      getTestBed().initTestEnvironment([BrowserTestingModule, ZonelessTestModule], platformBrowserTesting());
    } catch (e) {
      // Ignore "already initialized" errors from race conditions
      if (!(e instanceof Error && e.message.includes('already been called'))) {
        throw e;
      }
    }
  }
} else {
  // Node/jsdom mode - always initialize
  getTestBed().initTestEnvironment([BrowserTestingModule, ZonelessTestModule], platformBrowserTesting());
}

afterEach(() => {
  // Use untracked() to prevent orphan field errors during form cleanup
  // This ensures signal tracking is disabled during TestBed reset
  untracked(() => getTestBed().resetTestingModule());
});
