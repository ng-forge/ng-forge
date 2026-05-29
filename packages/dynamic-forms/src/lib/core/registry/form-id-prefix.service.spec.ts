import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createEnvironmentInjector, ElementRef, EnvironmentInjector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormIdPrefixService } from './form-id-prefix.service';
import { DynamicFormInstanceRegistry } from './dynamic-form-instance-registry.service';
import { FORM_OPTIONS } from '../../models/field-signal-context.token';
import { FormOptions } from '../../models/form-config';

describe('FormIdPrefixService', () => {
  let parent: EnvironmentInjector;
  let registry: DynamicFormInstanceRegistry;
  const created: HTMLElement[] = [];

  function host(): HTMLElement {
    const el = document.createElement('div');
    el.textContent = 'x';
    document.body.appendChild(el);
    created.push(el);
    return el;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
    parent = TestBed.inject(EnvironmentInjector);
    registry = TestBed.inject(DynamicFormInstanceRegistry);
  });

  afterEach(() => {
    // Child injectors are torn down by TestBed's per-test reset; only clean the DOM here.
    created.forEach((el) => el.remove());
    created.length = 0;
  });

  function mountForm(options?: FormOptions, el: HTMLElement = host()) {
    const opts = signal<FormOptions | undefined>(options);
    const env = createEnvironmentInjector(
      [FormIdPrefixService, { provide: ElementRef, useValue: new ElementRef(el) }, { provide: FORM_OPTIONS, useValue: opts }],
      parent,
    );
    return { svc: env.get(FormIdPrefixService), env, options: opts, el };
  }

  it('registers with the root registry on construction', () => {
    mountForm();
    expect(registry.multiplePresent()).toBe(false);
    mountForm();
    expect(registry.multiplePresent()).toBe(true);
  });

  it('a lone visible form has no prefix', () => {
    expect(mountForm().svc.prefix()).toBe('');
  });

  it('an explicit idPrefix wins, trimmed and sanitized', () => {
    expect(mountForm({ idPrefix: 'billing' }).svc.prefix()).toBe('billing');
    expect(mountForm({ idPrefix: '  shipping  ' }).svc.prefix()).toBe('shipping');
    expect(mountForm({ idPrefix: 'my form.1' }).svc.prefix()).toBe('my_form_1');
  });

  it('auto-prefixes both forms while two are visibly mounted', () => {
    const a = mountForm();
    const b = mountForm();
    expect(a.svc.prefix()).toMatch(/^df-\d+$/);
    expect(b.svc.prefix()).toMatch(/^df-\d+$/);
    expect(a.svc.prefix()).not.toBe(b.svc.prefix());
  });

  it('reverts to unprefixed when the sibling unmounts (no latch)', () => {
    const a = mountForm();
    const b = mountForm();
    expect(a.svc.prefix()).toMatch(/^df-\d+$/);
    b.env.destroy();
    expect(a.svc.prefix()).toBe('');
  });

  it('explicit prefix wins even when other forms are mounted', () => {
    const explicit = mountForm({ idPrefix: 'shipping' });
    mountForm();
    expect(explicit.svc.prefix()).toBe('shipping');
  });

  it('stops counting a sibling once it becomes hidden (ResizeObserver), like an ionic cached page', async () => {
    const a = mountForm();
    const sibling = host();
    mountForm(undefined, sibling);

    // Two visible forms → both scoped.
    expect(a.svc.prefix()).toMatch(/^df-\d+$/);

    // Hide the sibling (as ion-router-outlet does to a cached page): its box
    // collapses, the ResizeObserver fires, and `a` is the only visible form again.
    // Poll rather than wait a fixed delay — resolves as soon as the observer lands.
    sibling.style.display = 'none';
    await vi.waitFor(() => expect(a.svc.prefix()).toBe(''));
  });
});
