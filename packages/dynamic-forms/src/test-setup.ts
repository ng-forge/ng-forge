import '@angular/compiler';
import '@analogjs/vitest-angular/setup-snapshots';

import { NgModule, provideZonelessChangeDetection, untracked } from '@angular/core';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { getTestBed } from '@angular/core/testing';
// Reset TestBed after each test (critical for browser mode where TestBed is shared)
import { afterEach } from 'vitest';

@NgModule({
  providers: [provideZonelessChangeDetection()],
})
export class ZonelessTestModule {}

// Only initialize test environment once (critical for browser mode where setup runs for each file)
declare global {
  interface Window {
    __TEST_ENV_INITIALIZED__?: boolean;
  }
}

// Use Vitest's environment detection
const isBrowserMode = process.env.VITEST_BROWSER === 'true';

if (isBrowserMode && typeof window !== 'undefined') {
  if (!window.__TEST_ENV_INITIALIZED__) {
    window.__TEST_ENV_INITIALIZED__ = true;
    getTestBed().initTestEnvironment([BrowserTestingModule, ZonelessTestModule], platformBrowserTesting());
  }
} else {
  getTestBed().initTestEnvironment([BrowserTestingModule, ZonelessTestModule], platformBrowserTesting());
}

afterEach(() => {
  // Use untracked() to prevent orphan field errors during form cleanup
  // This ensures signal tracking is disabled during TestBed reset
  untracked(() => getTestBed().resetTestingModule());
});
