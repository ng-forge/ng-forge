import { Component, input, signal, Signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { delay } from '@ng-forge/utils';
import { DynamicForm } from './dynamic-form.component';
import { BUILT_IN_FIELDS } from './providers/built-in-fields';
import { FieldViewportObserver } from './directives/df-field-outlet/field-viewport-observer.service';
import { FIELD_REGISTRY, FieldTypeDefinition, FormConfig } from '@ng-forge/dynamic-forms/internal';
import { valueFieldMapper } from '@ng-forge/dynamic-forms/integration';

const TEST_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: 'input',
    loadComponent: () => import('../../test-utils/src/harnesses/test-input.harness').then((m) => m.default),
    mapper: valueFieldMapper,
  },
];

/**
 * Drives visibility by hand instead of waiting on a real `IntersectionObserver`.
 * Every field in a test fixture sits in the viewport, so the real observer would
 * report everything visible and nothing would ever park — and asserting on real
 * intersection callbacks would trade determinism for no extra coverage. Real
 * scrolling is covered by the E2E layer.
 */
class FakeViewportObserver {
  readonly states = new Map<Element, WritableSignal<boolean>>();

  observe(el: Element): Signal<boolean> {
    const existing = this.states.get(el);
    if (existing) return existing.asReadonly();
    const state = signal(true);
    this.states.set(el, state);
    return state.asReadonly();
  }

  unobserve(el: Element): void {
    this.states.delete(el);
  }

  /** Scroll every tracked field out of (or back into) view. */
  setAllVisible(visible: boolean): void {
    for (const state of this.states.values()) state.set(visible);
  }

  /** Scroll just the field whose host element contains `input` out of view. */
  setVisibleFor(input: Element, visible: boolean): void {
    for (const [el, state] of this.states) {
      if (el.contains(input)) state.set(visible);
    }
  }
}

function flatConfig(count: number, options?: FormConfig['options']): FormConfig {
  return {
    fields: Array.from({ length: count }, (_, i) => ({ key: `f${i}`, type: 'input', label: `Field ${i}`, value: `v${i}` })),
    ...(options ? { options } : {}),
  } as FormConfig;
}

@Component({
  selector: 'field-parking-test-host',
  imports: [DynamicForm],
  template: `<form [dynamic-form]="config()" [(value)]="value"></form>`,
})
class TestHostComponent {
  config = input.required<FormConfig>();
  /** Writable so a test can push a model change and watch whether the DOM follows. */
  readonly value = signal<Record<string, unknown> | undefined>(undefined);
}

async function settle(fixture: ComponentFixture<unknown>, cycles = 3): Promise<void> {
  for (let i = 0; i < cycles; i++) {
    TestBed.flushEffects();
    fixture.detectChanges();
    await delay(0);
  }
  await fixture.whenStable();
  TestBed.flushEffects();
  fixture.detectChanges();
}

describe('Field parking', () => {
  let observer: FakeViewportObserver;

  const inputs = (fixture: ComponentFixture<TestHostComponent>): HTMLInputElement[] =>
    Array.from(fixture.nativeElement.querySelectorAll('input'));

  const createHost = async (config: FormConfig) => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentRef.setInput('config', config);
    await settle(fixture);
    return fixture;
  };

  beforeEach(() => {
    observer = new FakeViewportObserver();
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        {
          provide: FIELD_REGISTRY,
          useFactory: () => {
            const registry = new Map();
            BUILT_IN_FIELDS.forEach((t) => registry.set(t.name, t));
            TEST_FIELD_TYPES.forEach((t) => registry.set(t.name, t));
            return registry;
          },
        },
      ],
    });
    TestBed.overrideProvider(FieldViewportObserver, { useValue: observer });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('observes every rendered field', async () => {
    const fixture = await createHost(flatConfig(4, { fieldWindowing: { park: true } }));
    expect(observer.states.size).toBe(4);
    expect(inputs(fixture).length).toBe(4);
  });

  it('keeps the DOM of a field that scrolls out of view', async () => {
    const fixture = await createHost(flatConfig(4, { fieldWindowing: { park: true } }));

    observer.setAllVisible(false);
    await settle(fixture);

    // Parking is not unmounting — the inputs and their values are still there,
    // which is what keeps find-in-page, autofill and screen readers working.
    expect(inputs(fixture).length).toBe(4);
    expect(inputs(fixture).map((el) => el.value)).toEqual(['v0', 'v1', 'v2', 'v3']);
  });

  it('holds a model change out of a parked field DOM, then catches it up on return', async () => {
    const fixture = await createHost(flatConfig(2, { fieldWindowing: { park: true } }));
    const [first, second] = inputs(fixture);

    observer.setVisibleFor(second, false);
    await settle(fixture);

    // Drive the model from outside. The live field follows; the parked field's
    // view is out of change detection, so model → DOM cannot reach it yet.
    fixture.componentInstance.value.set({ f0: 'from model', f1: 'from model' });
    await settle(fixture);
    expect(first.value).toBe('from model');
    expect(second.value).toBe('v1');

    observer.setVisibleFor(second, true);
    await settle(fixture);
    expect(second.value).toBe('from model');
  });

  it('still writes a parked field own edits through to the form value', async () => {
    const fixture = await createHost(flatConfig(2, { fieldWindowing: { park: true } }));
    const [, second] = inputs(fixture);

    observer.setVisibleFor(second, false);
    await settle(fixture);

    // Angular binds `input` with a plain DOM listener, which is not view-scoped
    // and keeps firing while the view is detached. Without this, a field
    // autofilled while parked would silently lose its value. Asserted on the
    // form value, not the DOM — echoing back what the test just typed would
    // pass whether or not anything reached the model.
    second.value = 'typed while parked';
    second.dispatchEvent(new Event('input'));
    await settle(fixture);

    expect(fixture.componentInstance.value()?.['f1']).toBe('typed while parked');
  });

  it('never parks the focused field', async () => {
    const fixture = await createHost(flatConfig(2, { fieldWindowing: { park: true } }));
    const [, second] = inputs(fixture);
    second.focus();

    observer.setVisibleFor(second, false);
    await settle(fixture);

    // Scrolled away but still focused: freezing it would strand the caret and
    // break IME composition mid-word. Proven by a model change still landing,
    // which is what parking would have blocked.
    fixture.componentInstance.value.set({ f0: 'v0', f1: 'from model' });
    await settle(fixture);

    expect(document.activeElement).toBe(second);
    expect(second.value).toBe('from model');
  });

  it('leaves out-of-view fields live when the form turns parking off', async () => {
    const fixture = await createHost(flatConfig(2, { fieldWindowing: { park: false } }));
    const [, second] = inputs(fixture);

    observer.setVisibleFor(second, false);
    await settle(fixture);

    fixture.componentInstance.value.set({ f0: 'v0', f1: 'from model' });
    await settle(fixture);

    expect(second.value).toBe('from model');
  });
});
