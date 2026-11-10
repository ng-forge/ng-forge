import { Component, input, signal } from '@angular/core';
import { ComponentFixture, DeferBlockBehavior, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { delay } from '@ng-forge/utils';
import { DynamicForm } from './dynamic-form.component';
import { DfPlaceholder } from './directives/df-placeholder/df-placeholder.directive';
import { BUILT_IN_FIELDS } from './providers/built-in-fields';
import { FIELD_WINDOWING, FieldWindowingConfig } from './providers/features/field-windowing/field-windowing.token';
import { FIELD_REGISTRY, FieldTypeDefinition, FormConfig } from '@ng-forge/dynamic-forms/internal';
import { valueFieldMapper } from '@ng-forge/dynamic-forms/integration';

// input + textarea both render via the same test harness — placeholder tests
// never mount the real component (the fields stay windowed), only its type matters.
const TEST_FIELD_TYPES: FieldTypeDefinition[] = ['input', 'textarea'].map((name) => ({
  name,
  loadComponent: () => import('../../test-utils/src/harnesses/test-input.harness').then((m) => m.default),
  mapper: valueFieldMapper,
}));

// eager: 2 → f0/f1 mount; bio (textarea), plain (input), special (input) are all
// windowed and, below the 30000px spacer, stay as placeholders.
const PAGED_CONFIG: FormConfig = {
  fields: [
    {
      key: 'page1',
      type: 'page',
      fields: [
        { key: 'f0', type: 'input', value: 'a' },
        { key: 'f1', type: 'input', value: 'b' },
        { key: 'bio', type: 'textarea', label: 'Biography', value: '' },
        { key: 'plain', type: 'input', label: 'Plain', value: '' },
      ],
    },
    { key: 'page2', type: 'page', fields: [{ key: 'last', type: 'input', value: '' }] },
  ],
} as FormConfig;

const CONFIG: FormConfig = {
  fields: [
    { key: 'f0', type: 'input', value: 'a' },
    { key: 'f1', type: 'input', value: 'b' },
    { key: 'bio', type: 'textarea', label: 'Biography', value: '' },
    { key: 'plain', type: 'input', label: 'Plain', value: '' },
    { key: 'special', type: 'input', label: 'Special', value: '' },
    ...Array.from({ length: 5 }, (_, i) => ({ key: `p${i}`, type: 'input', value: '' })),
  ],
} as FormConfig;

@Component({
  selector: 'placeholder-test-host',
  imports: [DynamicForm, DfPlaceholder],
  template: `<div style="height: 30000px"></div>
    <form [dynamic-form]="config()">
      <ng-template dfPlaceholder let-field>
        <span class="ph-default" [attr.data-ph-key]="field.key" [attr.data-ph-type]="field.type" [attr.data-ph-label]="field.label"
          >default</span
        >
      </ng-template>
      <ng-template dfPlaceholder="textarea"><span class="ph-textarea">textarea skeleton</span></ng-template>
      <ng-template dfPlaceholderKey="special"><span class="ph-key">key skeleton</span></ng-template>
    </form>`,
})
class PlaceholderHost {
  config = input.required<FormConfig>();
}

@Component({
  selector: 'bare-placeholder-host',
  imports: [DynamicForm],
  template: `<div style="height: 30000px"></div>
    <form [dynamic-form]="config()"></form>`,
})
class BareHost {
  config = input.required<FormConfig>();
}

@Component({
  selector: 'bound-placeholder-host',
  imports: [DynamicForm, DfPlaceholder],
  template: `<div style="height: 30000px"></div>
    <form [dynamic-form]="config()">
      <ng-template [dfPlaceholderKey]="boundKey()"><span class="ph-bound">bound</span></ng-template>
    </form>`,
})
class BoundHost {
  config = input.required<FormConfig>();
  boundKey = signal('none');
}

async function settle(fixture: ComponentFixture<unknown>, cycles = 4): Promise<void> {
  for (let i = 0; i < cycles; i++) {
    TestBed.flushEffects();
    fixture.detectChanges();
    await delay(0);
  }
  await fixture.whenStable();
  await delay(100); // let the IntersectionObserver deliver its initial entries
  TestBed.flushEffects();
  fixture.detectChanges();
}

function ph(fixture: ComponentFixture<unknown>, key: string): HTMLElement | null {
  return fixture.nativeElement.querySelector(`[data-field-key="${key}"].df-field-placeholder`);
}

describe('Field windowing — projected placeholders', () => {
  beforeEach(() => {
    window.scrollTo(0, 0);
    TestBed.configureTestingModule({
      deferBlockBehavior: DeferBlockBehavior.Playthrough,
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
        {
          provide: FIELD_WINDOWING,
          useValue: {
            enabled: true,
            eager: 2,
            placeholderHeight: '40px',
            park: { enabled: false, margin: '100%' },
          } satisfies FieldWindowingConfig,
        },
      ],
    });
  });

  afterEach(() => TestBed.resetTestingModule());

  it('renders the type-matched template for a windowed field of that type', async () => {
    const fixture = TestBed.createComponent(PlaceholderHost);
    fixture.componentRef.setInput('config', CONFIG);
    await settle(fixture);

    // bio is a textarea → the dfPlaceholder="textarea" template wins.
    expect(ph(fixture, 'bio')?.querySelector('.ph-textarea')).toBeTruthy();
    expect(ph(fixture, 'bio')?.querySelector('.ph-default')).toBeNull();
  });

  it('renders the default template for a windowed field with no type/key match, with correct context', async () => {
    const fixture = TestBed.createComponent(PlaceholderHost);
    fixture.componentRef.setInput('config', CONFIG);
    await settle(fixture);

    const def = ph(fixture, 'plain')?.querySelector('.ph-default');
    expect(def).toBeTruthy();
    // let-field context carries the narrow field info.
    expect(def?.getAttribute('data-ph-key')).toBe('plain');
    expect(def?.getAttribute('data-ph-type')).toBe('input');
  });

  it('prefers a key-matched template over the type/default templates', async () => {
    const fixture = TestBed.createComponent(PlaceholderHost);
    fixture.componentRef.setInput('config', CONFIG);
    await settle(fixture);

    // `special` is an input, but its KEY template must win over the default.
    expect(ph(fixture, 'special')?.querySelector('.ph-key')).toBeTruthy();
    expect(ph(fixture, 'special')?.querySelector('.ph-default')).toBeNull();
  });

  it('renders the built-in bare div (no projected content) when no placeholder templates are provided', async () => {
    const fixture = TestBed.createComponent(BareHost);
    fixture.componentRef.setInput('config', CONFIG);
    await settle(fixture);

    const bare = ph(fixture, 'bio');
    expect(bare).toBeTruthy();
    expect(bare?.children.length).toBe(0);
  });

  it('renders projected placeholders for windowed fields inside a page', async () => {
    const fixture = TestBed.createComponent(PlaceholderHost);
    fixture.componentRef.setInput('config', PAGED_CONFIG);
    await settle(fixture);

    expect(ph(fixture, 'bio')?.querySelector('.ph-textarea')).toBeTruthy();
    expect(ph(fixture, 'plain')?.querySelector('.ph-default')?.getAttribute('data-ph-key')).toBe('plain');
  });

  for (const [name, config] of [
    ['flat', CONFIG],
    ['paged', PAGED_CONFIG],
  ] as const) {
    it(`refreshes the placeholder context when a field keeps its key but its label changes (${name})`, async () => {
      const fixture = TestBed.createComponent(PlaceholderHost);
      fixture.componentRef.setInput('config', config);
      await settle(fixture);
      expect(ph(fixture, 'plain')?.querySelector('.ph-default')?.getAttribute('data-ph-label')).toBe('Plain');

      const relabel = (fields: readonly unknown[]): unknown[] =>
        fields.map((f) => {
          const field = f as { key: string; label?: string; fields?: readonly unknown[] };
          if (field.fields) return { ...field, fields: relabel(field.fields) };
          return field.key === 'plain' ? { ...field, label: 'Renamed' } : field;
        });
      fixture.componentRef.setInput('config', { ...config, fields: relabel(config.fields) } as FormConfig);
      await settle(fixture);

      expect(ph(fixture, 'plain')?.querySelector('.ph-default')?.getAttribute('data-ph-label')).toBe('Renamed');
    });
  }

  it('follows a bound dfPlaceholderKey that changes after render', async () => {
    const fixture = TestBed.createComponent(BoundHost);
    fixture.componentRef.setInput('config', CONFIG);
    await settle(fixture);
    expect(ph(fixture, 'plain')?.querySelector('.ph-bound')).toBeNull();

    fixture.componentInstance.boundKey.set('plain');
    await settle(fixture);

    expect(ph(fixture, 'plain')?.querySelector('.ph-bound')).toBeTruthy();
  });

  it('marks the placeholder wrapper inert so projected content is not focusable', async () => {
    const fixture = TestBed.createComponent(PlaceholderHost);
    fixture.componentRef.setInput('config', PAGED_CONFIG);
    await settle(fixture);
    expect(ph(fixture, 'plain')?.hasAttribute('inert')).toBe(true);

    const flat = TestBed.createComponent(PlaceholderHost);
    flat.componentRef.setInput('config', CONFIG);
    await settle(flat);
    expect(ph(flat, 'plain')?.hasAttribute('inert')).toBe(true);
  });

  it('still mounts the real field when its placeholder scrolls into view', async () => {
    const fixture = TestBed.createComponent(PlaceholderHost);
    fixture.componentRef.setInput('config', CONFIG);
    await settle(fixture);

    const placeholder = ph(fixture, 'plain');
    expect(placeholder?.querySelector('.ph-default')).toBeTruthy();
    placeholder!.scrollIntoView();

    const deadline = Date.now() + 2000;
    while (Date.now() < deadline) {
      await delay(50);
      TestBed.flushEffects();
      fixture.detectChanges();
      if (ph(fixture, 'plain') === null) break; // placeholder replaced by the mounted field
    }
    expect(ph(fixture, 'plain')).toBeNull();
  });
});
