import { type Provider } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatRadioButton } from '@angular/material/radio';
import { createNgForgeFieldFixture, provideTestValidationMessages } from '@ng-forge/dynamic-forms/integration';
import { MATERIAL_CONFIG } from '@ng-forge/dynamic-forms-material/shared';
import { describe, expect, it } from 'vitest';
import MatRadioFieldComponent from './mat-radio.component';
import MatMultiCheckboxFieldComponent from '../multi-checkbox/mat-multi-checkbox.component';

const options = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
];

async function ripples(
  component: typeof MatRadioFieldComponent | typeof MatMultiCheckboxFieldComponent,
  kitControl: typeof MatRadioButton | typeof MatCheckbox,
  props: Record<string, unknown>,
  providers: Provider[] = [],
): Promise<boolean[]> {
  const { fixture } = createNgForgeFieldFixture<unknown, unknown>(component, {
    key: 'choice',
    value: component === MatRadioFieldComponent ? null : [],
    inputs: { options, props },
    providers: [provideAnimations(), provideTestValidationMessages({}), ...providers],
  });
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.debugElement
    .queryAll(By.directive(kitControl))
    .map((el) => (el.componentInstance as { disableRipple: boolean }).disableRipple);
}

describe('Material radio and multi-checkbox — disableRipple', () => {
  it.each([
    ['radio', MatRadioFieldComponent, MatRadioButton, true],
    ['radio', MatRadioFieldComponent, MatRadioButton, false],
    ['multi-checkbox', MatMultiCheckboxFieldComponent, MatCheckbox, true],
    ['multi-checkbox', MatMultiCheckboxFieldComponent, MatCheckbox, false],
  ] as const)('%s passes props.disableRipple %s to every option', async (_name, component, kitControl, disableRipple) => {
    expect(await ripples(component, kitControl, { disableRipple })).toEqual([disableRipple, disableRipple]);
  });

  it.each([
    ['radio', MatRadioFieldComponent, MatRadioButton],
    ['multi-checkbox', MatMultiCheckboxFieldComponent, MatCheckbox],
  ] as const)('%s falls back to the global Material config', async (_name, component, kitControl) => {
    const config = [{ provide: MATERIAL_CONFIG, useValue: { disableRipple: true } }];
    expect(await ripples(component, kitControl, {}, config)).toEqual([true, true]);
  });
});
