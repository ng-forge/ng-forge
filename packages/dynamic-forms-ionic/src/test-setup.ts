import '@angular/compiler';
import '@analogjs/vitest-angular/setup-snapshots';

import { NgModule, provideZonelessChangeDetection, untracked } from '@angular/core';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { getTestBed } from '@angular/core/testing';
import { DynamicFormLogger } from '@ng-forge/dynamic-forms';
import { afterEach } from 'vitest';

class NoopLogger {
  debug(): void {
    /* noop */
  }
  info(): void {
    /* noop */
  }
  warn(): void {
    /* noop */
  }
  error(): void {
    /* noop */
  }
}

@NgModule({
  providers: [provideZonelessChangeDetection(), { provide: DynamicFormLogger, useValue: new NoopLogger() }],
})
export class ZonelessTestModule {}

declare global {
  interface Window {
    __TEST_ENV_INITIALIZED__?: boolean;
  }
}

// Browser-mode setup runs once per file — guard reinitialization across parallel files.
const isBrowserMode =
  typeof window !== 'undefined' &&
  typeof navigator !== 'undefined' &&
  typeof document !== 'undefined' &&
  (import.meta.env?.MODE === 'test' || typeof (globalThis as Record<string, unknown>).__vitest_browser__ !== 'undefined');

if (isBrowserMode && typeof window !== 'undefined') {
  if (!window.__TEST_ENV_INITIALIZED__) {
    window.__TEST_ENV_INITIALIZED__ = true;
    try {
      getTestBed().initTestEnvironment([BrowserTestingModule, ZonelessTestModule], platformBrowserTesting());
    } catch (e) {
      if (!(e instanceof Error && e.message.includes('already been called'))) {
        throw e;
      }
    }
  }
} else {
  getTestBed().initTestEnvironment([BrowserTestingModule, ZonelessTestModule], platformBrowserTesting());
}

afterEach(() => {
  // untracked() prevents orphan field errors during form cleanup
  untracked(() => getTestBed().resetTestingModule());
});
