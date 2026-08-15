import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { firstValueFrom, race, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { DynamicForm } from '../../dynamic-form.component';
import { FIELD_REGISTRY, FieldTypeDefinition } from '@ng-forge/dynamic-forms/internal';
import { BUILT_IN_FIELDS } from '../../providers/built-in-fields';
import { valueFieldMapper } from '@ng-forge/dynamic-forms/integration';
import { FormConfig } from '@ng-forge/dynamic-forms/internal';
import { delay } from '@ng-forge/utils';

// Configs are cast because `input` is registered at runtime below, not in the compile-time registry.

const TEST_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: 'input',
    loadComponent: () => import('../../../../test-utils/src/harnesses/test-input.harness').then((m) => m.default),
    mapper: valueFieldMapper,
  },
];

async function settle(fixture: ComponentFixture<DynamicForm>, timeoutMs = 200): Promise<void> {
  fixture.detectChanges();
  TestBed.flushEffects();
  await firstValueFrom(race(fixture.componentInstance.initialized$.pipe(map(() => true)), timer(timeoutMs).pipe(map(() => false))));
  for (let i = 0; i < 3; i++) {
    TestBed.flushEffects();
    fixture.detectChanges();
    await delay(0);
  }
  await fixture.whenStable();
  TestBed.flushEffects();
  fixture.detectChanges();
}

function gatedConfig(): FormConfig {
  return {
    options: { initialPage: { index: 2, validate: true } },
    fields: [
      { key: 'p1', type: 'page', fields: [{ key: 'a', type: 'input', label: 'A', required: true }] },
      { key: 'p2', type: 'page', fields: [{ key: 'b', type: 'input', label: 'B', required: true }] },
      { key: 'p3', type: 'page', fields: [{ key: 'c', type: 'input', label: 'C' }] },
    ],
  } as unknown as FormConfig;
}

function activePage(fixture: ComponentFixture<DynamicForm>): number {
  const host = fixture.nativeElement.querySelector('.df-page-orchestrator');
  return Number(host?.getAttribute('data-current-page') ?? -1);
}

// Resolves once at mount; depending on validity would let later changes yank the user.
describe('gated initialPage resolves at mount', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicForm],
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
    }).compileComponents();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('does not re-resolve when values arrive after mount', async () => {
    const fixture = TestBed.createComponent(DynamicForm);
    fixture.componentRef.setInput('dynamic-form', gatedConfig());
    fixture.componentRef.setInput('value', {}); // empty at mount
    await settle(fixture);

    const atMount = activePage(fixture);

    // Values arrive later, as a second request would deliver them.
    fixture.componentRef.setInput('value', { a: 'x', b: 'y' });
    await settle(fixture, 600);

    // Gated against an empty form at mount, so it stops on the first invalid page and stays.
    expect(atMount).toBe(0);
    expect(activePage(fixture)).toBe(0);
  });

  it('reaches the target when values are present at mount', async () => {
    const fixture = TestBed.createComponent(DynamicForm);
    fixture.componentRef.setInput('dynamic-form', gatedConfig());
    fixture.componentRef.setInput('value', { a: 'x', b: 'y' });
    await settle(fixture);

    expect(activePage(fixture)).toBe(2);
  });
});
