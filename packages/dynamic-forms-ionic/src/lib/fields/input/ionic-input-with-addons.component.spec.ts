import type { Type } from '@angular/core';
import { type AddonTypeDefinition } from '@ng-forge/dynamic-forms';
import { ADDON_ACTION_REGISTRY, ADDON_TYPE_COMPONENT_CACHE, ADDON_TYPE_REGISTRY } from '@ng-forge/dynamic-forms/integration';
import { createNgForgeFieldFixture } from '@ng-forge/dynamic-forms/integration';
import { describe, expect, it } from 'vitest';
import { IonicButtonAddonComponent } from '../../addons/ion-button-addon.component';
import { IonicIconAddonComponent } from '../../addons/ion-icon-addon.component';
import type { IonicButtonAddon, IonicIconAddon } from '../../types/addons';
import type { IonicInputAddon } from './ionic-input.type';
import IonicInputFieldComponent from './ionic-input.component';

const ION_ICON_KIND: AddonTypeDefinition = {
  type: 'ion-icon',
  loadComponent: () => Promise.resolve(IonicIconAddonComponent),
};
const ION_BUTTON_KIND: AddonTypeDefinition = {
  type: 'ion-button',
  loadComponent: () => Promise.resolve(IonicButtonAddonComponent),
};

function makeTypeRegistry(): ReadonlyMap<string, AddonTypeDefinition> {
  return new Map<string, AddonTypeDefinition>([
    ['ion-icon', ION_ICON_KIND],
    ['ion-button', ION_BUTTON_KIND],
  ]);
}

function createFixture(addons: ReadonlyArray<IonicInputAddon>) {
  return createNgForgeFieldFixture<IonicInputFieldComponent, string>(IonicInputFieldComponent, {
    key: 'field-1',
    value: '',
    inputs: { addons },
    providers: [
      { provide: ADDON_TYPE_REGISTRY, useValue: makeTypeRegistry() },
      { provide: ADDON_TYPE_COMPONENT_CACHE, useFactory: () => new Map<string, Type<unknown>>() },
      { provide: ADDON_ACTION_REGISTRY, useValue: new Map() },
    ],
  });
}

describe('IonicInputFieldComponent — addon rendering', () => {
  it('omits slot wrappers when addons is empty', () => {
    const { fixture } = createFixture([]);
    fixture.detectChanges();

    const ionInput = fixture.nativeElement.querySelector('ion-input') as HTMLElement;
    expect(ionInput).toBeTruthy();
    // No slot wrappers projected when there are no addons.
    expect(ionInput.querySelector('span[slot="start"]')).toBeNull();
    expect(ionInput.querySelector('span[slot="end"]')).toBeNull();
  });

  it('renders a <span slot="start"> wrapper for a prefix addon', async () => {
    const prefix: IonicIconAddon = { type: 'ion-icon', slot: 'prefix', icon: 'search-outline' };
    const { fixture } = createFixture([prefix]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const ionInput = fixture.nativeElement.querySelector('ion-input') as HTMLElement;
    expect(ionInput).toBeTruthy();
    const slot = ionInput.querySelector('span[slot="start"]');
    expect(slot).toBeTruthy();
    // The addon-slot is projected inside the wrapper.
    expect(slot?.querySelector('df-addon-slot')).toBeTruthy();
    // Confirm the suffix wrapper is absent.
    expect(ionInput.querySelector('span[slot="end"]')).toBeNull();
  });

  it('renders ion-button suffix addons INSIDE <ion-input> as projected slot children', async () => {
    // Interactive ion-button addons now render INSIDE <ion-input> as native
    // <ion-button slot="end"> elements (via the `ion-button[df-ion-button-addon]`
    // attribute-selector inline component). This satisfies Ionic's
    // `::slotted(ion-button[slot=end])` shadow-CSS rule, which provides the
    // native icon-only styling — no flex-sibling workaround needed.
    const suffix: IonicButtonAddon = {
      type: 'ion-button',
      slot: 'suffix',
      icon: 'close-outline',
      ariaLabel: 'Clear',
      preset: 'clear',
    } as IonicButtonAddon;
    const { fixture } = createFixture([suffix]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const ionInput = fixture.nativeElement.querySelector('ion-input') as HTMLElement;
    expect(ionInput).toBeTruthy();
    // The button is a direct child of <ion-input>, with slot="end".
    const ionButton = ionInput.querySelector('ion-button[slot="end"]') as HTMLElement;
    expect(ionButton).toBeTruthy();
    expect(ionButton.hasAttribute('df-ion-button-addon')).toBe(true);
    // No flex-sibling row wrapper any more.
    expect(fixture.nativeElement.querySelector('.df-ion-input-row')).toBeNull();
  });

  it('renders decorative addons in slot wrappers + button addons as direct ion-button children', async () => {
    const addons: IonicInputAddon[] = [
      { type: 'ion-icon', slot: 'prefix', icon: 'search-outline' } as IonicIconAddon,
      { type: 'ion-button', slot: 'suffix', icon: 'close-outline', ariaLabel: 'Clear', preset: 'clear' } as IonicButtonAddon,
    ];
    const { fixture } = createFixture(addons);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const ionInput = fixture.nativeElement.querySelector('ion-input') as HTMLElement;
    // Decorative prefix icon stays inside a <span slot="start"> wrapper.
    expect(ionInput.querySelectorAll('span[slot="start"]').length).toBe(1);
    // Interactive suffix button lives at the input as a direct <ion-button slot="end">.
    expect(ionInput.querySelectorAll('ion-button[slot="end"]').length).toBe(1);
  });

  it('keeps the aria-describedby plumbing intact when addons are present', async () => {
    const prefix: IonicIconAddon = { type: 'ion-icon', slot: 'prefix', icon: 'search-outline' };
    const { fixture } = createFixture([prefix]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    // The component sets up an explicitEffect that calls ion-input.getInputElement()
    // and forwards aria-describedby. We only assert the wiring did not throw and
    // the ion-input host is still present after a stable tick — the deeper
    // shadow-DOM assertion belongs to the e2e suite.
    const ionInput = fixture.nativeElement.querySelector('ion-input') as HTMLElement;
    expect(ionInput).toBeTruthy();
  });
});
