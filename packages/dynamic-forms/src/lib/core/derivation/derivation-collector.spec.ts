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
        expect(collection.entries[0].sourceFieldKey).toBe('total');
        expect(collection.entries[0].targetFieldKey).toBe('total');
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
      it('should collect derivation from logic array', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'country',
            type: 'text',
            logic: [
              {
                type: 'derivation',
                targetField: 'phonePrefix',
                expression: 'formValue.country === "USA" ? "+1" : "+44"',
              },
            ],
          } as TextFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].sourceFieldKey).toBe('country');
        expect(collection.entries[0].targetFieldKey).toBe('phonePrefix');
        expect(collection.entries[0].isShorthand).toBe(false);
      });

      it('should collect derivation with static value', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'premium',
            type: 'checkbox',
            logic: [
              {
                type: 'derivation',
                targetField: 'discount',
                condition: { type: 'fieldValue', operator: 'equals', value: true },
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
            key: 'country',
            type: 'text',
            logic: [
              {
                type: 'derivation',
                targetField: 'currency',
                functionName: 'getCurrencyForCountry',
              },
            ],
          } as TextFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries[0].functionName).toBe('getCurrencyForCountry');
        expect(collection.entries[0].dependsOn).toContain('*'); // Functions assume full form access
      });

      it('should collect derivation with onBlur trigger', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'zipCode',
            type: 'text',
            logic: [
              {
                type: 'derivation',
                targetField: 'city',
                expression: 'lookupCityFromZip(formValue.zipCode)',
                trigger: 'onBlur',
              },
            ],
          } as TextFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries[0].trigger).toBe('onBlur');
      });

      it('should ignore non-derivation logic entries', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'email',
            type: 'text',
            logic: [
              { type: 'hidden', condition: false },
              { type: 'readonly', condition: true },
              {
                type: 'derivation',
                targetField: 'displayEmail',
                expression: 'formValue.email.toLowerCase()',
              },
              { type: 'disabled', condition: false },
            ],
          } as TextFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(1);
        expect(collection.entries[0].targetFieldKey).toBe('displayEmail');
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
        expect(collection.entries[0].sourceFieldKey).toBe('fullAddress');
      });

      it('should collect derivations from array fields', () => {
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
        expect(collection.entries[0].sourceFieldKey).toBe('lineTotal');
      });

      it('should collect derivations with relative paths in array', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'items',
            type: 'array',
            fields: [
              {
                key: 'quantity',
                type: 'number',
                logic: [
                  {
                    type: 'derivation',
                    targetField: '$.lineTotal',
                    expression: 'formValue.quantity * formValue.price',
                  },
                ],
              } as NumberFieldDef,
            ],
          } as ArrayFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries[0].targetFieldKey).toBe('items.$.lineTotal');
      });
    });

    describe('lookup maps', () => {
      it('should build byTarget lookup map', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'source1',
            type: 'text',
            logic: [{ type: 'derivation', targetField: 'target1', value: 'a' }],
          } as TextFieldDef,
          {
            key: 'source2',
            type: 'text',
            logic: [{ type: 'derivation', targetField: 'target1', value: 'b' }],
          } as TextFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.byTarget.get('target1')?.length).toBe(2);
      });

      it('should build bySource lookup map', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'source1',
            type: 'text',
            logic: [
              { type: 'derivation', targetField: 'target1', value: 'a' },
              { type: 'derivation', targetField: 'target2', value: 'b' },
            ],
          } as TextFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.bySource.get('source1')?.length).toBe(2);
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
        expect(collection.entries[0].sourceFieldKey).toBe('valid');
      });

      it('should handle mixed shorthand and logic derivations', () => {
        const fields: FieldDef<unknown>[] = [
          {
            key: 'field1',
            type: 'text',
            derivation: 'formValue.other',
            logic: [{ type: 'derivation', targetField: 'field2', value: 'static' }],
          } as TextFieldDef,
        ];

        const collection = collectDerivations(fields);

        expect(collection.entries.length).toBe(2);
      });
    });
  });
});
