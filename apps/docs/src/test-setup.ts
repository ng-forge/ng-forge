import '@angular/compiler';

import { provideZonelessChangeDetection, untracked } from '@angular/core';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { getTestBed } from '@angular/core/testing';
import { afterEach } from 'vitest';

getTestBed().initTestEnvironment(
  [
    BrowserTestingModule,
    {
      ngModule: BrowserTestingModule,
      providers: [provideZonelessChangeDetection()],
    },
  ],
  platformBrowserTesting(),
);

afterEach(() => {
  untracked(() => getTestBed().resetTestingModule());
});
