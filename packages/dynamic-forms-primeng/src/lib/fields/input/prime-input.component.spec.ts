import type { Type } from '@angular/core';
import { type AddonTypeDefinition, DynamicFormLogger } from '@ng-forge/dynamic-forms';
import { ADDON_ACTION_REGISTRY, ADDON_TYPE_COMPONENT_CACHE, ADDON_TYPE_REGISTRY } from '@ng-forge/dynamic-forms/integration';
import { createNgForgeFieldFixture, provideTestValidationMessages } from '@ng-forge/dynamic-forms/integration';
import { describe, expect, it, vi } from 'vitest';
import PrimeInputFieldComponent from './prime-input.component';

// #321: placeholder was reported as not functional across adapters. The mapper-level passthrough
// only proves the placeholder reaches the component input — it does NOT prove the binding reaches
// the rendered <input>. These tests pin the DOM rendering. PrimeNG renders a native
// <input pInputText> with [placeholder] bound directly.

function createFixture(inputs: Record<string, unknown>) {
  return createNgForgeFieldFixture<PrimeInputFieldComponent, string>(PrimeInputFieldComponent, {
    key: 'field-1',
    value: '',
    inputs,
    providers: [
      { provide: ADDON_TYPE_REGISTRY, useValue: new Map<string, AddonTypeDefinition>() },
      { provide: ADDON_TYPE_COMPONENT_CACHE, useFactory: () => new Map<string, Type<unknown>>() },
      { provide: ADDON_ACTION_REGISTRY, useValue: new Map() },
      { provide: DynamicFormLogger, useValue: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() } },
      provideTestValidationMessages({}),
    ],
  });
}

describe('PrimeInputFieldComponent — placeholder rendering (#321)', () => {
  it('binds the placeholder onto the rendered <input>', async () => {
    const { fixture } = createFixture({ placeholder: 'Enter your name' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[pinputtext]') as HTMLInputElement | null;
    expect(input).toBeTruthy();
    expect(input?.getAttribute('placeholder')).toBe('Enter your name');
  });

  it('renders an empty placeholder attribute when none is configured', async () => {
    const { fixture } = createFixture({});
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[pinputtext]') as HTMLInputElement | null;
    expect(input).toBeTruthy();
    // Template falls back to '' so the attribute is always present but empty.
    expect(input?.getAttribute('placeholder') ?? '').toBe('');
  });
});
