import { createNgForgeFieldFixture, provideTestValidationMessages } from '@ng-forge/dynamic-forms/integration';
import { describe, expect, it } from 'vitest';
import IonicRadioFieldComponent from './ionic-radio.component';

const options = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
];

async function render(label?: string): Promise<HTMLElement> {
  const { fixture } = createNgForgeFieldFixture<unknown, unknown>(IonicRadioFieldComponent, {
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

describe('IonicRadioFieldComponent accessible name', () => {
  it('names the radio group with its visible label', async () => {
    const host = await render('Pick one');
    const group = host.querySelector('ion-radio-group') as HTMLElement;
    const labelId = group.getAttribute('aria-labelledby');

    expect(labelId).toBeTruthy();
    expect(host.querySelector(`#${labelId}`)?.textContent?.trim()).toBe('Pick one');
  });

  it('sets no aria-labelledby without a label', async () => {
    const host = await render();

    expect(host.querySelector('ion-radio-group')?.hasAttribute('aria-labelledby')).toBe(false);
  });
});
