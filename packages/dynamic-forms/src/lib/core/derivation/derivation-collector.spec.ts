import { describe, expect, it } from 'vitest';
import { collectDerivations } from './derivation-collector';
import { FieldDef } from '@ng-forge/dynamic-forms/internal';
import { TextFieldDef } from '../../definitions/text/text-field-def';
import { NumberFieldDef } from '../../definitions/number/number-field-def';
import { GroupFieldDef } from '../../definitions/group/group-field-def';
import { ArrayFieldDef } from '../../definitions/array/array-field-def';

describe('derivation-collector', () => {
  describe('collectDerivations', () => {
    describe('shorthand derivation property', () => {
      it('should collect derivation from shorthand property', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'quantity',
            type: 'number',
          } as NumberFieldDef,
          {
            key: 'unitPrice',
            type: 'number',
          } as NumberFieldDef,
          {
            key: 'total',
            type: 'number',
            derivation: 'formValue.quantity * formValue.unitPrice',
          } as NumberFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].fieldKey).toBe('total');
        expect(collection.entries[0].expression).toBe('formValue.quantity * formValue.unitPrice');
        expect(collection.entries[0].isShorthand).toBe(true);
        expect(collection.entries[0].trigger).toBe('onChange');
        expect(collection.entries[0].condition).toBe(true);
      });

      it('should extract dependencies from shorthand expression', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'fullName',
            type: 'text',
            derivation: 'formValue.firstName + " " + formValue.lastName',
          } as TextFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries[0].dependsOn).toContain('firstName');
        expect(collection.entries[0].dependsOn).toContain('lastName');
      });
    });

    describe('logic array derivations', () => {
      it('should collect derivation from logic array (self-targeting)', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'phonePrefix',
            type: 'text',
            logic: [
              {
                type: 'derivation',
                expression: 'formValue.country === "USA" ? "+1" : "+44"',
              },
            ],
          } as TextFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].fieldKey).toBe('phonePrefix');
        expect(collection.entries[0].isShorthand).toBe(false);
      });

      it('should collect derivation with static value', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'discount',
            type: 'number',
            logic: [
              {
                type: 'derivation',
                condition: { type: 'fieldValue', fieldPath: 'premium', operator: 'equals', value: true },
                value: 20,
              },
            ],
          } as unknown as FieldDef<unknown>,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries[0].value).toBe(20);
        expect(collection.entries[0].expression).toBeUndefined();
      });

      it('should collect derivation with function name', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'currency',
            type: 'text',
            logic: [
              {
                type: 'derivation',
                functionName: 'getCurrencyForCountry',
              },
            ],
          } as TextFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries[0].functionName).toBe('getCurrencyForCountry');
        expect(collection.entries[0].dependsOn).toContain('*'); // Functions assume full form access
      });

      it('should collect derivation with debounced trigger', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'city',
            type: 'text',
            logic: [
              {
                type: 'derivation',
                expression: 'lookupCityFromZip(formValue.zipCode)',
                trigger: 'debounced',
                debounceMs: 500,
              },
            ],
          } as TextFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries[0].trigger).toBe('debounced');
        expect(collection.entries[0].debounceMs).toBe(500);
      });

      it('should ignore non-derivation logic entries', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'displayEmail',
            type: 'text',
            logic: [
              { type: 'hidden', condition: false },
              { type: 'readonly', condition: true },
              {
                type: 'derivation',
                expression: 'formValue.email.toLowerCase()',
              },
              { type: 'disabled', condition: false },
            ],
          } as TextFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].fieldKey).toBe('displayEmail');
      });
    });

    describe('nested container fields', () => {
      it('should collect derivations from group fields with the group key prefixed onto the field path', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'address',
            type: 'group',
            fields: [
              {
                key: 'street',
                type: 'text',
              } as TextFieldDef,
              {
                key: 'fullAddress',
                type: 'text',
                derivation: 'formValue.address.street + ", " + formValue.address.city',
              } as TextFieldDef,
            ],
          } as GroupFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        // Field's actual form path is `address.fullAddress` — entry must
        // match so the applicator can write back correctly.
        expect(collection.entries[0].fieldKey).toBe('address.fullAddress');
      });

      it('should prefix nested group keys (group > group > input)', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'org',
            type: 'group',
            fields: [
              {
                key: 'address',
                type: 'group',
                fields: [
                  {
                    key: 'state',
                    type: 'text',
                    derivation: 'formValue.org.address.country',
                  } as TextFieldDef,
                ],
              } as GroupFieldDef,
            ],
          } as GroupFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].fieldKey).toBe('org.address.state');
      });

      it('should pass through layout containers without affecting groupPath (group > container > input)', () => {
        // Container is a layout-only field. Casts mirror existing test
        // patterns in this file — we only care about the shape the
        // collector receives at runtime.
        const fields = [
          {
            key: 'address',
            type: 'group',
            fields: [
              {
                key: 'addressContainer',
                type: 'container',
                fields: [
                  {
                    key: 'state',
                    type: 'text',
                    logic: [
                      {
                        type: 'derivation',
                        functionName: 'uppercaseState',
                        dependsOn: ['address.state'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ] as unknown as FieldDef<unknown>[];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].fieldKey).toBe('address.state');
      });

      it('should reset ancestor groupPath at array boundaries (array preserves array.$.fieldKey form)', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'org',
            type: 'group',
            fields: [
              {
                key: 'items',
                type: 'array',
                fields: [
                  {
                    key: 'name',
                    type: 'text',
                    derivation: 'formValue.foo',
                  } as TextFieldDef,
                ],
              } as ArrayFieldDef,
            ],
          } as GroupFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        // Ancestor `org` is dropped at the array boundary; the entry uses
        // the array placeholder form for descendants of the array item.
        expect(collection.entries[0].fieldKey).toBe('items.$.name');
      });

      it('should combine arrayPath and inner groupPath (array > group > input)', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'items',
            type: 'array',
            fields: [
              {
                key: 'address',
                type: 'group',
                fields: [
                  {
                    key: 'state',
                    type: 'text',
                    derivation: 'formValue.foo',
                  } as TextFieldDef,
                ],
              } as GroupFieldDef,
            ],
          } as ArrayFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        // Group inside an array contributes to the entry path so writeback
        // hits the actual schema location: items[i].address.state.
        expect(collection.entries[0].fieldKey).toBe('items.$.address.state');
      });

      it('should collect derivations from array fields with array path', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'items',
            type: 'array',
            fields: [
              {
                key: 'quantity',
                type: 'number',
              } as NumberFieldDef,
              {
                key: 'price',
                type: 'number',
              } as NumberFieldDef,
              {
                key: 'lineTotal',
                type: 'number',
                derivation: 'formValue.quantity * formValue.price',
              } as NumberFieldDef,
            ],
          } as ArrayFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        // Array derivations get their path prefixed with the array path
        expect(collection.entries[0].fieldKey).toBe('items.$.lineTotal');
      });

      it('should collect derivations with logic in array fields', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'items',
            type: 'array',
            fields: [
              {
                key: 'lineTotal',
                type: 'number',
                logic: [
                  {
                    type: 'derivation',
                    expression: 'formValue.quantity * formValue.price',
                  },
                ],
              } as NumberFieldDef,
            ],
          } as ArrayFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries[0].fieldKey).toBe('items.$.lineTotal');
      });
    });

    describe('property derivation routing', () => {
      it('should skip type: derivation with targetProperty (routed to property derivation pipeline)', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'endDate',
            type: 'datepicker',
            logic: [
              {
                type: 'derivation',
                targetProperty: 'minDate',
                expression: 'formValue.startDate',
              },
            ],
          } as unknown as FieldDef<unknown>,
        ];

        const collection = collectDerivations(fields);

        // Should not be collected as a value derivation because it has targetProperty
        expect(collection.entries.length).toBe(0);
      });
    });

    describe('HTTP derivation entries', () => {
      it('should carry http and responseExpression from config to entry', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'rate',
            type: 'number',
            logic: [
              {
                type: 'derivation',
                source: 'http',
                http: {
                  url: 'https://api.example.com/rate',
                  method: 'GET',
                  queryParams: { from: 'formValue.currency' },
                },
                responseExpression: 'response.rate',
                dependsOn: ['currency'],
              },
            ],
          } as NumberFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].http).toEqual({
          url: 'https://api.example.com/rate',
          method: 'GET',
          queryParams: { from: 'formValue.currency' },
        });
        expect(collection.entries[0].responseExpression).toBe('response.rate');
        expect(collection.entries[0].dependsOn).toContain('currency');
      });

      it('should throw DynamicFormError when HTTP entry has empty dependsOn', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'rate',
            type: 'number',
            logic: [
              {
                type: 'derivation',
                source: 'http',
                http: { url: 'https://api.example.com/rate' },
                responseExpression: 'response.rate',
                dependsOn: [],
              } as any,
            ],
          } as NumberFieldDef,
        ];

        expect(() => collectDerivations(fields)).toThrow(/requires explicit 'dependsOn'/);
      });

      it('should throw DynamicFormError when HTTP entry uses wildcard dependsOn', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'rate',
            type: 'number',
            logic: [
              {
                type: 'derivation',
                source: 'http',
                http: { url: 'https://api.example.com/rate' },
                responseExpression: 'response.rate',
                dependsOn: ['*'],
              },
            ],
          } as NumberFieldDef,
        ];

        expect(() => collectDerivations(fields)).toThrow(/cannot use wildcard/);
      });

      it('should throw DynamicFormError when HTTP entry uses wildcard among other deps', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'rate',
            type: 'number',
            logic: [
              {
                type: 'derivation',
                source: 'http',
                http: { url: 'https://api.example.com/rate' },
                responseExpression: 'response.rate',
                dependsOn: ['currency', '*'],
              },
            ],
          } as NumberFieldDef,
        ];

        expect(() => collectDerivations(fields)).toThrow(/cannot use wildcard/);
      });
    });

    describe('async function derivation entries', () => {
      it('should carry asyncFunctionName from config to entry', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'price',
            type: 'number',
            logic: [
              {
                type: 'derivation',
                source: 'asyncFunction',
                asyncFunctionName: 'fetchSuggestedPrice',
                dependsOn: ['productId', 'quantity'],
              },
            ],
          } as NumberFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].asyncFunctionName).toBe('fetchSuggestedPrice');
        expect(collection.entries[0].dependsOn).toContain('productId');
        expect(collection.entries[0].dependsOn).toContain('quantity');
      });

      it('should throw DynamicFormError when async entry has empty dependsOn', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'price',
            type: 'number',
            logic: [
              {
                type: 'derivation',
                source: 'asyncFunction',
                asyncFunctionName: 'fetchData',
                dependsOn: [],
              } as any,
            ],
          } as NumberFieldDef,
        ];

        expect(() => collectDerivations(fields)).toThrow(/requires explicit 'dependsOn'/);
      });

      it('should throw DynamicFormError when async entry uses wildcard dependsOn', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'price',
            type: 'number',
            logic: [
              {
                type: 'derivation',
                source: 'asyncFunction',
                asyncFunctionName: 'fetchData',
                dependsOn: ['*'],
              },
            ],
          } as NumberFieldDef,
        ];

        expect(() => collectDerivations(fields)).toThrow(/cannot use wildcard/);
      });
    });

    describe('edge cases', () => {
      it('should handle empty fields array', () => {
        const collection = collectDerivations([]);

        expect(collection.entries.length).toBe(0);
      });

      it('should handle fields without derivations', () => {
        const fields: FieldDef<unknown>[] = [
          { key: 'name', type: 'text' } as TextFieldDef,
          { key: 'age', type: 'number' } as NumberFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(0);
      });

      it('should handle fields without keys', () => {
        const fields: FieldDef<unknown>[] = [
          { type: 'text' } as TextFieldDef,
          { key: 'valid', type: 'text', derivation: 'test' } as TextFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].fieldKey).toBe('valid');
      });

      it('should handle mixed shorthand and logic derivations on same field', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'field1',
            type: 'text',
            derivation: 'formValue.other',
            logic: [
              {
                type: 'derivation',
                value: 'static',
                condition: { type: 'fieldValue', fieldPath: 'flag', operator: 'equals', value: true },
              },
            ],
          } as TextFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(2);
        // Both target the same field (field1) but with different conditions
        expect(collection.entries.every((e) => e.fieldKey === 'field1')).toBe(true);
      });
    });

    describe('$self dependency token', () => {
      it('should resolve $self to the field key at form root', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'state',
            type: 'text',
            logic: [
              {
                type: 'derivation',
                functionName: 'uppercase',
                dependsOn: ['$self'],
              },
            ],
          } as TextFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].fieldKey).toBe('state');
        expect(collection.entries[0].dependsOn).toEqual(['state']);
      });

      it('should resolve $self to the absolute path inside a group', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'address',
            type: 'group',
            fields: [
              {
                key: 'state',
                type: 'text',
                logic: [
                  {
                    type: 'derivation',
                    functionName: 'uppercase',
                    dependsOn: ['$self'],
                  },
                ],
              } as TextFieldDef,
            ],
          } as GroupFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].fieldKey).toBe('address.state');
        expect(collection.entries[0].dependsOn).toEqual(['address.state']);
      });

      it('should preserve other dependencies when $self is mixed with absolute paths', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'address',
            type: 'group',
            fields: [
              {
                key: 'state',
                type: 'text',
                logic: [
                  {
                    type: 'derivation',
                    functionName: 'compute',
                    dependsOn: ['$self', 'address.country'],
                  },
                ],
              } as TextFieldDef,
            ],
          } as GroupFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].dependsOn).toEqual(['address.state', 'address.country']);
      });

      it('should resolve $self to the array placeholder path inside arrays', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'items',
            type: 'array',
            fields: [
              {
                key: 'name',
                type: 'text',
                logic: [
                  {
                    type: 'derivation',
                    functionName: 'uppercase',
                    dependsOn: ['$self'],
                  },
                ],
              } as TextFieldDef,
            ],
          } as ArrayFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].fieldKey).toBe('items.$.name');
        expect(collection.entries[0].dependsOn).toEqual(['items.$.name']);
      });

      it('should resolve $self through layout containers inside arrays (array > container > input)', () => {
        // Mirror of the `group > container > input` case: layout containers
        // must pass through arrayPath unchanged, so $self for an input two
        // hops below an array still resolves to the array placeholder path.
        // Repros downstream addressList finding where array > itemContainer
        // > input fields lost their $self → arrayPath.$.fieldKey resolution.
        const fields = [
          {
            key: 'addresses',
            type: 'array',
            fields: [
              {
                key: 'addressItemContainer',
                type: 'container',
                fields: [
                  {
                    key: 'state',
                    type: 'text',
                    logic: [
                      {
                        type: 'derivation',
                        functionName: 'uppercase',
                        dependsOn: ['$self'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ] as unknown as FieldDef<unknown>[];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].fieldKey).toBe('addresses.$.state');
        expect(collection.entries[0].dependsOn).toEqual(['addresses.$.state']);
      });

      it('should resolve $self through nested layout containers inside arrays (array > container > container > input)', () => {
        // Reproduces the downstream dbxForgeAddressListField nesting:
        // array > itemContainer > container(flex) > input(state).
        // $self must resolve to the array placeholder path even when two
        // layout containers sit between the array and the input.
        const fields = [
          {
            key: 'addresses',
            type: 'array',
            fields: [
              {
                key: 'addressItemContainer',
                type: 'container',
                fields: [
                  {
                    key: 'flexContainer',
                    type: 'container',
                    fields: [
                      {
                        key: 'state',
                        type: 'text',
                        logic: [
                          {
                            type: 'derivation',
                            functionName: 'uppercase',
                            dependsOn: ['$self'],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ] as unknown as FieldDef<unknown>[];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].fieldKey).toBe('addresses.$.state');
        expect(collection.entries[0].dependsOn).toEqual(['addresses.$.state']);
      });

      it('should resolve $self through layout containers and an inner group inside arrays (array > container > group > input)', () => {
        // Containers between the array and an inner group should not break
        // the array.$.group.field path — the group key is appended to the
        // array placeholder path, layout containers contribute nothing.
        const fields = [
          {
            key: 'addresses',
            type: 'array',
            fields: [
              {
                key: 'addressItemContainer',
                type: 'container',
                fields: [
                  {
                    key: 'address',
                    type: 'group',
                    fields: [
                      {
                        key: 'state',
                        type: 'text',
                        logic: [
                          {
                            type: 'derivation',
                            functionName: 'uppercase',
                            dependsOn: ['$self'],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ] as unknown as FieldDef<unknown>[];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].fieldKey).toBe('addresses.$.address.state');
        expect(collection.entries[0].dependsOn).toEqual(['addresses.$.address.state']);
      });

      it('should resolve $self to the deeply nested absolute path (group > group > input)', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'org',
            type: 'group',
            fields: [
              {
                key: 'address',
                type: 'group',
                fields: [
                  {
                    key: 'state',
                    type: 'text',
                    logic: [
                      {
                        type: 'derivation',
                        functionName: 'uppercase',
                        dependsOn: ['$self'],
                      },
                    ],
                  } as TextFieldDef,
                ],
              } as GroupFieldDef,
            ],
          } as GroupFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].fieldKey).toBe('org.address.state');
        expect(collection.entries[0].dependsOn).toEqual(['org.address.state']);
      });

      it('should resolve $self for HTTP derivations (passes the dependsOn validity guards)', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'address',
            type: 'group',
            fields: [
              {
                key: 'state',
                type: 'text',
                logic: [
                  {
                    type: 'derivation',
                    source: 'http',
                    http: { url: '/api/state-info' },
                    responseExpression: 'response.normalized',
                    dependsOn: ['$self'],
                  },
                ],
              } as TextFieldDef,
            ],
          } as GroupFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].fieldKey).toBe('address.state');
        expect(collection.entries[0].dependsOn).toEqual(['address.state']);
      });

      it('should resolve $self for async function derivations (passes the dependsOn validity guards)', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'address',
            type: 'group',
            fields: [
              {
                key: 'state',
                type: 'text',
                logic: [
                  {
                    type: 'derivation',
                    source: 'asyncFunction',
                    asyncFunctionName: 'normalizeStateAsync',
                    dependsOn: ['$self'],
                  },
                ],
              } as TextFieldDef,
            ],
          } as GroupFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].fieldKey).toBe('address.state');
        expect(collection.entries[0].dependsOn).toEqual(['address.state']);
      });

      it('should NOT extract a literal $self from a shorthand expression — token is dependsOn-only', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'note',
            type: 'text',
            // Defensive: a `$self` literal sitting in expression text must
            // not be picked up by `extractStringDependencies`. Token is
            // only meaningful when listed explicitly in `dependsOn`.
            derivation: 'formValue.foo + "$self"',
          } as TextFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].dependsOn).toEqual(['foo']);
        expect(collection.entries[0].dependsOn).not.toContain('$self');
        expect(collection.entries[0].dependsOn).not.toContain('note');
      });
    });

    describe('$group dependency token', () => {
      it('should resolve $group to the immediate parent group path', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'address',
            type: 'group',
            fields: [
              {
                key: 'state',
                type: 'text',
                logic: [
                  {
                    type: 'derivation',
                    functionName: 'computeFromGroup',
                    dependsOn: ['$group'],
                  },
                ],
              } as TextFieldDef,
            ],
          } as GroupFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].fieldKey).toBe('address.state');
        expect(collection.entries[0].dependsOn).toEqual(['address']);
      });

      it('should resolve $group to the nearest parent group fully qualified (group > group > input)', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'org',
            type: 'group',
            fields: [
              {
                key: 'address',
                type: 'group',
                fields: [
                  {
                    key: 'state',
                    type: 'text',
                    logic: [
                      {
                        type: 'derivation',
                        functionName: 'computeFromGroup',
                        dependsOn: ['$group'],
                      },
                    ],
                  } as TextFieldDef,
                ],
              } as GroupFieldDef,
            ],
          } as GroupFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].fieldKey).toBe('org.address.state');
        expect(collection.entries[0].dependsOn).toEqual(['org.address']);
      });

      it('should resolve $group to the array key when directly inside an array', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'items',
            type: 'array',
            fields: [
              {
                key: 'name',
                type: 'text',
                logic: [
                  {
                    type: 'derivation',
                    functionName: 'computeFromArray',
                    dependsOn: ['$group'],
                  },
                ],
              } as TextFieldDef,
            ],
          } as ArrayFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].fieldKey).toBe('items.$.name');
        expect(collection.entries[0].dependsOn).toEqual(['items']);
      });

      it('should resolve $group to the combined array+group path (array > group > input)', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'items',
            type: 'array',
            fields: [
              {
                key: 'address',
                type: 'group',
                fields: [
                  {
                    key: 'state',
                    type: 'text',
                    logic: [
                      {
                        type: 'derivation',
                        functionName: 'computeFromAddressGroup',
                        dependsOn: ['$group'],
                      },
                    ],
                  } as TextFieldDef,
                ],
              } as GroupFieldDef,
            ],
          } as ArrayFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].fieldKey).toBe('items.$.address.state');
        expect(collection.entries[0].dependsOn).toEqual(['items.$.address']);
      });

      it('should preserve other dependencies when $group is mixed with $self and absolute paths', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'address',
            type: 'group',
            fields: [
              {
                key: 'state',
                type: 'text',
                logic: [
                  {
                    type: 'derivation',
                    functionName: 'compute',
                    dependsOn: ['$group', '$self', 'externalKey'],
                  },
                ],
              } as TextFieldDef,
            ],
          } as GroupFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].dependsOn).toEqual(['address', 'address.state', 'externalKey']);
      });

      it('should throw DynamicFormError when $group is used at form root', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'state',
            type: 'text',
            logic: [
              {
                type: 'derivation',
                functionName: 'compute',
                dependsOn: ['$group'],
              },
            ],
          } as TextFieldDef,
        ];

        expect(() => collectDerivations(fields)).toThrow(/has no parent group or array/);
      });

      it('should resolve $group for HTTP derivations (passes the dependsOn validity guards)', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'address',
            type: 'group',
            fields: [
              {
                key: 'state',
                type: 'text',
                logic: [
                  {
                    type: 'derivation',
                    source: 'http',
                    http: { url: '/api/lookup' },
                    responseExpression: 'response.value',
                    dependsOn: ['$group'],
                  },
                ],
              } as TextFieldDef,
            ],
          } as GroupFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].dependsOn).toEqual(['address']);
      });

      it('should NOT extract a literal $group from a shorthand expression — token is dependsOn-only', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'address',
            type: 'group',
            fields: [
              {
                key: 'note',
                type: 'text',
                derivation: 'formValue.foo + "$group"',
              } as TextFieldDef,
            ],
          } as GroupFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        // Shorthand deps come from extractStringDependencies(expression)
        // — it only matches `formValue.X`, so `$group` literal is ignored.
        expect(collection.entries[0].dependsOn).toEqual(['foo']);
        expect(collection.entries[0].dependsOn).not.toContain('$group');
        expect(collection.entries[0].dependsOn).not.toContain('address');
      });
    });

    describe('token prefix substitution ($group.sibling and $self.X)', () => {
      it('should resolve $group.sibling to <parentPath>.sibling inside a group', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'address',
            type: 'group',
            fields: [
              {
                key: 'state',
                type: 'text',
                logic: [
                  {
                    type: 'derivation',
                    functionName: 'pickFromCountry',
                    dependsOn: ['$group.country'],
                  },
                ],
              } as TextFieldDef,
            ],
          } as GroupFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].fieldKey).toBe('address.state');
        expect(collection.entries[0].dependsOn).toEqual(['address.country']);
      });

      it('should resolve $group.sibling for nested groups (joining the fully qualified parent)', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'org',
            type: 'group',
            fields: [
              {
                key: 'address',
                type: 'group',
                fields: [
                  {
                    key: 'state',
                    type: 'text',
                    logic: [
                      {
                        type: 'derivation',
                        functionName: 'pickFromCountry',
                        dependsOn: ['$group.country'],
                      },
                    ],
                  } as TextFieldDef,
                ],
              } as GroupFieldDef,
            ],
          } as GroupFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].dependsOn).toEqual(['org.address.country']);
      });

      it('should resolve $group.sibling inside arrays (joining the array placeholder path)', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'items',
            type: 'array',
            fields: [
              {
                key: 'address',
                type: 'group',
                fields: [
                  {
                    key: 'state',
                    type: 'text',
                    logic: [
                      {
                        type: 'derivation',
                        functionName: 'pickFromCountry',
                        dependsOn: ['$group.country'],
                      },
                    ],
                  } as TextFieldDef,
                ],
              } as GroupFieldDef,
            ],
          } as ArrayFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].dependsOn).toEqual(['items.$.address.country']);
      });

      it('should resolve multi-segment $group prefixes ($group.foo.bar)', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'address',
            type: 'group',
            fields: [
              {
                key: 'state',
                type: 'text',
                logic: [
                  {
                    type: 'derivation',
                    functionName: 'compute',
                    dependsOn: ['$group.contact.email'],
                  },
                ],
              } as TextFieldDef,
            ],
          } as GroupFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries[0].dependsOn).toEqual(['address.contact.email']);
      });

      it('should resolve $self.subProperty to <fieldKey>.subProperty', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'address',
            type: 'group',
            fields: [
              {
                key: 'meta',
                type: 'text',
                logic: [
                  {
                    type: 'derivation',
                    functionName: 'compute',
                    dependsOn: ['$self.flag'],
                  },
                ],
              } as TextFieldDef,
            ],
          } as GroupFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries[0].dependsOn).toEqual(['address.meta.flag']);
      });

      it('should throw DynamicFormError when $group.sibling is used at form root', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'state',
            type: 'text',
            logic: [
              {
                type: 'derivation',
                functionName: 'compute',
                dependsOn: ['$group.country'],
              },
            ],
          } as TextFieldDef,
        ];

        expect(() => collectDerivations(fields)).toThrow(/has no parent group or array/);
      });
    });
  });
});
