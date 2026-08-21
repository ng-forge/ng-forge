import type { FormConfig } from '@ng-forge/dynamic-forms';

export const DIRECT_ENTRY_TOTAL_FIELDS = 240;
export const DIRECT_ENTRY_PAGE_COUNT = 6;
export const DIRECT_ENTRY_FIELDS_PER_PAGE = DIRECT_ENTRY_TOTAL_FIELDS / DIRECT_ENTRY_PAGE_COUNT;
export const DIRECT_ENTRY_PROFILE = 'representative';

type BenchmarkField = Record<string, unknown>;

function genericRules(index: number): BenchmarkField {
  return {
    required: index % 5 === 0,
    validators: [{ type: 'minLength', value: 2 }, ...(index % 3 === 0 ? [{ type: 'maxLength', value: 80 }] : [])],
    ...(index % 7 === 0
      ? {
          logic: [
            {
              type: 'hidden',
              condition: { type: 'fieldValue', fieldPath: 'field1', operator: 'equals', value: '__never__' },
            },
          ],
        }
      : {}),
  };
}

function createInput(index: number): BenchmarkField {
  const fieldNumber = index + 1;
  const field: BenchmarkField = {
    key: `field${fieldNumber}`,
    type: 'input',
    label: `Field ${fieldNumber}`,
    value: '',
    ...genericRules(fieldNumber),
  };

  switch (fieldNumber) {
    case 1:
      return {
        ...field,
        label: 'Account type',
        value: 'standard',
        required: true,
        addons: [{ slot: 'suffix', type: 'text', text: 'profile' }],
      };
    case 2:
      return { ...field, label: 'Required profile name', required: true, validators: [{ type: 'minLength', value: 2 }] };
    case 3:
      return { ...field, label: 'Derivation source', value: 'seed', required: true };
    case 4:
      return {
        ...field,
        label: 'Derived summary',
        readonly: true,
        derivation: "formValue.field3 + '-derived'",
      };
    case 5:
      return {
        ...field,
        label: 'Conditional details',
        logic: [
          {
            type: 'hidden',
            condition: { type: 'fieldValue', fieldPath: 'field1', operator: 'equals', value: 'hidden' },
          },
        ],
      };
    case 6:
      return {
        ...field,
        label: 'Async username',
        validators: [
          {
            type: 'http',
            http: { url: '/mock-perf/username-check', method: 'GET', queryParams: { q: 'fieldValue' } },
            responseMapping: { validWhen: 'response.available', errorKind: 'usernameTaken' },
          },
        ],
        validationMessages: { usernameTaken: 'Already taken' },
      };
    case 7:
      return { ...field, label: 'Schema email', schemas: [{ type: 'apply', schema: 'benchmarkEmail' }] };
    case 8:
      return { ...field, label: 'Cross-field upper bound', value: 10, props: { type: 'number' }, validators: [] };
    case 9:
      return {
        ...field,
        label: 'Cross-field lower bound',
        value: 0,
        props: { type: 'number' },
        validators: [{ type: 'custom', kind: 'lessThanUpper', expression: '+fieldValue < +formValue.field8' }],
      };
    case 10:
      return {
        ...field,
        label: 'Conditionally disabled',
        logic: [
          {
            type: 'disabled',
            condition: { type: 'fieldValue', fieldPath: 'field1', operator: 'equals', value: 'locked' },
          },
        ],
      };
    case 41:
      return {
        ...field,
        label: 'Cross-page summary',
        readonly: true,
        derivation: "formValue.field3 + '-page-2'",
      };
    default:
      return field;
  }
}

function createPageFields(pageIndex: number): BenchmarkField[] {
  const pageStart = pageIndex * DIRECT_ENTRY_FIELDS_PER_PAGE;
  const directFields = Array.from({ length: DIRECT_ENTRY_FIELDS_PER_PAGE - 4 }, (_, fieldIndex) => createInput(pageStart + fieldIndex));

  return [
    ...directFields,
    {
      key: `page${pageIndex + 1}Group`,
      type: 'group',
      validators: [{ type: 'custom', kind: 'groupShape', expression: 'fieldValue !== null' }],
      fields: [createInput(pageStart + 36), createInput(pageStart + 37)],
    },
    {
      key: `page${pageIndex + 1}Items`,
      type: 'array',
      minLength: 1,
      maxLength: 4,
      fields: [[createInput(pageStart + 38)], [createInput(pageStart + 39)]],
    },
  ];
}

function representativeConfig(fields: BenchmarkField[]): FormConfig {
  return {
    defaultValidationMessages: {
      required: 'This field is required',
      minLength: 'Enter at least two characters',
      email: 'Enter a valid email address',
    },
    schemas: [
      {
        name: 'benchmarkEmail',
        validators: [{ type: 'required' }, { type: 'email' }],
      },
    ],
    fields,
  } as unknown as FormConfig;
}

/** The eager control uses the same representative semantics without page orchestration. */
export function directEntryFullConfig(): FormConfig {
  return representativeConfig(Array.from({ length: DIRECT_ENTRY_PAGE_COUNT }, (_, pageIndex) => createPageFields(pageIndex)).flat());
}

/** Six pages of 40 controls with validation, logic, derivations, add-ons, groups, and arrays. */
export function directEntryWizardConfig(): FormConfig {
  return representativeConfig(
    Array.from({ length: DIRECT_ENTRY_PAGE_COUNT }, (_, pageIndex) => ({
      key: `page${pageIndex + 1}`,
      type: 'page',
      fields: createPageFields(pageIndex),
      ...(pageIndex === 0
        ? {}
        : {
            logic: [
              {
                type: 'hidden',
                condition: { type: 'fieldValue', fieldPath: 'field1', operator: 'equals', value: `hide-page-${pageIndex + 1}` },
              },
            ],
          }),
    })),
  );
}
