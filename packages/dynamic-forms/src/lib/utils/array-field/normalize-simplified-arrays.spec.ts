import { describe, it, expect } from 'vitest';
import { normalizeSimplifiedArrays } from './normalize-simplified-arrays';
import { FieldDef } from '../../definitions/base/field-def';

// Helper to cast field literals to FieldDef<unknown>

const f = (field: any) => field as FieldDef<unknown>;

const fields = (...defs: any[]) => defs as FieldDef<unknown>[];

describe('normalizeSimplifiedArrays', () => {
  describe('passthrough', () => {
    it('should pass through non-array fields unchanged', () => {
      const input = fields(
        { key: 'name', type: 'input', label: 'Name', value: '' },
        { key: 'email', type: 'input', label: 'Email', value: '' },
      );

      const result = normalizeSimplifiedArrays(input);
      expect(result).toEqual(input);
    });

    it('should pass through full-API array fields unchanged', () => {
      const input = fields({
        key: 'tags',
        type: 'array',
        fields: [
          { key: 'value', type: 'input', label: 'Tag', value: 'angular' },
          { key: 'value', type: 'input', label: 'Tag', value: 'typescript' },
        ],
      });

      const result = normalizeSimplifiedArrays(input);
      expect(result).toEqual(input);
    });
  });

  describe('primitive array expansion', () => {
    it('should expand a primitive simplified array with values', () => {
      const input = fields({
        key: 'tags',
        type: 'array',
        template: { key: 'value', type: 'input', label: 'Tag' },
        value: ['angular', 'typescript'],
      });

      const result = normalizeSimplifiedArrays(input);

      // Should produce: arrayField + addButton
      expect(result).toHaveLength(2);

      // Array field
      const arrayField = result[0] as Record<string, unknown>;
      expect(arrayField.key).toBe('tags');
      expect(arrayField.type).toBe('array');

      const items = arrayField.fields as unknown[][];
      expect(items).toHaveLength(2);

      // Each item should be wrapped in [row[template + remove]]
      const firstItem = items[0] as Record<string, unknown>[];
      expect(firstItem).toHaveLength(1);
      const row = firstItem[0] as Record<string, unknown>;
      expect(row.type).toBe('row');
      const rowFields = row.fields as Record<string, unknown>[];
      expect(rowFields).toHaveLength(2);
      expect(rowFields[0].value).toBe('angular');
      expect(rowFields[0].type).toBe('input');
      expect(rowFields[1].type).toBe('removeArrayItem');

      // Add button
      const addButton = result[1] as Record<string, unknown>;
      expect(addButton.key).toBe('tags__add');
      expect(addButton.type).toBe('addArrayItem');
      expect(addButton.label).toBe('Add');
      expect(addButton.arrayKey).toBe('tags');
    });

    it('should handle empty value for primitive array', () => {
      const input = fields({
        key: 'tags',
        type: 'array',
        template: { key: 'value', type: 'input', label: 'Tag' },
      });

      const result = normalizeSimplifiedArrays(input);

      expect(result).toHaveLength(2);
      const arrayField = result[0] as Record<string, unknown>;
      expect((arrayField.fields as unknown[]).length).toBe(0);

      // Add button should still be generated
      expect(result[1]).toBeDefined();
      const addButton = result[1] as Record<string, unknown>;
      expect(addButton.type).toBe('addArrayItem');
    });

    it('should handle value: [] for primitive array', () => {
      const input = fields({
        key: 'tags',
        type: 'array',
        template: { key: 'value', type: 'input', label: 'Tag' },
        value: [],
      });

      const result = normalizeSimplifiedArrays(input);

      expect(result).toHaveLength(2);
      const arrayField = result[0] as Record<string, unknown>;
      expect((arrayField.fields as unknown[]).length).toBe(0);
    });
  });

  describe('object array expansion', () => {
    it('should expand an object simplified array with values', () => {
      const input = fields({
        key: 'contacts',
        type: 'array',
        template: [
          { key: 'name', type: 'input', label: 'Name' },
          { key: 'phone', type: 'input', label: 'Phone' },
        ],
        value: [{ name: 'Jane', phone: '555' }],
      });

      const result = normalizeSimplifiedArrays(input);

      expect(result).toHaveLength(2);

      const arrayField = result[0] as Record<string, unknown>;
      expect(arrayField.key).toBe('contacts');
      expect(arrayField.type).toBe('array');

      const items = arrayField.fields as unknown[][];
      expect(items).toHaveLength(1);

      // Object item: [name, phone, removeButton]
      const firstItem = items[0] as Record<string, unknown>[];
      expect(firstItem).toHaveLength(3);
      expect(firstItem[0].key).toBe('name');
      expect(firstItem[0].value).toBe('Jane');
      expect(firstItem[1].key).toBe('phone');
      expect(firstItem[1].value).toBe('555');
      expect(firstItem[2].type).toBe('removeArrayItem');
    });

    it('should handle empty value for object array', () => {
      const input = fields({
        key: 'contacts',
        type: 'array',
        template: [
          { key: 'name', type: 'input', label: 'Name' },
          { key: 'phone', type: 'input', label: 'Phone' },
        ],
      });

      const result = normalizeSimplifiedArrays(input);

      expect(result).toHaveLength(2);
      const arrayField = result[0] as Record<string, unknown>;
      expect((arrayField.fields as unknown[]).length).toBe(0);
    });

    it('should only merge values for keys that exist in valueObj', () => {
      const input = fields({
        key: 'contacts',
        type: 'array',
        template: [
          { key: 'name', type: 'input', label: 'Name' },
          { key: 'phone', type: 'input', label: 'Phone' },
        ],
        value: [{ name: 'Jane' }], // phone not provided
      });

      const result = normalizeSimplifiedArrays(input);

      const items = (result[0] as Record<string, unknown>).fields as Record<string, unknown>[][];
      const firstItem = items[0];
      expect(firstItem[0].value).toBe('Jane');
      expect('value' in firstItem[1]).toBe(false); // phone should not have value
    });
  });

  describe('add button', () => {
    it('should generate add button with default label', () => {
      const input = fields({
        key: 'tags',
        type: 'array',
        template: { key: 'value', type: 'input', label: 'Tag' },
      });

      const result = normalizeSimplifiedArrays(input);
      const addButton = result[1] as Record<string, unknown>;

      expect(addButton.label).toBe('Add');
      expect(addButton.arrayKey).toBe('tags');
    });

    it('should generate add button with custom label', () => {
      const input = fields({
        key: 'tags',
        type: 'array',
        template: { key: 'value', type: 'input', label: 'Tag' },
        addButton: { label: 'Add Tag' },
      });

      const result = normalizeSimplifiedArrays(input);
      const addButton = result[1] as Record<string, unknown>;

      expect(addButton.label).toBe('Add Tag');
    });

    it('should generate add button with custom props', () => {
      const input = fields({
        key: 'tags',
        type: 'array',
        template: { key: 'value', type: 'input', label: 'Tag' },
        addButton: { label: 'Add Tag', props: { color: 'primary' } },
      });

      const result = normalizeSimplifiedArrays(input);
      const addButton = result[1] as Record<string, unknown>;

      expect(addButton.props).toEqual({ color: 'primary' });
    });

    it('should not generate add button when addButton: false', () => {
      const input = fields({
        key: 'tags',
        type: 'array',
        template: { key: 'value', type: 'input', label: 'Tag' },
        addButton: false,
      });

      const result = normalizeSimplifiedArrays(input);

      // Only the array field, no add button
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('array');
    });

    it('should generate add button with correct template for primitive items', () => {
      const input = fields({
        key: 'tags',
        type: 'array',
        template: { key: 'value', type: 'input', label: 'Tag' },
      });

      const result = normalizeSimplifiedArrays(input);
      const addButton = result[1] as Record<string, unknown>;
      const addTemplate = addButton.template as Record<string, unknown>[];

      // Template should be [row[input, removeButton]]
      expect(addTemplate).toHaveLength(1);
      const row = addTemplate[0] as Record<string, unknown>;
      expect(row.type).toBe('row');
      const rowFields = row.fields as Record<string, unknown>[];
      expect(rowFields[0].type).toBe('input');
      expect(rowFields[1].type).toBe('removeArrayItem');
    });

    it('should generate add button with correct template for object items', () => {
      const input = fields({
        key: 'contacts',
        type: 'array',
        template: [
          { key: 'name', type: 'input', label: 'Name' },
          { key: 'phone', type: 'input', label: 'Phone' },
        ],
      });

      const result = normalizeSimplifiedArrays(input);
      const addButton = result[1] as Record<string, unknown>;
      const addTemplate = addButton.template as Record<string, unknown>[];

      // Template should be [name, phone, removeButton]
      expect(addTemplate).toHaveLength(3);
      expect(addTemplate[0].key).toBe('name');
      expect(addTemplate[1].key).toBe('phone');
      expect(addTemplate[2].type).toBe('removeArrayItem');
    });
  });

  describe('remove button', () => {
    it('should generate remove button with default label', () => {
      const input = fields({
        key: 'tags',
        type: 'array',
        template: { key: 'value', type: 'input', label: 'Tag' },
        value: ['angular'],
      });

      const result = normalizeSimplifiedArrays(input);
      const items = (result[0] as Record<string, unknown>).fields as unknown[][];
      const row = (items[0] as Record<string, unknown>[])[0] as Record<string, unknown>;
      const rowFields = row.fields as Record<string, unknown>[];
      const removeBtn = rowFields[1];

      expect(removeBtn.type).toBe('removeArrayItem');
      expect(removeBtn.label).toBe('Remove');
    });

    it('should generate remove button with custom label and props', () => {
      const input = fields({
        key: 'tags',
        type: 'array',
        template: { key: 'value', type: 'input', label: 'Tag' },
        value: ['angular'],
        removeButton: { label: 'Delete', props: { color: 'warn' } },
      });

      const result = normalizeSimplifiedArrays(input);
      const items = (result[0] as Record<string, unknown>).fields as unknown[][];
      const row = (items[0] as Record<string, unknown>[])[0] as Record<string, unknown>;
      const rowFields = row.fields as Record<string, unknown>[];
      const removeBtn = rowFields[1];

      expect(removeBtn.label).toBe('Delete');
      expect(removeBtn.props).toEqual({ color: 'warn' });
    });

    it('should not generate remove button when removeButton: false', () => {
      const input = fields({
        key: 'tags',
        type: 'array',
        template: { key: 'value', type: 'input', label: 'Tag' },
        value: ['angular'],
        removeButton: false,
      });

      const result = normalizeSimplifiedArrays(input);
      const items = (result[0] as Record<string, unknown>).fields as unknown[][];

      // Primitive without remove button: wrapped in array (consistent FieldDef[][] structure), no row
      expect(items).toHaveLength(1);
      const itemFields = items[0] as Record<string, unknown>[];
      expect(itemFields).toHaveLength(1);
      expect(itemFields[0].type).toBe('input');
      expect(itemFields[0].value).toBe('angular');
    });

    it('should not generate remove button for object arrays when removeButton: false', () => {
      const input = fields({
        key: 'contacts',
        type: 'array',
        template: [
          { key: 'name', type: 'input', label: 'Name' },
          { key: 'phone', type: 'input', label: 'Phone' },
        ],
        value: [{ name: 'Jane', phone: '555' }],
        removeButton: false,
      });

      const result = normalizeSimplifiedArrays(input);
      const items = (result[0] as Record<string, unknown>).fields as unknown[][];

      // Object item without remove button: [name, phone] only
      expect(items[0]).toHaveLength(2);
      expect((items[0][0] as Record<string, unknown>).key).toBe('name');
      expect((items[0][1] as Record<string, unknown>).key).toBe('phone');
    });
  });

  describe('recursive normalization', () => {
    it('should normalize simplified arrays inside page containers', () => {
      const input = fields({
        key: 'page1',
        type: 'page',
        fields: [
          {
            key: 'tags',
            type: 'array',
            template: { key: 'value', type: 'input', label: 'Tag' },
            value: ['angular'],
          },
        ],
      });

      const result = normalizeSimplifiedArrays(input);

      expect(result).toHaveLength(1);
      const page = result[0] as Record<string, unknown>;
      const pageFields = page.fields as Record<string, unknown>[];

      // Should have array + add button inside the page
      expect(pageFields).toHaveLength(2);
      expect(pageFields[0].type).toBe('array');
      expect(pageFields[1].type).toBe('addArrayItem');
    });

    it('should normalize simplified arrays inside group containers', () => {
      const input = fields({
        key: 'myGroup',
        type: 'group',
        fields: [
          {
            key: 'tags',
            type: 'array',
            template: { key: 'value', type: 'input', label: 'Tag' },
            value: ['angular'],
          },
        ],
      });

      const result = normalizeSimplifiedArrays(input);

      const group = result[0] as Record<string, unknown>;
      const groupFields = group.fields as Record<string, unknown>[];

      expect(groupFields).toHaveLength(2);
      expect(groupFields[0].type).toBe('array');
      expect(groupFields[1].type).toBe('addArrayItem');
    });

    it('should normalize simplified arrays inside row containers', () => {
      const input = fields({
        key: 'myRow',
        type: 'row',
        fields: [
          {
            key: 'tags',
            type: 'array',
            template: { key: 'value', type: 'input', label: 'Tag' },
            value: ['angular'],
          },
        ],
      });

      const result = normalizeSimplifiedArrays(input);

      const row = result[0] as Record<string, unknown>;
      const rowFields = row.fields as Record<string, unknown>[];

      expect(rowFields).toHaveLength(2);
      expect(rowFields[0].type).toBe('array');
      expect(rowFields[1].type).toBe('addArrayItem');
    });
  });

  describe('logic config preservation', () => {
    it('should preserve logic config on the expanded array field and add button', () => {
      const input = fields({
        key: 'tags',
        type: 'array',
        template: { key: 'value', type: 'input', label: 'Tag' },
        logic: [{ type: 'hidden', condition: true }],
      });

      const result = normalizeSimplifiedArrays(input);

      const arrayField = result[0] as Record<string, unknown>;
      expect(arrayField.logic).toEqual([{ type: 'hidden', condition: true }]);

      // Add button should also inherit the logic config
      const addButton = result[1] as Record<string, unknown>;
      expect(addButton.logic).toEqual([{ type: 'hidden', condition: true }]);
    });
  });

  describe('idempotency', () => {
    it('should produce the same result when called on already-normalized output', () => {
      const input = fields({
        key: 'tags',
        type: 'array',
        template: { key: 'value', type: 'input', label: 'Tag' },
        value: ['angular', 'typescript'],
      });

      const firstPass = normalizeSimplifiedArrays(input);
      const secondPass = normalizeSimplifiedArrays(firstPass);

      expect(secondPass).toEqual(firstPass);
    });
  });

  describe('mixed configs', () => {
    it('should handle simplified and full arrays in the same config', () => {
      const input = fields(
        {
          key: 'simpleTags',
          type: 'array',
          template: { key: 'value', type: 'input', label: 'Tag' },
          value: ['angular'],
        },
        {
          key: 'fullContacts',
          type: 'array',
          fields: [
            [
              { key: 'name', type: 'input', value: 'Jane' },
              { key: 'phone', type: 'input', value: '555' },
            ],
          ],
        },
        { key: 'name', type: 'input', label: 'Name', value: '' },
      );

      const result = normalizeSimplifiedArrays(input);

      // simpleTags array + addButton + fullContacts array + name input
      expect(result).toHaveLength(4);
      expect(result[0].type).toBe('array');
      expect(result[0].key).toBe('simpleTags');
      expect(result[1].type).toBe('addArrayItem');
      expect(result[2].type).toBe('array');
      expect(result[2].key).toBe('fullContacts');
      expect(result[3].type).toBe('input');
    });
  });
});
