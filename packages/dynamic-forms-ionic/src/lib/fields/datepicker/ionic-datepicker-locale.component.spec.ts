import { createNgForgeFieldFixture } from '@ng-forge/dynamic-forms/integration';
import { describe, expect, it } from 'vitest';
import IonicDatepickerFieldComponent from './ionic-datepicker.component';
import { IonicDatepickerProps } from './ionic-datepicker.type';

interface IonInputLike extends HTMLElement {
  value?: string | null;
}

async function displayedValue(props: IonicDatepickerProps): Promise<string | null | undefined> {
  const { fixture } = createNgForgeFieldFixture<IonicDatepickerFieldComponent, Date | null>(IonicDatepickerFieldComponent, {
    key: 'date',
    value: new Date(2026, 11, 15, 14, 30),
    inputs: { props },
  });
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  // Intl uses a narrow no-break space before AM/PM.
  return (fixture.nativeElement.querySelector('ion-input') as IonInputLike).value?.replace(/\s/g, ' ');
}

describe('IonicDatepickerFieldComponent — locale', () => {
  it.each([
    ['en-US', 'Dec 15, 2026'],
    ['de-DE', '15. Dez. 2026'],
    ['ro-RO', '15 dec. 2026'],
  ])('displays the date in the configured locale (%s)', async (locale, expected) => {
    expect(await displayedValue({ locale })).toBe(expected);
  });

  it.each([
    ['en-US', 'Dec 15, 2026, 2:30 PM'],
    ['de-DE', '15. Dez. 2026, 14:30'],
  ])('displays date and time in the configured locale (%s)', async (locale, expected) => {
    expect(await displayedValue({ locale, presentation: 'date-time' })).toBe(expected);
  });
});
