import { TestBed } from '@angular/core/testing';
import { Injector, runInInjectionContext, signal } from '@angular/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { form, schema } from '@angular/forms/signals';
import { FieldDef } from '../definitions/base/field-def';
import { FieldWithValidation } from '../definitions/base/field-with-validation';
import { RootFormRegistryService, FunctionRegistryService, FieldContextRegistryService, SchemaRegistryService } from './registry';
import { FormStateManager } from '../state/form-state-manager';
import { mapFieldToForm } from './form-mapping';
import { LogicFunctionCacheService } from './expressions/logic-function-cache.service';

describe('form-mapping', () => {
  let injector: Injector;
  const mockEntity = signal<Record<string, unknown>>({});
  const mockFormSignal = signal<any>(undefined);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: RootFormRegistryService, useValue: { formValue: mockEntity, rootForm: mockFormSignal } },
        { provide: FormStateManager, useValue: { activeConfig: signal(undefined) } },
        FunctionRegistryService,
        FieldContextRegistryService,
        SchemaRegistryService,
        LogicFunctionCacheService,
      ],
    });

    injector = TestBed.inject(Injector);
    mockEntity.set({});
    mockFormSignal.set(undefined);
  });

  describe('mapFieldToForm', () => {
    describe('field type routing', () => {
      it('should handle page fields without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field1: '', field2: '' });
          const pageField: FieldDef = {
            type: 'page',
            fields: [
              { key: 'field1', type: 'input' },
              { key: 'field2', type: 'input' },
            ],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(pageField, path as any);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle container fields by flattening children', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ name: '', email: '' });
          const containerField: FieldDef = {
            type: 'container',
            key: 'section',
            fields: [
              { key: 'name', type: 'input' },
              { key: 'email', type: 'input' },
            ],
            wrappers: [],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(containerField, path as any);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle group fields without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ address: { street: '', city: '' } });
          const groupField: FieldDef = {
            key: 'address',
            type: 'group',
            fields: [
              { key: 'street', type: 'input' },
              { key: 'city', type: 'input' },
            ],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(groupField, path.address);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle regular fields without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            required: true,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });
    });

    describe('simple validation rules', () => {
      it('should handle required property without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            required: true,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle email property without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            email: true,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle min property without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ age: 0 });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'age',
            type: 'input',
            min: 18,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.age);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle max property without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ age: 0 });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'age',
            type: 'input',
            max: 120,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.age);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle minLength property without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'username',
            type: 'input',
            minLength: 3,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.username);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle maxLength property without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'username',
            type: 'input',
            maxLength: 20,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.username);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle pattern string without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'username',
            type: 'input',
            pattern: '^[a-z]+$',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.username);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle pattern RegExp without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ username: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'username',
            type: 'input',
            pattern: /^[a-z]+$/,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.username);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle fields with no validation properties', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'field',
            type: 'input',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.field);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });
    });

    describe('advanced validators/logic/schemas', () => {
      it('should handle advanced validators without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            validators: [{ type: 'required' }, { type: 'email' }],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle logic configurations without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            logic: [
              { type: 'hidden', condition: false },
              { type: 'readonly', condition: true },
            ],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle schema configurations without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            schemas: [{ type: 'apply', schema: 'emailSchema' }],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle combined validators, logic, and schemas', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            required: true,
            validators: [{ type: 'email' }],
            logic: [{ type: 'hidden', condition: false }],
            schemas: [{ type: 'apply', schema: 'test' }],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });
    });

    describe('field-specific configuration', () => {
      it('should handle disabled state without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const fieldDef: FieldDef = {
            key: 'email',
            type: 'input',
            disabled: true,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle custom form configuration without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });

          const fieldDef: FieldDef = {
            key: 'email',
            type: 'input',
            customFormConfig: { custom: true },
          } as FieldDef & { customFormConfig: unknown };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle fields without custom config', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: '' });
          const fieldDef: FieldDef = {
            key: 'email',
            type: 'input',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(fieldDef, path.email);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });
    });

    describe('page field flattening', () => {
      it('should handle page fields with children without keys', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field1: '', field2: '' });
          const pageField: FieldDef = {
            type: 'page',
            fields: [
              { type: 'input' }, // No key
              { key: 'field2', type: 'input', validators: [{ type: 'required' }] },
            ],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(pageField, path as any);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle page fields with missing paths', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field1: '' });
          const pageField: FieldDef = {
            type: 'page',
            fields: [
              { key: 'field1', type: 'input', validators: [{ type: 'required' }] },
              { key: 'field2', type: 'input', validators: [{ type: 'required' }] },
            ],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(pageField, path as any);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle empty page fields array', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({});
          const pageField: FieldDef = {
            type: 'page',
            fields: [],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(pageField, path as any);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle page field without fields property', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({});
          const pageField: FieldDef = {
            type: 'page',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(pageField, path as any);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle nested page fields', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ field1: '', field2: '' });
          const pageField: FieldDef = {
            type: 'page',
            fields: [
              {
                type: 'page',
                fields: [{ key: 'field1', type: 'input', validators: [{ type: 'required' }] }],
              },
              { key: 'field2', type: 'input', validators: [{ type: 'email' }] },
            ],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(pageField, path as any);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });
    });

    describe('group field flattening', () => {
      it('should handle group fields with children without keys', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ address: { street: '', city: '' } });
          const groupField: FieldDef = {
            key: 'address',
            type: 'group',
            fields: [
              { type: 'input' }, // No key
              { key: 'city', type: 'input', validators: [{ type: 'required' }] },
            ],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(groupField, path.address);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle group fields with missing nested paths', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ address: { street: '' } });
          const groupField: FieldDef = {
            key: 'address',
            type: 'group',
            fields: [
              { key: 'street', type: 'input', validators: [{ type: 'required' }] },
              { key: 'city', type: 'input', validators: [{ type: 'required' }] },
            ],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(groupField, path.address);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle empty group fields array', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ address: {} });
          const groupField: FieldDef = {
            key: 'address',
            type: 'group',
            fields: [],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(groupField, path.address);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle group field without fields property', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ address: {} });
          const groupField: FieldDef = {
            key: 'address',
            type: 'group',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(groupField, path.address);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });

      it('should handle nested group fields', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ address: { location: { street: '', city: '' } } });
          const groupField: FieldDef = {
            key: 'address',
            type: 'group',
            fields: [
              {
                key: 'location',
                type: 'group',
                fields: [
                  { key: 'street', type: 'input', validators: [{ type: 'required' }] },
                  { key: 'city', type: 'input', validators: [{ type: 'required' }] },
                ],
              },
            ],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(groupField, path.address);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });
    });

    describe('array field validation', () => {
      it('should produce minlength error when array has fewer items than minLength', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ items: [{ item: '' }] });
          const arrayField: FieldDef = {
            key: 'items',
            type: 'array',
            minLength: 2,
            fields: [{ key: 'item', type: 'input' }],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(arrayField, path.items as any);
            }),
          );
          mockFormSignal.set(formInstance);

          // 1 item with minLength: 2 → form should be invalid
          const rootState = formInstance();
          expect(rootState.valid()).toBe(false);
          expect(rootState.errorSummary().length).toBeGreaterThan(0);
        });
      });

      it('should produce maxlength error when array has more items than maxLength', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ tags: [{ tag: '' }, { tag: '' }, { tag: '' }] });
          const arrayField: FieldDef = {
            key: 'tags',
            type: 'array',
            maxLength: 2,
            fields: [{ key: 'tag', type: 'input' }],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(arrayField, path.tags as any);
            }),
          );
          mockFormSignal.set(formInstance);

          // 3 items with maxLength: 2 → form should be invalid
          const rootState = formInstance();
          expect(rootState.valid()).toBe(false);
          expect(rootState.errorSummary().length).toBeGreaterThan(0);
        });
      });

      it('should be valid when array satisfies minLength constraint', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ items: [{ item: '' }] });
          const arrayField: FieldDef = {
            key: 'items',
            type: 'array',
            minLength: 1,
            fields: [{ key: 'item', type: 'input' }],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(arrayField, path.items as any);
            }),
          );
          mockFormSignal.set(formInstance);

          // 1 item with minLength: 1 → form should be valid
          expect(formInstance().valid()).toBe(true);
        });
      });

      it('should be valid when array satisfies both minLength and maxLength constraints', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ items: [{ item: 'a' }, { item: 'b' }] });
          const arrayField: FieldDef = {
            key: 'items',
            type: 'array',
            minLength: 1,
            maxLength: 5,
            fields: [{ key: 'item', type: 'input' }],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(arrayField, path.items as any);
            }),
          );
          mockFormSignal.set(formInstance);

          // 2 items within [1, 5] → form should be valid
          expect(formInstance().valid()).toBe(true);
        });
      });

      it('should handle array field without length constraints without throwing', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ items: [{ item: '' }] });
          const arrayField: FieldDef = {
            key: 'items',
            type: 'array',
            fields: [{ key: 'item', type: 'input' }],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              expect(() => {
                mapFieldToForm(arrayField, path.items as any);
              }).not.toThrow();
            }),
          );
          mockFormSignal.set(formInstance);
        });
      });
    });

    describe('array item layout containers', () => {
      // Locks in the downstream dbxForgeAddressListField fix: a value-bearing
      // input nested under one or more layout containers (page/row/container)
      // inside an array item must still receive its schema mapping. Without
      // this, validators/logic/derivations against the leaf path do nothing.
      // `mapContainerChildren` flattens layout containers into the parent
      // path, so any depth of layout-container nesting reaches the leaf.
      it('should apply required validator to an input nested under a container inside an array item', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ addresses: [{ state: '' }] });
          const arrayField = {
            key: 'addresses',
            type: 'array',
            fields: [
              {
                type: 'container',
                fields: [{ key: 'state', type: 'input', required: true }],
                wrappers: [],
              },
            ],
          } as unknown as FieldDef;

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(arrayField, path.addresses as any);
            }),
          );
          mockFormSignal.set(formInstance);

          expect(formInstance().valid()).toBe(false);
        });
      });

      it('should apply required validator to an input nested under TWO containers inside an array item', () => {
        // Mirrors the deepest downstream nesting: array > itemContainer >
        // container(flex) > input(state).
        runInInjectionContext(injector, () => {
          const formValue = signal({ addresses: [{ state: '' }] });
          const arrayField = {
            key: 'addresses',
            type: 'array',
            fields: [
              {
                type: 'container',
                fields: [
                  {
                    type: 'container',
                    fields: [{ key: 'state', type: 'input', required: true }],
                    wrappers: [],
                  },
                ],
                wrappers: [],
              },
            ],
          } as unknown as FieldDef;

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(arrayField, path.addresses as any);
            }),
          );
          mockFormSignal.set(formInstance);

          expect(formInstance().valid()).toBe(false);
        });
      });

      it('should apply required validator to a leaf inside a group nested under a container in an array item', () => {
        // array > container > group > input — the inner group still consumes
        // its key (address), the layout container flattens into the item path.
        runInInjectionContext(injector, () => {
          const formValue = signal({ addresses: [{ address: { state: '' } }] });
          const arrayField = {
            key: 'addresses',
            type: 'array',
            fields: [
              {
                type: 'container',
                fields: [
                  {
                    key: 'address',
                    type: 'group',
                    fields: [{ key: 'state', type: 'input', required: true }],
                  },
                ],
                wrappers: [],
              },
            ],
          } as unknown as FieldDef;

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(arrayField, path.addresses as any);
            }),
          );
          mockFormSignal.set(formInstance);

          expect(formInstance().valid()).toBe(false);
        });
      });

      it('should apply required validator to an input nested under all three layout container types in an array item', () => {
        // array > row > page > container > input — exercises every layout
        // container type in one chain.
        runInInjectionContext(injector, () => {
          const formValue = signal({ addresses: [{ state: '' }] });
          const arrayField = {
            key: 'addresses',
            type: 'array',
            fields: [
              {
                type: 'row',
                fields: [
                  {
                    type: 'page',
                    fields: [
                      {
                        type: 'container',
                        wrappers: [],
                        fields: [{ key: 'state', type: 'input', required: true }],
                      },
                    ],
                  },
                ],
              },
            ],
          } as unknown as FieldDef;

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(arrayField, path.addresses as any);
            }),
          );
          mockFormSignal.set(formInstance);

          expect(formInstance().valid()).toBe(false);
        });
      });
    });

    describe('group with layout container child', () => {
      // The same fix in `mapContainerChildren` also repairs the group case:
      // an input nested under a layout container inside a group at form root
      // was previously skipped for the same reason as the array case.
      it('should apply required validator to an input nested under a container inside a group at form root', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ address: { state: '' } });
          const groupField = {
            key: 'address',
            type: 'group',
            fields: [
              {
                type: 'container',
                fields: [{ key: 'state', type: 'input', required: true }],
                wrappers: [],
              },
            ],
          } as unknown as FieldDef;

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(groupField, path.address as any);
            }),
          );
          mockFormSignal.set(formInstance);

          expect(formInstance().valid()).toBe(false);
        });
      });
    });

    describe('nullable + required interaction', () => {
      // Documents that `nullable` and `required` describe different layers: nullable
      // widens the accepted value shape; required validates that a value is present.
      // Angular's Validators.required treats null as invalid, so a field that is both
      // `nullable` and `required` and carries `null` fails required-validation.
      it('should mark a nullable+required field as invalid when value is null', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal<{ middleName: string | null }>({ middleName: null });
          const fieldDef: FieldDef & FieldWithValidation & { nullable: true } = {
            key: 'middleName',
            type: 'input',
            nullable: true,
            required: true,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(fieldDef, path.middleName);
            }),
          );
          mockFormSignal.set(formInstance);

          expect(formInstance().valid()).toBe(false);
        });
      });

      it('should mark a nullable+required field as valid when a non-null value is present', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal<{ middleName: string | null }>({ middleName: 'Quincy' });
          const fieldDef: FieldDef & FieldWithValidation & { nullable: true } = {
            key: 'middleName',
            type: 'input',
            nullable: true,
            required: true,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(fieldDef, path.middleName);
            }),
          );
          mockFormSignal.set(formInstance);

          expect(formInstance().valid()).toBe(true);
        });
      });

      it('should not require a value for nullable fields without required', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal<{ middleName: string | null }>({ middleName: null });
          const fieldDef: FieldDef & FieldWithValidation & { nullable: true } = {
            key: 'middleName',
            type: 'input',
            nullable: true,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(fieldDef, path.middleName);
            }),
          );
          mockFormSignal.set(formInstance);

          expect(formInstance().valid()).toBe(true);
        });
      });

      // Pins the friendly behavior for nullable fields: Signal Forms' built-in
      // validators (minLength, maxLength, pattern, email) short-circuit via
      // isEmpty(ctx.value()) and return no error when the value is null. This
      // means users can declare nullable + minLength on the same field without
      // extra conditional logic — length constraints only fire once the user
      // actually types something.
      it('should skip minLength validation when a nullable field is null', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal<{ name: string | null }>({ name: null });
          const fieldDef: FieldDef & FieldWithValidation & { nullable: true } = {
            key: 'name',
            type: 'input',
            nullable: true,
            minLength: 3,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(fieldDef, path.name);
            }),
          );
          mockFormSignal.set(formInstance);

          expect(formInstance().valid()).toBe(true);
        });
      });

      it('should enforce minLength once a nullable field carries a non-null value', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal<{ name: string | null }>({ name: 'ab' });
          const fieldDef: FieldDef & FieldWithValidation & { nullable: true } = {
            key: 'name',
            type: 'input',
            nullable: true,
            minLength: 3,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(fieldDef, path.name);
            }),
          );
          mockFormSignal.set(formInstance);

          // Value is 'ab' (length 2), below minLength — should error
          expect(formInstance().valid()).toBe(false);
        });
      });

      it('should skip pattern validation when a nullable field is null', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal<{ code: string | null }>({ code: null });
          const fieldDef: FieldDef & FieldWithValidation & { nullable: true } = {
            key: 'code',
            type: 'input',
            nullable: true,
            pattern: '^[A-Z]+$',
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(fieldDef, path.code);
            }),
          );
          mockFormSignal.set(formInstance);

          expect(formInstance().valid()).toBe(true);
        });
      });
    });

    describe('validateWhenHidden cascade', () => {
      const HIDDEN_CONTEXT = { validateWhenHidden: false, ancestorAlwaysHidden: false, ancestorHiddenLogics: [] } as const;
      const VALIDATE_HIDDEN_CONTEXT = { validateWhenHidden: true, ancestorAlwaysHidden: false, ancestorHiddenLogics: [] } as const;

      it('should skip required validation on a statically hidden field by default', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ name: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'name',
            type: 'input',
            required: true,
            hidden: true,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(fieldDef, path.name);
            }),
          );
          mockFormSignal.set(formInstance);

          expect(formInstance().valid()).toBe(true);
        });
      });

      it('should run required validation on a non-hidden field with validateWhenHidden=true (control)', () => {
        // validateWhenHidden=true means validators register unconditionally. When the
        // field isn't hidden, those validators should fire normally.
        runInInjectionContext(injector, () => {
          const formValue = signal({ name: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'name',
            type: 'input',
            required: true,
            validateWhenHidden: true,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(fieldDef, path.name, HIDDEN_CONTEXT);
            }),
          );
          mockFormSignal.set(formInstance);

          expect(formInstance().valid()).toBe(false);
        });
      });

      it('should let a hidden field opt out of inherited validateWhenHidden=true', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ name: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'name',
            type: 'input',
            required: true,
            hidden: true,
            validateWhenHidden: false,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(fieldDef, path.name, VALIDATE_HIDDEN_CONTEXT);
            }),
          );
          mockFormSignal.set(formInstance);

          expect(formInstance().valid()).toBe(true);
        });
      });

      it('should skip simple validators (email, minLength) on a hidden field by default', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'not-an-email' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            email: true,
            minLength: 50,
            hidden: true,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(fieldDef, path.email);
            }),
          );
          mockFormSignal.set(formInstance);

          expect(formInstance().valid()).toBe(true);
        });
      });

      it('should still run simple validators on a non-hidden field when default is to skip on hidden', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ email: 'not-an-email' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'email',
            type: 'input',
            email: true,
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(fieldDef, path.email);
            }),
          );
          mockFormSignal.set(formInstance);

          expect(formInstance().valid()).toBe(false);
        });
      });

      it('should propagate parent group validateWhenHidden=true to descendants without overrides', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ address: { street: '' } });
          const groupField: FieldDef = {
            key: 'address',
            type: 'group',
            hidden: true,
            validateWhenHidden: true,
            fields: [
              {
                key: 'street',
                type: 'input',
                required: true,
              } as FieldDef & FieldWithValidation,
            ],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(groupField, path.address);
            }),
          );
          mockFormSignal.set(formInstance);

          // Group is hidden + group says validate-when-hidden, so child's required runs.
          expect(formInstance().valid()).toBe(false);
        });
      });

      // `excludeValueIfHidden` (value knob) and `validateWhenHidden` (validation knob)
      // are independent. Keeping a hidden field's value does NOT opt it into validation —
      // a hidden group with excludeValueIfHidden:false + a required child + default
      // validateWhenHidden(false) keeps the value but still skips its validation. This
      // documents the decoupling so the two knobs aren't assumed to move together.
      it('keeps validation skipped for a hidden required child even when its value is retained (excludeValueIfHidden:false)', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ address: { street: '' } });
          const groupField: FieldDef = {
            key: 'address',
            type: 'group',
            hidden: true,
            excludeValueIfHidden: false,
            fields: [{ key: 'street', type: 'input', required: true } as FieldDef & FieldWithValidation],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(groupField, path.address);
            }),
          );
          mockFormSignal.set(formInstance);

          // Value is retained, but validation is governed by validateWhenHidden (default
          // false), not by excludeValueIfHidden — so required does not fire.
          expect(formInstance().valid()).toBe(true);
        });
      });

      it('should let a child override and become inert when its parent says validate-when-hidden', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ address: { street: '' } });
          const groupField: FieldDef = {
            key: 'address',
            type: 'group',
            hidden: true,
            validateWhenHidden: true,
            fields: [
              {
                key: 'street',
                type: 'input',
                required: true,
                validateWhenHidden: false,
              } as FieldDef & FieldWithValidation,
            ],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(groupField, path.address);
            }),
          );
          mockFormSignal.set(formInstance);

          expect(formInstance().valid()).toBe(true);
        });
      });

      it('should inherit a middle override past the grandparent (parent=true, middle=false, leaf=undefined)', () => {
        // Parent group says validate-when-hidden=true.
        // Middle group overrides with validate-when-hidden=false.
        // Leaf has no override — must inherit middle's false, NOT parent's true.
        runInInjectionContext(injector, () => {
          const formValue = signal({ outer: { inner: { name: '' } } });
          const grandparentField: FieldDef = {
            key: 'outer',
            type: 'group',
            hidden: true,
            validateWhenHidden: true,
            fields: [
              {
                key: 'inner',
                type: 'group',
                validateWhenHidden: false,
                fields: [
                  {
                    key: 'name',
                    type: 'input',
                    required: true,
                  } as FieldDef & FieldWithValidation,
                ],
              },
            ],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(grandparentField, path.outer);
            }),
          );
          mockFormSignal.set(formInstance);

          // Outer is hidden, leaf inherits middle's false → leaf skips required.
          expect(formInstance().valid()).toBe(true);
        });
      });

      // T3: page is a flatten container (children hoisted to the parent path). These pin that a
      // hidden PAGE cascades its hidden-state to descendant validation the same way a hidden GROUP
      // does — i.e. the page wrapper is dropped at flatten time but the cascade context survives.
      it('should skip required validation on a leaf inside a statically hidden page by default', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ street: '' });
          const pageField: FieldDef = {
            type: 'page',
            hidden: true,
            fields: [
              {
                key: 'street',
                type: 'input',
                required: true,
              } as FieldDef & FieldWithValidation,
            ],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(pageField, path as any);
            }),
          );
          mockFormSignal.set(formInstance);

          // Hidden page → descendant's required is skipped by default (mirrors hidden group).
          expect(formInstance().valid()).toBe(true);
        });
      });

      it('should propagate page validateWhenHidden=true to descendants without overrides', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ street: '' });
          const pageField: FieldDef = {
            type: 'page',
            hidden: true,
            validateWhenHidden: true,
            fields: [
              {
                key: 'street',
                type: 'input',
                required: true,
              } as FieldDef & FieldWithValidation,
            ],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(pageField, path as any);
            }),
          );
          mockFormSignal.set(formInstance);

          // Hidden page + page-level validate-when-hidden → descendant's required runs.
          expect(formInstance().valid()).toBe(false);
        });
      });

      it('should skip validators on a leaf with logic-based static hidden=true condition', () => {
        // A logic condition of `true` resolves to "always hidden" through the
        // cascade's ancestorAlwaysHidden short-circuit. The validator should never
        // be applied at all.
        runInInjectionContext(injector, () => {
          const formValue = signal({ name: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'name',
            type: 'input',
            required: true,
            logic: [
              {
                type: 'hidden',
                condition: true,
              },
            ],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(fieldDef, path.name);
            }),
          );
          mockFormSignal.set(formInstance);

          expect(formInstance().valid()).toBe(true);
        });
      });

      it('should skip "required" state-logic validation on a hidden field by default', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ name: '' });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'name',
            type: 'input',
            hidden: true,
            logic: [
              {
                type: 'required',
                condition: true,
              },
            ],
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(fieldDef, path.name);
            }),
          );
          mockFormSignal.set(formInstance);

          expect(formInstance().valid()).toBe(true);
        });
      });
    });

    // ng-forge defaults number inputs to NaN so signal-forms uses valueAsNumber;
    // clearing a number input also yields NaN (see default-value.ts). These pin the
    // resulting validation + wire-serialization contract, inspired by formly #3813
    // (a non-required number throwing after type-then-clear) and #3698 (nullability).
    describe('number-input NaN contract', () => {
      it('does not make a NON-required number field invalid when its value is NaN (cleared)', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ age: NaN });
          const fieldDef: FieldDef & FieldWithValidation = { key: 'age', type: 'input', props: { type: 'number' } };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(fieldDef, path.age);
            }),
          );
          mockFormSignal.set(formInstance);

          expect(formInstance().valid()).toBe(true);
        });
      });

      it('treats a NaN value as empty for a REQUIRED number field (cleared = unsatisfied)', () => {
        runInInjectionContext(injector, () => {
          const formValue = signal({ age: NaN });
          const fieldDef: FieldDef & FieldWithValidation = {
            key: 'age',
            type: 'input',
            required: true,
            props: { type: 'number' },
          };

          const formInstance = form(
            formValue,
            schema<typeof formValue>((path) => {
              mapFieldToForm(fieldDef, path.age);
            }),
          );
          mockFormSignal.set(formInstance);

          expect(formInstance().valid()).toBe(false);
        });
      });

      it('serializes a NaN number value to null over the wire (JSON contract)', () => {
        // The in-memory model value is NaN, but JSON.stringify maps NaN to null, so a
        // cleared number reaches an HTTP backend as null, not NaN. Documented so consumers
        // reading the bound value (NaN) vs the submitted payload (null) know they differ.
        expect(JSON.stringify({ age: NaN })).toBe('{"age":null}');
      });
    });
  });
});
