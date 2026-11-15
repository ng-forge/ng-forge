import { By } from '@angular/platform-browser';
import { createNgForgeFieldFixture, provideTestValidationMessages } from '@ng-forge/dynamic-forms/integration';
import { describe, expect, it } from 'vitest';
import PrimeDatepickerFieldComponent from './prime-datepicker.component';
import { PrimeDatepickerControlComponent } from './prime-datepicker-control.component';
import { PrimeDatepickerProps } from './prime-datepicker.type';

const first = new Date(2026, 11, 15);
const second = new Date(2026, 11, 20);

async function setup(props: PrimeDatepickerProps, value: unknown = null) {
  const { fixture, rootValue } = createNgForgeFieldFixture<PrimeDatepickerFieldComponent, unknown>(PrimeDatepickerFieldComponent, {
    key: 'date',
    value,
    inputs: { props },
    providers: [provideTestValidationMessages({})],
  });
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  const control = fixture.debugElement.query(By.directive(PrimeDatepickerControlComponent))
    .componentInstance as PrimeDatepickerControlComponent;
  return { control, rootValue };
}

describe('PrimeDatepickerFieldComponent — multiple and range modes', () => {
  it.each(['multiple', 'range'] as const)('stores %s selections as ISO strings', async (selectionMode) => {
    const { control, rootValue } = await setup({ selectionMode });
    control.onModelChange([first, second]);
    expect(rootValue().date).toEqual([first.toISOString(), second.toISOString()]);
  });

  it('keeps a half-picked range instead of clearing it', async () => {
    const { control, rootValue } = await setup({ selectionMode: 'range' });
    control.onModelChange([first, null]);
    expect(rootValue().date).toEqual([first.toISOString()]);
  });

  it('does not let a single date selection overwrite a range', async () => {
    const { control, rootValue } = await setup({ selectionMode: 'range' });
    control.onModelChange([first, second]);
    control.onSelect(second);
    expect(rootValue().date).toEqual([first.toISOString(), second.toISOString()]);
  });

  it('reads an array value back as dates', async () => {
    const { control } = await setup({ selectionMode: 'multiple' }, [first.toISOString(), second.toISOString()]);
    expect(control['dateValue']()).toEqual([first, second]);
  });

  it('still stores a single date as an ISO string', async () => {
    const { control, rootValue } = await setup({});
    control.onModelChange(first);
    expect(rootValue().date).toBe(first.toISOString());
  });
});
