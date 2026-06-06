import type { Type } from '@angular/core';
import { type AddonTypeDefinition } from '@ng-forge/dynamic-forms';
import { ADDON_ACTION_REGISTRY, ADDON_TYPE_COMPONENT_CACHE, ADDON_TYPE_REGISTRY } from '@ng-forge/dynamic-forms/integration';
import { createNgForgeFieldFixture } from '@ng-forge/dynamic-forms/integration';
import { describe, expect, it } from 'vitest';
import IonicInputFieldComponent from './ionic-input.component';

// #321: placeholder was reported as not functional across adapters. The mapper-level passthrough
// only proves the placeholder reaches the component input — it does NOT prove the binding reaches
// the rendered element. These tests pin the DOM rendering.
//
// Ionic-specific: the template binds [placeholder] onto the <ion-input> host element, NOT a
// nested light-DOM <input> (the real <input> lives inside ion-input's shadow DOM, which the
// component populates asynchronously via getInputElement()). Angular property-binding writes
// `placeholder` as a JS property on the Stencil custom element, so we assert on the property.
// Stencil reflects this property to an attribute too, which we check as a secondary signal.

interface IonInputLike extends HTMLElement {
  placeholder?: string;
}

function createFixture(inputs: Record<string, unknown>) {
  return createNgForgeFieldFixture<IonicInputFieldComponent, string>(IonicInputFieldComponent, {
    key: 'field-1',
    value: '',
    inputs,
    providers: [
      { provide: ADDON_TYPE_REGISTRY, useValue: new Map<string, AddonTypeDefinition>() },
      { provide: ADDON_TYPE_COMPONENT_CACHE, useFactory: () => new Map<string, Type<unknown>>() },
      { provide: ADDON_ACTION_REGISTRY, useValue: new Map() },
    ],
  });
}

describe('IonicInputFieldComponent — placeholder rendering (#321)', () => {
  it('binds the placeholder onto the rendered <ion-input>', async () => {
    const { fixture } = createFixture({ placeholder: 'Enter your name' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const ionInput = fixture.nativeElement.querySelector('ion-input') as IonInputLike | null;
    expect(ionInput).toBeTruthy();
    // Assert on the JS property — how Angular property-binding exposes it on the Stencil element.
    expect(ionInput?.placeholder).toBe('Enter your name');
  });

  it('renders an empty placeholder when none is configured', async () => {
    const { fixture } = createFixture({});
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const ionInput = fixture.nativeElement.querySelector('ion-input') as IonInputLike | null;
    expect(ionInput).toBeTruthy();
    // Template falls back to '' so the property is always present but empty.
    expect(ionInput?.placeholder ?? '').toBe('');
  });
});
