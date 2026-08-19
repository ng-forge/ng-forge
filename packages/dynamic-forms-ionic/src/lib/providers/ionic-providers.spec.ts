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

  it('returns original field types plus the addons feature when no config provided', () => {
    const fields = withIonicFields();

    // First N entries are the IONIC_FIELD_TYPES; the trailing entries are the
    // auto-included `withIonicAddons()` feature and the field-errors wrapper.
    expect(fields.slice(0, IONIC_FIELD_TYPES.length)).toEqual([...IONIC_FIELD_TYPES]);
    const addonsFeature = fields.find((f) => 'ɵkind' in f && f.ɵkind === 'addons');
    expect(addonsFeature).toBeDefined();
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

  it('registers a field-errors wrapper that overrides the core default', () => {
    const wrapper = withIonicFields().find((f) => 'wrapperName' in f && f.wrapperName === 'field-errors');

    expect(wrapper).toBeDefined();
  });

  it('loads the Ionic field-errors component', async () => {
    const wrapper = withIonicFields().find((f) => 'wrapperName' in f && f.wrapperName === 'field-errors');

    const loaded = await wrapper.loadComponent();

    expect(loaded.default ?? loaded).toBeDefined();
  });

  it('declares rendersFieldErrors so the built-in default is not appended alongside it', () => {
    const wrapper = withIonicFields().find((f) => 'wrapperName' in f && f.wrapperName === 'field-errors');

    expect(wrapper.rendersFieldErrors).toBe(true);
  });
});
