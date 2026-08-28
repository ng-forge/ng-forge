import { Injector, runInInjectionContext, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  FIELD_REGISTRY,
  FieldDef,
  FieldTypeDefinition,
  FormConfig,
  WRAPPER_COMPONENT_CACHE,
  WRAPPER_COMPONENT_LOAD_CACHE,
  WRAPPER_REGISTRY,
} from '@ng-forge/dynamic-forms/internal';
import { COMPONENT_CACHE } from '../inject-field-registry/inject-field-registry';
import { injectFormComponentPreloader } from './preload-form-components';

class StubComponent {}

/** Resolves after the preloader's fire-and-forget promises have settled. */
const flush = () => new Promise((r) => setTimeout(r, 0));

describe('injectFormComponentPreloader', () => {
  let loadInput: ReturnType<typeof vi.fn>;
  let loadTextarea: ReturnType<typeof vi.fn>;
  let loadAdd: ReturnType<typeof vi.fn>;
  let loadRemove: ReturnType<typeof vi.fn>;
  let loadWrapper: ReturnType<typeof vi.fn>;

  const preloaderFor = (config: FormConfig) => {
    const injector = TestBed.inject(Injector);
    const preload = runInInjectionContext(injector, () => injectFormComponentPreloader());
    preload.preloadConfig(config);
  };

  beforeEach(() => {
    loadInput = vi.fn().mockResolvedValue({ default: StubComponent });
    loadTextarea = vi.fn().mockResolvedValue({ default: StubComponent });
    loadAdd = vi.fn().mockResolvedValue({ default: StubComponent });
    loadRemove = vi.fn().mockResolvedValue({ default: StubComponent });
    loadWrapper = vi.fn().mockResolvedValue({ default: StubComponent });

    const fields = new Map<string, FieldTypeDefinition>([
      ['input', { name: 'input', loadComponent: loadInput } as FieldTypeDefinition],
      ['textarea', { name: 'textarea', loadComponent: loadTextarea } as FieldTypeDefinition],
      ['add-array-item', { name: 'add-array-item', loadComponent: loadAdd } as FieldTypeDefinition],
      ['remove-array-item', { name: 'remove-array-item', loadComponent: loadRemove } as FieldTypeDefinition],
    ]);
    const wrappers = new Map([['css', { name: 'css', loadComponent: loadWrapper }]]);

    TestBed.configureTestingModule({
      providers: [
        { provide: FIELD_REGISTRY, useValue: fields },
        { provide: WRAPPER_REGISTRY, useValue: wrappers },
        { provide: COMPONENT_CACHE, useValue: new Map<string, Type<unknown>>() },
        { provide: WRAPPER_COMPONENT_CACHE, useValue: new Map<string, Type<unknown>>() },
        { provide: WRAPPER_COMPONENT_LOAD_CACHE, useValue: new Map<string, Promise<Type<unknown> | undefined>>() },
      ],
    });
  });

  it('warms the field component cache for every type the config names', async () => {
    preloaderFor({ fields: [{ key: 'a', type: 'input' }] } as FormConfig);
    await flush();

    expect(loadInput).toHaveBeenCalled();
    expect(TestBed.inject(COMPONENT_CACHE).get('input')).toBe(StubComponent);
  });

  it('loads each type once even when many fields share it', async () => {
    preloaderFor({
      fields: [
        { key: 'a', type: 'input' },
        { key: 'b', type: 'input' },
        { key: 'c', type: 'input' },
      ],
    } as FormConfig);
    await flush();

    // The point of preloading is to collapse a waterfall, not to trade it for a
    // burst of duplicate imports.
    expect(loadInput).toHaveBeenCalledTimes(1);
  });

  it('warms wrapper components named by the selected fields', async () => {
    preloaderFor({
      fields: [{ key: 'a', type: 'input', wrappers: [{ type: 'css' }] }],
    } as FormConfig);
    await flush();

    expect(loadWrapper).toHaveBeenCalledTimes(1);
    expect(TestBed.inject(WRAPPER_COMPONENT_CACHE).get('css')).toBe(StubComponent);
  });

  it('does not walk the same config more than once', () => {
    const injector = TestBed.inject(Injector);
    const preload = runInInjectionContext(injector, () => injectFormComponentPreloader());
    const fields = [{ key: 'a', type: 'input' }];
    const readFields = vi.fn(() => fields);
    const config = {
      get fields() {
        return readFields();
      },
    } as unknown as FormConfig;

    preload.preloadConfig(config);
    preload.preloadConfig(config);

    expect(readFields).toHaveBeenCalledTimes(1);
  });

  it('reaches field types nested inside containers', async () => {
    preloaderFor({ fields: [{ key: 'g', type: 'group', fields: [{ key: 'a', type: 'input' }] }] } as unknown as FormConfig);
    await flush();

    // A container's children are exactly the fields whose chunks would otherwise
    // be discovered last, so missing them would leave the waterfall in place.
    expect(loadInput).toHaveBeenCalled();
  });

  it('reaches field types inside an array item template', async () => {
    preloaderFor({ fields: [{ key: 'arr', type: 'array', fields: [[{ key: 'a', type: 'input' }]] }] } as unknown as FormConfig);
    await flush();

    expect(loadInput).toHaveBeenCalled();
  });

  it('leaves paged configs to the page orchestrator', async () => {
    preloaderFor({
      fields: [
        { key: 'first', type: 'page', fields: [{ key: 'a', type: 'input' }] },
        { key: 'later', type: 'page', fields: [{ key: 'b', type: 'textarea' }] },
      ],
      options: { pagePreloadWindow: 0 },
    } as unknown as FormConfig);
    await flush();

    expect(loadInput).not.toHaveBeenCalled();
    expect(loadTextarea).not.toHaveBeenCalled();
  });

  it('preloads only the page fields selected by the orchestrator', async () => {
    const injector = TestBed.inject(Injector);
    const preload = runInInjectionContext(injector, () => injectFormComponentPreloader());
    preload.preloadFields([{ key: 'first', type: 'page', fields: [{ key: 'a', type: 'input' }] } as unknown as FieldDef<unknown>]);
    await flush();

    expect(loadInput).toHaveBeenCalledTimes(1);
    expect(loadTextarea).not.toHaveBeenCalled();
  });

  it('does not walk the same page definition more than once', () => {
    const injector = TestBed.inject(Injector);
    const preload = runInInjectionContext(injector, () => injectFormComponentPreloader());
    const readChildren = vi.fn(() => [{ key: 'a', type: 'input' }]);
    const page = {
      key: 'first',
      type: 'page',
      get fields() {
        return readChildren();
      },
    } as unknown as FieldDef<unknown>;

    preload.preloadFields([page]);
    const readsAfterFirstWalk = readChildren.mock.calls.length;
    preload.preloadFields([page]);

    expect(readChildren).toHaveBeenCalledTimes(readsAfterFirstWalk);
  });

  it('preloads a simplified array template and its generated actions', async () => {
    preloaderFor({
      fields: [{ key: 'tags', type: 'array', template: { key: 'tag', type: 'input' }, value: ['one'] }],
    } as unknown as FormConfig);
    await flush();

    expect(loadInput).toHaveBeenCalledTimes(1);
    expect(loadAdd).toHaveBeenCalledTimes(1);
    expect(loadRemove).toHaveBeenCalledTimes(1);
  });

  it('skips a type that is already cached', async () => {
    TestBed.inject(COMPONENT_CACHE).set('input', StubComponent);

    preloaderFor({ fields: [{ key: 'a', type: 'input' }] } as FormConfig);
    await flush();

    expect(loadInput).not.toHaveBeenCalled();
  });

  it('stays silent when a type is not registered', async () => {
    // Preloading is a head start, not a validation step. The normal resolution
    // path owns error reporting; throwing here would turn an optimisation into
    // a new failure mode.
    preloaderFor({ fields: [{ key: 'a', type: 'nope' }] } as FormConfig);
    await expect(flush()).resolves.toBeUndefined();
  });

  it('survives a loader that rejects', async () => {
    loadInput.mockRejectedValue(new Error('chunk 404'));

    preloaderFor({ fields: [{ key: 'a', type: 'input' }] } as FormConfig);
    await expect(flush()).resolves.toBeUndefined();
    expect(TestBed.inject(COMPONENT_CACHE).has('input')).toBe(false);
  });

  it('does nothing for an empty config', async () => {
    preloaderFor({ fields: [] } as FormConfig);
    await flush();

    expect(loadInput).not.toHaveBeenCalled();
    expect(loadWrapper).not.toHaveBeenCalled();
  });
});
