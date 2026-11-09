import { provideTestValidationMessages, createNgForgeFieldFixture } from '@ng-forge/dynamic-forms/integration';
import { describe, expect, it } from 'vitest';
import PrimeDatepickerFieldComponent from './prime-datepicker.component';
import { PrimeDatepickerProps } from './prime-datepicker.type';

async function typeDate(props: PrimeDatepickerProps, text: string): Promise<string | null> {
  const { fixture, rootValue } = createNgForgeFieldFixture<PrimeDatepickerFieldComponent, string | null>(PrimeDatepickerFieldComponent, {
    key: 'date',
    value: null,
    inputs: { props },
    providers: [provideTestValidationMessages({})],
  });
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();

  const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
  // PrimeNG only parses input that follows a keydown.
  input.dispatchEvent(new KeyboardEvent('keydown', { key: '5' }));
  input.value = text;
  input.dispatchEvent(new Event('input'));
  fixture.detectChanges();
  return rootValue().date;
}

describe('PrimeDatepickerFieldComponent — locale', () => {
  it.each([
    ['en-US', 'mm/dd/yy', '12/15/2026'],
    ['de-DE', 'dd.mm.yy', '15.12.2026'],
    ['ro-RO', 'dd.mm.yy', '15.12.2026'],
  ])('parses %s input with dateFormat %s', async (_locale, dateFormat, text) => {
    expect(await typeDate({ dateFormat }, text)).toBe(new Date(2026, 11, 15).toISOString());
  });
});
