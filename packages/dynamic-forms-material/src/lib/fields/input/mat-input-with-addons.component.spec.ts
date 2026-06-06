import { Injector, signal } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { type AddonTypeDefinition, DynamicFormLogger } from '@ng-forge/dynamic-forms';
import {
  ADDON_ACTION_REGISTRY,
  ADDON_TYPE_COMPONENT_CACHE,
  ADDON_TYPE_REGISTRY,
  FIELD_SIGNAL_CONTEXT,
  type FieldSignalContext,
} from '@ng-forge/dynamic-forms/integration';
import type { Type } from '@angular/core';
import { createNgForgeFieldFixture, provideTestValidationMessages } from '@ng-forge/dynamic-forms/integration';
import { describe, expect, it, vi } from 'vitest';
import { MatButtonAddonComponent } from '../../addons/mat-button-addon.component';
import { MatIconAddonComponent } from '../../addons/mat-icon-addon.component';
import type { MatButtonAddon, MatIconAddon } from '../../types/addons';
import MatInputFieldComponent from './mat-input.component';
import type { MatInputAddon } from './mat-input.type';

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

function stubFieldSignalContext(): FieldSignalContext {
  // FIELD_SIGNAL_CONTEXT's default factory throws (`providedIn: null`).
  // The mat-input's ADDON_PRESET_HANDLER provider injects this token with
  // `{ optional: true }`, but the harness still triggers the factory during
  // resolution profiling. Stub it so the optional injection short-circuits
  // to a usable value instead of bubbling the throw.
  return {
    injector: undefined as unknown as Injector,
    value: signal<Record<string, unknown> | undefined>({}),
    defaultValues: () => ({}),
    form: {} as FieldSignalContext['form'],
  };
}

function createFixture(addons: ReadonlyArray<MatInputAddon>) {
  return createNgForgeFieldFixture<MatInputFieldComponent, string>(MatInputFieldComponent, {
    key: 'field-1',
    value: '',
    inputs: { addons },
    providers: [
      provideAnimations(),
      { provide: ADDON_TYPE_REGISTRY, useValue: makeTypeRegistry() },
      { provide: ADDON_TYPE_COMPONENT_CACHE, useFactory: () => new Map<string, Type<unknown>>() },
      { provide: ADDON_ACTION_REGISTRY, useValue: new Map() },
      { provide: FIELD_SIGNAL_CONTEXT, useFactory: stubFieldSignalContext },
      { provide: DynamicFormLogger, useValue: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() } },
      provideTestValidationMessages({}),
    ],
  });
}

describe('MatInputFieldComponent — addon rendering', () => {
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
      preset: 'clear',
    };
    const { fixture } = createFixture([suffix]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const slot = fixture.nativeElement.querySelector('df-addon-slot[matsuffix]');
    expect(slot).toBeTruthy();
  });

  it('renders both prefix and suffix slots when both addons are supplied', async () => {
    const addons: MatInputAddon[] = [
      { type: 'mat-icon', slot: 'prefix', icon: 'search', ariaLabel: 'Search' },
      { type: 'mat-button', slot: 'suffix', icon: 'close', ariaLabel: 'Clear', preset: 'clear' },
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

  it('renders no df-addon-slot when addons is empty', () => {
    const { fixture } = createFixture([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('df-addon-slot')).toBeNull();
    // The mat-form-field with input still renders.
    expect(fixture.nativeElement.querySelector('input[matInput]')).toBeTruthy();
  });
});
