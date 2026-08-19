/**
 * ContainerField reconciliation gate, Material.
 *
 * `container` is registered in `FieldRegistryContainers` and in core's
 * `BUILT_IN_FIELDS`, but the Zod validation schemas reject it as an unknown
 * field type. Before that divergence can be resolved in either direction, the
 * runtime behaviour has to be established rather than assumed.
 *
 * Scope is deliberately narrow: a bare container, its children, its wrappers,
 * and whether adapter-native fields render inside it. Nesting and cardinality
 * rules are explicitly out of scope.
 */

import { TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { DynamicForm, provideDynamicForm, type FormConfig } from '@ng-forge/dynamic-forms';
import { afterEach, describe, expect, it } from 'vitest';
import { withMaterialFields } from './providers/material-providers';

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function mountForm(config: FormConfig, expectedInputs: number) {
  TestBed.configureTestingModule({
    imports: [DynamicForm],
    providers: [provideAnimations(), provideDynamicForm(...withMaterialFields())],
  });
  const fixture = TestBed.createComponent(DynamicForm);
  fixture.componentRef.setInput('dynamic-form', config);
  fixture.detectChanges();

  // Adapter fields load via dynamic import(); pump until they render rather than
  // waiting a fixed time, so this gates on a real condition.
  for (let i = 0; i < 40 && fixture.nativeElement.querySelectorAll('input').length < expectedInputs; i++) {
    await delay(5);
    fixture.detectChanges();
    TestBed.flushEffects();
  }
  await delay(5);
  fixture.detectChanges();
  TestBed.flushEffects();
  return fixture;
}

describe('ContainerField runtime support (Material)', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('renders adapter-native children inside a bare container', async () => {
    const config = {
      fields: [
        {
          key: 'chrome',
          type: 'container',
          wrappers: [],
          fields: [{ key: 'email', type: 'input', label: 'Email' }],
        },
      ],
    } as unknown as FormConfig;

    const fixture = await mountForm(config, 1);

    // The Material form field is what proves the adapter rendered, rather than
    // a bare input that any adapter would produce.
    expect(fixture.nativeElement.querySelectorAll('mat-form-field').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('input').length).toBe(1);
  });

  it('flattens child values, so the container contributes no key of its own', async () => {
    const config = {
      fields: [
        {
          key: 'chrome',
          type: 'container',
          wrappers: [],
          fields: [
            { key: 'first', type: 'input', label: 'First', value: 'Ada' },
            { key: 'last', type: 'input', label: 'Last', value: 'Lovelace' },
          ],
        },
      ],
    } as unknown as FormConfig;

    const fixture = await mountForm(config, 2);

    expect(fixture.componentInstance.formValue()).toEqual({ first: 'Ada', last: 'Lovelace' });
  });

  it('applies a real registered wrapper around its children', async () => {
    // The built-in `css` wrapper, not an unregistered placeholder, so this
    // exercises the wrapper chain rather than its absence.
    const config = {
      fields: [
        {
          key: 'chrome',
          type: 'container',
          wrappers: [{ type: 'css', cssClasses: 'spike-chrome' }],
          fields: [{ key: 'email', type: 'input', label: 'Email' }],
        },
      ],
    } as unknown as FormConfig;

    const fixture = await mountForm(config, 1);
    const wrapper = fixture.nativeElement.querySelector('.spike-chrome');

    expect(wrapper, 'wrapper element did not render').toBeTruthy();
    expect(wrapper.querySelector('mat-form-field'), 'child did not render inside the wrapper').toBeTruthy();
  });

  it('renders an empty container without error', async () => {
    const config = {
      fields: [{ key: 'chrome', type: 'container', wrappers: [], fields: [] }],
    } as unknown as FormConfig;

    const fixture = await mountForm(config, 0);

    expect(fixture.componentInstance.valid()).toBe(true);
  });
});
