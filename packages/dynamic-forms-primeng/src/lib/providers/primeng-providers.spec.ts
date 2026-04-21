import { TestBed } from '@angular/core/testing';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { afterEach, describe, expect, it } from 'vitest';
import { PRIMENG_FIELD_TYPES } from '../config/primeng-field-config';
import { PRIMENG_CONFIG } from '../models/primeng-config.token';
import type { PrimeNGConfig } from '../models/primeng-config';
import { withPrimeNGFields } from './primeng-providers';

describe('withPrimeNGFields', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('returns original field types when no config provided', () => {
    const fields = withPrimeNGFields();

    expect(fields).toBe(PRIMENG_FIELD_TYPES);
  });

  it('adds primeng-config feature when config is provided', () => {
    const config = {
      size: 'large',
      variant: 'filled',
      severity: 'primary',
    } satisfies PrimeNGConfig;

    const fields = withPrimeNGFields(config);
    const feature = fields.find((f) => 'ɵkind' in f && f.ɵkind === 'primeng-config');

    expect(feature).toBeDefined();
    expect(feature.ɵproviders).toContainEqual({
      provide: PRIMENG_CONFIG,
      useValue: config,
    });
  });

  it('registers PRIMENG_CONFIG when spread into provideDynamicForm', () => {
    const config = {
      size: 'large',
      variant: 'filled',
      severity: 'primary',
    } satisfies PrimeNGConfig;

    TestBed.configureTestingModule({
      providers: [provideDynamicForm(...withPrimeNGFields(config))],
    });

    expect(TestBed.inject(PRIMENG_CONFIG)).toEqual(config);
  });
});
