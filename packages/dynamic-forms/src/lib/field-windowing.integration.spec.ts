import { Component, input } from '@angular/core';
import { ComponentFixture, DeferBlockBehavior, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { delay } from '@ng-forge/utils';
import { DynamicForm } from './dynamic-form.component';
import { BUILT_IN_FIELDS } from './providers/built-in-fields';
import { FIELD_WINDOWING, FieldWindowingConfig } from './providers/features/field-windowing/field-windowing.token';
import { FIELD_REGISTRY, FieldTypeDefinition, FormConfig } from '@ng-forge/dynamic-forms/internal';
import { valueFieldMapper } from '@ng-forge/dynamic-forms/integration';

const TEST_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: 'input',
    loadComponent: () => import('../../test-utils/src/harnesses/test-input.harness').then((m) => m.default),
    mapper: valueFieldMapper,
  },
];

/** A flat form of `count` plain inputs, each defaulting to its own key as the value. */
function flatConfig(count: number, options?: FormConfig['options']): FormConfig {
  return {
    fields: Array.from({ length: count }, (_, i) => ({ key: `f${i}`, type: 'input', label: `Field ${i}`, value: `v${i}` })),
    ...(options ? { options } : {}),
  } as FormConfig;
}

/**
 * Host wrapping the form in a tall spacer so the form starts below the fold —
 * lets windowed placeholders start out-of-viewport without depending on the
 * exact headless browser window size.
 */
@Component({
  selector: 'field-windowing-test-host',
  imports: [DynamicForm],
  template: `<div style="height: 30000px"></div>
    <form [dynamic-form]="config()"></form>`,
})
class TestHostComponent {
  config = input.required<FormConfig>();
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

function createHost(config: FormConfig): ComponentFixture<TestHostComponent> {
  const fixture = TestBed.createComponent(TestHostComponent);
  fixture.componentRef.setInput('config', config);
  return fixture;
}

function mountedInputCount(fixture: ComponentFixture<TestHostComponent>): number {
  return fixture.nativeElement.querySelectorAll('input').length;
}

function placeholderCount(fixture: ComponentFixture<TestHostComponent>): number {
  return fixture.nativeElement.querySelectorAll('.df-field-placeholder').length;
}

describe('Field windowing (progressive field mounting)', () => {
  beforeEach(() => {
    // Window scroll position is real browser state shared across tests in this
    // file (not reset by TestBed) — a prior test's scrollIntoView() otherwise
    // leaks into the next test's initial-viewport assertions.
    window.scrollTo(0, 0);
    TestBed.configureTestingModule({
      deferBlockBehavior: DeferBlockBehavior.Playthrough,
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
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('mounts all fields and renders no placeholders when windowing is disabled (default)', async () => {
    const fixture = createHost(flatConfig(40));
    await settle(fixture, 4);

    expect(mountedInputCount(fixture)).toBe(40);
    expect(placeholderCount(fixture)).toBe(0);
  });

  it('mounts only the eager window when windowing is enabled globally, with placeholders for the rest', async () => {
    TestBed.overrideProvider(FIELD_WINDOWING, {
      useValue: { enabled: true, eager: 5, placeholderHeight: '80px' } satisfies FieldWindowingConfig,
    });

    const fixture = createHost(flatConfig(40));
    await settle(fixture, 4);
    // Give the IntersectionObserver a turn to deliver its initial entries.
    await delay(100);
    await settle(fixture, 2);

    const mounted = mountedInputCount(fixture);
    expect(mounted).toBeGreaterThanOrEqual(5);
    expect(mounted).toBeLessThan(40);
    expect(placeholderCount(fixture)).toBe(40 - mounted);
  });

  it('mounts the remaining fields once the last placeholder is scrolled into view', async () => {
    TestBed.overrideProvider(FIELD_WINDOWING, {
      useValue: { enabled: true, eager: 5, placeholderHeight: '80px' } satisfies FieldWindowingConfig,
    });

    const fixture = createHost(flatConfig(40));
    await settle(fixture, 4);
    await delay(100);
    await settle(fixture, 2);

    const before = mountedInputCount(fixture);
    expect(before).toBeLessThan(40);

    const lastPlaceholder = fixture.nativeElement.querySelector('[data-field-key="f39"].df-field-placeholder');
    expect(lastPlaceholder).toBeTruthy();
    lastPlaceholder.scrollIntoView();

    // Poll for the IntersectionObserver callback + defer mount to settle (up to ~2s).
    const deadline = Date.now() + 2000;
    let after = before;
    while (Date.now() < deadline) {
      await delay(50);
      await settle(fixture, 1);
      after = mountedInputCount(fixture);
      if (fixture.nativeElement.querySelector('input[id="f39"], [data-testid="f39"] input')) break;
      if (after > before) break;
    }

    expect(after).toBeGreaterThan(before);
  });

  it('FormOptions.fieldWindowing: false forces a fully-eager render even when the global feature is enabled', async () => {
    TestBed.overrideProvider(FIELD_WINDOWING, {
      useValue: { enabled: true, eager: 5, placeholderHeight: '80px' } satisfies FieldWindowingConfig,
    });

    const fixture = createHost(flatConfig(40, { fieldWindowing: false }));
    await settle(fixture, 4);

    expect(mountedInputCount(fixture)).toBe(40);
    expect(placeholderCount(fixture)).toBe(0);
  });

  it('FormOptions.fieldWindowing: { eager: 0 } enables windowing per-form with no global feature', async () => {
    const fixture = createHost(flatConfig(10, { fieldWindowing: { eager: 0 } }));
    await settle(fixture, 4);
    await delay(100);
    await settle(fixture, 2);

    const mounted = mountedInputCount(fixture);
    expect(mounted).toBeLessThan(10);
    expect(placeholderCount(fixture)).toBe(10 - mounted);
  });

  it('keeps unmounted fields participating in the form value at their default', async () => {
    TestBed.overrideProvider(FIELD_WINDOWING, {
      useValue: { enabled: true, eager: 5, placeholderHeight: '80px' } satisfies FieldWindowingConfig,
    });

    const fixture = createHost(flatConfig(40));
    await settle(fixture, 4);
    await delay(100);
    await settle(fixture, 2);

    expect(mountedInputCount(fixture)).toBeLessThan(40);

    const dynamicForm = fixture.debugElement.query((de) => de.componentInstance instanceof DynamicForm).componentInstance as DynamicForm;
    const value = dynamicForm.formValue() as Record<string, unknown>;

    for (let i = 0; i < 40; i++) {
      expect(value[`f${i}`]).toBe(`v${i}`);
    }
  });
});
