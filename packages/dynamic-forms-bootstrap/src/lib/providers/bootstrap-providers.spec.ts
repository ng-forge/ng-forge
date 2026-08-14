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

  it('returns field types + the auto-included addons feature when no config provided', () => {
    const fields = withBootstrapFields();

    // Field types come first; the addons feature and the container-errors
    // wrapper are appended after them.
    expect(fields.slice(0, BOOTSTRAP_FIELD_TYPES.length)).toEqual(BOOTSTRAP_FIELD_TYPES);
    const addonsFeature = fields.find((f) => 'ɵkind' in f && f.ɵkind === 'addons');
    expect(addonsFeature).toBeDefined();
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

  it('registers a container-errors wrapper that overrides the core default', () => {
    const wrapper = withBootstrapFields().find((f) => 'wrapperName' in f && f.wrapperName === 'container-errors');

    expect(wrapper).toBeDefined();
  });

  it('loads the Bootstrap container-errors component', async () => {
    const wrapper = withBootstrapFields().find((f) => 'wrapperName' in f && f.wrapperName === 'container-errors');

    const loaded = await wrapper.loadComponent();

    expect(loaded.default ?? loaded).toBeDefined();
  });
});
