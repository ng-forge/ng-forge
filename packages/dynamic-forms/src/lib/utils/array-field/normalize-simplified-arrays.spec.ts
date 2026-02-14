import { describe, it, expect } from 'vitest';
import { normalizeSimplifiedArrays } from './normalize-simplified-arrays';
import { getNormalizedArrayMetadata } from './normalized-array-metadata';
import { FieldDef } from '../../definitions/base/field-def';

// Helper to cast field literals to FieldDef<unknown>
const fields = (...defs: Record<string, unknown>[]) => defs as FieldDef<unknown>[];

// ─────────────────────────────────────────────────────────────────────────────
// Shared test fixtures
// ─────────────────────────────────────────────────────────────────────────────

const primitiveTemplate = { key: 'value', type: 'input', label: 'Tag' } as const;
const objectTemplate = [
  { key: 'name', type: 'input', label: 'Name' },
  { key: 'phone', type: 'input', label: 'Phone' },
] as const;

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
    it('should expand a primitive simplified array with values as single FieldDefs', () => {
      const input = fields({
        key: 'tags',
        type: 'array',
        template: primitiveTemplate,
        value: ['angular', 'typescript'],
      });

      const result = normalizeSimplifiedArrays(input);

      // Should produce: arrayField + addButton
      expect(result).toHaveLength(2);

      // Array field
      const arrayField = result[0] as Record<string, unknown>;
      expect(arrayField.key).toBe('tags');
      expect(arrayField.type).toBe('array');

      // Items are single FieldDefs (primitive items), NOT wrapped in arrays/rows
      const items = arrayField.fields as Record<string, unknown>[];
      expect(items).toHaveLength(2);
      expect(items[0].type).toBe('input');
      expect(items[0].value).toBe('angular');
      expect(items[0].key).toBe('value');
      expect(items[1].type).toBe('input');
      expect(items[1].value).toBe('typescript');

      // Auto-remove button stored in WeakMap metadata
      const metadata = getNormalizedArrayMetadata(arrayField);
      expect(metadata).toBeDefined();
      expect(metadata!.autoRemoveButton).toBeDefined();
      const autoRemove = metadata!.autoRemoveButton as Record<string, unknown>;
      expect(autoRemove.type).toBe('removeArrayItem');
      expect(autoRemove.label).toBe('Remove');

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
        template: primitiveTemplate,
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
        template: primitiveTemplate,
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
        template: objectTemplate,
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
        template: objectTemplate,
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
        template: objectTemplate,
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
        template: primitiveTemplate,
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
        template: primitiveTemplate,
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
        template: primitiveTemplate,
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
        template: primitiveTemplate,
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
        template: primitiveTemplate,
      });

      const result = normalizeSimplifiedArrays(input);
      const addButton = result[1] as Record<string, unknown>;
      const addTemplate = addButton.template as Record<string, unknown>;

      // Template should be the single field (not wrapped in row/array)
      // Remove button is handled via WeakMap metadata on the array field
      expect(addTemplate.type).toBe('input');
      expect(addTemplate.key).toBe('value');
      expect(addTemplate.label).toBe('Tag');
    });

    it('should generate add button with correct template for object items', () => {
      const input = fields({
        key: 'contacts',
        type: 'array',
        template: objectTemplate,
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
    it('should store auto-remove button in metadata with default label', () => {
      const input = fields({
        key: 'tags',
        type: 'array',
        template: primitiveTemplate,
        value: ['angular'],
      });

      const result = normalizeSimplifiedArrays(input);
      const arrayField = result[0] as Record<string, unknown>;

      // Items are single FieldDefs (not wrapped in rows)
      const items = arrayField.fields as Record<string, unknown>[];
      expect(items).toHaveLength(1);
      expect(items[0].type).toBe('input');
      expect(items[0].value).toBe('angular');

      // Remove button is stored in WeakMap metadata
      const metadata = getNormalizedArrayMetadata(arrayField);
      expect(metadata).toBeDefined();
      const removeBtn = metadata!.autoRemoveButton as Record<string, unknown>;
      expect(removeBtn).toBeDefined();
      expect(removeBtn.type).toBe('removeArrayItem');
      expect(removeBtn.label).toBe('Remove');
    });

    it('should store auto-remove button in metadata with custom label and props', () => {
      const input = fields({
        key: 'tags',
        type: 'array',
        template: primitiveTemplate,
        value: ['angular'],
        removeButton: { label: 'Delete', props: { color: 'warn' } },
      });

      const result = normalizeSimplifiedArrays(input);
      const arrayField = result[0] as Record<string, unknown>;

      // Items are single FieldDefs (not wrapped in rows)
      const items = arrayField.fields as Record<string, unknown>[];
      expect(items).toHaveLength(1);
      expect(items[0].type).toBe('input');
      expect(items[0].value).toBe('angular');

      // Remove button metadata with custom config
      const metadata = getNormalizedArrayMetadata(arrayField);
      expect(metadata).toBeDefined();
      const removeBtn = metadata!.autoRemoveButton as Record<string, unknown>;
      expect(removeBtn).toBeDefined();
      expect(removeBtn.label).toBe('Delete');
      expect(removeBtn.props).toEqual({ color: 'warn' });
    });

    it('should not store auto-remove metadata when removeButton: false', () => {
      const input = fields({
        key: 'tags',
        type: 'array',
        template: primitiveTemplate,
        value: ['angular'],
        removeButton: false,
      });

      const result = normalizeSimplifiedArrays(input);
      const arrayField = result[0] as Record<string, unknown>;

      // Primitive without remove button: single FieldDef items
      const items = arrayField.fields as Record<string, unknown>[];
      expect(items).toHaveLength(1);
      expect(items[0].type).toBe('input');
      expect(items[0].value).toBe('angular');

      // No auto-remove metadata (but may have primitiveFieldKey)
      const metadata = getNormalizedArrayMetadata(arrayField);
      expect(metadata?.autoRemoveButton).toBeUndefined();
    });

    it('should not generate remove button for object arrays when removeButton: false', () => {
      const input = fields({
        key: 'contacts',
        type: 'array',
        template: objectTemplate,
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

  describe('primitive field key metadata', () => {
    it('should store primitiveFieldKey in metadata for primitive arrays', () => {
      const input = fields({
        key: 'tags',
        type: 'array',
        template: primitiveTemplate,
      });

      const result = normalizeSimplifiedArrays(input);
      const arrayField = result[0] as Record<string, unknown>;

      const metadata = getNormalizedArrayMetadata(arrayField);
      expect(metadata?.primitiveFieldKey).toBe('value');
    });

    it('should not store primitiveFieldKey for object arrays', () => {
      const input = fields({
        key: 'contacts',
        type: 'array',
        template: objectTemplate,
      });

      const result = normalizeSimplifiedArrays(input);
      const arrayField = result[0] as Record<string, unknown>;

      const metadata = getNormalizedArrayMetadata(arrayField);
      expect(metadata?.primitiveFieldKey).toBeUndefined();
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
            template: primitiveTemplate,
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
            template: primitiveTemplate,
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
            template: primitiveTemplate,
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
        template: primitiveTemplate,
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
        template: primitiveTemplate,
        value: ['angular', 'typescript'],
      });

      const firstPass = normalizeSimplifiedArrays(input);
      const secondPass = normalizeSimplifiedArrays(firstPass);

      expect(secondPass).toEqual(firstPass);
    });
  });

  describe('primitive value shape preservation', () => {
    it('should produce flat primitive items from template (add button template is single FieldDef)', () => {
      const input = fields({
        key: 'tags',
        type: 'array',
        template: primitiveTemplate,
        value: ['angular', 'typescript'],
      });

      const result = normalizeSimplifiedArrays(input);
      const arrayField = result[0] as Record<string, unknown>;
      const items = arrayField.fields as Record<string, unknown>[];

      // Each item is a single FieldDef (NOT wrapped in an array), ensuring FormControl (not FormGroup)
      for (const item of items) {
        expect(Array.isArray(item)).toBe(false);
        expect(item.type).toBe('input');
        expect(item.key).toBe('value');
      }

      // The add button template should also be a single FieldDef (not an array)
      const addButton = result[1] as Record<string, unknown>;
      const addTemplate = addButton.template as Record<string, unknown>;
      expect(Array.isArray(addTemplate)).toBe(false);
      expect(addTemplate.type).toBe('input');
      expect(addTemplate.key).toBe('value');
    });
  });

  describe('removing all items', () => {
    it('should produce empty fields array when value is empty', () => {
      const input = fields({
        key: 'tags',
        type: 'array',
        template: primitiveTemplate,
        value: [],
      });

      const result = normalizeSimplifiedArrays(input);
      const arrayField = result[0] as Record<string, unknown>;
      expect(arrayField.fields).toEqual([]);
    });

    it('should produce empty fields array when no value is provided', () => {
      const input = fields({
        key: 'tags',
        type: 'array',
        template: primitiveTemplate,
      });

      const result = normalizeSimplifiedArrays(input);
      const arrayField = result[0] as Record<string, unknown>;
      expect(arrayField.fields).toEqual([]);
    });
  });

  describe('mixed configs', () => {
    it('should handle simplified and full arrays in the same config', () => {
      const input = fields(
        {
          key: 'simpleTags',
          type: 'array',
          template: primitiveTemplate,
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
