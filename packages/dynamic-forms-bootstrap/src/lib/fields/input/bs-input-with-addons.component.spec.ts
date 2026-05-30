import { Type } from '@angular/core';
import { type AddonKindDefinition, DynamicFormLogger, TextAddonComponent } from '@ng-forge/dynamic-forms';
import { ADDON_ACTION_REGISTRY, ADDON_KIND_COMPONENT_CACHE, ADDON_KIND_REGISTRY } from '@ng-forge/dynamic-forms/integration';
import { createNgForgeFieldFixture, provideTestValidationMessages } from '@ng-forge/dynamic-forms/integration';
import { describe, expect, it, vi } from 'vitest';
import { BsButtonAddonComponent } from '../../addons/bs-button-addon.component';
import { BsIconAddonComponent } from '../../addons/bs-icon-addon.component';
import type { BsInputAddon } from './bs-input.type';
import BsInputFieldComponent from './bs-input.component';

// Pre-loaded kind components — bypass the async dynamic-import path so the
// <df-addon-slot> effect resolves the component synchronously and the inner
// renderer renders in the same CD pass as the wrapper.
const KIND_REGISTRY: ReadonlyMap<string, AddonKindDefinition> = new Map([
  ['bs-icon', { kind: 'bs-icon', loadComponent: () => Promise.resolve(BsIconAddonComponent) } as AddonKindDefinition],
  ['bs-button', { kind: 'bs-button', loadComponent: () => Promise.resolve(BsButtonAddonComponent) } as AddonKindDefinition],
  ['text', { kind: 'text', loadComponent: () => Promise.resolve(TextAddonComponent) } as AddonKindDefinition],
]);

function makeKindCache(): Map<string, Type<unknown>> {
  return new Map<string, Type<unknown>>([
    ['bs-icon', BsIconAddonComponent],
    ['bs-button', BsButtonAddonComponent],
    ['text', TextAddonComponent],
  ]);
}

async function setup(opts: { value?: string; props?: Record<string, unknown>; addons?: readonly BsInputAddon[] } = {}) {
  const result = createNgForgeFieldFixture<BsInputFieldComponent, string>(BsInputFieldComponent, {
    key: 'q',
    value: opts.value ?? '',
    providers: [
      { provide: ADDON_KIND_REGISTRY, useValue: KIND_REGISTRY },
      { provide: ADDON_KIND_COMPONENT_CACHE, useFactory: makeKindCache },
      { provide: ADDON_ACTION_REGISTRY, useValue: new Map() },
      { provide: DynamicFormLogger, useValue: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() } },
      provideTestValidationMessages({}),
    ],
    inputs: {
      ...(opts.props ? { props: opts.props } : {}),
      // NgForgeAddons.addons is the host-directive forwarded input.
      ...(opts.addons ? { addons: opts.addons } : {}),
    },
  });
  result.fixture.detectChanges();
  await result.fixture.whenStable();
  result.fixture.detectChanges();
  return result;
}

function rootEl(fixture: { nativeElement: unknown }): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

describe('BsInputFieldComponent — addon rendering', () => {
  describe('without addons', () => {
    it('renders the input inside a .mb-3 wrapper, no .input-group', async () => {
      const { fixture } = await setup();
      const el = rootEl(fixture);
      expect(el.querySelector('.mb-3')).toBeTruthy();
      expect(el.querySelector('.input-group')).toBeNull();
      expect(el.querySelector('input.form-control')).toBeTruthy();
    });
  });

  describe('with addons (standard variant)', () => {
    const PREFIX_ICON: BsInputAddon = { kind: 'bs-icon', slot: 'prefix', icon: 'search', ariaLabel: 'Search' };
    const SUFFIX_TEXT: BsInputAddon = { kind: 'text', slot: 'suffix', text: 'USD' };

    it('wraps the input in .input-group', async () => {
      const { fixture } = await setup({ addons: [PREFIX_ICON, SUFFIX_TEXT] });
      const el = rootEl(fixture);
      const group = el.querySelector('.input-group');
      expect(group).toBeTruthy();
      // input lives inside the input-group
      expect(group?.querySelector('input.form-control')).toBeTruthy();
    });

    it('renders prefix and suffix addons as <span class="input-group-text">', async () => {
      const { fixture } = await setup({ addons: [PREFIX_ICON, SUFFIX_TEXT] });
      const el = rootEl(fixture);
      const slots = el.querySelectorAll('.input-group .input-group-text');
      expect(slots.length).toBe(2);
      // prefix slot has the icon
      expect(slots[0].querySelector('i.bi.bi-search')).toBeTruthy();
      // suffix slot has the text
      expect(slots[1].textContent).toContain('USD');
    });

    it('preserves declaration order for prefix and suffix addons', async () => {
      const PREFIX_TEXT: BsInputAddon = { kind: 'text', slot: 'prefix', text: '$' };
      const SUFFIX_ICON: BsInputAddon = { kind: 'bs-icon', slot: 'suffix', icon: 'x', ariaLabel: 'Clear' };
      const { fixture } = await setup({ addons: [PREFIX_ICON, PREFIX_TEXT, SUFFIX_TEXT, SUFFIX_ICON] });
      const el = rootEl(fixture);
      const slots = el.querySelectorAll('.input-group .input-group-text');
      expect(slots.length).toBe(4);
      // prefix axis preserves config order
      expect(slots[0].querySelector('i.bi.bi-search')).toBeTruthy();
      expect(slots[1].textContent).toContain('$');
      // suffix axis preserves config order
      expect(slots[2].textContent).toContain('USD');
      expect(slots[3].querySelector('i.bi.bi-x')).toBeTruthy();
    });
  });

  describe('floating-label variant', () => {
    it('renders .form-floating without addons (no .input-group)', async () => {
      const { fixture } = await setup({ props: { floatingLabel: true } });
      const el = rootEl(fixture);
      expect(el.querySelector('.input-group')).toBeNull();
      expect(el.querySelector('.form-floating')).toBeTruthy();
    });

    it('nests .form-floating inside .input-group when addons are present', async () => {
      const PREFIX_ICON: BsInputAddon = { kind: 'bs-icon', slot: 'prefix', icon: 'search', ariaLabel: 'Search' };
      const { fixture } = await setup({ props: { floatingLabel: true }, addons: [PREFIX_ICON] });
      const el = rootEl(fixture);
      const group = el.querySelector('.input-group');
      expect(group).toBeTruthy();
      // .form-floating must be a descendant of .input-group, not a sibling
      const floatingInsideGroup = group?.querySelector('.form-floating');
      expect(floatingInsideGroup).toBeTruthy();
      expect(floatingInsideGroup?.querySelector('input.form-control')).toBeTruthy();
      // addon slot is also inside the group
      expect(group?.querySelector('.input-group-text i.bi.bi-search')).toBeTruthy();
    });
  });
});
