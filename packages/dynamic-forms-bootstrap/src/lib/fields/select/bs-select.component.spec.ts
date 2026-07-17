import { Type } from '@angular/core';
import { type AddonTypeDefinition, DynamicFormLogger } from '@ng-forge/dynamic-forms';
import { ADDON_ACTION_REGISTRY, ADDON_TYPE_COMPONENT_CACHE, ADDON_TYPE_REGISTRY } from '@ng-forge/dynamic-forms/integration';
import { createNgForgeFieldFixture, provideTestValidationMessages } from '@ng-forge/dynamic-forms/integration';
import { describe, expect, it, vi } from 'vitest';
import BsSelectFieldComponent from './bs-select.component';

// #517: [size]="props()?.htmlSize" coerced undefined to size="0", which matches Bootstrap's
// .form-select[size]:not([size="1"]) rule and strips the dropdown chevron. The binding is now
// [attr.size] so an unset htmlSize removes the attribute entirely. These tests pin the DOM.

function createFixture(inputs: Record<string, unknown>) {
  return createNgForgeFieldFixture<BsSelectFieldComponent, string>(BsSelectFieldComponent, {
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

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
];

describe('BsSelectFieldComponent — size attribute (#517)', () => {
  it('renders no size attribute when htmlSize is unset', async () => {
    const { fixture } = createFixture({ options });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('select.form-select') as HTMLSelectElement | null;
    expect(select).toBeTruthy();
    expect(select?.hasAttribute('size')).toBe(false);
  });

  it('renders size="5" when htmlSize is 5', async () => {
    const { fixture } = createFixture({ options, props: { htmlSize: 5 } });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('select.form-select') as HTMLSelectElement | null;
    expect(select).toBeTruthy();
    expect(select?.getAttribute('size')).toBe('5');
  });

  it('renders label and options', async () => {
    const { fixture } = createFixture({ options, label: 'Pick one' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('label.form-label') as HTMLLabelElement | null;
    expect(label?.textContent?.trim()).toBe('Pick one');

    const rendered = Array.from(fixture.nativeElement.querySelectorAll('option')) as HTMLOptionElement[];
    expect(rendered.map((o) => o.textContent?.trim())).toEqual(['Option A', 'Option B']);
    expect(rendered.map((o) => o.value)).toEqual(['a', 'b']);
  });
});
