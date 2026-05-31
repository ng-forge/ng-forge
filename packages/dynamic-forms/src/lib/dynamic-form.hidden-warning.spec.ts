import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { delay } from '@ng-forge/utils';
import { DynamicForm } from './dynamic-form.component';
import { SimpleTestUtils, TestFormConfig } from '../../testing/src/simple-test-utils';
import TestInputHarnessComponent from '../../testing/src/harnesses/test-input.harness';
import { FIELD_REGISTRY, FieldTypeDefinition } from '@ng-forge/dynamic-forms/internal';
import { valueFieldMapper } from '@ng-forge/dynamic-forms/integration';
import { BUILT_IN_FIELDS, BUILT_IN_WRAPPERS } from './providers/built-in-fields';
import { WRAPPER_REGISTRY } from '@ng-forge/dynamic-forms/internal';
import type { FieldDef } from '@ng-forge/dynamic-forms/internal';

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

  const waitForRender = async (fixture: ComponentFixture<unknown>): Promise<void> => {
    // Field components load via lazy `import()` — `whenStable()` alone doesn't await that.
    // Two short delays + flush cycles let the import + the post-load CD settle.
    await delay(10);
    fixture.detectChanges();
    TestBed.flushEffects();
    await delay(10);
    fixture.detectChanges();
    TestBed.flushEffects();
  };

  const harnessCount = (fixture: ComponentFixture<unknown>): number =>
    (fixture.nativeElement as HTMLElement).querySelectorAll('df-test-input').length;

  describe('static hidden: true', () => {
    it('does not emit any console.warn', async () => {
      const config: TestFormConfig = {
        fields: [
          { key: 'name', type: 'input', value: '' } as FieldDef<unknown>,
          { key: 'secret', type: 'input', value: 'x', hidden: true } as FieldDef<unknown>,
        ],
      };

      const { fixture } = SimpleTestUtils.createComponent(config);
      await waitForRender(fixture);

      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('removes the hidden field host from the DOM (not just attribute-hides it)', async () => {
      const config: TestFormConfig = {
        fields: [
          { key: 'name', type: 'input', value: '' } as FieldDef<unknown>,
          { key: 'secret', type: 'input', value: 'x', hidden: true } as FieldDef<unknown>,
        ],
      };

      const { fixture } = SimpleTestUtils.createComponent(config);
      await waitForRender(fixture);

      // Only one harness in the DOM — the hidden one is gone, not [attr.hidden]-hidden.
      expect(harnessCount(fixture)).toBe(1);
      expect((fixture.nativeElement as HTMLElement).querySelector('df-test-input[hidden]')).toBeNull();
    });
  });

  describe('dynamic hidden via logic', () => {
    it('does not emit any console.warn on initial render', async () => {
      const config: TestFormConfig = {
        fields: [
          { key: 'contactMethod', type: 'input', value: 'mail' } as FieldDef<unknown>,
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
          } as FieldDef<unknown>,
        ],
      };

      const { fixture } = SimpleTestUtils.createComponent(config);
      await waitForRender(fixture);

      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('removes the hidden field from the DOM and adds it back when the condition flips', async () => {
      const config: TestFormConfig = {
        fields: [
          { key: 'contactMethod', type: 'input', value: 'mail' } as FieldDef<unknown>,
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
          } as FieldDef<unknown>,
        ],
      };

      const { component, fixture } = SimpleTestUtils.createComponent<{ contactMethod: string; phone: string }>(config, {
        contactMethod: 'mail',
        phone: '',
      });
      await waitForRender(fixture);

      // Initially phone is hidden (contactMethod !== 'phone').
      expect(harnessCount(fixture)).toBe(1);

      // Flip the condition so phone becomes visible.
      component.value.set({ contactMethod: 'phone', phone: '' });
      await waitForRender(fixture);

      expect(harnessCount(fixture)).toBe(2);
      expect(warnSpy).not.toHaveBeenCalled();

      // Flip back — phone should leave the DOM again.
      component.value.set({ contactMethod: 'mail', phone: '' });
      await waitForRender(fixture);

      expect(harnessCount(fixture)).toBe(1);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('survives a visible → hidden → visible round trip without warning', async () => {
      const config: TestFormConfig = {
        fields: [
          { key: 'show', type: 'input', value: 'yes' } as FieldDef<unknown>,
          {
            key: 'detail',
            type: 'input',
            value: '',
            logic: [
              {
                type: 'hidden',
                condition: { type: 'fieldValue', fieldPath: 'show', operator: 'notEquals', value: 'yes' },
              },
            ],
          } as FieldDef<unknown>,
        ],
      };

      const { component, fixture } = SimpleTestUtils.createComponent<{ show: string; detail: string }>(config, {
        show: 'yes',
        detail: '',
      });
      await waitForRender(fixture);

      // visible
      expect(harnessCount(fixture)).toBe(2);

      // hidden
      component.value.set({ show: 'no', detail: '' });
      await waitForRender(fixture);
      expect(harnessCount(fixture)).toBe(1);

      // visible again
      component.value.set({ show: 'yes', detail: '' });
      await waitForRender(fixture);
      expect(harnessCount(fixture)).toBe(2);

      expect(warnSpy).not.toHaveBeenCalled();
    });
  });
});
