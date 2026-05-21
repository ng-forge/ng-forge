import { TestBed } from '@angular/core/testing';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { afterEach, describe, expect, it } from 'vitest';
import { MATERIAL_FIELD_TYPES } from '../config/material-field-config';
import { MATERIAL_CONFIG } from '../models/material-config.token';
import type { MaterialConfig } from '../models/material-config';
import { withMaterialFields } from './material-providers';

describe('withMaterialFields', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('returns field types plus the auto-included addons feature when no config provided', () => {
    const fields = withMaterialFields();

    // Field-type defs come first, the addons feature is appended for
    // out-of-the-box `mat-icon` / `mat-button` support.
    expect(fields.slice(0, MATERIAL_FIELD_TYPES.length)).toEqual(MATERIAL_FIELD_TYPES);
    const addonsFeature = fields.find((f) => 'ɵkind' in f && f.ɵkind === 'addons');
    expect(addonsFeature).toBeDefined();
  });

  it('adds material-config feature when config is provided', () => {
    const config = {
      appearance: 'outline',
      subscriptSizing: 'fixed',
    } satisfies MaterialConfig;

    const fields = withMaterialFields(config);
    const feature = fields.find((f) => 'ɵkind' in f && f.ɵkind === 'material-config');

    expect(feature).toBeDefined();
    expect(feature.ɵproviders).toContainEqual({
      provide: MATERIAL_CONFIG,
      useValue: config,
    });
  });

  it('registers MATERIAL_CONFIG when spread into provideDynamicForm', () => {
    const config = {
      appearance: 'outline',
      subscriptSizing: 'dynamic',
    } satisfies MaterialConfig;

    TestBed.configureTestingModule({
      providers: [provideDynamicForm(...withMaterialFields(config))],
    });

    expect(TestBed.inject(MATERIAL_CONFIG)).toEqual(config);
  });
});
