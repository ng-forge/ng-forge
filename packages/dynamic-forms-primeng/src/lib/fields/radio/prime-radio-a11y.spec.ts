import { createNgForgeFieldFixture, provideTestValidationMessages } from '@ng-forge/dynamic-forms/integration';
import { describe, expect, it } from 'vitest';
import PrimeRadioFieldComponent from './prime-radio.component';

const options = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
];

async function render(label?: string): Promise<HTMLElement> {
  const { fixture } = createNgForgeFieldFixture<unknown, unknown>(PrimeRadioFieldComponent, {
    key: 'choice',
    value: null,
    inputs: { options, label },
    providers: [provideTestValidationMessages({})],
  });
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('PrimeRadioFieldComponent accessible name', () => {
  it('names the radio group with its visible label', async () => {
    const host = await render('Pick one');
    const group = host.querySelector('[role="radiogroup"]') as HTMLElement;
    const labelId = group.getAttribute('aria-labelledby');

    expect(labelId).toBeTruthy();
    expect(host.querySelector(`#${labelId}`)?.textContent?.trim()).toBe('Pick one');
  });

  it('sets no aria-labelledby without a label', async () => {
    const host = await render();

    expect(host.querySelector('[role="radiogroup"]')?.hasAttribute('aria-labelledby')).toBe(false);
  });
});
