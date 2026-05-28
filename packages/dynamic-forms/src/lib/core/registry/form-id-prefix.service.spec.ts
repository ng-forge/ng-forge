import { beforeEach, describe, expect, it } from 'vitest';
import { createEnvironmentInjector, EnvironmentInjector, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormIdPrefixService } from './form-id-prefix.service';
import { DynamicFormInstanceRegistry } from './dynamic-form-instance-registry.service';
import { FORM_OPTIONS } from '../../models/field-signal-context.token';
import { FormOptions } from '../../models/form-config';

describe('FormIdPrefixService', () => {
  let parent: EnvironmentInjector;
  let registry: DynamicFormInstanceRegistry;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    parent = TestBed.inject(EnvironmentInjector);
    registry = TestBed.inject(DynamicFormInstanceRegistry);
  });

  /** Spins up one form's prefix service in its own destroyable injector. */
  function mountForm(options?: FormOptions): {
    svc: FormIdPrefixService;
    env: EnvironmentInjector;
    options: WritableSignal<FormOptions | undefined>;
  } {
    const opts = signal<FormOptions | undefined>(options);
    const env = createEnvironmentInjector([FormIdPrefixService, { provide: FORM_OPTIONS, useValue: opts }], parent);
    const svc = env.get(FormIdPrefixService);
    return { svc, env, options: opts };
  }

  it('registers with the root registry on construction', () => {
    expect(registry.count()).toBe(0);
    mountForm();
    expect(registry.count()).toBe(1);
  });

  it('a lone form has no prefix (ids stay clean)', () => {
    const { svc } = mountForm();
    TestBed.flushEffects();
    expect(svc.prefix()).toBe('');
  });

  it('an explicit idPrefix wins even for a single form', () => {
    const { svc } = mountForm({ idPrefix: 'billing' });
    TestBed.flushEffects();
    expect(svc.prefix()).toBe('billing');
  });

  it('trims whitespace from an explicit idPrefix', () => {
    const { svc } = mountForm({ idPrefix: '  billing  ' });
    TestBed.flushEffects();
    expect(svc.prefix()).toBe('billing');
  });

  it('treats a whitespace-only idPrefix as unset', () => {
    const { svc } = mountForm({ idPrefix: '   ' });
    TestBed.flushEffects();
    expect(svc.prefix()).toBe('');
  });

  it('sanitizes id-breaking characters in an explicit prefix', () => {
    const { svc } = mountForm({ idPrefix: 'my form.1' });
    TestBed.flushEffects();
    expect(svc.prefix()).toBe('my_form_1');
  });

  it('auto-prefixes both forms once a second one mounts', () => {
    const a = mountForm();
    const b = mountForm();
    TestBed.flushEffects();

    expect(a.svc.prefix()).toMatch(/^df-\d+$/);
    expect(b.svc.prefix()).toMatch(/^df-\d+$/);
    expect(a.svc.prefix()).not.toBe(b.svc.prefix());
  });

  it('latches the auto-prefix — it does not revert when the sibling unmounts', () => {
    const a = mountForm();
    TestBed.flushEffects();
    expect(a.svc.prefix()).toBe(''); // alone so far

    const b = mountForm(); // sibling appears
    TestBed.flushEffects();
    const latched = a.svc.prefix();
    expect(latched).toMatch(/^df-\d+$/);

    b.env.destroy(); // sibling unmounts
    TestBed.flushEffects();
    expect(a.svc.prefix()).toBe(latched); // stays put — no churn
  });

  it('explicit prefix continues to win even after auto-prefixing would kick in', () => {
    const explicit = mountForm({ idPrefix: 'shipping' });
    mountForm(); // second form → multiplePresent
    TestBed.flushEffects();
    expect(explicit.svc.prefix()).toBe('shipping');
  });

  it('unregisters from the root registry when the form is destroyed', () => {
    const { env } = mountForm();
    expect(registry.count()).toBe(1);
    env.destroy();
    expect(registry.count()).toBe(0);
  });
});
