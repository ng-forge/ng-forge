import { flattenFields, getFieldLayoutClasses, getFieldLayoutStyles, groupFieldsByContainer } from './field-flattener';
import { FieldDef } from '../models/field-config';
import { RowField } from '../definitions/default/row-field';
import { GroupField } from '../definitions/default/group-field';

describe('Field Flattener', () => {
  describe('flattenFields', () => {
    it('should flatten simple definitions without modification', () => {
      const fields: FieldDef[] = [
        { key: 'name', type: 'input', label: 'Name' },
        { key: 'email', type: 'input', label: 'Email' },
      ];

      const result = flattenFields(fields);

      expect(result).toHaveLength(2);
      expect(result[0].key).toBe('name');
      expect(result[1].key).toBe('email');
      expect(result[0].layoutContext).toBeUndefined();
      expect(result[1].layoutContext).toBeUndefined();
    });

    it('should flatten row definitions with proper layout context', () => {
      const fields: FieldDef[] = [
        {
          key: 'personalInfo',
          type: 'row',
          label: 'Personal Information',
          fields: [
            { key: 'firstName', type: 'input', label: 'First Name' },
            { key: 'lastName', type: 'input', label: 'Last Name' },
          ],
        } as RowField,
      ];

      const result = flattenFields(fields);

      expect(result).toHaveLength(2);
      expect(result[0].key).toBe('firstName');
      expect(result[1].key).toBe('lastName');
      expect(result[0].layoutContext?.type).toBe('row');
      expect(result[1].layoutContext?.type).toBe('row');
      expect(result[0].layoutContext?.containerId).toContain('row_0');
    });

    it('should flatten group definitions with nested keys', () => {
      const fields: FieldDef[] = [
        {
          key: 'address',
          type: 'group',
          label: 'Address',
          fields: [
            { key: 'street', type: 'input', label: 'Street' },
            { key: 'city', type: 'input', label: 'City' },
          ],
        } as GroupField,
      ];

      const result = flattenFields(fields);

      expect(result).toHaveLength(2);
      expect(result[0].key).toBe('address.street');
      expect(result[1].key).toBe('address.city');
      expect(result[0].originalKey).toBe('street');
      expect(result[1].originalKey).toBe('city');
      expect(result[0].layoutContext?.type).toBe('group');
      expect(result[1].layoutContext?.type).toBe('group');
    });

    it('should handle nested row within group', () => {
      const fields: FieldDef[] = [
        {
          key: 'contact',
          type: 'group',
          label: 'Contact Information',
          fields: [
            {
              key: 'name',
              type: 'row',
              label: 'Name',
              fields: [
                { key: 'first', type: 'input', label: 'First' },
                { key: 'last', type: 'input', label: 'Last' },
              ],
            } as RowField,
            { key: 'email', type: 'input', label: 'Email' },
          ],
        } as GroupField,
      ];

      const result = flattenFields(fields);

      expect(result).toHaveLength(3);
      expect(result[0].key).toBe('contact.first');
      expect(result[1].key).toBe('contact.last');
      expect(result[2].key).toBe('contact.email');

      // First two definitions should have row layout context (innermost)
      expect(result[0].layoutContext?.type).toBe('row');
      expect(result[1].layoutContext?.type).toBe('row');

      // Last field should have group layout context
      expect(result[2].layoutContext?.type).toBe('group');
    });

    it('should handle column configuration for row definitions', () => {
      const fields: FieldDef[] = [
        {
          key: 'userInfo',
          type: 'row',
          label: 'User Info',
          fields: [
            {
              key: 'name',
              type: 'input',
              label: 'Name',
              col: { span: 8 } as any,
            },
            {
              key: 'age',
              type: 'input',
              label: 'Age',
              col: { span: 4 },
            },
          ],
        } as RowField,
      ];

      const result = flattenFields(fields);

      expect(result).toHaveLength(2);
      expect(result[0].layoutContext?.row?.col?.span).toBe(8);
      expect(result[1].layoutContext?.row?.col?.span).toBe(4);
    });

    it('should preserve custom gap settings', () => {
      const fields: FieldDef[] = [
        {
          key: 'customGapRow',
          type: 'row',
          label: 'Custom Gap Row',
          gap: { horizontal: '2rem', vertical: '1rem' },
          fields: [{ key: 'field1', type: 'input', label: 'Field 1' }],
        } as RowField,
        {
          key: 'customGapGroup',
          type: 'group',
          label: 'Custom Gap Group',
          gap: { horizontal: '1.5rem', vertical: '0.5rem' },
          fields: [{ key: 'field2', type: 'input', label: 'Field 2' }],
        } as GroupField,
      ];

      const result = flattenFields(fields);

      expect(result).toHaveLength(2);
      expect(result[0].layoutContext?.row?.gap).toEqual({ horizontal: '2rem', vertical: '1rem' });
      expect(result[1].layoutContext?.group?.gap).toEqual({ horizontal: '1.5rem', vertical: '0.5rem' });
    });
  });

  describe('groupFieldsByContainer', () => {
    it('should group definitions by their container ID', () => {
      const flattenedFields = flattenFields([
        {
          key: 'row1',
          type: 'row',
          label: 'Row 1',
          fields: [
            { key: 'field1', type: 'input', label: 'Field 1' },
            { key: 'field2', type: 'input', label: 'Field 2' },
          ],
        } as RowField,
        { key: 'standalone', type: 'input', label: 'Standalone' },
      ]);

      const grouped = groupFieldsByContainer(flattenedFields);

      expect(grouped.size).toBe(2);
      expect(grouped.has('root')).toBe(true);
      expect(grouped.get('root')).toHaveLength(1);

      const rowContainerId = Array.from(grouped.keys()).find((key) => key.includes('row_0'));
      expect(rowContainerId).toBeTruthy();
      expect(grouped.get(rowContainerId!)).toHaveLength(2);
    });
  });

  describe('getFieldLayoutClasses', () => {
    it('should return row classes for row definitions', () => {
      const field = {
        key: 'test',
        type: 'input',
        label: 'Test',
        originalKey: 'test',
        layoutContext: {
          type: 'row' as const,
          containerId: 'row_0',
          row: { col: { span: 6 } },
        },
      };

      const classes = getFieldLayoutClasses(field);

      expect(classes).toContain('lib-row-field__item');
      expect(classes).toContain('lib-row-field__col-6');
    });

    it('should return group classes for group definitions', () => {
      const field = {
        key: 'test',
        type: 'input',
        label: 'Test',
        originalKey: 'test',
        layoutContext: {
          type: 'group' as const,
          containerId: 'group_address',
        },
      };

      const classes = getFieldLayoutClasses(field);

      expect(classes).toContain('lib-group-field__item');
    });

    it('should return empty array for definitions without layout context', () => {
      const field = {
        key: 'test',
        type: 'input',
        label: 'Test',
        originalKey: 'test',
      };

      const classes = getFieldLayoutClasses(field);

      expect(classes).toEqual([]);
    });
  });

  describe('getFieldLayoutStyles', () => {
    it('should return flex styles for row definitions with column span', () => {
      const field = {
        key: 'test',
        type: 'input',
        label: 'Test',
        originalKey: 'test',
        layoutContext: {
          type: 'row' as const,
          containerId: 'row_0',
          row: { col: { span: 6 } },
        },
      };

      const styles = getFieldLayoutStyles(field);

      expect(styles['flex']).toBe('0 0 calc(50% - var(--row-gap-width, 1rem))');
    });

    it('should return empty object for definitions without column configuration', () => {
      const field = {
        key: 'test',
        type: 'input',
        label: 'Test',
        originalKey: 'test',
        layoutContext: {
          type: 'row' as const,
          containerId: 'row_0',
        },
      };

      const styles = getFieldLayoutStyles(field);

      expect(styles).toEqual({});
    });
  });
});
