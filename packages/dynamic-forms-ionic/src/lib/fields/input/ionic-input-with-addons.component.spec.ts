import type { Type } from '@angular/core';
import { ADDON_ACTION_REGISTRY, ADDON_KIND_COMPONENT_CACHE, ADDON_KIND_REGISTRY, type AddonKindDefinition } from '@ng-forge/dynamic-forms';
import { createNgForgeFieldFixture } from '@ng-forge/dynamic-forms/integration';
import { describe, expect, it } from 'vitest';
import { IonButtonAddonComponent } from '../../addons/ion-button-addon.component';
import { IonIconAddonComponent } from '../../addons/ion-icon-addon.component';
import type { IonButtonAddon, IonIconAddon } from '../../types/addons';
import type { IonInputAddon } from './ionic-input.type';
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

function createFixture(addons: ReadonlyArray<IonInputAddon>) {
  return createNgForgeFieldFixture<IonicInputFieldComponent, string>(IonicInputFieldComponent, {
    key: 'field-1',
    value: '',
    inputs: { addons },
    providers: [
      { provide: ADDON_KIND_REGISTRY, useValue: makeKindRegistry() },
      { provide: ADDON_KIND_COMPONENT_CACHE, useFactory: () => new Map<string, Type<unknown>>() },
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
    const prefix: IonIconAddon = { kind: 'ion-icon', slot: 'prefix', icon: 'search-outline' };
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
    const suffix: IonButtonAddon = {
      kind: 'ion-button',
      slot: 'suffix',
      icon: 'close-outline',
      ariaLabel: 'Clear',
      preset: 'clear',
    } as IonButtonAddon;
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
    const addons: IonInputAddon[] = [
      { kind: 'ion-icon', slot: 'prefix', icon: 'search-outline' } as IonIconAddon,
      { kind: 'ion-button', slot: 'suffix', icon: 'close-outline', ariaLabel: 'Clear', preset: 'clear' } as IonButtonAddon,
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
    const prefix: IonIconAddon = { kind: 'ion-icon', slot: 'prefix', icon: 'search-outline' };
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
