import { createNgForgeFieldFixture } from '@ng-forge/dynamic-forms/integration';
import { describe, expect, it } from 'vitest';
import IonicDatepickerFieldComponent from './ionic-datepicker.component';

const first = new Date(2026, 11, 15);
const second = new Date(2026, 11, 20);

async function setup(value: unknown = null) {
  const { fixture, rootValue } = createNgForgeFieldFixture<IonicDatepickerFieldComponent, unknown>(IonicDatepickerFieldComponent, {
    key: 'date',
    value,
    inputs: { props: { multiple: true, locale: 'en-US' } },
  });
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance, rootValue };
}

describe('IonicDatepickerFieldComponent — multiple mode', () => {
  it('stores multiple selections as dates', async () => {
    const { component, rootValue } = await setup();
    component.onDateChange(new CustomEvent('ionChange', { detail: { value: [first.toISOString(), second.toISOString()] } }));
    expect(rootValue().date).toEqual([first, second]);
  });

  it('passes an array value to ion-datetime as ISO strings', async () => {
    const { component } = await setup();
    expect(component.valueToIso([first, second])).toEqual([first.toISOString(), second.toISOString()]);
  });

  it('shows every selected date in the field', async () => {
    const { fixture } = await setup([first, second]);
    const value = (fixture.nativeElement.querySelector('ion-input') as HTMLElement & { value?: string }).value;
    expect(value?.replace(/\s/g, ' ')).toBe('Dec 15, 2026, Dec 20, 2026');
  });
});
