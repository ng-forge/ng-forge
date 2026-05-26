import type { FormConfig } from '@ng-forge/dynamic-forms';

type DF = Record<string, unknown>;

const triggerFields: DF[] = [
  { key: 'accountType', type: 'input', label: 'Account Type', value: 'standard', col: 6 },
  { key: 'region', type: 'input', label: 'Region', value: 'us', col: 6 },
  { key: 'tier', type: 'input', label: 'Tier', value: 'basic', col: 6 },
  { key: 'plan', type: 'input', label: 'Plan', value: 'free', col: 6 },
  { key: 'currency', type: 'input', label: 'Currency', value: 'USD', col: 6 },
];

function valueFieldShowcase(): DF[] {
  return [
    { key: 'showcaseText', type: 'input', label: 'Text', value: '', col: 4, validators: [{ type: 'minLength', value: 2 }] },
    {
      key: 'showcaseNumber',
      type: 'input',
      label: 'Number',
      value: 0,
      props: { type: 'number' },
      col: 4,
      validators: [
        { type: 'min', value: 0 },
        { type: 'max', value: 100 },
      ],
    },
    { key: 'showcaseEmail', type: 'input', label: 'Email', value: '', props: { type: 'email' }, col: 4, validators: [{ type: 'email' }] },
    { key: 'showcaseTextarea', type: 'textarea', label: 'Textarea', value: '', col: 6, validators: [{ type: 'maxLength', value: 500 }] },
    {
      key: 'showcaseSelect',
      type: 'select',
      label: 'Select',
      value: 'a',
      col: 6,
      options: [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
        { label: 'C', value: 'c' },
      ],
    },
    { key: 'showcaseCheckbox', type: 'checkbox', label: 'Checkbox', value: false, col: 4 },
    { key: 'showcaseToggle', type: 'toggle', label: 'Toggle', value: true, col: 4 },
    { key: 'showcaseSlider', type: 'slider', label: 'Slider', value: 50, props: { min: 0, max: 100, step: 1 }, col: 4 },
    {
      key: 'showcaseRadio',
      type: 'radio',
      label: 'Radio',
      value: 'x',
      col: 6,
      options: [
        { label: 'X', value: 'x' },
        { label: 'Y', value: 'y' },
      ],
    },
    {
      key: 'showcaseMultiCheckbox',
      type: 'multi-checkbox',
      label: 'Multi',
      value: [],
      col: 6,
      options: [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
      ],
    },
    { key: 'showcaseDatepicker', type: 'datepicker', label: 'Date', value: null, col: 12 },
  ];
}

function containerNestingShowcase(): DF[] {
  return [
    {
      key: 'addressGroup',
      type: 'group',
      fields: [
        {
          key: 'addressRow',
          type: 'row',
          fields: [
            { key: 'street', type: 'input', label: 'Street', value: '', col: 8 },
            { key: 'zip', type: 'input', label: 'ZIP', value: '', col: 4, validators: [{ type: 'pattern', value: '^[0-9]{5}$' }] },
          ],
        },
        {
          key: 'cityRow',
          type: 'row',
          fields: [
            { key: 'city', type: 'input', label: 'City', value: '', col: 6 },
            { key: 'country', type: 'input', label: 'Country', value: 'US', col: 6 },
          ],
        },
      ],
    },
  ];
}

function arrayShowcase(): DF[] {
  return [
    {
      key: 'primitiveArr',
      type: 'array',
      label: 'Primitive Array',
      fields: Array.from({ length: 3 }, () => [{ key: 'item', type: 'input', value: '', col: 12 }]),
    },
    {
      key: 'complexArr',
      type: 'array',
      label: 'Complex Array',
      fields: Array.from({ length: 2 }, () => [
        { key: 'name', type: 'input', label: 'Name', value: '', col: 6, validators: [{ type: 'required' }] },
        { key: 'qty', type: 'input', label: 'Qty', value: 1, props: { type: 'number' }, col: 6 },
      ]),
    },
    { key: 'arrAddBtn', type: 'addArrayItem', label: 'Add Primitive', props: { arrayKey: 'primitiveArr' }, col: 6 },
    { key: 'arrAddComplexBtn', type: 'addArrayItem', label: 'Add Complex', props: { arrayKey: 'complexArr' }, col: 6 },
  ];
}

