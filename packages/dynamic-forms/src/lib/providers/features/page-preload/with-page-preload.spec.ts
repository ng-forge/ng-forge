import { Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { withPagePreload } from './with-page-preload';
import { PAGE_PRELOAD_WINDOW } from './page-preload.token';

describe('withPagePreload', () => {
  it('creates a page-preload feature', () => {
    const feature = withPagePreload(2);
    expect(feature.ɵkind).toBe('page-preload');
    expect(feature.ɵproviders.length).toBe(1);
  });

  it('provides the resolved window through PAGE_PRELOAD_WINDOW', () => {
    TestBed.configureTestingModule({ providers: [...withPagePreload(3).ɵproviders] });
    runInInjectionContext(TestBed.inject(Injector), () => {
      expect(TestBed.inject(PAGE_PRELOAD_WINDOW)).toBe(3);
    });
  });

  it('clamps negative values to 0', () => {
    TestBed.configureTestingModule({ providers: [...withPagePreload(-5).ɵproviders] });
    expect(TestBed.inject(PAGE_PRELOAD_WINDOW)).toBe(0);
  });

  it('floors fractional values', () => {
    TestBed.configureTestingModule({ providers: [...withPagePreload(2.9).ɵproviders] });
    expect(TestBed.inject(PAGE_PRELOAD_WINDOW)).toBe(2);
  });

  it('defaults to 1 when the feature is not provided', () => {
    expect(TestBed.inject(PAGE_PRELOAD_WINDOW)).toBe(1);
  });
});
