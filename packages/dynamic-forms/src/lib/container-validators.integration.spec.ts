import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { delay } from '@ng-forge/utils';
import { DynamicForm } from './dynamic-form.component';
import { SimpleTestUtils, TestFormConfig } from '../../test-utils/src/simple-test-utils';
import TestInputHarnessComponent from '../../test-utils/src/harnesses/test-input.harness';
import { FIELD_REGISTRY, FieldTypeDefinition } from '@ng-forge/dynamic-forms/internal';
import { valueFieldMapper } from '@ng-forge/dynamic-forms/integration';
import { BUILT_IN_FIELDS, BUILT_IN_WRAPPERS } from './providers/built-in-fields';
import { WRAPPER_REGISTRY } from '@ng-forge/dynamic-forms/internal';
import type { FieldDef } from '@ng-forge/dynamic-forms/internal';

const TEST_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: 'input',
    loadComponent: () => import('../../test-utils/src/harnesses/test-input.harness').then((m) => m.default),
    mapper: valueFieldMapper,
  },
];

/**
 * End-to-end coverage for issue #568: a `validators` entry on a `group` /
 * `array` must gate form validity AND surface its message, which for a
 * container means through the auto-attached `container-errors` wrapper.
 */
describe('DynamicForm — container-level validators', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicForm, TestInputHarnessComponent],
      providers: [
        {
          provide: FIELD_REGISTRY,
          useFactory: () => {
            const registry = new Map();
            BUILT_IN_FIELDS.forEach((fieldType) => registry.set(fieldType.name, fieldType));
            TEST_FIELD_TYPES.forEach((fieldType) => registry.set(fieldType.name, fieldType));
            return registry;
          },
        },
        {
          provide: WRAPPER_REGISTRY,
          useFactory: () => {
            const registry = new Map();
            BUILT_IN_WRAPPERS.forEach((wrapperType) => registry.set(wrapperType.wrapperName, wrapperType));
            return registry;
          },
        },
      ],
    }).compileComponents();
  });

  afterEach(() => TestBed.resetTestingModule());

  const waitForRender = async (fixture: ComponentFixture<unknown>): Promise<void> => {
    // Field + wrapper components load via lazy `import()`; give the chain a few
    // flush cycles to settle (mirrors dynamic-form.hidden-warning.spec).
    for (let i = 0; i < 4; i++) {
      await delay(10);
      fixture.detectChanges();
      TestBed.flushEffects();
    }
  };

  const errorTexts = (fixture: ComponentFixture<unknown>): string[] =>
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.df-container-error')).map((el) => el.textContent?.trim() ?? '');

  /** Marks every rendered control touched, which propagates touched up to the container. */
  const touchAll = (fixture: ComponentFixture<unknown>): void => {
    (fixture.nativeElement as HTMLElement).querySelectorAll('input').forEach((input) => {
      input.dispatchEvent(new Event('blur'));
    });
  };

  const groupConfig = (dateFrom: string, dateTo: string): TestFormConfig => ({
    fields: [
      {
        key: 'period',
        type: 'group',
        fields: [
          { key: 'dateFrom', type: 'input', value: dateFrom },
          { key: 'dateTo', type: 'input', value: dateTo },
        ],
        validators: [
          {
            type: 'custom',
            fn: (ctx) => {
              const v = ctx.value() as { dateFrom?: string; dateTo?: string };
              return v?.dateFrom && v?.dateTo && v.dateTo < v.dateFrom ? { kind: 'dateOrder' } : null;
            },
          },
        ],
        validationMessages: { dateOrder: 'The end must not be before the start.' },
      } as unknown as FieldDef<unknown>,
    ],
  });

  it('renders the container message once the group is touched and invalid', async () => {
    const { fixture } = SimpleTestUtils.createComponent(groupConfig('2026-02-01', '2026-01-01'));
    await waitForRender(fixture);

    touchAll(fixture);
    await waitForRender(fixture);

    expect(errorTexts(fixture)).toEqual(['The end must not be before the start.']);
  });

  it('renders no container message when the group satisfies the rule', async () => {
    const { fixture } = SimpleTestUtils.createComponent(groupConfig('2026-01-01', '2026-02-01'));
    await waitForRender(fixture);

    touchAll(fixture);
    await waitForRender(fixture);

    expect(errorTexts(fixture)).toEqual([]);
  });

  it('does not attach the wrapper to a container without validators', async () => {
    const config: TestFormConfig = {
      fields: [
        {
          key: 'period',
          type: 'group',
          fields: [{ key: 'dateFrom', type: 'input', value: '' }],
        } as unknown as FieldDef<unknown>,
      ],
    };

    const { fixture } = SimpleTestUtils.createComponent(config);
    await waitForRender(fixture);

    expect((fixture.nativeElement as HTMLElement).querySelector('df-container-errors-wrapper')).toBeNull();
  });

  it('renders the container message for an array-level rule', async () => {
    const config: TestFormConfig = {
      fields: [
        {
          key: 'periods',
          type: 'array',
          fields: [
            [
              { key: 'from', type: 'input', value: '2026-01-02T10:00' },
              { key: 'to', type: 'input', value: '2026-01-02T09:00' },
            ],
          ],
          validators: [
            {
              type: 'custom',
              fn: (ctx) => {
                const rows = (ctx.value() as { from?: string; to?: string }[]) ?? [];
                return rows.some((r) => r?.from && r?.to && r.to < r.from) ? { kind: 'periodOrder' } : null;
              },
            },
          ],
          validationMessages: { periodOrder: 'Every period must end after it starts.' },
        } as unknown as FieldDef<unknown>,
      ],
    };

    const { fixture } = SimpleTestUtils.createComponent(config);
    await waitForRender(fixture);

    touchAll(fixture);
    await waitForRender(fixture);

    expect(errorTexts(fixture)).toEqual(['Every period must end after it starts.']);
  });
});
