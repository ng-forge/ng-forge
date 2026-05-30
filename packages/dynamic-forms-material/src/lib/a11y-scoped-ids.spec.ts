import { TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { DynamicForm, provideDynamicForm, type FormConfig } from '@ng-forge/dynamic-forms';
import { afterEach, describe, expect, it } from 'vitest';
import { withMaterialFields } from './providers/material-providers';

// Pass-3 audit hypothesis: errorId/hintId/inputId derive from the field key, so two groups with the
// same leaf key (#401) — or array items reusing a template key (#219) — would render duplicate DOM
// IDs, breaking ARIA uniqueness and label[for] association. These tests verify the actual rendered
// IDs to confirm whether the GROUP_CONTEXT/ARRAY_CONTEXT scoping already prevents the collision.

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function mountForm(config: FormConfig, expectedInputs: number) {
  TestBed.configureTestingModule({
    imports: [DynamicForm],
    providers: [provideAnimations(), provideDynamicForm(...withMaterialFields())],
  });
  const fixture = TestBed.createComponent(DynamicForm);
  fixture.componentRef.setInput('dynamic-form', config);
  fixture.detectChanges();
  // Material fields load via dynamic import(); FormStateManager.ready$ isn't public API across the
  // package boundary, so pump CD + effects until the expected inputs actually render (bounded), then
  // one extra pass for the derivedFromDeferred pipeline. Gates on a real condition, not a fixed wait.
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

function collectIds(root: HTMLElement, selector: string): string[] {
  return Array.from(root.querySelectorAll(selector))
    .map((el) => el.getAttribute('id'))
    .filter((id): id is string => !!id);
}

describe('scoped DOM IDs (a11y uniqueness)', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('renders unique input IDs for the same leaf key in two different groups (#401)', async () => {
    const config = {
      fields: [
        { key: 'groupA', type: 'group', fields: [{ key: 'city', type: 'input', label: 'City' }] },
        { key: 'groupB', type: 'group', fields: [{ key: 'city', type: 'input', label: 'City' }] },
      ],
    } as unknown as FormConfig;

    const fixture = await mountForm(config, 2);
    const inputIds = collectIds(fixture.nativeElement, 'input');

    expect(inputIds.length).toBe(2);
    expect(new Set(inputIds).size).toBe(inputIds.length); // no duplicates
  });

  it('renders unique input IDs across array items reusing one template key (#219)', async () => {
    const config = {
      fields: [
        {
          key: 'phones',
          type: 'array',
          value: ['', ''],
          template: { key: 'value', type: 'input', label: 'Phone' },
        },
      ],
    } as unknown as FormConfig;

    const fixture = await mountForm(config, 2);
    const inputIds = collectIds(fixture.nativeElement, 'input');

    expect(inputIds.length).toBeGreaterThanOrEqual(2);
    expect(new Set(inputIds).size).toBe(inputIds.length); // no duplicates across items
  });
});
