import { Component, computed, inject, input, signal } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { delay } from '@ng-forge/utils';
import { DynamicForm } from '../dynamic-form.component';
import { FIELD_REGISTRY, FieldTypeDefinition } from '../models/field-type';
import { BUILT_IN_FIELDS } from '../providers/built-in-fields';
import { FormConfig } from '../models/form-config';
import { FIELD_SIGNAL_CONTEXT } from '../models';

@Component({
  selector: 'df-test-required-field',
  standalone: true,
  template: '',
  host: {
    '[attr.data-testid]': 'key()',
    '[attr.hidden]': 'hiddenAttr()',
  },
})
class TestRequiredFieldComponent {
  readonly field = input.required<FieldTree<string>>();
  readonly key = input.required<string>();

  readonly hiddenAttr = computed(() => this.field()().hidden() || null);
}

function delayedFieldMapper(fieldDef: { key: string }) {
  const context = inject(FIELD_SIGNAL_CONTEXT);
  const attachField = signal(false);

  setTimeout(() => attachField.set(true), 50);

  return computed(() => {
    const formRoot = context.form as Record<string, FieldTree<string> | undefined> | undefined;
    const fieldTree = formRoot?.[fieldDef.key];

    return {
      key: fieldDef.key,
      ...(attachField() && fieldTree ? { field: fieldTree } : {}),
    };
  });
}

describe('render-ready metadata', () => {
  it('waits for required mapped inputs before instantiating paged field components', async () => {
    const registry: FieldTypeDefinition[] = [
      ...BUILT_IN_FIELDS,
      {
        name: 'required-field',
        loadComponent: () => Promise.resolve(TestRequiredFieldComponent),
        mapper: delayedFieldMapper,
        renderReadyWhen: ['field'],
      },
    ];

    await TestBed.configureTestingModule({
      imports: [DynamicForm],
      providers: [
        {
          provide: FIELD_REGISTRY,
          useFactory: () => new Map(registry.map((fieldType) => [fieldType.name, fieldType])),
        },
      ],
    }).compileComponents();

    const config: FormConfig = {
      fields: [
        {
          key: 'page1',
          type: 'page',
          fields: [{ key: 'birthDate', type: 'required-field', label: 'Birth date', value: '' }],
        },
      ],
    } as unknown as FormConfig;

    const fixture = TestBed.createComponent(DynamicForm);
    fixture.componentRef.setInput('dynamic-form', config);
    fixture.componentRef.setInput('value', { birthDate: '' });

    fixture.detectChanges();
    TestBed.flushEffects();
    expect(fixture.nativeElement.querySelector('[data-testid="birthDate"]')).toBeNull();

    await delay(80);
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="birthDate"]')).toBeTruthy();
  }, 5000);
});
