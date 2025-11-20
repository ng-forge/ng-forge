import '@angular/compiler';
import '@analogjs/vitest-angular/setup-snapshots';

import { NgModule, provideZonelessChangeDetection } from '@angular/core';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { getTestBed } from '@angular/core/testing';

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

if (!window.__TEST_ENV_INITIALIZED__) {
  window.__TEST_ENV_INITIALIZED__ = true;
  getTestBed().initTestEnvironment([BrowserTestingModule, ZonelessTestModule], platformBrowserTesting());
}

// Reset TestBed after each test (critical for browser mode where TestBed is shared)
import { afterEach } from 'vitest';
afterEach(() => {
  getTestBed().resetTestingModule();
});
