import { describe, expect, it } from 'vitest';
import { collectPropertyDerivations } from './property-derivation-collector';
import { FieldDef } from '../../definitions/base/field-def';
import { createMockLogger } from '../../../../testing/src/mock-logger';
import { createWarningTracker } from '../../utils/warning-tracker';

describe('property-derivation-collector', () => {
  const logger = createMockLogger();
  const tracker = createWarningTracker();

  describe('collectPropertyDerivations', () => {
    it('should return empty collection when no fields have propertyDerivation logic', () => {
      const fields: FieldDef<unknown>[] = [
        { key: 'name', type: 'input' } as FieldDef<unknown>,
        { key: 'age', type: 'number' } as FieldDef<unknown>,
        {
          key: 'email',
          type: 'input',
          logic: [{ type: 'hidden', condition: true }],
        } as unknown as FieldDef<unknown>,
      ];

      const collection = collectPropertyDerivations(fields, logger, tracker);

      expect(collection.entries).toHaveLength(0);
    });

    it('should collect a single propertyDerivation entry from a field logic array', () => {
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

      const collection = collectPropertyDerivations(fields, logger, tracker);

      expect(collection.entries).toHaveLength(1);
      expect(collection.entries[0].fieldKey).toBe('endDate');
      expect(collection.entries[0].targetProperty).toBe('minDate');
      expect(collection.entries[0].expression).toBe('formValue.startDate');
      expect(collection.entries[0].trigger).toBe('onChange');
      expect(collection.entries[0].condition).toBe(true);
    });

    it('should collect type: derivation with targetProperty as property derivation entry', () => {
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

      const collection = collectPropertyDerivations(fields, logger, tracker);

      expect(collection.entries).toHaveLength(1);
      expect(collection.entries[0].fieldKey).toBe('endDate');
      expect(collection.entries[0].targetProperty).toBe('minDate');
      expect(collection.entries[0].expression).toBe('formValue.startDate');
    });

    it('should ignore state logic and value derivation entries (only collects property derivations)', () => {
      const fields: FieldDef<unknown>[] = [
        {
          key: 'myField',
          type: 'input',
          logic: [
            { type: 'hidden', condition: false },
            { type: 'disabled', condition: true },
            { type: 'readonly', condition: false },
            { type: 'required', condition: true },
            { type: 'derivation', expression: 'formValue.other' },
            {
              type: 'derivation',
              targetProperty: 'label',
              value: 'Dynamic Label',
            },
          ],
        } as unknown as FieldDef<unknown>,
      ];

      const collection = collectPropertyDerivations(fields, logger, tracker);

      expect(collection.entries).toHaveLength(1);
      expect(collection.entries[0].fieldKey).toBe('myField');
      expect(collection.entries[0].targetProperty).toBe('label');
      expect(collection.entries[0].value).toBe('Dynamic Label');
    });

    it('should collect multiple entries from different fields', () => {
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
        {
          key: 'city',
          type: 'select',
          logic: [
            {
              type: 'derivation',
              targetProperty: 'options',
              functionName: 'getCitiesForCountry',
              dependsOn: ['country'],
            },
          ],
        } as unknown as FieldDef<unknown>,
        {
          key: 'phone',
          type: 'input',
          logic: [
            {
              type: 'derivation',
              targetProperty: 'label',
              value: 'Mobile Phone',
              condition: {
                type: 'fieldValue',
                fieldPath: 'contactType',
                operator: 'equals',
                value: 'mobile',
              },
            },
          ],
        } as unknown as FieldDef<unknown>,
      ];

      const collection = collectPropertyDerivations(fields, logger, tracker);

      expect(collection.entries).toHaveLength(3);
      expect(collection.entries[0].fieldKey).toBe('endDate');
      expect(collection.entries[1].fieldKey).toBe('city');
      expect(collection.entries[2].fieldKey).toBe('phone');
    });

    it('should collect entries from nested container fields (group, page, row)', () => {
      const fields: FieldDef<unknown>[] = [
        {
          key: 'page1',
          type: 'page',
          fields: [
            {
              key: 'addressGroup',
              type: 'group',
              fields: [
                {
                  key: 'zipField',
                  type: 'input',
                  logic: [
                    {
                      type: 'derivation',
                      targetProperty: 'placeholder',
                      expression: 'formValue.country === "US" ? "ZIP Code" : "Postal Code"',
                    },
                  ],
                } as unknown as FieldDef<unknown>,
              ],
            } as unknown as FieldDef<unknown>,
            {
              key: 'row1',
              type: 'row',
              fields: [
                {
                  key: 'citySelect',
                  type: 'select',
                  logic: [
                    {
                      type: 'derivation',
                      targetProperty: 'options',
                      functionName: 'getCities',
                    },
                  ],
                } as unknown as FieldDef<unknown>,
              ],
            } as unknown as FieldDef<unknown>,
          ],
        } as unknown as FieldDef<unknown>,
      ];

      const collection = collectPropertyDerivations(fields, logger, tracker);

      expect(collection.entries).toHaveLength(2);
      // Group ancestors are folded into the store key so overlapping leaf keys
      // in different groups stay distinct (issue #401). Layout containers
      // (page, row) do not contribute.
      expect(collection.entries[0].fieldKey).toBe('addressGroup.zipField');
      expect(collection.entries[0].targetProperty).toBe('placeholder');
      expect(collection.entries[1].fieldKey).toBe('citySelect');
      expect(collection.entries[1].targetProperty).toBe('options');
    });

    it('should distinguish overlapping leaf keys in different groups (issue #401)', () => {
      const fields: FieldDef<unknown>[] = [
        {
          key: 'createADto',
          type: 'group',
          fields: [
            {
              key: 'name',
              type: 'input',
              logic: [{ type: 'derivation', targetProperty: 'label', value: 'A Name' }],
            } as unknown as FieldDef<unknown>,
          ],
        } as unknown as FieldDef<unknown>,
        {
          key: 'createBDto',
          type: 'group',
          fields: [
            {
              key: 'name',
              type: 'input',
              logic: [{ type: 'derivation', targetProperty: 'label', value: 'B Name' }],
            } as unknown as FieldDef<unknown>,
          ],
        } as unknown as FieldDef<unknown>,
      ];

      const collection = collectPropertyDerivations(fields, logger, tracker);

      expect(collection.entries).toHaveLength(2);
      expect(collection.entries[0].fieldKey).toBe('createADto.name');
      expect(collection.entries[1].fieldKey).toBe('createBDto.name');
    });

    it('should combine arrayPath with inner groupPath (array > group > input)', () => {
      const fields: FieldDef<unknown>[] = [
        {
          key: 'contacts',
          type: 'array',
          fields: [
            {
              key: 'profile',
              type: 'group',
              fields: [
                {
                  key: 'email',
                  type: 'input',
                  logic: [{ type: 'derivation', targetProperty: 'placeholder', expression: 'formValue.x' }],
                } as unknown as FieldDef<unknown>,
              ],
            } as unknown as FieldDef<unknown>,
          ],
        } as unknown as FieldDef<unknown>,
      ];

      const collection = collectPropertyDerivations(fields, logger, tracker);

      expect(collection.entries).toHaveLength(1);
      // Array resets ancestor groupPath; the inner group contributes to the per-item key.
      expect(collection.entries[0].fieldKey).toBe('contacts.$.profile.email');
    });

    it('should handle array field context by creating placeholder paths with $', () => {
      const fields: FieldDef<unknown>[] = [
        {
          key: 'items',
          type: 'array',
          fields: [
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
          ],
        } as unknown as FieldDef<unknown>,
      ];

      const collection = collectPropertyDerivations(fields, logger, tracker);

      expect(collection.entries).toHaveLength(1);
      expect(collection.entries[0].fieldKey).toBe('items.$.endDate');
      expect(collection.entries[0].targetProperty).toBe('minDate');
    });

    it('should extract dependencies from expression automatically', () => {
      const fields: FieldDef<unknown>[] = [
        {
          key: 'total',
          type: 'input',
          logic: [
            {
              type: 'derivation',
              targetProperty: 'label',
              expression: 'formValue.quantity * formValue.unitPrice',
            },
          ],
        } as unknown as FieldDef<unknown>,
      ];

      const collection = collectPropertyDerivations(fields, logger, tracker);

      expect(collection.entries[0].dependsOn).toContain('quantity');
      expect(collection.entries[0].dependsOn).toContain('unitPrice');
    });

    it('should use explicit dependsOn when provided', () => {
      const fields: FieldDef<unknown>[] = [
        {
          key: 'city',
          type: 'select',
          logic: [
            {
              type: 'derivation',
              targetProperty: 'options',
              functionName: 'getCitiesForCountry',
              dependsOn: ['country'],
            },
          ],
        } as unknown as FieldDef<unknown>,
      ];

      const collection = collectPropertyDerivations(fields, logger, tracker);

      expect(collection.entries[0].dependsOn).toEqual(['country']);
      expect(collection.entries[0].dependsOn).not.toContain('*');
    });

    it('should use * wildcard for functionName entries without explicit dependsOn', () => {
      const fields: FieldDef<unknown>[] = [
        {
          key: 'currency',
          type: 'select',
          logic: [
            {
              type: 'derivation',
              targetProperty: 'options',
              functionName: 'getAllCurrencies',
            },
          ],
        } as unknown as FieldDef<unknown>,
      ];

      const collection = collectPropertyDerivations(fields, logger, tracker);

      expect(collection.entries[0].dependsOn).toContain('*');
    });

    it('should extract dependencies from condition expressions', () => {
      const fields: FieldDef<unknown>[] = [
        {
          key: 'phone',
          type: 'input',
          logic: [
            {
              type: 'derivation',
              targetProperty: 'label',
              value: 'Mobile Phone',
              condition: {
                type: 'fieldValue',
                fieldPath: 'contactType',
                operator: 'equals',
                value: 'mobile',
              },
            },
          ],
        } as unknown as FieldDef<unknown>,
      ];

      const collection = collectPropertyDerivations(fields, logger, tracker);

      expect(collection.entries[0].dependsOn).toContain('contactType');
    });

    it('should set correct trigger and debounceMs', () => {
      const fields: FieldDef<unknown>[] = [
        {
          key: 'searchResults',
          type: 'select',
          logic: [
            {
              type: 'derivation',
              targetProperty: 'options',
              functionName: 'searchOptions',
              trigger: 'debounced',
              debounceMs: 300,
              dependsOn: ['searchTerm'],
            },
          ],
        } as unknown as FieldDef<unknown>,
        {
          key: 'label',
          type: 'input',
          logic: [
            {
              type: 'derivation',
              targetProperty: 'label',
              expression: 'formValue.name',
            },
          ],
        } as unknown as FieldDef<unknown>,
      ];

      const collection = collectPropertyDerivations(fields, logger, tracker);

      expect(collection.entries[0].trigger).toBe('debounced');
      expect(collection.entries[0].debounceMs).toBe(300);
      expect(collection.entries[1].trigger).toBe('onChange');
      expect(collection.entries[1].debounceMs).toBeUndefined();
    });

    it('should forward http + responseExpression for HTTP property derivations', () => {
      const fields: FieldDef<unknown>[] = [
        {
          key: 'streetDropdown',
          type: 'select',
          logic: [
            {
              type: 'derivation',
              source: 'http',
              targetProperty: 'options',
              http: { url: '/api/streets', queryParams: { q: 'formValue.street' } },
              responseExpression: 'response.map(d => ({ value: d.id, label: d.name }))',
              dependsOn: ['street'],
            },
          ],
        } as unknown as FieldDef<unknown>,
      ];

      const collection = collectPropertyDerivations(fields, logger, tracker);

      expect(collection.entries).toHaveLength(1);
      const entry = collection.entries[0];
      expect(entry.fieldKey).toBe('streetDropdown');
      expect(entry.targetProperty).toBe('options');
      expect(entry.http).toEqual({ url: '/api/streets', queryParams: { q: 'formValue.street' } });
      expect(entry.responseExpression).toBe('response.map(d => ({ value: d.id, label: d.name }))');
      expect(entry.dependsOn).toEqual(['street']);
    });

    it('should forward asyncFunctionName and asyncFn for async property derivations', () => {
      const inlineFn = async () => [{ value: '1', label: 'a' }];
      const fields: FieldDef<unknown>[] = [
        {
          key: 'cityRegistered',
          type: 'select',
          logic: [
            {
              type: 'derivation',
              source: 'asyncFunction',
              targetProperty: 'options',
              asyncFunctionName: 'fetchCities',
              dependsOn: ['country'],
            },
          ],
        } as unknown as FieldDef<unknown>,
        {
          key: 'cityInline',
          type: 'select',
          logic: [
            {
              type: 'derivation',
              source: 'asyncFunction',
              targetProperty: 'options',
              asyncFn: inlineFn,
              dependsOn: ['country'],
            },
          ],
        } as unknown as FieldDef<unknown>,
      ];

      const collection = collectPropertyDerivations(fields, logger, tracker);

      expect(collection.entries[0].asyncFunctionName).toBe('fetchCities');
      expect(collection.entries[0].asyncFn).toBeUndefined();
      expect(collection.entries[1].asyncFunctionName).toBeUndefined();
      expect(collection.entries[1].asyncFn).toBe(inlineFn);
    });

    it('should throw when HTTP property derivation has empty dependsOn', () => {
      const fields: FieldDef<unknown>[] = [
        {
          key: 'streetDropdown',
          type: 'select',
          logic: [
            {
              type: 'derivation',
              source: 'http',
              targetProperty: 'options',
              http: { url: '/api/streets' },
              responseExpression: 'response',
              dependsOn: [],
            },
          ],
        } as unknown as FieldDef<unknown>,
      ];

      expect(() => collectPropertyDerivations(fields, logger, tracker)).toThrow(/requires explicit 'dependsOn'/);
    });

    it("should throw when HTTP property derivation uses wildcard '*' in dependsOn", () => {
      const fields: FieldDef<unknown>[] = [
        {
          key: 'streetDropdown',
          type: 'select',
          logic: [
            {
              type: 'derivation',
              source: 'http',
              targetProperty: 'options',
              http: { url: '/api/streets' },
              responseExpression: 'response',
              dependsOn: ['*'],
            },
          ],
        } as unknown as FieldDef<unknown>,
      ];

      expect(() => collectPropertyDerivations(fields, logger, tracker)).toThrow(/cannot use wildcard/);
    });
  });
});
