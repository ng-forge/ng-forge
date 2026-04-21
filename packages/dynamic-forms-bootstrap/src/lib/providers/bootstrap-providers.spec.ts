import { TestBed } from '@angular/core/testing';
import { provideDynamicForm } from '@ng-forge/dynamic-forms';
import { afterEach, describe, expect, it } from 'vitest';
import { BOOTSTRAP_FIELD_TYPES } from '../config/bootstrap-field-config';
import { BOOTSTRAP_CONFIG } from '../models/bootstrap-config.token';
import type { BootstrapConfig } from '../models/bootstrap-config';
import { withBootstrapFields } from './bootstrap-providers';

describe('withBootstrapFields', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('returns original field types when no config provided', () => {
    const fields = withBootstrapFields();

    expect(fields).toBe(BOOTSTRAP_FIELD_TYPES);
  });

  it('adds bootstrap-config feature when config is provided', () => {
    const config = {
      floatingLabel: true,
      size: 'lg',
      variant: 'primary',
    } satisfies BootstrapConfig;

    const fields = withBootstrapFields(config);
    const feature = fields.find((f) => 'ɵkind' in f && f.ɵkind === 'bootstrap-config');

    expect(feature).toBeDefined();
    expect(feature.ɵproviders).toContainEqual({
      provide: BOOTSTRAP_CONFIG,
      useValue: config,
    });
  });

  it('registers BOOTSTRAP_CONFIG when spread into provideDynamicForm', () => {
    const config = {
      floatingLabel: true,
      size: 'lg',
      variant: 'primary',
    } satisfies BootstrapConfig;

    TestBed.configureTestingModule({
      providers: [provideDynamicForm(...withBootstrapFields(config))],
    });

    expect(TestBed.inject(BOOTSTRAP_CONFIG)).toEqual(config);
  });
});
