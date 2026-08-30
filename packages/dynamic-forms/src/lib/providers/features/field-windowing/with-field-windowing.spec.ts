import { Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { withFieldWindowing } from './with-field-windowing';
import { FIELD_WINDOWING, FieldParkingConfig } from './field-windowing.token';

/** Asking for windowing turns parking on with it, unless the caller opts out. */
const PARK_ON: FieldParkingConfig = { enabled: true, margin: '100%' };
/** Without the feature, parking stays off — it changes rendering behaviour. */
const PARK_OFF: FieldParkingConfig = { enabled: false, margin: '100%' };

describe('withFieldWindowing', () => {
  it('creates a field-windowing feature', () => {
    const feature = withFieldWindowing();
    expect(feature.ɵkind).toBe('field-windowing');
    expect(feature.ɵproviders.length).toBe(1);
  });

  it('enables windowing with default eager count and placeholder height', () => {
    TestBed.configureTestingModule({ providers: [...withFieldWindowing().ɵproviders] });
    runInInjectionContext(TestBed.inject(Injector), () => {
      expect(TestBed.inject(FIELD_WINDOWING)).toEqual({ enabled: true, eager: 12, placeholderHeight: '4rem', park: PARK_ON });
    });
  });

  it('overrides eager and placeholderHeight', () => {
    TestBed.configureTestingModule({ providers: [...withFieldWindowing({ eager: 5, placeholderHeight: '80px' }).ɵproviders] });
    expect(TestBed.inject(FIELD_WINDOWING)).toEqual({ enabled: true, eager: 5, placeholderHeight: '80px', park: PARK_ON });
  });

  it('clamps negative eager to 0', () => {
    TestBed.configureTestingModule({ providers: [...withFieldWindowing({ eager: -3 }).ɵproviders] });
    expect(TestBed.inject(FIELD_WINDOWING).eager).toBe(0);
  });

  it('floors fractional eager', () => {
    TestBed.configureTestingModule({ providers: [...withFieldWindowing({ eager: 4.9 }).ɵproviders] });
    expect(TestBed.inject(FIELD_WINDOWING).eager).toBe(4);
  });

  it('defaults to disabled, and to no parking, when the feature is not provided', () => {
    expect(TestBed.inject(FIELD_WINDOWING)).toEqual({ enabled: false, eager: 12, placeholderHeight: '4rem', park: PARK_OFF });
  });

  it('turns parking on along with windowing', () => {
    TestBed.configureTestingModule({ providers: [...withFieldWindowing().ɵproviders] });
    expect(TestBed.inject(FIELD_WINDOWING).park).toEqual(PARK_ON);
  });
});
