import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { delay } from '@ng-forge/utils';
import { DynamicForm } from './dynamic-form.component';
import { SimpleTestUtils } from '../../testing/src/simple-test-utils';
import TestInputHarnessComponent from '../../testing/src/harnesses/test-input.harness';
import { FIELD_REGISTRY, FieldTypeDefinition } from './models/field-type';
import { valueFieldMapper } from '@ng-forge/dynamic-forms/integration';
import { BUILT_IN_FIELDS, BUILT_IN_WRAPPERS } from './providers/built-in-fields';
import { WRAPPER_REGISTRY } from './models/wrapper-type';
import { FormConfig } from './models/form-config';

const TEST_FIELD_TYPES: FieldTypeDefinition[] = [
  {
    name: 'input',
    loadComponent: () => import('../../testing/src/harnesses/test-input.harness').then((m) => m.default),
    mapper: valueFieldMapper,
  },
];

describe('DynamicForm — hidden field rendering (NG01916)', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
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

  afterEach(() => {
    warnSpy.mockRestore();
    TestBed.resetTestingModule();
  });

  const waitForRender = async (fixture: { detectChanges: () => void }): Promise<void> => {
    await delay(10);
    fixture.detectChanges();
    TestBed.flushEffects();
    await delay(10);
    fixture.detectChanges();
    TestBed.flushEffects();
  };

  it('does not emit any console.warn when a field has static hidden: true', async () => {
    const config = {
      fields: [
        { key: 'name', type: 'input', value: '' },
        { key: 'secret', type: 'input', value: 'x', hidden: true },
      ],
    } as unknown as FormConfig;

    const { fixture } = SimpleTestUtils.createComponent(config);
    await waitForRender(fixture);

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('does not emit any console.warn when a field becomes hidden via logic', async () => {
    const config = {
      fields: [
        { key: 'contactMethod', type: 'input', value: 'mail' },
        {
          key: 'phone',
          type: 'input',
          value: '',
          logic: [
            {
              type: 'hidden',
              condition: { type: 'fieldValue', fieldPath: 'contactMethod', operator: 'notEquals', value: 'phone' },
            },
          ],
        },
      ],
    } as unknown as FormConfig;

    const { fixture } = SimpleTestUtils.createComponent(config);
    await waitForRender(fixture);

    expect(warnSpy).not.toHaveBeenCalled();
  });
});
