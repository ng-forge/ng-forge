import type { FormConfig } from '@ng-forge/dynamic-forms';

type DF = Record<string, unknown>;

/**
 * A realistic, LARGE, high-complexity multi-page form: an enterprise insurance
 * application. It looks like something a real user would build — Applicant,
 * Address, Employment, Spouse, Dependents, Coverage, Beneficiaries, Medical
 * history, Financial, Vehicles, and Review sections — but at a scale (200+
 * fields across ~20 pages) that stresses rendering.
 *
 * Intricacy exercised:
 *   - Every validator kind (required/min/max/minLength/maxLength/pattern/email/
 *     custom cross-field/HTTP async).
 *   - Cross-page conditional logic: sections/fields shown, hidden, disabled,
 *     readonly, or made required based on earlier answers (marital status,
 *     employment status, payment method, smoker, policy type…).
 *   - Sync + HTTP + cross-field derivations (premium estimate, BMI, exchange rate).
 *   - Nested group>row containers and repeatable arrays (dependents, beneficiaries,
 *     vehicles).
 *
 * Page 0 additionally carries a stable `probe_*` measurement group whose trigger
 * and dependent effect are co-located on the (visible) first page, so the latency
 * harness can measure every response type without navigating.
 */

// ---------------------------------------------------------------------------
// Measurement probes (stable keys — the latency harness targets these directly)
// ---------------------------------------------------------------------------
function probeFields(): DF[] {
  return [
    {
      key: 'probe_valInput',
      type: 'input',
      label: 'Preferred username (min 5 chars)',
      value: '',
      col: 6,
      validators: [{ type: 'minLength', value: 5 }],
      validationMessages: { minLength: 'Need at least 5 characters' },
    },
    { key: 'probe_ctrl', type: 'input', label: 'Referral source (type "hide" to collapse promo)', value: '', col: 6 },
    {
      key: 'probe_show',
      type: 'input',
      label: 'Promo code',
      value: '',
      col: 6,
      logic: [{ type: 'hidden', condition: { type: 'fieldValue', fieldPath: 'probe_ctrl', operator: 'equals', value: 'hide' } }],
    },
    { key: 'probe_seed', type: 'input', label: 'Household size', value: 1, props: { type: 'number' }, col: 3 },
    {
      key: 'probe_deriv',
      type: 'input',
      label: 'Covered members (household + 1)',
      readonly: true,
      value: 0,
      props: { type: 'number' },
      col: 3,
      derivation: 'formValue.probe_seed + 1',
    },
    { key: 'probe_disCtrl', type: 'input', label: 'Autopay ("off" disables discount code)', value: '', col: 6 },
    {
      key: 'probe_dis',
      type: 'input',
      label: 'Loyalty discount code',
      value: '',
      col: 6,
      logic: [{ type: 'disabled', condition: { type: 'fieldValue', fieldPath: 'probe_disCtrl', operator: 'equals', value: 'off' } }],
    },
    {
      key: 'probe_httpVal',
      type: 'input',
      label: 'Agent ID (verified live)',
      value: '',
      col: 6,
      validators: [
        {
          type: 'http',
          http: { url: '/mock-perf/username-check', method: 'GET', queryParams: { q: 'fieldValue' } },
          responseMapping: { validWhen: 'response.available', errorKind: 'usernameTaken' },
        },
      ],
      validationMessages: { usernameTaken: 'That agent ID is not available' },
    },
    { key: 'probe_httpCtrl', type: 'input', label: 'Billing currency code', value: 'USD', col: 6 },
    {
      key: 'probe_httpDeriv',
      type: 'input',
      label: 'Live exchange rate',
      readonly: true,
      props: { type: 'number' },
      col: 6,
      logic: [
        {
          type: 'derivation',
          source: 'http',
          http: { url: '/mock-perf/exchange-rate', method: 'GET', queryParams: { currency: 'formValue.probe_httpCtrl' } },
          responseExpression: 'response.rate',
          dependsOn: ['probe_httpCtrl'],
        },
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Page 0 — Applicant & policy selectors (these drive cross-page logic)
// Keys accountType/region/tier/plan/currency are kept stable (referenced by the
// never-match cross-page condition) but presented with realistic labels.
// ---------------------------------------------------------------------------
function applicantFields(): DF[] {
  return [
    {
      key: 'firstName',
      type: 'input',
      label: 'First name',
      value: '',
      col: 4,
      validators: [{ type: 'required' }],
      validationMessages: { required: 'First name is required' },
    },
    { key: 'middleName', type: 'input', label: 'Middle name', value: '', col: 4 },
    {
      key: 'lastName',
      type: 'input',
      label: 'Last name',
      value: '',
      col: 4,
      validators: [{ type: 'required' }],
      validationMessages: { required: 'Last name is required' },
    },
    { key: 'dob', type: 'datepicker', label: 'Date of birth', value: null, col: 4 },
    {
      key: 'ssn',
      type: 'input',
      label: 'SSN',
      value: '',
      col: 4,
      validators: [{ type: 'pattern', value: '^\\d{3}-\\d{2}-\\d{4}$' }],
      validationMessages: { pattern: 'Format: 123-45-6789' },
    },
    {
      key: 'maritalStatus',
      type: 'select',
      label: 'Marital status',
      value: 'single',
      col: 4,
      options: [
        { label: 'Single', value: 'single' },
        { label: 'Married', value: 'married' },
        { label: 'Divorced', value: 'divorced' },
        { label: 'Widowed', value: 'widowed' },
      ],
    },
    {
      key: 'gender',
      type: 'radio',
      label: 'Gender',
      value: 'na',
      col: 6,
      options: [
        { label: 'Female', value: 'f' },
        { label: 'Male', value: 'm' },
        { label: 'Non-binary', value: 'nb' },
        { label: 'Prefer not to say', value: 'na' },
      ],
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      value: '',
      props: { type: 'email' },
      col: 6,
      validators: [{ type: 'required' }, { type: 'email' }],
      validationMessages: { required: 'Email is required', email: 'Enter a valid email' },
    },
    {
      key: 'phone',
      type: 'input',
      label: 'Phone',
      value: '',
      col: 6,
      validators: [{ type: 'pattern', value: '^\\d{3}-\\d{3}-\\d{4}$' }],
      validationMessages: { pattern: 'Format: 555-123-4567' },
    },
    // Policy selectors — drive downstream conditions. Stable keys.
    {
      key: 'accountType',
      type: 'select',
      label: 'Policy type',
      value: 'standard',
      col: 4,
      options: [
        { label: 'Individual', value: 'standard' },
        { label: 'Family', value: 'business' },
        { label: 'Group / Enterprise', value: 'enterprise' },
      ],
    },
    {
      key: 'region',
      type: 'select',
      label: 'State / region',
      value: 'us',
      col: 4,
      options: [
        { label: 'United States', value: 'us' },
        { label: 'Europe', value: 'eu' },
        { label: 'Asia-Pacific', value: 'apac' },
      ],
    },
    {
      key: 'tier',
      type: 'select',
      label: 'Coverage tier',
      value: 'basic',
      col: 4,
      options: [
        { label: 'Basic', value: 'basic' },
        { label: 'Standard', value: 'pro' },
        { label: 'Premium', value: 'premium' },
      ],
    },
    {
      key: 'plan',
      type: 'select',
      label: 'Billing plan',
      value: 'free',
      col: 6,
      options: [
        { label: 'Pay-as-you-go', value: 'free' },
        { label: 'Annual', value: 'paid' },
      ],
    },
    {
      key: 'currency',
      type: 'select',
      label: 'Currency',
      value: 'USD',
      col: 6,
      options: [
        { label: 'USD', value: 'USD' },
        { label: 'EUR', value: 'EUR' },
        { label: 'JPY', value: 'JPY' },
      ],
    },
  ];
}

const STATES: DF[] = [
  { label: 'California', value: 'CA' },
  { label: 'New York', value: 'NY' },
  { label: 'Texas', value: 'TX' },
  { label: 'Florida', value: 'FL' },
  { label: 'Illinois', value: 'IL' },
];

// ---------------------------------------------------------------------------
// Realistic content sections. Each takes a unique page prefix so keys stay unique.
// ---------------------------------------------------------------------------
function addressSection(px: string): DF[] {
  return [
    {
      key: `${px}_home`,
      type: 'group',
      label: 'Home address',
      fields: [
        {
          key: `${px}_addrRow1`,
          type: 'row',
          fields: [
            { key: `${px}_street`, type: 'input', label: 'Street', value: '', col: 8, validators: [{ type: 'required' }] },
            { key: `${px}_unit`, type: 'input', label: 'Unit', value: '', col: 4 },
          ],
        },
        {
          key: `${px}_addrRow2`,
          type: 'row',
          fields: [
            { key: `${px}_city`, type: 'input', label: 'City', value: '', col: 5, validators: [{ type: 'required' }] },
            { key: `${px}_state`, type: 'select', label: 'State', value: 'CA', col: 4, options: STATES },
            {
              key: `${px}_zip`,
              type: 'input',
              label: 'ZIP',
              value: '',
              col: 3,
              validators: [{ type: 'pattern', value: '^\\d{5}$' }],
              validationMessages: { pattern: '5 digits' },
            },
          ],
        },
      ],
    },
    {
      key: `${px}_yearsAtAddress`,
      type: 'input',
      label: 'Years at address',
      value: 1,
      props: { type: 'number' },
      col: 4,
      validators: [
        { type: 'min', value: 0 },
        { type: 'max', value: 99 },
      ],
    },
    {
      key: `${px}_residenceType`,
      type: 'select',
      label: 'Residence type',
      value: 'own',
      col: 4,
      options: [
        { label: 'Own', value: 'own' },
        { label: 'Rent', value: 'rent' },
        { label: 'Other', value: 'other' },
      ],
    },
    { key: `${px}_mailingSame`, type: 'toggle', label: 'Mailing address same as home', value: true, col: 4 },
    // Mailing address group only shown when the toggle is off.
    {
      key: `${px}_mailing`,
      type: 'group',
      label: 'Mailing address',
      logic: [{ type: 'hidden', condition: { type: 'fieldValue', fieldPath: `${px}_mailingSame`, operator: 'equals', value: true } }],
      fields: [
        {
          key: `${px}_mailRow`,
          type: 'row',
          fields: [
            { key: `${px}_mailStreet`, type: 'input', label: 'Mailing street', value: '', col: 6 },
            { key: `${px}_mailCity`, type: 'input', label: 'Mailing city', value: '', col: 3 },
            {
              key: `${px}_mailZip`,
              type: 'input',
              label: 'Mailing ZIP',
              value: '',
              col: 3,
              validators: [{ type: 'pattern', value: '^\\d{5}$' }],
            },
          ],
        },
      ],
    },
  ];
}

function employmentSection(px: string): DF[] {
  const employedCond = {
    type: 'or',
    conditions: [
      { type: 'fieldValue', fieldPath: `${px}_status`, operator: 'equals', value: 'unemployed' },
      { type: 'fieldValue', fieldPath: `${px}_status`, operator: 'equals', value: 'retired' },
    ],
  };
  return [
    {
      key: `${px}_status`,
      type: 'select',
      label: 'Employment status',
      value: 'employed',
      col: 6,
      options: [
        { label: 'Employed', value: 'employed' },
        { label: 'Self-employed', value: 'self' },
        { label: 'Unemployed', value: 'unemployed' },
        { label: 'Retired', value: 'retired' },
      ],
    },
    { key: `${px}_employer`, type: 'input', label: 'Employer', value: '', col: 6, logic: [{ type: 'hidden', condition: employedCond }] },
    { key: `${px}_jobTitle`, type: 'input', label: 'Job title', value: '', col: 6, logic: [{ type: 'hidden', condition: employedCond }] },
    {
      key: `${px}_yearsEmployed`,
      type: 'input',
      label: 'Years employed',
      value: 0,
      props: { type: 'number' },
      col: 6,
      logic: [{ type: 'hidden', condition: employedCond }],
    },
    {
      key: `${px}_annualIncome`,
      type: 'input',
      label: 'Annual income',
      value: 0,
      props: { type: 'number' },
      col: 6,
      validators: [{ type: 'min', value: 0 }],
    },
    { key: `${px}_otherIncome`, type: 'input', label: 'Other income', value: 0, props: { type: 'number' }, col: 6 },
    {
      key: `${px}_totalIncome`,
      type: 'input',
      label: 'Total income (derived)',
      readonly: true,
      value: 0,
      props: { type: 'number' },
      col: 12,
      derivation: `(+formValue.${px}_annualIncome || 0) + (+formValue.${px}_otherIncome || 0)`,
    },
  ];
}

function spouseSection(px: string): DF[] {
  return [
    {
      key: `${px}_spFirst`,
      type: 'input',
      label: 'Spouse first name',
      value: '',
      col: 6,
      logic: [{ type: 'required', condition: { type: 'fieldValue', fieldPath: 'maritalStatus', operator: 'equals', value: 'married' } }],
    },
    { key: `${px}_spLast`, type: 'input', label: 'Spouse last name', value: '', col: 6 },
    { key: `${px}_spDob`, type: 'datepicker', label: 'Spouse date of birth', value: null, col: 6 },
    {
      key: `${px}_spSsn`,
      type: 'input',
      label: 'Spouse SSN',
      value: '',
      col: 6,
      validators: [{ type: 'pattern', value: '^\\d{3}-\\d{2}-\\d{4}$' }],
    },
    { key: `${px}_spEmployed`, type: 'toggle', label: 'Spouse employed', value: false, col: 6 },
    { key: `${px}_spCoverage`, type: 'checkbox', label: 'Add spouse to coverage', value: false, col: 6 },
  ];
}

function dependentsSection(px: string): DF[] {
  return [
    {
      key: `${px}_dependents`,
      type: 'array',
      label: 'Dependents',
      fields: Array.from({ length: 2 }, () => [
        { key: 'depName', type: 'input', label: 'Name', value: '', col: 5, validators: [{ type: 'required' }] },
        { key: 'depDob', type: 'datepicker', label: 'Date of birth', value: null, col: 4 },
        {
          key: 'depRelation',
          type: 'select',
          label: 'Relationship',
          value: 'child',
          col: 3,
          options: [
            { label: 'Child', value: 'child' },
            { label: 'Parent', value: 'parent' },
            { label: 'Other', value: 'other' },
          ],
        },
      ]),
    },
    { key: `${px}_addDependent`, type: 'addArrayItem', label: 'Add dependent', props: { arrayKey: `${px}_dependents` }, col: 12 },
  ];
}

function coverageSection(px: string): DF[] {
  return [
    {
      key: `${px}_coverageType`,
      type: 'radio',
      label: 'Coverage type',
      value: 'standard',
      col: 12,
      options: [
        { label: 'Basic', value: 'basic' },
        { label: 'Standard', value: 'standard' },
        { label: 'Premium', value: 'premium' },
      ],
    },
    {
      key: `${px}_coverageAmount`,
      type: 'slider',
      label: 'Coverage amount ($000s)',
      value: 250,
      props: { min: 50, max: 1000, step: 10 },
      col: 12,
    },
    {
      key: `${px}_termLength`,
      type: 'select',
      label: 'Term length',
      value: '20',
      col: 6,
      options: [
        { label: '10 years', value: '10' },
        { label: '20 years', value: '20' },
        { label: '30 years', value: '30' },
      ],
    },
    {
      key: `${px}_riders`,
      type: 'multi-checkbox',
      label: 'Optional riders',
      value: [],
      col: 6,
      options: [
        { label: 'Accidental death', value: 'add' },
        { label: 'Disability waiver', value: 'waiver' },
        { label: 'Critical illness', value: 'ci' },
      ],
    },
    {
      key: `${px}_premiumEstimate`,
      type: 'input',
      label: 'Estimated monthly premium (derived)',
      readonly: true,
      value: 0,
      props: { type: 'number' },
      col: 12,
      derivation: `Math.round((+formValue.${px}_coverageAmount || 0) * 0.42)`,
    },
  ];
}

function beneficiariesSection(px: string): DF[] {
  return [
    {
      key: `${px}_beneficiaries`,
      type: 'array',
      label: 'Beneficiaries',
      fields: Array.from({ length: 2 }, () => [
        { key: 'benName', type: 'input', label: 'Full name', value: '', col: 5, validators: [{ type: 'required' }] },
        {
          key: 'benRelation',
          type: 'select',
          label: 'Relationship',
          value: 'spouse',
          col: 4,
          options: [
            { label: 'Spouse', value: 'spouse' },
            { label: 'Child', value: 'child' },
            { label: 'Estate', value: 'estate' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          key: 'benPct',
          type: 'input',
          label: 'Share %',
          value: 50,
          props: { type: 'number' },
          col: 3,
          validators: [
            { type: 'min', value: 0 },
            { type: 'max', value: 100 },
          ],
        },
      ]),
    },
    { key: `${px}_addBeneficiary`, type: 'addArrayItem', label: 'Add beneficiary', props: { arrayKey: `${px}_beneficiaries` }, col: 12 },
  ];
}

function medicalSection(px: string): DF[] {
  return [
    { key: `${px}_smoker`, type: 'toggle', label: 'Do you use tobacco?', value: false, col: 6 },
    {
      key: `${px}_cigsPerDay`,
      type: 'input',
      label: 'Cigarettes per day',
      value: 0,
      props: { type: 'number' },
      col: 6,
      logic: [{ type: 'hidden', condition: { type: 'fieldValue', fieldPath: `${px}_smoker`, operator: 'equals', value: false } }],
    },
    {
      key: `${px}_heightIn`,
      type: 'input',
      label: 'Height (in)',
      value: 68,
      props: { type: 'number' },
      col: 3,
      validators: [
        { type: 'min', value: 24 },
        { type: 'max', value: 96 },
      ],
    },
    {
      key: `${px}_weightLb`,
      type: 'input',
      label: 'Weight (lb)',
      value: 160,
      props: { type: 'number' },
      col: 3,
      validators: [
        { type: 'min', value: 50 },
        { type: 'max', value: 700 },
      ],
    },
    {
      key: `${px}_bmi`,
      type: 'input',
      label: 'BMI (derived)',
      readonly: true,
      value: 0,
      props: { type: 'number' },
      col: 6,
      derivation: `Math.round(((+formValue.${px}_weightLb || 0) / Math.pow((+formValue.${px}_heightIn || 1), 2)) * 703 * 10) / 10`,
    },
    {
      key: `${px}_conditions`,
      type: 'multi-checkbox',
      label: 'Pre-existing conditions',
      value: [],
      col: 12,
      options: [
        { label: 'Diabetes', value: 'diabetes' },
        { label: 'Heart disease', value: 'heart' },
        { label: 'Hypertension', value: 'htn' },
        { label: 'None', value: 'none' },
      ],
    },
    {
      key: `${px}_medications`,
      type: 'textarea',
      label: 'Current medications',
      value: '',
      col: 12,
      validators: [{ type: 'maxLength', value: 500 }],
    },
  ];
}

function financialSection(px: string): DF[] {
  const notCard = { type: 'not', condition: { type: 'fieldValue', fieldPath: `${px}_payMethod`, operator: 'equals', value: 'card' } };
  const notAch = { type: 'not', condition: { type: 'fieldValue', fieldPath: `${px}_payMethod`, operator: 'equals', value: 'ach' } };
  return [
    {
      key: `${px}_payMethod`,
      type: 'select',
      label: 'Payment method',
      value: 'card',
      col: 6,
      options: [
        { label: 'Credit card', value: 'card' },
        { label: 'Bank transfer (ACH)', value: 'ach' },
        { label: 'Check', value: 'check' },
      ],
    },
    {
      key: `${px}_billingFreq`,
      type: 'select',
      label: 'Billing frequency',
      value: 'monthly',
      col: 6,
      options: [
        { label: 'Monthly', value: 'monthly' },
        { label: 'Quarterly', value: 'quarterly' },
        { label: 'Annually', value: 'annually' },
      ],
    },
    {
      key: `${px}_cardNumber`,
      type: 'input',
      label: 'Card number',
      value: '',
      col: 6,
      logic: [{ type: 'hidden', condition: notCard }],
      validators: [{ type: 'pattern', value: '^\\d{16}$' }],
      validationMessages: { pattern: '16 digits' },
    },
    {
      key: `${px}_cardExp`,
      type: 'input',
      label: 'Expiry (MM/YY)',
      value: '',
      col: 3,
      logic: [{ type: 'hidden', condition: notCard }],
      validators: [{ type: 'pattern', value: '^\\d{2}/\\d{2}$' }],
    },
    {
      key: `${px}_cardCvc`,
      type: 'input',
      label: 'CVC',
      value: '',
      col: 3,
      logic: [{ type: 'hidden', condition: notCard }],
      validators: [{ type: 'pattern', value: '^\\d{3,4}$' }],
    },
    {
      key: `${px}_routing`,
      type: 'input',
      label: 'Routing number',
      value: '',
      col: 6,
      logic: [{ type: 'hidden', condition: notAch }],
      validators: [{ type: 'pattern', value: '^\\d{9}$' }],
      validationMessages: { pattern: '9 digits' },
    },
    { key: `${px}_account`, type: 'input', label: 'Account number', value: '', col: 6, logic: [{ type: 'hidden', condition: notAch }] },
    { key: `${px}_autopay`, type: 'toggle', label: 'Enroll in autopay', value: true, col: 6 },
    { key: `${px}_paperless`, type: 'checkbox', label: 'Paperless billing', value: true, col: 6 },
  ];
}

function vehiclesSection(px: string): DF[] {
  return [
    {
      key: `${px}_vehicles`,
      type: 'array',
      label: 'Vehicles',
      fields: Array.from({ length: 1 }, () => [
        { key: 'vMake', type: 'input', label: 'Make', value: '', col: 4, validators: [{ type: 'required' }] },
        { key: 'vModel', type: 'input', label: 'Model', value: '', col: 4 },
        {
          key: 'vYear',
          type: 'input',
          label: 'Year',
          value: 2020,
          props: { type: 'number' },
          col: 4,
          validators: [
            { type: 'min', value: 1950 },
            { type: 'max', value: 2027 },
          ],
        },
        {
          key: 'vVin',
          type: 'input',
          label: 'VIN',
          value: '',
          col: 12,
          validators: [{ type: 'pattern', value: '^[A-HJ-NPR-Z0-9]{17}$' }],
          validationMessages: { pattern: '17-char VIN' },
        },
      ]),
    },
    { key: `${px}_addVehicle`, type: 'addArrayItem', label: 'Add vehicle', props: { arrayKey: `${px}_vehicles` }, col: 12 },
  ];
}

function priorClaimsSection(px: string): DF[] {
  return [
    { key: `${px}_hadClaims`, type: 'toggle', label: 'Any prior claims in the last 5 years?', value: false, col: 12 },
    {
      key: `${px}_claims`,
      type: 'array',
      label: 'Prior claims',
      logic: [{ type: 'hidden', condition: { type: 'fieldValue', fieldPath: `${px}_hadClaims`, operator: 'equals', value: false } }],
      fields: Array.from({ length: 1 }, () => [
        { key: 'claimYear', type: 'input', label: 'Year', value: 2023, props: { type: 'number' }, col: 4 },
        { key: 'claimType', type: 'input', label: 'Type', value: '', col: 4 },
        { key: 'claimAmount', type: 'input', label: 'Amount', value: 0, props: { type: 'number' }, col: 4 },
      ]),
    },
    {
      key: `${px}_addClaim`,
      type: 'addArrayItem',
      label: 'Add claim',
      props: { arrayKey: `${px}_claims` },
      col: 12,
      logic: [{ type: 'hidden', condition: { type: 'fieldValue', fieldPath: `${px}_hadClaims`, operator: 'equals', value: false } }],
    },
  ];
}

// Additional-insured section (used to scale up realistically for group policies).
// Includes a cross-field custom validator (coverage must be >= requested).
function additionalInsuredSection(px: string, n: number): DF[] {
  return [
    { key: `${px}_aiName`, type: 'input', label: `Insured party ${n} — full name`, value: '', col: 6, validators: [{ type: 'required' }] },
    { key: `${px}_aiRelation`, type: 'input', label: 'Relationship', value: '', col: 6 },
    { key: `${px}_aiDob`, type: 'datepicker', label: 'Date of birth', value: null, col: 4 },
    {
      key: `${px}_aiSsn`,
      type: 'input',
      label: 'SSN',
      value: '',
      col: 4,
      validators: [{ type: 'pattern', value: '^\\d{3}-\\d{2}-\\d{4}$' }],
    },
    { key: `${px}_aiEmail`, type: 'input', label: 'Email', value: '', props: { type: 'email' }, col: 4, validators: [{ type: 'email' }] },
    { key: `${px}_aiRequested`, type: 'input', label: 'Requested coverage ($000s)', value: 100, props: { type: 'number' }, col: 6 },
    {
      key: `${px}_aiApproved`,
      type: 'input',
      label: 'Approved coverage ($000s, must be <= requested)',
      value: 100,
      props: { type: 'number' },
      col: 6,
      validators: [{ type: 'custom', kind: 'leApproved', expression: `+fieldValue <= +formValue.${px}_aiRequested` }],
      validationMessages: { leApproved: 'Approved cannot exceed requested' },
    },
    {
      key: `${px}_aiPremium`,
      type: 'input',
      label: 'Party premium (derived)',
      readonly: true,
      value: 0,
      props: { type: 'number' },
      col: 12,
      derivation: `Math.round((+formValue.${px}_aiApproved || 0) * 0.5)`,
    },
  ];
}

function reviewSection(px: string): DF[] {
  return [
    {
      key: `${px}_summaryNote`,
      type: 'textarea',
      label: 'Anything else we should know?',
      value: '',
      col: 12,
      validators: [{ type: 'maxLength', value: 1000 }],
    },
    {
      key: `${px}_agreeTerms`,
      type: 'checkbox',
      label: 'I agree to the terms and conditions',
      value: false,
      col: 12,
      validators: [{ type: 'required' }],
      validationMessages: { required: 'You must agree to continue' },
    },
    {
      key: `${px}_agreeDisclosure`,
      type: 'checkbox',
      label: 'I authorize verification of the information provided',
      value: false,
      col: 12,
      validators: [{ type: 'required' }],
    },
    {
      key: `${px}_signature`,
      type: 'input',
      label: 'Electronic signature (full legal name)',
      value: '',
      col: 12,
      validators: [{ type: 'required' }, { type: 'minLength', value: 3 }],
    },
  ];
}

// ---------------------------------------------------------------------------
// A deep, never-matching cross-page condition (and/or/not/javascript). Keeps
// pages visible while forcing the evaluator to walk the full tree on relevant
// form-value changes — the paged-orchestrator hot path.
// ---------------------------------------------------------------------------
function deepNeverMatchCondition(): DF {
  return {
    type: 'and',
    conditions: [
      {
        type: 'or',
        conditions: [
          { type: 'fieldValue', fieldPath: 'accountType', operator: 'equals', value: '__never__' },
          { type: 'not', condition: { type: 'fieldValue', fieldPath: 'region', operator: 'equals', value: 'us' } },
        ],
      },
      {
        type: 'not',
        condition: {
          type: 'or',
          conditions: [
            { type: 'fieldValue', fieldPath: 'tier', operator: 'equals', value: 'basic' },
            { type: 'javascript', expression: 'formValue.plan === "free" || formValue.currency === "USD"' },
          ],
        },
      },
    ],
  };
}

function navButtons(isLast: boolean, px: string): DF[] {
  if (isLast)
    return [{ key: `${px}_submit`, type: 'submit', label: 'Submit application', props: { type: 'submit', color: 'primary' }, col: 12 }];
  return [
    { key: `${px}_prev`, type: 'previous', label: 'Previous', col: 6 },
    { key: `${px}_next`, type: 'next', label: 'Next', col: 6 },
  ];
}

export interface EnormousConfigOptions {
  /** Number of content pages after the applicant page. Default 20. */
  contentPages?: number;
}

export function enormousIntricateConfig(opts: EnormousConfigOptions = {}): FormConfig {
  const contentPages = opts.contentPages ?? 20;

  // Page 0 — applicant + policy selectors + measurement probes + Next.
  const triggerPage: DF = {
    key: 'pageApplicant',
    type: 'page',
    fields: [...applicantFields(), ...probeFields(), { key: 'applicant_next', type: 'next', label: 'Next', col: 12 }],
  };

  // Core realistic sections (in a natural application order).
  const coreSections: Array<{ title: string; build: (px: string) => DF[]; hideCond?: DF }> = [
    { title: 'Address', build: addressSection },
    { title: 'Employment', build: employmentSection },
    // Spouse page only relevant when married.
    {
      title: 'Spouse',
      build: spouseSection,
      hideCond: { type: 'not', condition: { type: 'fieldValue', fieldPath: 'maritalStatus', operator: 'equals', value: 'married' } },
    },
    { title: 'Dependents', build: dependentsSection },
    { title: 'Coverage', build: coverageSection },
    { title: 'Beneficiaries', build: beneficiariesSection },
    { title: 'Medical history', build: medicalSection },
    { title: 'Vehicles', build: vehiclesSection },
    { title: 'Prior claims', build: priorClaimsSection },
    { title: 'Financial', build: financialSection },
  ];

  const pages: DF[] = [];
  for (let i = 0; i < contentPages; i++) {
    const px = `s${i}`;
    const isLast = i === contentPages - 1;

    let fields: DF[];
    let hideCond: DF | undefined;
    if (isLast) {
      fields = reviewSection(px);
    } else if (i < coreSections.length) {
      const section = coreSections[i];
      fields = section.build(px);
      hideCond = section.hideCond;
    } else {
      // Scale up realistically with additional insured parties (group policies).
      fields = additionalInsuredSection(px, i - coreSections.length + 1);
    }

    fields = [...fields, ...navButtons(isLast, px)];

    const page: DF = { key: `page_${px}`, type: 'page', fields };
    if (hideCond) {
      page['logic'] = [{ type: 'hidden', condition: hideCond }];
    } else if (i % 3 === 0 && !isLast) {
      // Sprinkle the deep never-match condition on a third of pages to stress the evaluator.
      page['logic'] = [{ type: 'hidden', condition: deepNeverMatchCondition() }];
    }
    pages.push(page);
  }

  return { fields: [triggerPage, ...pages] } as unknown as FormConfig;
}
