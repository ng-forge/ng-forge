import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal, WritableSignal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { createSchemaFromFields } from './schema-builder';
import { SchemaRegistryService } from './registry/schema-registry.service';
import { FormStateManager } from '../state/form-state-manager';
import {
  DEPRECATION_WARNING_TRACKER,
  DynamicValueFunctionCacheService,
  FieldContextRegistryService,
  FieldDef,
  FieldTypeDefinition,
  FunctionRegistryService,
  HttpConditionFunctionCacheService,
  interpolateParams,
  LogicFunctionCacheService,
  RootFormRegistryService,
} from '@ng-forge/dynamic-forms/internal';
import { createWarningTracker } from '@ng-forge/dynamic-forms/internal';

/**
 * Integration coverage for issue #512 native routing: built-in validators with a
 * static value and a `when` condition are applied natively via Angular Signal Forms
 * instead of the root validateTree.
 */
describe('conditional validator routing (native when)', () => {
  const mockEntity = signal<Record<string, unknown>>({});
  const mockFormSignal = signal<unknown>(undefined);

  let injector: Injector;
  let registry: Map<string, FieldTypeDefinition>;

  const crossFieldWhen = { type: 'javascript' as const, expression: 'formValue.other === "yes"' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SchemaRegistryService,
        FunctionRegistryService,
        FieldContextRegistryService,
        { provide: RootFormRegistryService, useValue: { formValue: mockEntity, rootForm: mockFormSignal } },
        { provide: FormStateManager, useValue: { activeConfig: signal(undefined) } },
        { provide: DEPRECATION_WARNING_TRACKER, useFactory: createWarningTracker },
        LogicFunctionCacheService,
        HttpConditionFunctionCacheService,
        DynamicValueFunctionCacheService,
      ],
    });

    injector = TestBed.inject(Injector);
    registry = new Map<string, FieldTypeDefinition>();
    registry.set('input', { name: 'input', mapper: () => [], valueHandling: 'include' });
    registry.set('checkbox', { name: 'checkbox', mapper: () => [], valueHandling: 'include' });
    registry.set('array', { name: 'array', mapper: () => [], valueHandling: 'include' });

    mockEntity.set({});
    mockFormSignal.set(undefined);
  });

  /** Builds the same pipeline as FormStateManager: fields feed createSchemaFromFields. */
  function buildForm<T extends Record<string, unknown>>(fields: FieldDef<unknown>[], initial: T) {
    return runInInjectionContext(injector, () => {
      const model = signal<T>(initial);
      mockEntity.set(initial);
      const formSchema = createSchemaFromFields<T>(fields, registry);
      const formInstance = form(model, formSchema);
      mockFormSignal.set(formInstance);
      return { model, formInstance };
    });
  }

  function setValue<T extends Record<string, unknown>>(model: WritableSignal<T>, value: T): void {
    model.set(value);
    mockEntity.set(value);
  }

  it('emits exactly one native error for a violated conditional built-in and interpolates the constraint', () => {
    const fields: FieldDef<unknown>[] = [
      { type: 'input', key: 'name', validators: [{ type: 'maxLength', value: 5, when: crossFieldWhen }] } as FieldDef<unknown>,
      { type: 'input', key: 'other' } as FieldDef<unknown>,
    ];

    const { model, formInstance } = buildForm(fields, { name: 'way too long', other: 'no' });

    expect(formInstance.name().errors()).toEqual([]);

    setValue(model, { name: 'way too long', other: 'yes' });

    const errors = formInstance.name().errors();
    expect(errors).toHaveLength(1);
    expect(errors[0].kind).toBe('maxLength');
    expect(formInstance.name().maxLength?.()).toBe(5);

    const message = interpolateParams(
      'Must be at most {{requiredLength}} characters',
      errors[0] as unknown as Parameters<typeof interpolateParams>[1],
    );
    expect(message).toBe('Must be at most 5 characters');
  });

  it('clears the error when the condition flips mid-edit', () => {
    const fields: FieldDef<unknown>[] = [
      { type: 'input', key: 'name', validators: [{ type: 'maxLength', value: 5, when: crossFieldWhen }] } as FieldDef<unknown>,
      { type: 'input', key: 'other' } as FieldDef<unknown>,
    ];

    const { model, formInstance } = buildForm(fields, { name: 'way too long', other: 'yes' });

    expect(formInstance.name().errors()).toHaveLength(1);

    setValue(model, { name: 'way too long', other: 'no' });
    expect(formInstance.name().errors()).toEqual([]);
    expect(formInstance().valid()).toBe(true);
  });

  it('honors validateWhenHidden: false for a conditional required on a hidden field', () => {
    const fields: FieldDef<unknown>[] = [
      { type: 'input', key: 'secret', hidden: true, validators: [{ type: 'required', when: crossFieldWhen }] } as FieldDef<unknown>,
      { type: 'input', key: 'other' } as FieldDef<unknown>,
    ];

    const { formInstance } = buildForm(fields, { secret: '', other: 'yes' });

    // Condition is met but the field is hidden - validation is gated off, form submittable
    expect(formInstance.secret().errors()).toEqual([]);
    expect(formInstance().valid()).toBe(true);
  });

  it('applies conditional validators declared in a named SchemaDefinition', () => {
    runInInjectionContext(injector, () => {
      const schemaRegistry = TestBed.inject(SchemaRegistryService);
      schemaRegistry.registerSchema({
        name: 'nameRules',
        validators: [{ type: 'maxLength', value: 5, when: crossFieldWhen }],
      });
    });

    const fields: FieldDef<unknown>[] = [
      { type: 'input', key: 'name', schemas: [{ type: 'apply', schema: 'nameRules' }] } as FieldDef<unknown>,
      { type: 'input', key: 'other' } as FieldDef<unknown>,
    ];

    const { model, formInstance } = buildForm(fields, { name: 'way too long', other: 'no' });

    expect(formInstance.name().errors()).toEqual([]);

    setValue(model, { name: 'way too long', other: 'yes' });
    const errors = formInstance.name().errors();
    expect(errors).toHaveLength(1);
    expect(errors[0].kind).toBe('maxLength');
  });

  it('reports conditional array-item errors on the correct index', () => {
    // Array-item evaluation contexts scope formValue to the item; the root is rootFormValue
    const rootScopedWhen = { type: 'javascript' as const, expression: 'rootFormValue.other === "yes"' };
    const fields: FieldDef<unknown>[] = [
      {
        type: 'array',
        key: 'contacts',
        fields: [[{ type: 'input', key: 'email', validators: [{ type: 'maxLength', value: 5, when: rootScopedWhen }] }]],
      } as unknown as FieldDef<unknown>,
      { type: 'input', key: 'other' } as FieldDef<unknown>,
    ];

    const initial = { contacts: [{ email: 'ok' }, { email: 'way too long' }], other: 'no' };
    const { model, formInstance } = buildForm(fields, initial);

    expect(formInstance.contacts[1].email().errors()).toEqual([]);

    setValue(model, { ...initial, other: 'yes' });

    expect(formInstance.contacts[0].email().errors()).toEqual([]);
    const itemErrors = formInstance.contacts[1].email().errors();
    expect(itemErrors).toHaveLength(1);
    expect(itemErrors[0].kind).toBe('maxLength');
  });
});
