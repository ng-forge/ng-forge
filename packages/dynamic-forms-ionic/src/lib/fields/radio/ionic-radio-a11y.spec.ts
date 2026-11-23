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

// ion-radio-group overwrites aria-labelledby when it renders, so the group is named with aria-label.
// The e2e accessibility suite checks the name survives hydration.
describe('IonicRadioFieldComponent accessible name', () => {
  it('names the radio group with its visible label', async () => {
    const host = await render('Pick one');

    expect(host.querySelector('ion-radio-group')?.getAttribute('aria-label')).toBe('Pick one');
  });

  it('sets no aria-label without a label', async () => {
    const host = await render();

    expect(host.querySelector('ion-radio-group')?.hasAttribute('aria-label')).toBe(false);
  });
});