function syncConditionShowcase(): DF[] {
  // Exercises: fieldValue + and/or/not composites + custom expression conditions
  return [
    {
      key: 'syncCond1',
      type: 'input',
      label: 'Hidden when accountType = secret',
      value: '',
      col: 6,
      logic: [{ type: 'hidden', condition: { type: 'fieldValue', fieldPath: 'accountType', operator: 'equals', value: 'secret' } }],
    },
    {
      key: 'syncCond2',
      type: 'input',
      label: 'Hidden if region=us AND tier=basic',
      value: '',
      col: 6,
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'and',
            conditions: [
              { type: 'fieldValue', fieldPath: 'region', operator: 'equals', value: 'us' },
              { type: 'fieldValue', fieldPath: 'tier', operator: 'equals', value: 'basic' },
            ],
          },
        },
      ],
    },
    {
      key: 'syncCond3',
      type: 'input',
      label: 'Hidden if plan=free OR currency=JPY',
      value: '',
      col: 6,
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'or',
            conditions: [
              { type: 'fieldValue', fieldPath: 'plan', operator: 'equals', value: 'free' },
              { type: 'fieldValue', fieldPath: 'currency', operator: 'equals', value: 'JPY' },
            ],
          },
        },
      ],
    },
    {
      key: 'syncCond4',
      type: 'input',
      label: 'Hidden NOT region=us',
      value: '',
      col: 6,
      logic: [
        {
          type: 'hidden',
          condition: { type: 'not', condition: { type: 'fieldValue', fieldPath: 'region', operator: 'equals', value: 'us' } },
        },
      ],
    },
    {
      key: 'syncCond5',
      type: 'input',
      label: 'Hidden via custom expression',
      value: '',
      col: 6,
      logic: [{ type: 'hidden', condition: { type: 'custom', expression: 'formValue.tier === "premium" && formValue.region !== "us"' } }],
    },
  ];
}

function httpConditionShowcase(): DF[] {
  return [
    {
      key: 'httpCond1',
      type: 'input',
      label: 'HTTP-gated (region-config)',
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
    },
    {
      key: 'httpCond2',
      type: 'input',
      label: 'HTTP-gated (tier-config)',
      value: '',
      col: 6,
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'http',
            http: { url: '/mock-perf/tier-config', method: 'GET', queryParams: { tier: 'formValue.tier' } },
            responseExpression: 'response.multiplier === 1',
            pendingValue: false,
          },
        },
      ],
    },
  ];
}

function propertyDerivationShowcase(): DF[] {
  return [
    {
      key: 'propDisabled1',
      type: 'input',
      label: 'Disabled when plan=free',
      value: '',
      col: 4,
      logic: [{ type: 'disabled', condition: { type: 'fieldValue', fieldPath: 'plan', operator: 'equals', value: 'free' } }],
    },
    {
      key: 'propReadonly1',
      type: 'input',
      label: 'Readonly when region=eu',
      value: '',
      col: 4,
      logic: [{ type: 'readonly', condition: { type: 'fieldValue', fieldPath: 'region', operator: 'equals', value: 'eu' } }],
    },
    {
      key: 'propRequired1',
      type: 'input',
      label: 'Required when tier=premium',
      value: '',
      col: 4,
      logic: [{ type: 'required', condition: { type: 'fieldValue', fieldPath: 'tier', operator: 'equals', value: 'premium' } }],
    },
  ];
}

function validatorShowcase(): DF[] {
  // Built-in + custom expression + cross-field
  return [
    {
      key: 'valRequired',
      type: 'input',
      label: 'Required',
      value: '',
      col: 6,
      validators: [{ type: 'required' }],
      validationMessages: { required: 'This field is required' },
    },
    {
      key: 'valPattern',
      type: 'input',
      label: 'Phone (pattern)',
      value: '',
      col: 6,
      validators: [{ type: 'pattern', value: '^\\d{3}-\\d{4}$' }],
      validationMessages: { pattern: 'Format: 555-0000' },
    },
    {
      key: 'valCustomA',
      type: 'input',
      label: 'CF A (< CF B)',
      value: 0,
      props: { type: 'number' },
      col: 6,
      validators: [{ type: 'custom', kind: 'lessThanB', expression: '+fieldValue < +formValue.valCustomB' }],
      validationMessages: { lessThanB: 'Must be < CF B' },
    },
    { key: 'valCustomB', type: 'input', label: 'CF B', value: 1, props: { type: 'number' }, col: 6 },
  ];
}

function httpValidatorShowcase(): DF[] {
  return [
    {
      key: 'httpVal1',
      type: 'input',
      label: 'HTTP-validated (declarative)',
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
    },
  ];
}

function derivationShowcase(): DF[] {
  // Sync chain a→b→c→...
  const chain: DF[] = [{ key: 'chain0', type: 'input', label: 'Chain seed', value: 1, props: { type: 'number' }, col: 4 }];
  for (let i = 1; i < 5; i++) {
    chain.push({
      key: `chain${i}`,
      type: 'input',
      label: `Chain ${i}`,
      readonly: true,
      value: 0,
      props: { type: 'number' },
      col: 4,
      derivation: `formValue.chain${i - 1} + 1`,
    });
  }
  return chain;
}

function httpDerivationShowcase(): DF[] {
  return [
    {
      key: 'exchangeRate',
      type: 'input',
      label: 'Exchange Rate (HTTP)',
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
    },
  ];
}

