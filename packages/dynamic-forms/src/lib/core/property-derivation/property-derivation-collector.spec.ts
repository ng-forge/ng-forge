import { describe, expect, it } from 'vitest';
import { collectPropertyDerivations } from './property-derivation-collector';
import { FieldDef } from '../../definitions/base/field-def';

describe('property-derivation-collector', () => {
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

      const collection = collectPropertyDerivations(fields);

      expect(collection.entries).toHaveLength(0);
    });

    it('should collect a single propertyDerivation entry from a field logic array', () => {
      const fields: FieldDef<unknown>[] = [
        {
          key: 'endDate',
          type: 'datepicker',
          logic: [
            {
              type: 'propertyDerivation',
              targetProperty: 'minDate',
              expression: 'formValue.startDate',
            },
          ],
        } as unknown as FieldDef<unknown>,
      ];

      const collection = collectPropertyDerivations(fields);

      expect(collection.entries).toHaveLength(1);
      expect(collection.entries[0].fieldKey).toBe('endDate');
      expect(collection.entries[0].targetProperty).toBe('minDate');
      expect(collection.entries[0].expression).toBe('formValue.startDate');
      expect(collection.entries[0].trigger).toBe('onChange');
      expect(collection.entries[0].condition).toBe(true);
    });

    it('should ignore state logic and value derivation entries (only collects type: propertyDerivation)', () => {
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
              type: 'propertyDerivation',
              targetProperty: 'label',
              value: 'Dynamic Label',
            },
          ],
        } as unknown as FieldDef<unknown>,
      ];

      const collection = collectPropertyDerivations(fields);

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
              type: 'propertyDerivation',
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
              type: 'propertyDerivation',
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
              type: 'propertyDerivation',
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

      const collection = collectPropertyDerivations(fields);

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
                      type: 'propertyDerivation',
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
                      type: 'propertyDerivation',
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

      const collection = collectPropertyDerivations(fields);

      expect(collection.entries).toHaveLength(2);
      expect(collection.entries[0].fieldKey).toBe('zipField');
      expect(collection.entries[0].targetProperty).toBe('placeholder');
      expect(collection.entries[1].fieldKey).toBe('citySelect');
      expect(collection.entries[1].targetProperty).toBe('options');
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
                  type: 'propertyDerivation',
                  targetProperty: 'minDate',
                  expression: 'formValue.startDate',
                },
              ],
            } as unknown as FieldDef<unknown>,
          ],
        } as unknown as FieldDef<unknown>,
      ];

      const collection = collectPropertyDerivations(fields);

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
              type: 'propertyDerivation',
              targetProperty: 'label',
              expression: 'formValue.quantity * formValue.unitPrice',
            },
          ],
        } as unknown as FieldDef<unknown>,
      ];

      const collection = collectPropertyDerivations(fields);

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
              type: 'propertyDerivation',
              targetProperty: 'options',
              functionName: 'getCitiesForCountry',
              dependsOn: ['country'],
            },
          ],
        } as unknown as FieldDef<unknown>,
      ];

      const collection = collectPropertyDerivations(fields);

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
              type: 'propertyDerivation',
              targetProperty: 'options',
              functionName: 'getAllCurrencies',
            },
          ],
        } as unknown as FieldDef<unknown>,
      ];

      const collection = collectPropertyDerivations(fields);

      expect(collection.entries[0].dependsOn).toContain('*');
    });

    it('should extract dependencies from condition expressions', () => {
      const fields: FieldDef<unknown>[] = [
        {
          key: 'phone',
          type: 'input',
          logic: [
            {
              type: 'propertyDerivation',
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

      const collection = collectPropertyDerivations(fields);

      expect(collection.entries[0].dependsOn).toContain('contactType');
    });

    it('should set correct trigger and debounceMs', () => {
      const fields: FieldDef<unknown>[] = [
        {
          key: 'searchResults',
          type: 'select',
          logic: [
            {
              type: 'propertyDerivation',
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
              type: 'propertyDerivation',
              targetProperty: 'label',
              expression: 'formValue.name',
            },
          ],
        } as unknown as FieldDef<unknown>,
      ];

      const collection = collectPropertyDerivations(fields);

      expect(collection.entries[0].trigger).toBe('debounced');
      expect(collection.entries[0].debounceMs).toBe(300);
      expect(collection.entries[1].trigger).toBe('onChange');
      expect(collection.entries[1].debounceMs).toBeUndefined();
    });
  });
});
