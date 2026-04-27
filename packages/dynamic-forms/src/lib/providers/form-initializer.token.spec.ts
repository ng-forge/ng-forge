import { describe, expect, it, vi } from 'vitest';
import { Injector, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FORM_INITIALIZER } from './form-initializer.token';

describe('FORM_INITIALIZER', () => {
  it('returns null when no feature provider registers via the multi-token', () => {
    const injector = TestBed.configureTestingModule({}).inject(Injector);

    const value = runInInjectionContext(injector, () => injector.get(FORM_INITIALIZER, null, { optional: true }));

    expect(value).toBeNull();
  });

  it('constructs each multi-provider entry exactly once when the array is resolved', () => {
    const orchestratorAFactory = vi.fn(() => ({ kind: 'A' as const }));
    const orchestratorBFactory = vi.fn(() => ({ kind: 'B' as const }));

    const injector = TestBed.configureTestingModule({
      providers: [
        { provide: 'ORCHESTRATOR_A', useFactory: orchestratorAFactory },
        { provide: 'ORCHESTRATOR_B', useFactory: orchestratorBFactory },
        { provide: FORM_INITIALIZER, useExisting: 'ORCHESTRATOR_A', multi: true },
        { provide: FORM_INITIALIZER, useExisting: 'ORCHESTRATOR_B', multi: true },
      ],
    }).inject(Injector);

    // Resolve once — the side effect is each useExisting target being constructed.
    const initializers = injector.get(FORM_INITIALIZER);

    expect(orchestratorAFactory).toHaveBeenCalledTimes(1);
    expect(orchestratorBFactory).toHaveBeenCalledTimes(1);
    expect(initializers).toHaveLength(2);
    expect(initializers).toEqual([{ kind: 'A' }, { kind: 'B' }]);
  });

  it('is idempotent — repeat resolves do not re-construct entries', () => {
    const factory = vi.fn(() => ({}));

    const injector = TestBed.configureTestingModule({
      providers: [
        { provide: 'ONCE', useFactory: factory },
        { provide: FORM_INITIALIZER, useExisting: 'ONCE', multi: true },
      ],
    }).inject(Injector);

    injector.get(FORM_INITIALIZER);
    injector.get(FORM_INITIALIZER);
    injector.get(FORM_INITIALIZER);

    expect(factory).toHaveBeenCalledTimes(1);
  });
});
