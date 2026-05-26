import type { FormConfig } from '@ng-forge/dynamic-forms';

type DynamicField = Record<string, unknown>;

function submitButton(): DynamicField {
  return {
    key: 'submit',
    type: 'submit',
    label: 'Submit',
    props: { type: 'submit', color: 'primary' },
    col: 12,
  };
}

export interface StressOptions {
  httpValidators?: number;
  httpConditions?: number;
  httpDerivations?: number;
  syncDerivationChain?: number;
  crossFieldValidators?: number;
  propertyDerivations?: number;
}

/**
 * Stress: many pages, each with multiple conditional-visibility rules + field-level
 * conditional logic + sync validators. Designed to amplify PageOrchestrator
 * `evaluatePageHidden` cost and the expression/validator hot path.
 */
export function generateStressMultiPageConditional(pages: number, fieldsPerPage: number, opts: StressOptions = {}): FormConfig {
  const triggerFields: DynamicField[] = [
    { key: 'accountType', type: 'input', label: 'Account Type', value: 'standard', col: 6 },
    { key: 'region', type: 'input', label: 'Region', value: 'us', col: 6 },
    { key: 'tier', type: 'input', label: 'Tier', value: 'basic', col: 6 },
    { key: 'plan', type: 'input', label: 'Plan', value: 'free', col: 6 },
    { key: 'currency', type: 'input', label: 'Currency', value: 'usd', col: 6 },
  ];

  const pageFields: DynamicField[] = Array.from({ length: pages }, (_, pageIndex) => {
    const fields: DynamicField[] =
      pageIndex === 0
        ? [...triggerFields]
        : Array.from({ length: fieldsPerPage }, (_, fieldIndex) => {
            const field: DynamicField = {
              key: `p${pageIndex}f${fieldIndex}`,
              type: 'input',
              label: `Page ${pageIndex + 1} - Field ${fieldIndex + 1}`,
              placeholder: `Enter value`,
              col: 6,
              validators: [
                { type: 'minLength', value: 2 },
                { type: 'maxLength', value: 50 },
              ],
            };
            if (fieldIndex % 3 === 0) {
              field['logic'] = [
                {
                  type: 'hidden',
                  condition: { type: 'fieldValue', fieldPath: 'accountType', operator: 'equals', value: 'hidden' },
                },
              ];
            }
            return field;
          });

    if (
      pageIndex === 1 &&
      (opts.httpValidators ||
        opts.httpConditions ||
        opts.httpDerivations ||
        opts.syncDerivationChain ||
        opts.crossFieldValidators ||
        opts.propertyDerivations)
    ) {
      for (let i = 0; i < (opts.httpValidators || 0); i++) {
        fields.push({
          key: `httpVal${i}`,
          type: 'input',
          label: `HTTP-validated #${i + 1}`,
          value: '',
          col: 6,
          validators: [
            {
              type: 'http',
              http: { url: '/mock-perf/username-check', method: 'GET', queryParams: { q: 'fieldValue' } },
              responseMapping: { validWhen: 'response.available', errorKind: 'usernameTaken' },
            },
          ],
          validationMessages: { usernameTaken: 'Already taken' },
        });
      }
      for (let i = 0; i < (opts.httpConditions || 0); i++) {
        fields.push({
          key: `httpCond${i}`,
          type: 'input',
          label: `HTTP-gated #${i + 1}`,
          value: '',
          col: 6,
          logic: [
            {
              type: 'hidden',
              condition: {
                type: 'http',
                http: { url: '/mock-perf/region-config', method: 'GET', queryParams: { region: 'formValue.region' } },
                responseExpression: '!response.allowed',
                pendingValue: false,
              },
            },
          ],
        });
      }
      for (let i = 0; i < (opts.httpDerivations || 0); i++) {
        fields.push({
          key: `httpDerived${i}`,
          type: 'input',
          label: `HTTP-derived #${i + 1}`,
          readonly: true,
          props: { type: 'number' },
          col: 6,
          logic: [
            {
              type: 'derivation',
              source: 'http',
              http: { url: '/mock-perf/exchange-rate', method: 'GET', queryParams: { currency: 'formValue.currency' } },
              responseExpression: 'response.rate',
              dependsOn: ['currency'],
            },
          ],
        });
      }
      if (opts.syncDerivationChain && opts.syncDerivationChain > 0) {
        fields.push({ key: 'chain0', type: 'input', label: 'Chain seed', value: 1, props: { type: 'number' }, col: 6 });
        for (let i = 1; i < opts.syncDerivationChain; i++) {
          fields.push({
            key: `chain${i}`,
            type: 'input',
            label: `Chain step ${i}`,
            readonly: true,
            value: 0,
            props: { type: 'number' },
            col: 6,
            derivation: `formValue.chain${i - 1} + 1`,
          });
        }
      }
      for (let i = 0; i < (opts.crossFieldValidators || 0); i++) {
        fields.push({
          key: `cfA${i}`,
          type: 'input',
          label: `CF A${i}`,
          props: { type: 'number' },
          value: 0,
          col: 6,
          validators: [{ type: 'custom', kind: 'lessThanB', expression: `+fieldValue < +formValue.cfB${i}` }],
          validationMessages: { lessThanB: `Must be < cfB${i}` },
        });
        fields.push({ key: `cfB${i}`, type: 'input', label: `CF B${i}`, props: { type: 'number' }, value: 1, col: 6 });
      }
      for (let i = 0; i < (opts.propertyDerivations || 0); i++) {
        fields.push({
          key: `propDer${i}`,
          type: 'input',
          label: `PropDerived #${i + 1}`,
          value: '',
          col: 6,
          logic: [
            {
              type: 'disabled',
              condition: { type: 'fieldValue', fieldPath: 'accountType', operator: 'equals', value: `disable${i}` },
            },
          ],
        });
      }
    }

    if (pageIndex === pages - 1) fields.push(submitButton());

    const page: DynamicField = { key: `page${pageIndex}`, type: 'page', fields };
    if (pageIndex > 0) {
      page['logic'] = [
        {
          type: 'hidden',
          condition: {
            type: 'and',
            conditions: [
              { type: 'fieldValue', fieldPath: 'accountType', operator: 'equals', value: 'never_matches' },
              { type: 'fieldValue', fieldPath: 'region', operator: 'equals', value: 'never_matches' },
              { type: 'fieldValue', fieldPath: 'tier', operator: 'equals', value: 'never_matches' },
              { type: 'fieldValue', fieldPath: 'plan', operator: 'equals', value: 'never_matches' },
              { type: 'fieldValue', fieldPath: 'currency', operator: 'equals', value: 'never_matches' },
            ],
          },
        },
      ];
    }
    return page;
  });

  return { fields: pageFields } as unknown as FormConfig;
}

/**
 * Returns the standard stress scenario config shared across all adapter perf benchmarks.
 * Single source of truth so cross-adapter numbers are directly comparable.
 */
export function standardStressConfig(): FormConfig {
  return generateStressMultiPageConditional(50, 10, {
    httpValidators: 3,
    httpConditions: 3,
    httpDerivations: 2,
    syncDerivationChain: 8,
    crossFieldValidators: 3,
    propertyDerivations: 5,
  });
}
