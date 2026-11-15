import { signal, type Type } from '@angular/core';
import { required } from '@angular/forms/signals';
import { ADDON_ACTION_REGISTRY, ADDON_TYPE_COMPONENT_CACHE, ADDON_TYPE_REGISTRY } from '@ng-forge/dynamic-forms/integration';
import { createNgForgeFieldFixture, provideTestValidationMessages } from '@ng-forge/dynamic-forms/integration';
import { describe, expect, it } from 'vitest';
import IonicInputFieldComponent from './ionic-input.component';
import IonicTextareaFieldComponent from '../textarea/ionic-textarea.component';
import IonicSelectFieldComponent from '../select/ionic-select.component';
import IonicDatepickerFieldComponent from '../datepicker/ionic-datepicker.component';

async function render(
  component: Type<unknown>,
  inputs: Record<string, unknown>,
  opts: { messages?: Record<string, string>; value?: unknown } = {},
) {
  const { fixture } = createNgForgeFieldFixture<unknown, unknown>(component, {
    key: 'f',
    value: opts.value ?? '',
    touched: true,
    schema: (path) => required(path),
    inputs,
    providers: [
      provideTestValidationMessages(opts.messages ?? {}),
      { provide: ADDON_TYPE_REGISTRY, useValue: new Map() },
      { provide: ADDON_TYPE_COMPONENT_CACHE, useFactory: () => new Map() },
      { provide: ADDON_ACTION_REGISTRY, useValue: new Map() },
    ],
  });
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
}

describe('Ionic fields — previously unused props', () => {
  it.each([
    ['input', IonicInputFieldComponent],
    ['textarea', IonicTextareaFieldComponent],
  ] as const)('%s shows errorText when the error has no message', async (_name, component) => {
    const fixture = await render(component, { props: { errorText: 'Please fix this' } });
    expect(fixture.nativeElement.querySelector('.df-ion-error')?.textContent?.trim()).toBe('Please fix this');
  });

  it.each([
    ['input', IonicInputFieldComponent],
    ['textarea', IonicTextareaFieldComponent],
  ] as const)('%s prefers the validation message over errorText', async (_name, component) => {
    const fixture = await render(component, { props: { errorText: 'Please fix this' } }, { messages: { required: 'Required' } });
    expect(fixture.nativeElement.querySelector('.df-ion-error')?.textContent?.trim()).toBe('Required');
  });

  it('resolves dynamic cancelText and okText on select', async () => {
    const fixture = await render(IonicSelectFieldComponent, {
      options: [{ value: 'a', label: 'A' }],
      props: { cancelText: signal('Abbrechen'), okText: 'Fertig' },
    });
    const select = fixture.nativeElement.querySelector('ion-select') as HTMLElement & { cancelText?: string; okText?: string };
    expect(select.cancelText).toBe('Abbrechen');
    expect(select.okText).toBe('Fertig');
  });

  it('keeps the default select texts when none are set', async () => {
    const fixture = await render(IonicSelectFieldComponent, { options: [{ value: 'a', label: 'A' }], props: {} });
    const select = fixture.nativeElement.querySelector('ion-select') as HTMLElement & { cancelText?: string; okText?: string };
    expect(select.cancelText).toBe('Cancel');
    expect(select.okText).toBe('OK');
  });

  it('passes doneText, cancelText and size to ion-datetime', async () => {
    const fixture = await render(
      IonicDatepickerFieldComponent,
      { props: { doneText: 'Fertig', cancelText: 'Abbrechen', size: 'cover', showDefaultButtons: true } },
      { value: null },
    );
    (fixture.componentInstance as { openModal(): void }).openModal();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const datetime = document.querySelector('ion-datetime') as
      (HTMLElement & { doneText?: string; cancelText?: string; size?: string }) | null;
    expect(datetime?.doneText).toBe('Fertig');
    expect(datetime?.cancelText).toBe('Abbrechen');
    expect(datetime?.size).toBe('cover');
  });
});
