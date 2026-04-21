import { TestBed } from '@angular/core/testing';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { afterEach, describe, expect, it } from 'vitest';
import { IONIC_FIELD_TYPES } from '../config/ionic-field-config';
import { IONIC_CONFIG } from '../models/ionic-config.token';
import type { IonicConfig } from '../models/ionic-config';
import { withIonicFields } from './ionic-providers';

describe('withIonicFields', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('returns original field types when no config provided', () => {
    const fields = withIonicFields();

    expect(fields).toBe(IONIC_FIELD_TYPES);
  });

  it('adds ionic-config feature when config is provided', () => {
    const config = {
      fill: 'outline',
      labelPlacement: 'floating',
      color: 'primary',
    } satisfies IonicConfig;

    const fields = withIonicFields(config);
    const feature = fields.find((f) => 'ɵkind' in f && f.ɵkind === 'ionic-config');

    expect(feature).toBeDefined();
    expect(feature.ɵproviders).toContainEqual({
      provide: IONIC_CONFIG,
      useValue: config,
    });
  });

  it('registers IONIC_CONFIG when spread into provideDynamicForm', () => {
    const config = {
      fill: 'outline',
      labelPlacement: 'floating',
      color: 'primary',
    } satisfies IonicConfig;

    TestBed.configureTestingModule({
      providers: [provideDynamicForm(...withIonicFields(config))],
    });

    expect(TestBed.inject(IONIC_CONFIG)).toEqual(config);
  });
});
