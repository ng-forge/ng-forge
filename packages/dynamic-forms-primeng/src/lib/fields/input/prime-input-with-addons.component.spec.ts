import { ADDON_ACTION_REGISTRY, ADDON_KIND_REGISTRY, type AddonKindDefinition, DynamicFormLogger } from '@ng-forge/dynamic-forms';
import { createNgForgeFieldFixture, provideTestValidationMessages } from '@ng-forge/dynamic-forms/integration';
import { describe, expect, it, vi } from 'vitest';
import { PiButtonAddonComponent } from '../../addons/pi-button-addon.component';
import { PiIconAddonComponent } from '../../addons/pi-icon-addon.component';
import type { PiButtonAddon, PiIconAddon } from '../../types/addons';
import type { PrimeInputAddon } from './prime-input.type';
import PrimeInputFieldComponent from './prime-input.component';

const PI_ICON_KIND: AddonKindDefinition = {
  kind: 'pi-icon',
  loadComponent: () => Promise.resolve(PiIconAddonComponent),
};
const PI_BUTTON_KIND: AddonKindDefinition = {
  kind: 'pi-button',
  loadComponent: () => Promise.resolve(PiButtonAddonComponent),
};

function makeKindRegistry(): ReadonlyMap<string, AddonKindDefinition> {
  return new Map<string, AddonKindDefinition>([
    ['pi-icon', PI_ICON_KIND],
    ['pi-button', PI_BUTTON_KIND],
  ]);
}

function createFixture(addons: ReadonlyArray<PrimeInputAddon>) {
  return createNgForgeFieldFixture<PrimeInputFieldComponent, string>(PrimeInputFieldComponent, {
    key: 'field-1',
    value: '',
    inputs: { addons },
    providers: [
      { provide: ADDON_KIND_REGISTRY, useValue: makeKindRegistry() },
      { provide: ADDON_ACTION_REGISTRY, useValue: new Map() },
      { provide: DynamicFormLogger, useValue: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() } },
      provideTestValidationMessages({}),
    ],
  });
}

describe('PrimeInputFieldComponent — addon rendering', () => {
  it('wraps the input in <p-inputgroup> when a prefix addon is supplied', async () => {
    const prefix: PiIconAddon = { kind: 'pi-icon', slot: 'prefix', icon: 'search' };
    const { fixture } = createFixture([prefix]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const group = fixture.nativeElement.querySelector('p-inputgroup');
    expect(group).toBeTruthy();
    const prefixSlot = group.querySelector('p-inputgroup-addon df-addon-slot');
    expect(prefixSlot).toBeTruthy();
  });

  it('renders a suffix <p-inputgroup-addon> for a pi-button addon', async () => {
    const suffix: PiButtonAddon = {
      kind: 'pi-button',
      slot: 'suffix',
      icon: 'times',
      ariaLabel: 'Clear',
      preset: 'clear',
    } as PiButtonAddon;
    const { fixture } = createFixture([suffix]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const group = fixture.nativeElement.querySelector('p-inputgroup') as HTMLElement;
    expect(group).toBeTruthy();
    const addons = group.querySelectorAll('p-inputgroup-addon');
    expect(addons.length).toBe(1);
    // Suffix addons follow the input element in the group.
    const input = group.querySelector('input[pinputtext]') as HTMLElement;
    expect(input).toBeTruthy();
    expect(input.compareDocumentPosition(addons[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders both prefix and suffix when both slots are supplied', async () => {
    const addons: PrimeInputAddon[] = [
      { kind: 'pi-icon', slot: 'prefix', icon: 'search' } as PiIconAddon,
      { kind: 'pi-button', slot: 'suffix', icon: 'times', ariaLabel: 'Clear', preset: 'clear' } as PiButtonAddon,
    ];
    const { fixture } = createFixture(addons);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const group = fixture.nativeElement.querySelector('p-inputgroup') as HTMLElement;
    expect(group).toBeTruthy();
    expect(group.querySelectorAll('p-inputgroup-addon').length).toBe(2);
  });

  it('omits <p-inputgroup> when addons is empty', () => {
    const { fixture } = createFixture([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('p-inputgroup')).toBeNull();
    // Bare input still rendered.
    expect(fixture.nativeElement.querySelector('input[pinputtext]')).toBeTruthy();
  });
});
