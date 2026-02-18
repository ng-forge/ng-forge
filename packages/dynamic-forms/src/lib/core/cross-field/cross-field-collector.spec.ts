import { describe, it, expect } from 'vitest';
import { collectCrossFieldEntries } from './cross-field-collector';
import { FieldDef } from '../../definitions/base/field-def';

describe('collectCrossFieldEntries()', () => {
  describe('top-level fields', () => {
    it('stores sourceFieldKey as the simple field key', () => {
      const fields: FieldDef<unknown>[] = [
        {
          type: 'input',
          key: 'confirmPassword',
          validators: [{ type: 'custom', expression: 'fieldValue === formValue.password', kind: 'passwordMismatch' }],
        } as any,
      ];

      const { validators } = collectCrossFieldEntries(fields);

      expect(validators).toHaveLength(1);
      expect(validators[0].sourceFieldKey).toBe('confirmPassword');
    });

    it('collects cross-field logic with simple key', () => {
      const fields: FieldDef<unknown>[] = [
        {
          type: 'input',
          key: 'street',
          logic: [
            {
              type: 'hidden',
              condition: { type: 'fieldValue', fieldPath: 'country', operator: 'equals', value: 'US' },
            },
          ],
        } as any,
      ];

      const { logic } = collectCrossFieldEntries(fields);

      expect(logic).toHaveLength(1);
      expect(logic[0].sourceFieldKey).toBe('street');
    });
  });

  describe('fields inside a group', () => {
    it('stores sourceFieldKey as dotted path group.field', () => {
      const fields: FieldDef<unknown>[] = [
        {
          type: 'group',
          key: 'credentials',
          fields: [
            { type: 'input', key: 'password' } as any,
            {
              type: 'input',
              key: 'confirmPassword',
              validators: [{ type: 'custom', expression: 'fieldValue === formValue.credentials.password', kind: 'passwordMismatch' }],
            } as any,
          ],
        } as any,
      ];

      const { validators } = collectCrossFieldEntries(fields);

      expect(validators).toHaveLength(1);
      expect(validators[0].sourceFieldKey).toBe('credentials.confirmPassword');
    });

    it('stores logic sourceFieldKey as dotted path', () => {
      const fields: FieldDef<unknown>[] = [
        {
          type: 'group',
          key: 'address',
          fields: [
            {
              type: 'input',
              key: 'state',
              logic: [
                {
                  type: 'hidden',
                  condition: { type: 'fieldValue', fieldPath: 'address.country', operator: 'equals', value: 'US' },
                },
              ],
            } as any,
          ],
        } as any,
      ];

      const { logic } = collectCrossFieldEntries(fields);

      expect(logic).toHaveLength(1);
      expect(logic[0].sourceFieldKey).toBe('address.state');
    });
  });

  describe('fields inside deeply nested groups', () => {
    it('stores sourceFieldKey as a multi-segment dotted path', () => {
      const fields: FieldDef<unknown>[] = [
        {
          type: 'group',
          key: 'outer',
          fields: [
            {
              type: 'group',
              key: 'inner',
              fields: [
                {
                  type: 'input',
                  key: 'endDate',
                  validators: [
                    {
                      type: 'custom',
                      expression: 'new Date(fieldValue) > new Date(formValue.outer.inner.startDate)',
                      kind: 'endBeforeStart',
                    },
                  ],
                } as any,
              ],
            } as any,
          ],
        } as any,
      ];

      const { validators } = collectCrossFieldEntries(fields);

      expect(validators).toHaveLength(1);
      expect(validators[0].sourceFieldKey).toBe('outer.inner.endDate');
    });
  });

  describe('page and row containers are transparent', () => {
    it('does not add page key to sourceFieldKey', () => {
      const fields: FieldDef<unknown>[] = [
        {
          type: 'page',
          key: 'page1',
          fields: [
            {
              type: 'input',
              key: 'confirmPassword',
              validators: [{ type: 'custom', expression: 'fieldValue === formValue.password', kind: 'passwordMismatch' }],
            } as any,
          ],
        } as any,
      ];

      const { validators } = collectCrossFieldEntries(fields);

      expect(validators).toHaveLength(1);
      expect(validators[0].sourceFieldKey).toBe('confirmPassword');
    });

    it('does not add row key to sourceFieldKey', () => {
      const fields: FieldDef<unknown>[] = [
        {
          type: 'row',
          key: 'nameRow',
          fields: [
            {
              type: 'input',
              key: 'confirmPassword',
              validators: [{ type: 'custom', expression: 'fieldValue === formValue.password', kind: 'passwordMismatch' }],
            } as any,
          ],
        } as any,
      ];

      const { validators } = collectCrossFieldEntries(fields);

      expect(validators).toHaveLength(1);
      expect(validators[0].sourceFieldKey).toBe('confirmPassword');
    });

    it('combines group path with transparent row inside group', () => {
      const fields: FieldDef<unknown>[] = [
        {
          type: 'group',
          key: 'credentials',
          fields: [
            {
              type: 'row',
              key: 'passwordRow',
              fields: [
                { type: 'input', key: 'password' } as any,
                {
                  type: 'input',
                  key: 'confirmPassword',
                  validators: [{ type: 'custom', expression: 'fieldValue === formValue.credentials.password', kind: 'passwordMismatch' }],
                } as any,
              ],
            } as any,
          ],
        } as any,
      ];

      const { validators } = collectCrossFieldEntries(fields);

      expect(validators).toHaveLength(1);
      expect(validators[0].sourceFieldKey).toBe('credentials.confirmPassword');
    });
  });

  describe('array fields are not traversed', () => {
    it('does not recurse into array items', () => {
      const fields: FieldDef<unknown>[] = [
        {
          type: 'array',
          key: 'contacts',
          fields: [
            [
              {
                type: 'input',
                key: 'email',
                validators: [{ type: 'custom', expression: 'fieldValue.includes("@")', kind: 'invalidEmail' }],
              } as any,
            ],
          ],
        } as any,
      ];

      const { validators } = collectCrossFieldEntries(fields);

      // Array items should not be traversed for cross-field collection
      expect(validators).toHaveLength(0);
    });
  });
});
