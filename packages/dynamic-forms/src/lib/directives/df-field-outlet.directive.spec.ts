import { describe, it, expect, beforeEach } from 'vitest';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EnvironmentInjector,
  Injector,
  input,
  signal,
  Signal,
  Type,
  ViewContainerRef,
  viewChild,
} from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { DfFieldOutlet } from './df-field-outlet.directive';
import { ResolvedField } from '../utils/resolve-field/resolve-field';
import {
  FieldWrapperContract,
  WRAPPER_AUTO_ASSOCIATIONS,
  WRAPPER_REGISTRY,
  WrapperConfig,
  WrapperTypeDefinition,
} from '../models/wrapper-type';
import { DEFAULT_WRAPPERS } from '../models/field-signal-context.token';
import { DynamicFormLogger } from '../providers/features/logger/logger.token';
import { NoopLogger } from '../providers/features/logger/noop-logger';
import { delay } from '@ng-forge/utils';

@Component({
  selector: 'test-leaf',
  template: `<span class="leaf" [attr.data-label]="label()">leaf</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestLeafComponent {
  readonly label = input<string>();
  static instances = 0;
  constructor() {
    TestLeafComponent.instances++;
  }
}

/** Component with a REQUIRED `key` input — used to regress NG0950 on re-render. */
@Component({
  selector: 'test-required-key',
  template: `<span class="required-key" [attr.data-key]="key()">{{ key() }}</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestRequiredKeyComponent {
  readonly key = input.required<string>();
}

@Component({
  selector: 'test-section',
  template: `<div class="section" [attr.data-title]="title()"><ng-container #fieldComponent></ng-container></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestSectionWrapper implements FieldWrapperContract {
  readonly fieldComponent = viewChild.required('fieldComponent', { read: ViewContainerRef });
  readonly title = input<string>();
}

@Component({
  imports: [DfFieldOutlet],
  template: `<ng-container *dfFieldOutlet="field()" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OutletHostComponent {
  readonly field = input.required<ResolvedField>();
}

function buildResolvedField(
  options: {
    key?: string;
    component?: Type<unknown>;
    wrappers?: readonly WrapperConfig[] | null;
    inputs?: Signal<Record<string, unknown>>;
    renderReady?: Signal<boolean>;
    injector: Injector;
  } = { injector: undefined as unknown as Injector },
): ResolvedField {
  const key = options.key ?? 'test';
  return {
    key,
    // Preserve `null` explicitly — `options.wrappers ?? undefined` would coerce null → undefined
    // and defeat the opt-out semantics we want to test.
    fieldDef: { key, type: 'input', wrappers: 'wrappers' in options ? options.wrappers : undefined },
    component: options.component ?? TestLeafComponent,
    injector: options.injector,
    inputs: options.inputs ?? signal({ label: key }),
    renderReady: options.renderReady ?? signal(true),
  };
}

describe('DfFieldOutlet', () => {
  let fixture: ComponentFixture<OutletHostComponent>;

  async function flush(): Promise<void> {
    // Chain rebuild schedules a microtask (Promise.resolve or firstValueFrom);
    // two delays give the explicitEffect + async load time to settle.
    await delay(0);
    fixture.detectChanges();
    TestBed.flushEffects();
    await delay(0);
    fixture.detectChanges();
    TestBed.flushEffects();
  }

  function setupAndResolve(field: (injector: EnvironmentInjector) => ResolvedField): void {
    const envInjector = TestBed.inject(EnvironmentInjector);
    fixture = TestBed.createComponent(OutletHostComponent);
    fixture.componentRef.setInput('field', field(envInjector));
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestLeafComponent.instances = 0;
    TestBed.configureTestingModule({
      imports: [OutletHostComponent],
      providers: [{ provide: DynamicFormLogger, useValue: new NoopLogger() }],
    });
  });

  it('renders the field component directly when no wrappers apply', async () => {
    setupAndResolve((envInjector) => buildResolvedField({ injector: envInjector }));
    await flush();

    const leaf = fixture.nativeElement.querySelector('.leaf');
    expect(leaf).toBeTruthy();
    expect(leaf.getAttribute('data-label')).toBe('test');
    expect(fixture.nativeElement.querySelector('.section')).toBeNull();
  });

  it('wraps the field with a section wrapper when one is configured', async () => {
    const sectionDef: WrapperTypeDefinition = {
      wrapperName: 'section',
      loadComponent: () => Promise.resolve({ default: TestSectionWrapper }),
    };
    TestBed.overrideProvider(WRAPPER_REGISTRY, { useValue: new Map([['section', sectionDef]]) });

    setupAndResolve((envInjector) =>
      buildResolvedField({
        wrappers: [{ type: 'section', title: 'Primary' }] as readonly WrapperConfig[],
        injector: envInjector,
      }),
    );
    await flush();

    const section = fixture.nativeElement.querySelector('.section');
    expect(section).toBeTruthy();
    expect(section.getAttribute('data-title')).toBe('Primary');
    expect(section.querySelector('.leaf')).toBeTruthy();
  });

  it('applies form-level defaultWrappers to fields that do not opt out', async () => {
    const sectionDef: WrapperTypeDefinition = {
      wrapperName: 'section',
      loadComponent: () => Promise.resolve({ default: TestSectionWrapper }),
    };
    TestBed.overrideProvider(WRAPPER_REGISTRY, { useValue: new Map([['section', sectionDef]]) });
    TestBed.overrideProvider(DEFAULT_WRAPPERS, {
      useValue: computed(() => [{ type: 'section', title: 'Default' }] as readonly WrapperConfig[]),
    });

    setupAndResolve((envInjector) => buildResolvedField({ injector: envInjector }));
    await flush();

    expect(fixture.nativeElement.querySelector('.section')?.getAttribute('data-title')).toBe('Default');
  });

  it('wrappers: null on the field opts out of defaults + auto-associations', async () => {
    const sectionDef: WrapperTypeDefinition = {
      wrapperName: 'section',
      loadComponent: () => Promise.resolve({ default: TestSectionWrapper }),
    };
    TestBed.overrideProvider(WRAPPER_REGISTRY, { useValue: new Map([['section', sectionDef]]) });
    TestBed.overrideProvider(DEFAULT_WRAPPERS, {
      useValue: computed(() => [{ type: 'section', title: 'Default' }] as readonly WrapperConfig[]),
    });
    TestBed.overrideProvider(WRAPPER_AUTO_ASSOCIATIONS, {
      useValue: new Map([['input', [{ type: 'section' }] as readonly WrapperConfig[]]]),
    });

    setupAndResolve((envInjector) => buildResolvedField({ wrappers: null, injector: envInjector }));
    await flush();

    expect(fixture.nativeElement.querySelector('.section')).toBeNull();
    expect(fixture.nativeElement.querySelector('.leaf')).toBeTruthy();
  });

  it('does NOT rebuild the chain when the ResolvedField reference changes but component + effective wrappers do not', async () => {
    const envInjector = TestBed.inject(EnvironmentInjector);
    fixture = TestBed.createComponent(OutletHostComponent);
    const initial = buildResolvedField({ injector: envInjector });
    fixture.componentRef.setInput('field', initial);
    fixture.detectChanges();
    await flush();

    expect(TestLeafComponent.instances).toBe(1);

    // Swap in a new ResolvedField object pointing to the SAME component and
    // SAME (reference-identical) wrappers. Memoed wrappers should
    // suppress the rebuild.
    const sameWrappers = initial.fieldDef.wrappers;
    const swapped: ResolvedField = {
      ...initial,
      fieldDef: { ...initial.fieldDef, wrappers: sameWrappers },
      inputs: signal({ label: 'test' }),
    };
    fixture.componentRef.setInput('field', swapped);
    fixture.detectChanges();
    await flush();

    expect(TestLeafComponent.instances).toBe(1);
  });

  it('sets required inputs on the new fieldRef when the component class changes but input values repeat', async () => {
    // Regresses an NG0950 seen during rapid config swaps: the new fieldRef was
    // created but its required `key` input was skipped because the ref-identity
    // cache in the outlet still held the previous rawInputs where `key` had the
    // same string value. Host bindings then threw before setInput ran.
    const envInjector = TestBed.inject(EnvironmentInjector);
    fixture = TestBed.createComponent(OutletHostComponent);

    const sharedKey = 'shared';
    const initial = buildResolvedField({
      key: sharedKey,
      component: TestLeafComponent,
      inputs: signal({ key: sharedKey, label: 'A' }),
      injector: envInjector,
    });
    fixture.componentRef.setInput('field', initial);
    fixture.detectChanges();
    await flush();

    // Swap to a DIFFERENT component class but keep `key` value identical.
    const swapped: ResolvedField = buildResolvedField({
      key: sharedKey,
      component: TestRequiredKeyComponent,
      inputs: signal({ key: sharedKey, label: 'A' }),
      injector: envInjector,
    });
    fixture.componentRef.setInput('field', swapped);
    fixture.detectChanges();
    await flush();

    const requiredKeyEl = fixture.nativeElement.querySelector('.required-key');
    expect(requiredKeyEl).toBeTruthy();
    expect(requiredKeyEl.getAttribute('data-key')).toBe(sharedKey);
  });

  it('survives a renderReady flicker without tearing down the mounted component', async () => {
    // Regresses the "renderReady flicker" limitation: when the mapper
    // transiently flips renderReady `true → false → true` (e.g. during a
    // form-level reconfiguration) the outlet used to destroy and recreate
    // the field component, discarding focus / caret state. The controller
    // now keeps the mounted chain alive on gate flickers.
    const envInjector = TestBed.inject(EnvironmentInjector);
    fixture = TestBed.createComponent(OutletHostComponent);
    const readySignal = signal(true);
    fixture.componentRef.setInput('field', buildResolvedField({ renderReady: readySignal, injector: envInjector }));
    fixture.detectChanges();
    await flush();

    expect(TestLeafComponent.instances).toBe(1);

    // Flicker: false, then back to true, in quick succession.
    readySignal.set(false);
    fixture.detectChanges();
    await flush();
    readySignal.set(true);
    fixture.detectChanges();
    await flush();

    // No rebuild — same component instance, still mounted.
    expect(TestLeafComponent.instances).toBe(1);
    expect(fixture.nativeElement.querySelector('.leaf')).toBeTruthy();
  });

  it('destroys the field + wrappers when the host is destroyed (vcr.clear cascade)', async () => {
    const sectionDef: WrapperTypeDefinition = {
      wrapperName: 'section',
      loadComponent: () => Promise.resolve({ default: TestSectionWrapper }),
    };
    TestBed.overrideProvider(WRAPPER_REGISTRY, { useValue: new Map([['section', sectionDef]]) });

    setupAndResolve((envInjector) =>
      buildResolvedField({
        wrappers: [{ type: 'section' }] as readonly WrapperConfig[],
        injector: envInjector,
      }),
    );
    await flush();

    expect(fixture.nativeElement.querySelector('.leaf')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.section')).toBeTruthy();

    fixture.destroy();

    expect(fixture.nativeElement.querySelector('.leaf')).toBeNull();
    expect(fixture.nativeElement.querySelector('.section')).toBeNull();
  });
});
