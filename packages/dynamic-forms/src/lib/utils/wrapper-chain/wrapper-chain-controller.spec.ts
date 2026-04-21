import { describe, it, expect, beforeEach } from 'vitest';
import {
  ChangeDetectionStrategy,
  Component,
  EnvironmentInjector,
  Injector,
  Type,
  ViewContainerRef,
  input,
  runInInjectionContext,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { delay } from '@ng-forge/utils';
import {
  FieldWrapperContract,
  WRAPPER_COMPONENT_CACHE,
  WRAPPER_REGISTRY,
  WrapperConfig,
  WrapperTypeDefinition,
} from '../../models/wrapper-type';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { NoopLogger } from '../../providers/features/logger/noop-logger';
import { WrapperFieldInputs } from '../../wrappers/wrapper-field-inputs';
import { createWrapperChainController } from './wrapper-chain-controller';

@Component({
  selector: 'test-leaf-a',
  template: `<span class="leaf-a" [attr.data-label]="label()">A</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestLeafA {
  static instances = 0;
  readonly label = input<string>();
  constructor() {
    TestLeafA.instances++;
  }
}

@Component({
  selector: 'test-leaf-b',
  template: `<span class="leaf-b">B</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestLeafB {
  static instances = 0;
  constructor() {
    TestLeafB.instances++;
  }
}

@Component({
  selector: 'test-wrap-x',
  template: `<div class="wrap-x" [attr.data-tag]="tag()"><ng-container #fieldComponent></ng-container></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestWrapX implements FieldWrapperContract {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });
  readonly tag = input<string>();
  readonly fieldInputs = input<WrapperFieldInputs>();
}

@Component({
  selector: 'test-wrap-y',
  template: `<div class="wrap-y"><ng-container #fieldComponent></ng-container></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestWrapY implements FieldWrapperContract {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });
  readonly fieldInputs = input<WrapperFieldInputs>();
}

@Component({
  selector: 'test-host',
  template: `<div><ng-container #slot></ng-container></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestHostComponent {
  readonly slot = viewChild.required('slot', { read: ViewContainerRef });
}

function def(name: string, loader: () => Type<unknown> | Promise<Type<unknown>>): WrapperTypeDefinition {
  return {
    wrapperName: name,
    loadComponent: async () => {
      const r = await loader();
      return { default: r };
    },
  };
}

async function flush(): Promise<void> {
  // Several trips through the task queue give the toObservable effect +
  // async wrapper loader + forkJoin + subscribe callback time to settle.
  for (let i = 0; i < 4; i++) {
    await delay(0);
    TestBed.flushEffects();
  }
}

interface ControllerFixture {
  host: TestHostComponent;
  slot: ViewContainerRef;
  wrappers: WritableSignal<readonly WrapperConfig[]>;
  rebuildKey: WritableSignal<unknown>;
  gate: WritableSignal<boolean>;
  fieldInputs: WritableSignal<WrapperFieldInputs | undefined>;
  innermostCalls: number;
  lastInnermostSlot: ViewContainerRef | undefined;
  beforeRebuildCalls: number;
  destroy: () => void;
}

function setupController(
  options: { registry?: Map<string, WrapperTypeDefinition>; cache?: Map<string, Type<unknown>> } = {},
): ControllerFixture {
  const registry = options.registry ?? new Map<string, WrapperTypeDefinition>();
  const cache = options.cache ?? new Map<string, Type<unknown>>();

  TestBed.configureTestingModule({
    providers: [
      { provide: WRAPPER_REGISTRY, useValue: registry },
      { provide: WRAPPER_COMPONENT_CACHE, useValue: cache },
      { provide: DynamicFormLogger, useValue: new NoopLogger() },
    ],
  });

  const fixture = TestBed.createComponent(TestHostComponent);
  fixture.detectChanges();
  const host = fixture.componentInstance;
  const slot = host.slot();

  const wrappers = signal<readonly WrapperConfig[]>([]);
  const rebuildKey = signal<unknown>(TestLeafA);
  const gate = signal(true);
  const fieldInputs = signal<WrapperFieldInputs | undefined>(undefined);

  const injector = TestBed.inject(Injector);
  const envInjector = TestBed.inject(EnvironmentInjector);
  const slotSignal = signal(slot).asReadonly();
  const ref: ControllerFixture = {
    host,
    slot,
    wrappers,
    rebuildKey,
    gate,
    fieldInputs,
    innermostCalls: 0,
    lastInnermostSlot: undefined,
    beforeRebuildCalls: 0,
    destroy: () => fixture.destroy(),
  };

  runInInjectionContext(fixture.componentRef.injector, () => {
    createWrapperChainController({
      vcr: slotSignal,
      wrappers,
      gate,
      rebuildKey,
      fieldInputs,
      renderInnermost: (s) => {
        ref.innermostCalls++;
        ref.lastInnermostSlot = s;
        s.createComponent(rebuildKey() as Type<unknown>, { environmentInjector: envInjector, injector });
      },
      beforeRebuild: () => {
        ref.beforeRebuildCalls++;
      },
    });
  });

  return ref;
}

describe('createWrapperChainController', () => {
  beforeEach(() => {
    TestLeafA.instances = 0;
    TestLeafB.instances = 0;
  });

  it('renders once on initial mount when gate=true and no wrappers', async () => {
    const f = setupController();
    await flush();

    expect(f.innermostCalls).toBe(1);
    expect(TestLeafA.instances).toBe(1);
    f.destroy();
  });

  it('blocks the initial render when gate=false, renders once gate flips true', async () => {
    const f = setupController();
    f.gate.set(false);
    await flush();
    expect(f.innermostCalls).toBe(0);

    f.gate.set(true);
    await flush();
    expect(f.innermostCalls).toBe(1);
    f.destroy();
  });

  it('ignores a gate flicker after mount — does NOT rebuild', async () => {
    const f = setupController();
    await flush();
    expect(f.innermostCalls).toBe(1);

    f.gate.set(false);
    await flush();
    f.gate.set(true);
    await flush();

    expect(f.innermostCalls).toBe(1);
    expect(TestLeafA.instances).toBe(1);
    expect(f.beforeRebuildCalls).toBe(0);
    f.destroy();
  });

  it('accepts a viewChild.required signal as vcr — no race against post-init resolution', async () => {
    // Regresses the concern that toObservable(chainKey).subscribe() might fire
    // before a viewChild.required('slot') has resolved. The signal is read only
    // inside the subscribe callback, which runs via Angular's effect scheduler
    // after the first CD cycle — viewChild.required is resolved by then.
    const registry = new Map<string, WrapperTypeDefinition>();
    const cache = new Map<string, Type<unknown>>();
    TestBed.configureTestingModule({
      providers: [
        { provide: WRAPPER_REGISTRY, useValue: registry },
        { provide: WRAPPER_COMPONENT_CACHE, useValue: cache },
        { provide: DynamicFormLogger, useValue: new NoopLogger() },
      ],
    });
    const fixture = TestBed.createComponent(TestHostComponent);
    // NB: do NOT detectChanges() yet — viewChild is still unresolved here.
    const viewChildVcr = fixture.componentInstance.slot; // the raw Signal<ViewContainerRef>
    const wrappers = signal<readonly WrapperConfig[]>([]);
    const rebuildKey = signal<unknown>(TestLeafA);
    const envInjector = TestBed.inject(EnvironmentInjector);
    const injector = TestBed.inject(Injector);

    let innermostCalls = 0;
    runInInjectionContext(fixture.componentRef.injector, () => {
      createWrapperChainController({
        vcr: viewChildVcr,
        wrappers,
        rebuildKey,
        renderInnermost: (s) => {
          innermostCalls++;
          s.createComponent(TestLeafA, { environmentInjector: envInjector, injector });
        },
      });
    });
    // Now run CD — viewChild resolves, effect schedules, subscribe fires.
    fixture.detectChanges();
    await flush();

    expect(innermostCalls).toBe(1);
    expect(TestLeafA.instances).toBe(1);
    fixture.destroy();
  });

  it('rebuilds when rebuildKey changes to a different component class', async () => {
    const f = setupController();
    await flush();
    expect(TestLeafA.instances).toBe(1);

    f.rebuildKey.set(TestLeafB);
    await flush();

    expect(f.innermostCalls).toBe(2);
    expect(TestLeafB.instances).toBe(1);
    expect(f.beforeRebuildCalls).toBe(1);
    f.destroy();
  });

  it('rebuilds when wrappers change structurally (different count or type)', async () => {
    const registry = new Map<string, WrapperTypeDefinition>([['x', def('x', () => TestWrapX)]]);
    const cache = new Map<string, Type<unknown>>();
    const f = setupController({ registry, cache });
    await flush();
    expect(f.innermostCalls).toBe(1);

    f.wrappers.set([{ type: 'x' } as WrapperConfig]);
    await flush();

    expect(f.innermostCalls).toBe(2);
    expect(f.beforeRebuildCalls).toBe(1);
    f.destroy();
  });

  it('does NOT rebuild when wrappers emit a structurally identical array', async () => {
    const f = setupController();
    await flush();
    expect(f.innermostCalls).toBe(1);

    // Same contents, different array reference — isSameWrapperChain should dedupe
    f.wrappers.set([]);
    await flush();

    expect(f.innermostCalls).toBe(1);
    expect(f.beforeRebuildCalls).toBe(0);
    f.destroy();
  });

  it('cancels a pending async wrapper load when a newer emission arrives', async () => {
    // Slow loader that we resolve manually so we can interleave emissions.
    const slowLoad = new Subject<Type<unknown>>();
    const registry = new Map<string, WrapperTypeDefinition>([
      [
        'slow',
        {
          wrapperName: 'slow',
          loadComponent: () =>
            new Promise<Type<unknown>>((resolve) => {
              const sub = slowLoad.subscribe((v) => {
                resolve(v);
                sub.unsubscribe();
              });
            }),
        },
      ],
      ['y', def('y', () => TestWrapY)],
    ]);
    const cache = new Map<string, Type<unknown>>();
    const f = setupController({ registry, cache });
    await flush();
    expect(f.innermostCalls).toBe(1);

    // Start a rebuild that blocks on slow loader
    f.wrappers.set([{ type: 'slow' } as WrapperConfig]);
    await flush();
    // No new render yet — still waiting on slow loader
    expect(f.innermostCalls).toBe(1);

    // New emission arrives before slow load completes — switchMap cancels the
    // slow inner. The stale `slow` wrapper should NEVER mount.
    f.wrappers.set([{ type: 'y' } as WrapperConfig]);
    await flush();
    expect(f.innermostCalls).toBe(2);

    // Belatedly resolve the stale load — nothing should happen.
    const mountedBefore = f.innermostCalls;
    slowLoad.next(TestWrapX);
    slowLoad.complete();
    await flush();
    expect(f.innermostCalls).toBe(mountedBefore);

    f.destroy();
  });

  it('pushes fieldInputs to each mounted wrapper on subsequent changes', async () => {
    const registry = new Map<string, WrapperTypeDefinition>([['x', def('x', () => TestWrapX)]]);
    const cache = new Map<string, Type<unknown>>();
    const f = setupController({ registry, cache });
    f.wrappers.set([{ type: 'x' } as WrapperConfig]);
    await flush();

    // Change fieldInputs without changing the chain
    f.fieldInputs.set({ key: 'k1', label: 'one' } as WrapperFieldInputs);
    await flush();

    const wrapperEl = f.slot.element.nativeElement.parentElement?.querySelector('.wrap-x') as HTMLElement | null;
    expect(wrapperEl).toBeTruthy();

    // And the push-through survives another fieldInputs change
    f.fieldInputs.set({ key: 'k2', label: 'two' } as WrapperFieldInputs);
    await flush();

    expect(f.innermostCalls).toBe(1); // never rebuilt the chain
    expect(f.beforeRebuildCalls).toBe(0);
    f.destroy();
  });

  it('calls beforeRebuild right before clearing on a structural change', async () => {
    const registry = new Map<string, WrapperTypeDefinition>([
      ['x', def('x', () => TestWrapX)],
      ['y', def('y', () => TestWrapY)],
    ]);
    const cache = new Map<string, Type<unknown>>();
    let beforeRebuildCount = 0;
    const wrappers = signal<readonly WrapperConfig[]>([{ type: 'x' } as WrapperConfig]);
    const rebuildKey = signal<unknown>(TestLeafA);
    const gate = signal(true);

    TestBed.configureTestingModule({
      providers: [
        { provide: WRAPPER_REGISTRY, useValue: registry },
        { provide: WRAPPER_COMPONENT_CACHE, useValue: cache },
        { provide: DynamicFormLogger, useValue: new NoopLogger() },
      ],
    });
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const slot = fixture.componentInstance.slot();
    const injector = TestBed.inject(Injector);
    const envInjector = TestBed.inject(EnvironmentInjector);

    const slotSignal = signal(slot).asReadonly();
    runInInjectionContext(fixture.componentRef.injector, () => {
      createWrapperChainController({
        vcr: slotSignal,
        wrappers,
        gate,
        rebuildKey,
        renderInnermost: (s) => {
          s.createComponent(rebuildKey() as Type<unknown>, { environmentInjector: envInjector, injector });
        },
        beforeRebuild: () => {
          beforeRebuildCount++;
        },
      });
    });
    await flush();
    expect(beforeRebuildCount).toBe(0); // first mount doesn't fire beforeRebuild

    wrappers.set([{ type: 'y' } as WrapperConfig]);
    await flush();

    expect(beforeRebuildCount).toBe(1);
    fixture.destroy();
  });

  it('clears the outer VCR on destroy', async () => {
    const f = setupController();
    await flush();
    expect(f.slot.element.nativeElement.parentElement?.querySelectorAll('[class^="leaf"]').length).toBe(1);

    f.destroy();
    expect(f.slot.length).toBe(0);
  });
});
