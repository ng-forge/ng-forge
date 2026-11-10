import { Injectable, type Provider, type Type } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { DateAdapter, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import { ADDON_ACTION_REGISTRY, ADDON_TYPE_COMPONENT_CACHE, ADDON_TYPE_REGISTRY } from '@ng-forge/dynamic-forms/integration';
import { createNgForgeFieldFixture, provideTestValidationMessages } from '@ng-forge/dynamic-forms/integration';
import { describe, expect, it } from 'vitest';
import MatDatepickerFieldComponent from './mat-datepicker.component';

/** Stands in for an app adapter (date-fns, Luxon, ...) that parses day-first input. */
@Injectable()
class DayFirstDateAdapter extends NativeDateAdapter {
  override parse(value: unknown): Date | null {
    const match = typeof value === 'string' ? /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(value.trim()) : null;
    return match ? new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1])) : super.parse(value);
  }
}

function createFixture(providers: Provider[] = [], value: Date | null = null) {
  return createNgForgeFieldFixture<MatDatepickerFieldComponent, Date | null>(MatDatepickerFieldComponent, {
    key: 'date',
    value,
    providers: [
      provideAnimations(),
      { provide: ADDON_TYPE_REGISTRY, useValue: new Map() },
      { provide: ADDON_TYPE_COMPONENT_CACHE, useFactory: () => new Map<string, Type<unknown>>() },
      { provide: ADDON_ACTION_REGISTRY, useValue: new Map() },
      provideTestValidationMessages({}),
      ...providers,
    ],
  });
}

async function render(fixture: ReturnType<typeof createFixture>['fixture']): Promise<HTMLInputElement> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.nativeElement.querySelector('input') as HTMLInputElement;
}

function type(input: HTMLInputElement, text: string): void {
  input.value = text;
  input.dispatchEvent(new Event('input'));
}

describe('MatDatepickerFieldComponent — locale', () => {
  it('parses en-US input with the default native adapter', async () => {
    const { fixture, rootValue } = createFixture();
    type(await render(fixture), '12/15/2026');

    expect(rootValue().date).toEqual(new Date(2026, 11, 15));
  });

  it.each(['de-DE', 'ro-RO'])('parses %s input with an app-provided DateAdapter', async (locale) => {
    const { fixture, rootValue } = createFixture([
      { provide: MAT_DATE_LOCALE, useValue: locale },
      { provide: DateAdapter, useClass: DayFirstDateAdapter },
    ]);
    type(await render(fixture), '15.12.2026');

    expect(rootValue().date).toEqual(new Date(2026, 11, 15));
  });

  it.each([
    ['en-US', '12/15/2026'],
    ['de-DE', '15.12.2026'],
    ['ro-RO', '15.12.2026'],
  ])('displays the value in the app MAT_DATE_LOCALE (%s)', async (locale, expected) => {
    const { fixture } = createFixture([{ provide: MAT_DATE_LOCALE, useValue: locale }], new Date(2026, 11, 15));

    expect((await render(fixture)).value).toBe(expected);
  });
});
