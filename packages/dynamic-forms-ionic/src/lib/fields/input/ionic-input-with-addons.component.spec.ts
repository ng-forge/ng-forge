import { ADDON_ACTION_REGISTRY, ADDON_KIND_REGISTRY, type AddonKindDefinition } from '@ng-forge/dynamic-forms';
import { createNgForgeFieldFixture } from '@ng-forge/dynamic-forms/integration';
import { describe, expect, it } from 'vitest';
import { IonButtonAddonComponent } from '../../addons/ion-button-addon.component';
import { IonIconAddonComponent } from '../../addons/ion-icon-addon.component';
import type { IonicButtonAddon, IonicIconAddon } from '../../types/addons';
import type { IonicInputAddon } from './ionic-input.type';
import IonicInputFieldComponent from './ionic-input.component';

const ION_ICON_KIND: AddonKindDefinition = {
  kind: 'ion-icon',
  loadComponent: () => Promise.resolve(IonIconAddonComponent),
};
const ION_BUTTON_KIND: AddonKindDefinition = {
  kind: 'ion-button',
  loadComponent: () => Promise.resolve(IonButtonAddonComponent),
};

function makeKindRegistry(): ReadonlyMap<string, AddonKindDefinition> {
  return new Map<string, AddonKindDefinition>([
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
      { provide: ADDON_KIND_REGISTRY, useValue: makeKindRegistry() },
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
    const prefix: IonicIconAddon = { kind: 'ion-icon', slot: 'prefix', icon: 'search-outline' };
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

  it('renders a <span slot="end"> wrapper for a suffix addon', async () => {
    const suffix: IonicButtonAddon = {
      kind: 'ion-button',
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
    const slot = ionInput.querySelector('span[slot="end"]');
    expect(slot).toBeTruthy();
    expect(slot?.querySelector('df-addon-slot')).toBeTruthy();
    expect(ionInput.querySelector('span[slot="start"]')).toBeNull();
  });

  it('renders both wrappers when both prefix and suffix addons are present', async () => {
    const addons: IonicInputAddon[] = [
      { kind: 'ion-icon', slot: 'prefix', icon: 'search-outline' } as IonicIconAddon,
      { kind: 'ion-button', slot: 'suffix', icon: 'close-outline', ariaLabel: 'Clear', preset: 'clear' } as IonicButtonAddon,
    ];
    const { fixture } = createFixture(addons);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const ionInput = fixture.nativeElement.querySelector('ion-input') as HTMLElement;
    expect(ionInput.querySelectorAll('span[slot="start"]').length).toBe(1);
    expect(ionInput.querySelectorAll('span[slot="end"]').length).toBe(1);
  });

  it('keeps the aria-describedby plumbing intact when addons are present', async () => {
    const prefix: IonicIconAddon = { kind: 'ion-icon', slot: 'prefix', icon: 'search-outline' };
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
