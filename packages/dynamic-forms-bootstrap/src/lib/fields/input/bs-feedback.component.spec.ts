import { type Type } from '@angular/core';
import { required } from '@angular/forms/signals';
import { createNgForgeFieldFixture, provideTestValidationMessages } from '@ng-forge/dynamic-forms/integration';
import { ADDON_ACTION_REGISTRY, ADDON_TYPE_COMPONENT_CACHE, ADDON_TYPE_REGISTRY } from '@ng-forge/dynamic-forms/integration';
import { describe, expect, it } from 'vitest';
import BsInputFieldComponent from './bs-input.component';
import BsTextareaFieldComponent from '../textarea/bs-textarea.component';
import BsSelectFieldComponent from '../select/bs-select.component';
import BsDatepickerFieldComponent from '../datepicker/bs-datepicker.component';

const components = [
  ['input', BsInputFieldComponent],
  ['textarea', BsTextareaFieldComponent],
  ['select', BsSelectFieldComponent],
  ['datepicker', BsDatepickerFieldComponent],
] as const;

async function render(component: Type<unknown>, props: Record<string, unknown>, messages: Record<string, string>, value: unknown = '') {
  const { fixture } = createNgForgeFieldFixture<unknown, unknown>(component, {
    key: 'f',
    value,
    touched: true,
    schema: (path) => required(path),
    inputs: { props, options: [{ value: 'a', label: 'A' }] },
    providers: [
      provideTestValidationMessages(messages),
      { provide: ADDON_TYPE_REGISTRY, useValue: new Map() },
      { provide: ADDON_TYPE_COMPONENT_CACHE, useFactory: () => new Map() },
      { provide: ADDON_ACTION_REGISTRY, useValue: new Map() },
    ],
  });
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('Bootstrap fields — invalidFeedback fallback', () => {
  it.each(components)('%s shows invalidFeedback when the error has no message', async (_name, component) => {
    const el = await render(component, { invalidFeedback: 'Please fix this' }, {});
    expect(el.querySelector('.invalid-feedback')?.textContent?.trim()).toBe('Please fix this');
  });

  it.each(components)('%s prefers the validation message', async (_name, component) => {
    const el = await render(component, { invalidFeedback: 'Please fix this' }, { required: 'Required' });
    expect(el.querySelector('.invalid-feedback')?.textContent?.trim()).toBe('Required');
  });
});

describe('Bootstrap select — validFeedback and floatingLabel', () => {
  it('shows validFeedback once valid and touched', async () => {
    const el = await render(BsSelectFieldComponent, { validFeedback: 'Looks good' }, {}, 'a');
    expect(el.querySelector('.valid-feedback')?.textContent?.trim()).toBe('Looks good');
    expect(el.querySelector('select')?.classList.contains('is-valid')).toBe(true);
  });

  it('renders a floating label after the select', async () => {
    const { fixture } = createNgForgeFieldFixture<unknown, unknown>(BsSelectFieldComponent, {
      key: 'f',
      value: 'a',
      inputs: { props: { floatingLabel: true }, label: 'Choice', options: [{ value: 'a', label: 'A' }] },
      providers: [provideTestValidationMessages({})],
    });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const wrapper = (fixture.nativeElement as HTMLElement).querySelector('.form-floating');
    expect(wrapper).toBeTruthy();
    expect(wrapper?.querySelector('select + label')?.textContent?.trim()).toBe('Choice');
  });
});