function controlButtons(opts: { pagedNav: boolean }): DF[] {
  const out: DF[] = [];
  if (opts.pagedNav) {
    out.push({ key: 'prevBtn', type: 'previous', label: 'Previous', col: 6 });
    out.push({ key: 'nextBtn', type: 'next', label: 'Next', col: 6 });
  } else {
    out.push({ key: 'submitBtn', type: 'submit', label: 'Submit', col: 12 });
  }
  return out;
}

const SECTIONS: Array<{ key: string; build: () => DF[] }> = [
  { key: 'valueFieldShowcase', build: valueFieldShowcase },
  { key: 'containerNesting', build: containerNestingShowcase },
  { key: 'arrayShowcase', build: arrayShowcase },
  { key: 'syncConditions', build: syncConditionShowcase },
  { key: 'httpConditions', build: httpConditionShowcase },
  { key: 'propertyDerivations', build: propertyDerivationShowcase },
  { key: 'validators', build: validatorShowcase },
  { key: 'httpValidators', build: httpValidatorShowcase },
  { key: 'syncDerivations', build: derivationShowcase },
  { key: 'httpDerivations', build: httpDerivationShowcase },
];

/**
 * Full-API-surface stress config, FLAT shape (no pages, no PageOrchestrator).
 * Isolates per-field CD cost from page-level orchestration overhead.
 */
export function fullSurfaceStressConfigFlat(): FormConfig {
  const fields: DF[] = [...triggerFields];
  for (const section of SECTIONS) {
    fields.push({
      key: section.key,
      type: 'group',
      fields: section.build(),
    });
  }
  fields.push(...controlButtons({ pagedNav: false }));
  return { fields } as unknown as FormConfig;
}

/**
 * Full-API-surface stress config, PAGED shape. Each section is its own page.
 * Adds PageOrchestrator + cross-page visibility-rules cost on top of the flat config.
 */
export function fullSurfaceStressConfigPaged(): FormConfig {
  const triggerPage: DF = { key: 'pageTriggers', type: 'page', fields: [...triggerFields] };
  const sectionPages: DF[] = SECTIONS.map((section, idx) => {
    const fields = section.build();
    if (idx === SECTIONS.length - 1) fields.push(...controlButtons({ pagedNav: false }));
    else fields.push(...controlButtons({ pagedNav: true }));
    return {
      key: `page_${section.key}`,
      type: 'page',
      fields,
      // Cross-page hidden conditions (always-false AND chain) — exercises evaluatePageHidden
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'and',
            conditions: [
              { type: 'fieldValue', fieldPath: 'accountType', operator: 'equals', value: '__never__' },
              { type: 'fieldValue', fieldPath: 'region', operator: 'equals', value: '__never__' },
              { type: 'fieldValue', fieldPath: 'tier', operator: 'equals', value: '__never__' },
              { type: 'fieldValue', fieldPath: 'plan', operator: 'equals', value: '__never__' },
              { type: 'fieldValue', fieldPath: 'currency', operator: 'equals', value: '__never__' },
            ],
          },
        },
      ],
    };
  });
  return { fields: [triggerPage, ...sectionPages] } as unknown as FormConfig;
}

/**
 * Paged variant where MOST pages are actually hidden by `logic`. Specifically targets
 * the PageOrchestrator @if-gate optimization: with the gate, all hidden pages skip
 * @defer + section mounting entirely; without it, every page is mounted (CSS-hidden)
 * and contributes to CD on every keystroke.
 *
 * Page-0 (triggers) plus the first 2 section pages remain visible. Every other section
 * page has a hidden condition that resolves to TRUE under default trigger values
 * (accountType='standard' matches the condition).
 */
export function fullSurfaceStressConfigPagedMostlyHidden(): FormConfig {
  const triggerPage: DF = { key: 'pageTriggers', type: 'page', fields: [...triggerFields] };
  // Keep first 2 section pages (idx 0, 1) visible; hide the rest. The submit
  // button must live on the last visible page so the form remains usable under
  // default trigger values — placing it on `SECTIONS.length - 1` (which is
  // hidden) would leave the form with no reachable submit control.
  const LAST_VISIBLE_IDX = 1;
  const sectionPages: DF[] = SECTIONS.map((section, idx) => {
    const fields = section.build();
    if (idx === LAST_VISIBLE_IDX) fields.push(...controlButtons({ pagedNav: false }));
    else fields.push(...controlButtons({ pagedNav: true }));
    const shouldHide = idx > LAST_VISIBLE_IDX;
    const page: DF = { key: `page_${section.key}`, type: 'page', fields };
    if (shouldHide) {
      page['logic'] = [
        {
          type: 'hidden',
          condition: { type: 'fieldValue', fieldPath: 'accountType', operator: 'equals', value: 'standard' },
        },
      ];
    }
    return page;
  });
  return { fields: [triggerPage, ...sectionPages] } as unknown as FormConfig;
}
