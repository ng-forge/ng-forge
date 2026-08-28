import { provideAnimations } from '@angular/platform-browser/animations';
import { type AddonTypeDefinition, DynamicFormLogger } from '@ng-forge/dynamic-forms';
import { ADDON_ACTION_REGISTRY, ADDON_TYPE_COMPONENT_CACHE, ADDON_TYPE_REGISTRY } from '@ng-forge/dynamic-forms/integration';
import type { Type } from '@angular/core';
import { createNgForgeFieldFixture, provideTestValidationMessages } from '@ng-forge/dynamic-forms/integration';
import { describe, expect, it, vi } from 'vitest';
import { MatButtonAddonComponent } from '../../addons/mat-button-addon.component';
import { MatIconAddonComponent } from '../../addons/mat-icon-addon.component';
import type { MatButtonAddon, MatIconAddon } from '../../types/addons';
import type { AnyAddon } from '@ng-forge/dynamic-forms';
import MatSelectFieldComponent from './mat-select.component';

const MAT_ICON_KIND: AddonTypeDefinition = {
  type: 'mat-icon',
  loadComponent: () => Promise.resolve(MatIconAddonComponent),
};
const MAT_BUTTON_KIND: AddonTypeDefinition = {
  type: 'mat-button',
  loadComponent: () => Promise.resolve(MatButtonAddonComponent),
};

function makeTypeRegistry(): ReadonlyMap<string, AddonTypeDefinition> {
  return new Map<string, AddonTypeDefinition>([
    ['mat-icon', MAT_ICON_KIND],
    ['mat-button', MAT_BUTTON_KIND],
  ]);
}

function createFixture(addons: ReadonlyArray<AnyAddon>) {
  return createNgForgeFieldFixture<MatSelectFieldComponent, string>(MatSelectFieldComponent, {
    key: 'field-1',
    value: '',
    inputs: {
      addons,
      options: [
        { value: 'one', label: 'One' },
        { value: 'two', label: 'Two' },
      ],
    },
    providers: [
      provideAnimations(),
      { provide: ADDON_TYPE_REGISTRY, useValue: makeTypeRegistry() },
      { provide: ADDON_TYPE_COMPONENT_CACHE, useFactory: () => new Map<string, Type<unknown>>() },
      { provide: ADDON_ACTION_REGISTRY, useValue: new Map() },
      { provide: DynamicFormLogger, useValue: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() } },
      provideTestValidationMessages({}),
    ],
  });
}

describe('MatSelectFieldComponent — addon rendering', () => {
  it('renders <df-addon-slot matPrefix> for a prefix-slot addon', async () => {
    const prefix: MatIconAddon = { type: 'mat-icon', slot: 'prefix', icon: 'search', ariaLabel: 'Search' };
    const { fixture } = createFixture([prefix]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const slot = fixture.nativeElement.querySelector('df-addon-slot[matprefix]');
    expect(slot).toBeTruthy();
  });

  it('renders <df-addon-slot matSuffix> for a suffix-slot addon', async () => {
    const suffix: MatButtonAddon = {
      type: 'mat-button',
      slot: 'suffix',
      icon: 'close',
      ariaLabel: 'Clear',
    };
    const { fixture } = createFixture([suffix]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const slot = fixture.nativeElement.querySelector('df-addon-slot[matsuffix]');
    expect(slot).toBeTruthy();
  });

  it('renders both prefix and suffix slots when both addons are supplied', async () => {
    const addons: AnyAddon[] = [
      { type: 'mat-icon', slot: 'prefix', icon: 'search', ariaLabel: 'Search' },
      { type: 'mat-button', slot: 'suffix', icon: 'close', ariaLabel: 'Clear' },
    ];
    const { fixture } = createFixture(addons);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const prefixSlots = fixture.nativeElement.querySelectorAll('df-addon-slot[matprefix]');
    const suffixSlots = fixture.nativeElement.querySelectorAll('df-addon-slot[matsuffix]');
    expect(prefixSlots.length).toBe(1);
    expect(suffixSlots.length).toBe(1);
  });

  it('dispatches addon actions without opening the panel, while the native trigger still opens it', async () => {
    const prefixAction = vi.fn();
    const suffixAction = vi.fn();
    const { fixture } = createFixture([
      { type: 'mat-button', slot: 'prefix', icon: 'search', ariaLabel: 'Search', action: prefixAction },
      { type: 'mat-button', slot: 'suffix', icon: 'close', ariaLabel: 'Clear', action: suffixAction },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('mat-select') as HTMLElement;
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('df-addon-slot button')).toHaveLength(2);
    });
    const addonButtons = fixture.nativeElement.querySelectorAll('df-addon-slot button') as NodeListOf<HTMLButtonElement>;
    const trigger = select.querySelector('.mat-mdc-select-trigger') as HTMLElement;

    expect(select.getAttribute('aria-expanded')).toBe('false');
    addonButtons[0].click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(prefixAction).toHaveBeenCalledTimes(1);
    expect(select.getAttribute('aria-expanded')).toBe('false');

    addonButtons[1].click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(suffixAction).toHaveBeenCalledTimes(1);
    expect(select.getAttribute('aria-expanded')).toBe('false');

    trigger.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(select.getAttribute('aria-expanded')).toBe('true');
    expect(document.body.querySelector('.mat-mdc-select-panel')).toBeTruthy();
  });

  it('renders no df-addon-slot when addons is empty', () => {
    const { fixture } = createFixture([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('df-addon-slot')).toBeNull();
    // The mat-form-field with select still renders.
    expect(fixture.nativeElement.querySelector('mat-select')).toBeTruthy();
  });
});
