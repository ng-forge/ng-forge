import type { CustomValidator, FormConfig } from '@ng-forge/dynamic-forms';
import type { TestSuite } from '../types';

/** Fails when a row's `to` precedes its `from`. */
const periodOrder: CustomValidator = (ctx) => {
  const rows = (ctx.value() ?? []) as { from?: string; to?: string }[];
  return rows.some((r) => r?.from && r?.to && r.to < r.from) ? { kind: 'periodOrder' } : null;
};

export const layoutSuite: TestSuite = {
  id: 'layout',
  title: 'Layout',
  scenarios: [
    {
      testId: 'row-columns',
      title: 'Row Columns',
      description: 'Columns on a tablet; stacked on a phone, as on the web',
      config: {
        fields: [
          {
            key: 'nameRow',
            type: 'row',
            fields: [
              { key: 'firstName', type: 'input', label: 'First name', col: 6 },
              { key: 'lastName', type: 'input', label: 'Last name', col: 6 },
            ],
          },
          {
            key: 'addressRow',
            type: 'row',
            fields: [
              { key: 'city', type: 'input', label: 'City', col: 8 },
              { key: 'zip', type: 'input', label: 'ZIP', col: 4 },
            ],
          },
        ],
      } as const satisfies FormConfig,
      initialValue: {},
    },
    {
      testId: 'array-container-validator',
      title: 'Array Container Validator',
      description: 'An array-level validation message renders through the field-errors wrapper',
      config: {
        customFnConfig: { validators: { periodOrder } },
        fields: [
          {
            key: 'periods',
            type: 'array',
            template: [
              { key: 'from', type: 'input', label: 'From', col: 6 },
              { key: 'to', type: 'input', label: 'To', col: 6 },
            ],
            value: [{ from: '', to: '' }],
            minLength: 1,
            validators: [{ type: 'custom', functionName: 'periodOrder' }],
            validationMessages: { periodOrder: 'The end must not be before the start.' },
          },
          { key: 'submitPeriods', type: 'submit', label: 'Submit' },
        ],
      } as const satisfies FormConfig,
    },
  ],
};
