import { Type } from '@angular/core';
import { type AddonKindDefinition, DynamicFormLogger } from '@ng-forge/dynamic-forms';
import { ADDON_ACTION_REGISTRY, ADDON_KIND_COMPONENT_CACHE, ADDON_KIND_REGISTRY } from '@ng-forge/dynamic-forms/integration';
import { createNgForgeFieldFixture, provideTestValidationMessages } from '@ng-forge/dynamic-forms/integration';
import { describe, expect, it, vi } from 'vitest';
import BsInputFieldComponent from './bs-input.component';

// #321: placeholder was reported as not functional across adapters. The mapper-level passthrough
// only proves the placeholder reaches the component input — it does NOT prove the binding reaches
// the rendered <input>. These tests pin the DOM rendering. Bootstrap renders a native
// <input class="form-control"> with [placeholder] bound directly.

function createFixture(inputs: Record<string, unknown>) {
  return createNgForgeFieldFixture<BsInputFieldComponent, string>(BsInputFieldComponent, {
    key: 'field-1',
    value: '',
    inputs,
    providers: [
      { provide: ADDON_KIND_REGISTRY, useValue: new Map<string, AddonKindDefinition>() },
      { provide: ADDON_KIND_COMPONENT_CACHE, useFactory: () => new Map<string, Type<unknown>>() },
      { provide: ADDON_ACTION_REGISTRY, useValue: new Map() },
      { provide: DynamicFormLogger, useValue: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() } },
      provideTestValidationMessages({}),
    ],
  });
}

describe('BsInputFieldComponent — placeholder rendering (#321)', () => {
  it('binds the placeholder onto the rendered <input>', async () => {
    const { fixture } = createFixture({ placeholder: 'Enter your name' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input.form-control') as HTMLInputElement | null;
    expect(input).toBeTruthy();
    expect(input?.getAttribute('placeholder')).toBe('Enter your name');
  });

  it('renders an empty placeholder attribute when none is configured', async () => {
    const { fixture } = createFixture({});
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input.form-control') as HTMLInputElement | null;
    expect(input).toBeTruthy();
    // Template falls back to '' so the attribute is always present but empty.
    expect(input?.getAttribute('placeholder') ?? '').toBe('');
  });
});
