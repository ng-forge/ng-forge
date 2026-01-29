import { describe, expect, it } from 'vitest';
import { collectDerivations } from './derivation-collector';
import { FieldDef } from '../../definitions/base/field-def';
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
      it('should collect derivations from group fields', () => {
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
        expect(collection.entries[0].fieldKey).toBe('fullAddress');
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
  });
});
