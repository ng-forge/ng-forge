import { describe, it, expect, beforeEach } from 'vitest';
import { flattenFields } from './field-flattener';
import { FieldDef } from '../../definitions';
import { FieldTypeDefinition } from '../../models/field-type';

describe('field-flattener', () => {
  let registry: Map<string, FieldTypeDefinition>;

  beforeEach(() => {
    // Setup a basic registry with common field types
    registry = new Map<string, FieldTypeDefinition>([
      ['input', { component: {} as any, valueHandling: 'include' }],
      ['checkbox', { component: {} as any, valueHandling: 'include' }],
      ['select', { component: {} as any, valueHandling: 'include' }],
      ['button', { component: {} as any, valueHandling: 'exclude' }],
      ['text', { component: {} as any, valueHandling: 'exclude' }],
      ['group', { component: {} as any, valueHandling: 'include' }],
      ['array', { component: {} as any, valueHandling: 'include' }],
      ['row', { component: {} as any, valueHandling: 'flatten' }],
      ['page', { component: {} as any, valueHandling: 'flatten' }],
    ]);
  });

  describe('flattenFields', () => {
    describe('basic field types', () => {
      it('should pass through simple fields unchanged', () => {
        const fields: FieldDef<any>[] = [
          { type: 'input', key: 'email' },
          { type: 'checkbox', key: 'subscribe' },
        ];

        const result = flattenFields(fields, registry);

        expect(result).toEqual([
          { type: 'input', key: 'email' },
          { type: 'checkbox', key: 'subscribe' },
        ]);
      });

      it('should preserve all field properties', () => {
        const fields: FieldDef<any>[] = [
          {
            type: 'input',
            key: 'email',
            label: 'Email',
            placeholder: 'Enter email',
            required: true,
          },
        ];

        const result = flattenFields(fields, registry);

        expect(result[0]).toEqual({
          type: 'input',
          key: 'email',
          label: 'Email',
          placeholder: 'Enter email',
          required: true,
        });
      });
    });

    describe('auto-key generation', () => {
      it('should auto-generate keys for fields without keys', () => {
        const fields: FieldDef<any>[] = [{ type: 'input', label: 'Name' } as any, { type: 'button', label: 'Submit' } as any];

        const result = flattenFields(fields, registry);

        expect(result[0].key).toBe('auto_field_0');
        expect(result[1].key).toBe('auto_field_1');
      });

      it('should increment auto-key counter for each field without key', () => {
        const fields: FieldDef<any>[] = [{ type: 'input' } as any, { type: 'input' } as any, { type: 'input' } as any];

        const result = flattenFields(fields, registry);

        expect(result[0].key).toBe('auto_field_0');
        expect(result[1].key).toBe('auto_field_1');
        expect(result[2].key).toBe('auto_field_2');
      });

      it('should not overwrite existing keys', () => {
        const fields: FieldDef<any>[] = [{ type: 'input', key: 'existing' }, { type: 'input' } as any, { type: 'input', key: 'another' }];

        const result = flattenFields(fields, registry);

        expect(result[0].key).toBe('existing');
        expect(result[1].key).toBe('auto_field_0');
        expect(result[2].key).toBe('another');
      });
    });

    describe('row field flattening', () => {
      it('should flatten row field children into parent level', () => {
        const fields: FieldDef<any>[] = [
          {
            type: 'row',
            fields: [
              { type: 'input', key: 'firstName' },
              { type: 'input', key: 'lastName' },
            ],
          },
        ];

        const result = flattenFields(fields, registry);

        expect(result).toEqual([
          { type: 'input', key: 'firstName' },
          { type: 'input', key: 'lastName' },
        ]);
      });

      it('should handle multiple row fields', () => {
        const fields: FieldDef<any>[] = [
          {
            type: 'row',
            fields: [{ type: 'input', key: 'email' }],
          },
          {
            type: 'row',
            fields: [{ type: 'checkbox', key: 'subscribe' }],
          },
        ];

        const result = flattenFields(fields, registry);

        expect(result).toEqual([
          { type: 'input', key: 'email' },
          { type: 'checkbox', key: 'subscribe' },
        ]);
      });

      it('should handle empty row fields', () => {
        const fields: FieldDef<any>[] = [
          { type: 'row', fields: [] },
          { type: 'input', key: 'test' },
        ];

        const result = flattenFields(fields, registry);

        expect(result).toEqual([{ type: 'input', key: 'test' }]);
      });

      it('should preserve rows when preserveRows option is true', () => {
        const fields: FieldDef<any>[] = [
          {
            type: 'row',
            key: 'row1',
            fields: [
              { type: 'input', key: 'firstName' },
              { type: 'input', key: 'lastName' },
            ],
          },
        ];

        const result = flattenFields(fields, registry, { preserveRows: true });

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('row');
        expect(result[0].key).toBe('row1');
        expect(result[0].fields).toEqual([
          { type: 'input', key: 'firstName' },
          { type: 'input', key: 'lastName' },
        ]);
      });

      it('should auto-generate key for preserved row without key', () => {
        const fields: FieldDef<any>[] = [
          {
            type: 'row',
            fields: [{ type: 'input', key: 'test' }],
          },
        ];

        const result = flattenFields(fields, registry, { preserveRows: true });

        expect(result[0].key).toBe('auto_row_0');
      });
    });

    describe('page field flattening', () => {
      it('should flatten page field children into parent level', () => {
        const fields: FieldDef<any>[] = [
          {
            type: 'page',
            fields: [
              { type: 'input', key: 'name' },
              { type: 'input', key: 'email' },
            ],
          },
        ];

        const result = flattenFields(fields, registry);

        expect(result).toEqual([
          { type: 'input', key: 'name' },
          { type: 'input', key: 'email' },
        ]);
      });

      it('should flatten page fields even with preserveRows option', () => {
        const fields: FieldDef<any>[] = [
          {
            type: 'page',
            fields: [{ type: 'input', key: 'test' }],
          },
        ];

        const result = flattenFields(fields, registry, { preserveRows: true });

        expect(result).toEqual([{ type: 'input', key: 'test' }]);
      });
    });

    describe('group field handling', () => {
      it('should preserve group structure with flattened children', () => {
        const fields: FieldDef<any>[] = [
          {
            type: 'group',
            key: 'address',
            fields: {
              street: { type: 'input', key: 'street' },
              city: { type: 'input', key: 'city' },
            },
          },
        ];

        const result = flattenFields(fields, registry);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('group');
        expect(result[0].key).toBe('address');
        expect(result[0].fields).toEqual([
          { type: 'input', key: 'street' },
          { type: 'input', key: 'city' },
        ]);
      });

      it('should auto-generate key for group without key', () => {
        const fields: FieldDef<any>[] = [
          {
            type: 'group',
            fields: {
              test: { type: 'input', key: 'test' },
            },
          } as any,
        ];

        const result = flattenFields(fields, registry);

        expect(result[0].key).toBe('auto_group_0');
      });

      it('should handle nested groups', () => {
        const fields: FieldDef<any>[] = [
          {
            type: 'group',
            key: 'user',
            fields: {
              name: { type: 'input', key: 'name' },
              address: {
                type: 'group',
                key: 'address',
                fields: {
                  street: { type: 'input', key: 'street' },
                },
              },
            },
          },
        ];

        const result = flattenFields(fields, registry);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('group');
        expect(result[0].key).toBe('user');
        expect(result[0].fields).toHaveLength(2);
        expect((result[0].fields as any)[1].type).toBe('group');
      });
    });

    describe('array field handling', () => {
      it('should preserve array structure with flattened item templates', () => {
        // New structure: fields[][] where each inner array defines one item's fields
        const fields: FieldDef<any>[] = [
          {
            type: 'array',
            key: 'items',
            fields: [
              [
                { type: 'input', key: 'name' },
                { type: 'input', key: 'quantity' },
              ],
            ],
          },
        ];

        const result = flattenFields(fields, registry);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('array');
        expect(result[0].key).toBe('items');
        // Result is now FieldDef[][] with flattened items
        expect(result[0].fields).toEqual([
          [
            { type: 'input', key: 'name' },
            { type: 'input', key: 'quantity' },
          ],
        ]);
      });

      it('should auto-generate key for array without key', () => {
        const fields: FieldDef<any>[] = [
          {
            type: 'array',
            fields: [[{ type: 'input', key: 'item' }]],
          } as any,
        ];

        const result = flattenFields(fields, registry);

        expect(result[0].key).toBe('auto_array_0');
      });
    });

    describe('complex nested structures', () => {
      it('should flatten complex nested structure correctly', () => {
        const fields: FieldDef<any>[] = [
          {
            type: 'page',
            fields: [
              {
                type: 'row',
                fields: [
                  { type: 'input', key: 'firstName' },
                  { type: 'input', key: 'lastName' },
                ],
              },
              {
                type: 'group',
                key: 'address',
                fields: {
                  street: { type: 'input', key: 'street' },
                  city: { type: 'input', key: 'city' },
                },
              },
            ],
          },
        ];

        const result = flattenFields(fields, registry);

        expect(result).toHaveLength(3);
        expect(result[0]).toEqual({ type: 'input', key: 'firstName' });
        expect(result[1]).toEqual({ type: 'input', key: 'lastName' });
        expect(result[2].type).toBe('group');
        expect(result[2].key).toBe('address');
      });

      it('should handle row within group', () => {
        const fields: FieldDef<any>[] = [
          {
            type: 'group',
            key: 'form',
            fields: {
              row1: {
                type: 'row',
                fields: [
                  { type: 'input', key: 'email' },
                  { type: 'input', key: 'phone' },
                ],
              },
            },
          },
        ];

        const result = flattenFields(fields, registry);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('group');
        expect(result[0].fields).toEqual([
          { type: 'input', key: 'email' },
          { type: 'input', key: 'phone' },
        ]);
      });

      it('should handle array with row template', () => {
        // New structure: fields[][] where each inner array defines one item's fields
        // Row containers within items should flatten their children
        const fields: FieldDef<any>[] = [
          {
            type: 'array',
            key: 'addresses',
            fields: [
              [
                {
                  type: 'row',
                  fields: [
                    { type: 'input', key: 'street' },
                    { type: 'input', key: 'city' },
                  ],
                },
              ],
            ],
          },
        ];

        const result = flattenFields(fields, registry);

        expect(result).toHaveLength(1);
        expect(result[0].type).toBe('array');
        // Result is FieldDef[][] with flattened rows within each item
        expect(result[0].fields).toEqual([
          [
            { type: 'input', key: 'street' },
            { type: 'input', key: 'city' },
          ],
        ]);
      });
    });

    describe('edge cases', () => {
      it('should handle empty fields array', () => {
        const fields: FieldDef<any>[] = [];
        const result = flattenFields(fields, registry);

        expect(result).toEqual([]);
      });

      it('should handle fields with object notation', () => {
        const fields: FieldDef<any>[] = [
          {
            type: 'row',
            fields: {
              first: { type: 'input', key: 'firstName' },
              last: { type: 'input', key: 'lastName' },
            },
          } as any,
        ];

        const result = flattenFields(fields, registry);

        expect(result).toHaveLength(2);
        expect(result[0].key).toBe('firstName');
        expect(result[1].key).toBe('lastName');
      });

      it('should handle unregistered field types as leaf fields', () => {
        const fields: FieldDef<any>[] = [{ type: 'custom' as any, key: 'test' }];

        const result = flattenFields(fields, registry);

        expect(result).toEqual([{ type: 'custom', key: 'test' }]);
      });
    });
  });

  describe('flattenFields with preserveRows', () => {
    it('should preserve row fields for rendering', () => {
      const fields: FieldDef<any>[] = [
        {
          type: 'row',
          key: 'row1',
          fields: [
            { type: 'input', key: 'firstName' },
            { type: 'input', key: 'lastName' },
          ],
        },
      ];

      const result = flattenFields(fields, registry, { preserveRows: true });

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('row');
      expect(result[0].key).toBe('row1');
      expect(result[0].fields).toEqual([
        { type: 'input', key: 'firstName' },
        { type: 'input', key: 'lastName' },
      ]);
    });

    it('should still flatten page fields', () => {
      const fields: FieldDef<any>[] = [
        {
          type: 'page',
          fields: [
            { type: 'input', key: 'email' },
            { type: 'checkbox', key: 'subscribe' },
          ],
        },
      ];

      const result = flattenFields(fields, registry, { preserveRows: true });

      expect(result).toEqual([
        { type: 'input', key: 'email' },
        { type: 'checkbox', key: 'subscribe' },
      ]);
    });

    it('should handle complex structure with preserved rows', () => {
      const fields: FieldDef<any>[] = [
        {
          type: 'page',
          fields: [
            {
              type: 'row',
              key: 'row1',
              fields: [{ type: 'input', key: 'name' }],
            },
            {
              type: 'row',
              key: 'row2',
              fields: [{ type: 'input', key: 'email' }],
            },
          ],
        },
      ];

      const result = flattenFields(fields, registry, { preserveRows: true });

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('row');
      expect(result[0].key).toBe('row1');
      expect(result[1].type).toBe('row');
      expect(result[1].key).toBe('row2');
    });

    it('should preserve group and array structures', () => {
      const fields: FieldDef<any>[] = [
        {
          type: 'group',
          key: 'address',
          fields: {
            street: { type: 'input', key: 'street' },
          },
        },
        {
          type: 'array',
          key: 'items',
          fields: [[{ type: 'input', key: 'name' }]],
        },
      ];

      const result = flattenFields(fields, registry, { preserveRows: true });

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('group');
      expect(result[1].type).toBe('array');
    });
  });
});
