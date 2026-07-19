import { describe, it, expect } from 'vitest';
import { collectCrossFieldEntries } from './cross-field-collector';
import { FieldDef } from '@ng-forge/dynamic-forms/internal';

describe('collectCrossFieldEntries()', () => {
  describe('top-level fields', () => {
    it('stores sourceFieldKey as the simple field key', () => {
      const fields: FieldDef<any>[] = [
        {
          type: 'input',
          key: 'confirmPassword',
          validators: [{ type: 'custom', expression: 'fieldValue === formValue.password', kind: 'passwordMismatch' }],
        },
      ];

      const { validators } = collectCrossFieldEntries(fields);

      expect(validators).toHaveLength(1);
      expect(validators[0].sourceFieldKey).toBe('confirmPassword');
    });

    it('collects cross-field logic with simple key', () => {
      const fields: FieldDef<any>[] = [
        {
          type: 'input',
          key: 'street',
          logic: [
            {
              type: 'hidden',
              condition: { type: 'fieldValue', fieldPath: 'country', operator: 'equals', value: 'US' },
            },
          ],
        },
      ];

      const { logic } = collectCrossFieldEntries(fields);

      expect(logic).toHaveLength(1);
      expect(logic[0].sourceFieldKey).toBe('street');
    });
  });

  describe('fields inside a group', () => {
    it('stores sourceFieldKey as dotted path group.field', () => {
      const fields: FieldDef<any>[] = [
        {
          type: 'group',
          key: 'credentials',
          fields: [
            { type: 'input', key: 'password' },
            {
              type: 'input',
              key: 'confirmPassword',
              validators: [{ type: 'custom', expression: 'fieldValue === formValue.credentials.password', kind: 'passwordMismatch' }],
            },
          ],
        },
      ];

      const { validators } = collectCrossFieldEntries(fields);

      expect(validators).toHaveLength(1);
      expect(validators[0].sourceFieldKey).toBe('credentials.confirmPassword');
    });

    it('stores logic sourceFieldKey as dotted path', () => {
      const fields: FieldDef<any>[] = [
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
            },
          ],
        },
      ];

      const { logic } = collectCrossFieldEntries(fields);

      expect(logic).toHaveLength(1);
      expect(logic[0].sourceFieldKey).toBe('address.state');
    });
  });

  describe('fields inside deeply nested groups', () => {
    it('stores sourceFieldKey as a multi-segment dotted path', () => {
      const fields: FieldDef<any>[] = [
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
                      expression: 'fieldValue > formValue.outer.inner.startDate',
                      kind: 'endBeforeStart',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const { validators } = collectCrossFieldEntries(fields);

      expect(validators).toHaveLength(1);
      expect(validators[0].sourceFieldKey).toBe('outer.inner.endDate');
    });
  });

  describe('page and row containers are transparent', () => {
    it('does not add page key to sourceFieldKey', () => {
      const fields: FieldDef<any>[] = [
        {
          type: 'page',
          key: 'page1',
          fields: [
            {
              type: 'input',
              key: 'confirmPassword',
              validators: [{ type: 'custom', expression: 'fieldValue === formValue.password', kind: 'passwordMismatch' }],
            },
          ],
        },
      ];

      const { validators } = collectCrossFieldEntries(fields);

      expect(validators).toHaveLength(1);
      expect(validators[0].sourceFieldKey).toBe('confirmPassword');
    });

    it('does not add row key to sourceFieldKey', () => {
      const fields: FieldDef<any>[] = [
        {
          type: 'row',
          key: 'nameRow',
          fields: [
            {
              type: 'input',
              key: 'confirmPassword',
              validators: [{ type: 'custom', expression: 'fieldValue === formValue.password', kind: 'passwordMismatch' }],
            },
          ],
        },
      ];

      const { validators } = collectCrossFieldEntries(fields);

      expect(validators).toHaveLength(1);
      expect(validators[0].sourceFieldKey).toBe('confirmPassword');
    });

    it('combines group path with transparent row inside group', () => {
      const fields: FieldDef<any>[] = [
        {
          type: 'group',
          key: 'credentials',
          fields: [
            {
              type: 'row',
              key: 'passwordRow',
              fields: [
                { type: 'input', key: 'password' },
                {
                  type: 'input',
                  key: 'confirmPassword',
                  validators: [{ type: 'custom', expression: 'fieldValue === formValue.credentials.password', kind: 'passwordMismatch' }],
                },
              ],
            },
          ],
        },
      ];

      const { validators } = collectCrossFieldEntries(fields);

      expect(validators).toHaveLength(1);
      expect(validators[0].sourceFieldKey).toBe('credentials.confirmPassword');
    });
  });

  describe('native when routing (validators not collected into the tree)', () => {
    const crossFieldWhen = { type: 'javascript' as const, expression: 'formValue.other === true' };

    it('does not collect built-in validators with a static value and cross-field when', () => {
      const fields: FieldDef<any>[] = [
        {
          type: 'input',
          key: 'name',
          validators: [{ type: 'maxLength', value: 20, when: crossFieldWhen }],
        },
      ];

      const { validators } = collectCrossFieldEntries(fields);

      expect(validators).toHaveLength(0);
    });

    it('does not collect required/email validators with a cross-field when', () => {
      const fields: FieldDef<any>[] = [
        {
          type: 'input',
          key: 'name',
          validators: [
            { type: 'required', when: crossFieldWhen },
            { type: 'email', when: crossFieldWhen },
          ],
        },
      ];

      const { validators } = collectCrossFieldEntries(fields);

      expect(validators).toHaveLength(0);
    });

    it('does not collect custom fn validators with a cross-field when', () => {
      const fields: FieldDef<any>[] = [
        {
          type: 'input',
          key: 'name',
          validators: [{ type: 'custom', fn: () => null, when: crossFieldWhen }],
        },
      ];

      const { validators } = collectCrossFieldEntries(fields);

      expect(validators).toHaveLength(0);
    });

    it('does not collect async or http validators with a cross-field when', () => {
      const fields: FieldDef<any>[] = [
        {
          type: 'input',
          key: 'name',
          validators: [
            { type: 'async', functionName: 'check', when: crossFieldWhen },
            {
              type: 'http',
              http: { url: '/api/check', method: 'GET' },
              responseMapping: { validWhen: 'response.ok', errorKind: 'taken' },
              when: crossFieldWhen,
            },
          ],
        },
      ];

      const { validators } = collectCrossFieldEntries(fields);

      expect(validators).toHaveLength(0);
    });

    it('still collects built-in validators with a cross-field expression, preserving when on the converted config', () => {
      const fields: FieldDef<any>[] = [
        {
          type: 'input',
          key: 'name',
          validators: [{ type: 'maxLength', expression: 'formValue.limit', when: crossFieldWhen }],
        },
      ];

      const { validators } = collectCrossFieldEntries(fields);

      expect(validators).toHaveLength(1);
      expect(validators[0].validatorType).toBe('maxLength');
      expect(validators[0].config.type).toBe('custom');
      expect(validators[0].config.when).toEqual(crossFieldWhen);
      expect(validators[0].dependsOn).toContain('limit');
    });

    it('still collects custom validators with a cross-field expression', () => {
      const fields: FieldDef<any>[] = [
        {
          type: 'input',
          key: 'name',
          validators: [{ type: 'custom', expression: 'fieldValue === formValue.password', kind: 'mismatch' }],
        },
      ];

      const { validators } = collectCrossFieldEntries(fields);

      expect(validators).toHaveLength(1);
      expect(validators[0].dependsOn).toContain('password');
    });
  });

  describe('array fields are not traversed', () => {
    it('does not recurse into array items', () => {
      const fields: FieldDef<any>[] = [
        {
          type: 'array',
          key: 'contacts',
          fields: [
            [
              {
                type: 'input',
                key: 'email',
                validators: [{ type: 'custom', expression: 'fieldValue.includes("@")', kind: 'invalidEmail' }],
              },
            ],
          ],
        },
      ];

      const { validators } = collectCrossFieldEntries(fields);

      // Array items should not be traversed for cross-field collection
      expect(validators).toHaveLength(0);
    });
  });
});
