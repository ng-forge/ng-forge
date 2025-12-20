/**
 * @fileoverview Type-level benchmark tests for InferFormValue
 *
 * This file tests type inference correctness and serves as a compile-time
 * performance benchmark. If TypeScript compilation becomes slow, this file
 * will be one of the first indicators.
 *
 * Run `tsc --noEmit --extendedDiagnostics` to measure compilation time.
 */

import { describe, it, expect } from 'vitest';
import { FormConfig, InferFormValue } from '../..';

// =============================================================================
// Type assertion helpers
// =============================================================================

type Expect<T extends true> = T;
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;

// =============================================================================
// Small form (baseline - ~10 fields)
// =============================================================================

const smallForm = {
  fields: [
    { key: 'firstName', type: 'input', value: '', required: true },
    { key: 'lastName', type: 'input', value: '', required: true },
    { key: 'email', type: 'input', value: '', required: true, email: true },
    { key: 'age', type: 'input', value: 0, props: { type: 'number' }, required: true },
    { key: 'bio', type: 'textarea', value: '' },
    { key: 'country', type: 'select', value: 'us', options: [{ value: 'us', label: 'US' }] },
    { key: 'newsletter', type: 'checkbox', value: false },
    { key: 'rating', type: 'slider', value: 5 },
    { type: 'submit', key: 'submit', label: 'Submit' },
  ],
} as const satisfies FormConfig;

type SmallFormValue = InferFormValue<typeof smallForm>;

// Verify small form inference
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Type-level test for compile-time verification
type _SmallFormTests = [
  Expect<Equal<SmallFormValue['firstName'], string>>,
  Expect<Equal<SmallFormValue['lastName'], string>>,
  Expect<Equal<SmallFormValue['email'], string>>,
  Expect<Equal<SmallFormValue['age'], number>>, // number input
  Expect<Equal<SmallFormValue['bio'], string | undefined>>,
  Expect<Equal<SmallFormValue['country'], string | undefined>>,
  Expect<Equal<SmallFormValue['newsletter'], boolean | undefined>>,
  Expect<Equal<SmallFormValue['rating'], number | undefined>>, // slider
];

// =============================================================================
// Medium form (~30 fields)
// =============================================================================

const mediumForm = {
  fields: [
    // Personal info
    { key: 'firstName', type: 'input', value: '', required: true },
    { key: 'lastName', type: 'input', value: '', required: true },
    { key: 'middleName', type: 'input', value: '' },
    { key: 'email', type: 'input', value: '', required: true },
    { key: 'phone', type: 'input', value: '' },
    { key: 'age', type: 'input', value: 0, props: { type: 'number' }, required: true },
    { key: 'birthDate', type: 'datepicker', value: null },
    // Address
    { key: 'street', type: 'input', value: '' },
    { key: 'city', type: 'input', value: '' },
    { key: 'state', type: 'input', value: '' },
    { key: 'zip', type: 'input', value: '' },
    { key: 'country', type: 'select', value: 'us', options: [] },
    // Preferences
    { key: 'newsletter', type: 'checkbox', value: false },
    { key: 'notifications', type: 'checkbox', value: true },
    { key: 'theme', type: 'radio', value: 'light', options: [] },
    { key: 'language', type: 'select', value: 'en', options: [] },
    // Work info
    { key: 'company', type: 'input', value: '' },
    { key: 'jobTitle', type: 'input', value: '' },
    { key: 'department', type: 'input', value: '' },
    { key: 'salary', type: 'input', value: 0, props: { type: 'number' } },
    { key: 'experience', type: 'slider', value: 0 },
    // Social
    { key: 'website', type: 'input', value: '' },
    { key: 'twitter', type: 'input', value: '' },
    { key: 'linkedin', type: 'input', value: '' },
    { key: 'github', type: 'input', value: '' },
    // Bio
    { key: 'bio', type: 'textarea', value: '' },
    { key: 'interests', type: 'textarea', value: '' },
    // Ratings
    { key: 'satisfaction', type: 'slider', value: 5 },
    { key: 'likelihood', type: 'slider', value: 5 },
    { type: 'submit', key: 'submit', label: 'Submit' },
  ],
} as const satisfies FormConfig;

type MediumFormValue = InferFormValue<typeof mediumForm>;

// Verify key fields
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Type-level test for compile-time verification
type _MediumFormTests = [
  Expect<Equal<MediumFormValue['firstName'], string>>,
  Expect<Equal<MediumFormValue['age'], number>>,
  Expect<Equal<MediumFormValue['salary'], number | undefined>>,
  Expect<Equal<MediumFormValue['experience'], number | undefined>>,
  Expect<Equal<MediumFormValue['satisfaction'], number | undefined>>,
];

// =============================================================================
// Large form (~50 fields with nesting)
// =============================================================================

const largeForm = {
  fields: [
    {
      key: 'page1',
      type: 'page',
      fields: [
        { key: 'firstName', type: 'input', value: '', required: true },
        { key: 'lastName', type: 'input', value: '', required: true },
        { key: 'middleName', type: 'input', value: '' },
        { key: 'email', type: 'input', value: '', required: true },
        { key: 'phone', type: 'input', value: '' },
        { key: 'age', type: 'input', value: 0, props: { type: 'number' }, required: true },
        { key: 'birthDate', type: 'datepicker', value: null },
        { key: 'gender', type: 'radio', value: '', options: [] },
        { key: 'nationality', type: 'select', value: '', options: [] },
        { key: 'maritalStatus', type: 'select', value: '', options: [] },
      ],
    },
    {
      key: 'page2',
      type: 'page',
      fields: [
        {
          key: 'address',
          type: 'group',
          fields: [
            { key: 'street', type: 'input', value: '', required: true },
            { key: 'apt', type: 'input', value: '' },
            { key: 'city', type: 'input', value: '', required: true },
            { key: 'state', type: 'input', value: '', required: true },
            { key: 'zip', type: 'input', value: '', required: true },
            { key: 'country', type: 'select', value: 'us', options: [], required: true },
          ],
        },
        {
          key: 'shipping',
          type: 'group',
          fields: [
            { key: 'sameAsAbove', type: 'checkbox', value: true },
            { key: 'street', type: 'input', value: '' },
            { key: 'apt', type: 'input', value: '' },
            { key: 'city', type: 'input', value: '' },
            { key: 'state', type: 'input', value: '' },
            { key: 'zip', type: 'input', value: '' },
            { key: 'country', type: 'select', value: 'us', options: [] },
          ],
        },
      ],
    },
    {
      key: 'page3',
      type: 'page',
      fields: [
        { key: 'company', type: 'input', value: '' },
        { key: 'jobTitle', type: 'input', value: '' },
        { key: 'department', type: 'input', value: '' },
        { key: 'yearsAtCompany', type: 'input', value: 0, props: { type: 'number' } },
        { key: 'salary', type: 'input', value: 0, props: { type: 'number' } },
        { key: 'bonus', type: 'input', value: 0, props: { type: 'number' } },
        { key: 'experience', type: 'slider', value: 0 },
        { key: 'skills', type: 'multi-checkbox', value: [], options: [] },
        { key: 'certifications', type: 'textarea', value: '' },
        { key: 'references', type: 'textarea', value: '' },
      ],
    },
    {
      key: 'page4',
      type: 'page',
      fields: [
        { key: 'website', type: 'input', value: '' },
        { key: 'twitter', type: 'input', value: '' },
        { key: 'linkedin', type: 'input', value: '' },
        { key: 'github', type: 'input', value: '' },
        { key: 'portfolio', type: 'input', value: '' },
        { key: 'bio', type: 'textarea', value: '' },
        { key: 'interests', type: 'textarea', value: '' },
        { key: 'goals', type: 'textarea', value: '' },
        { key: 'availability', type: 'select', value: '', options: [] },
        { key: 'remoteWork', type: 'checkbox', value: false },
        { key: 'relocation', type: 'checkbox', value: false },
        { key: 'travelPercent', type: 'slider', value: 0 },
        { key: 'salaryExpectation', type: 'input', value: 0, props: { type: 'number' } },
        { key: 'startDate', type: 'datepicker', value: null },
        { key: 'terms', type: 'checkbox', value: false, required: true },
        { type: 'submit', key: 'submit', label: 'Submit Application' },
      ],
    },
  ],
} as const satisfies FormConfig;

type LargeFormValue = InferFormValue<typeof largeForm>;

// Verify large form inference including nested groups
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Type-level test for compile-time verification
type _LargeFormTests = [
  // Top level (flattened from pages)
  Expect<Equal<LargeFormValue['firstName'], string>>,
  Expect<Equal<LargeFormValue['age'], number>>,
  // Nested groups
  Expect<Equal<LargeFormValue['address']['street'], string>>,
  Expect<Equal<LargeFormValue['address']['country'], string>>,
  Expect<Equal<LargeFormValue['shipping']['sameAsAbove'], boolean | undefined>>,
  // Number inputs
  Expect<Equal<LargeFormValue['yearsAtCompany'], number | undefined>>,
  Expect<Equal<LargeFormValue['salary'], number | undefined>>,
  Expect<Equal<LargeFormValue['salaryExpectation'], number | undefined>>,
  // Sliders
  Expect<Equal<LargeFormValue['experience'], number | undefined>>,
  Expect<Equal<LargeFormValue['travelPercent'], number | undefined>>,
  // Required checkbox
  Expect<Equal<LargeFormValue['terms'], boolean>>,
];

// =============================================================================
// Stress test (~100 flat fields)
// =============================================================================

const stressForm = {
  fields: [
    { key: 'f01', type: 'input', value: '' },
    { key: 'f02', type: 'input', value: '' },
    { key: 'f03', type: 'input', value: '' },
    { key: 'f04', type: 'input', value: '' },
    { key: 'f05', type: 'input', value: '' },
    { key: 'f06', type: 'input', value: '' },
    { key: 'f07', type: 'input', value: '' },
    { key: 'f08', type: 'input', value: '' },
    { key: 'f09', type: 'input', value: '' },
    { key: 'f10', type: 'input', value: '' },
    { key: 'f11', type: 'input', value: '' },
    { key: 'f12', type: 'input', value: '' },
    { key: 'f13', type: 'input', value: '' },
    { key: 'f14', type: 'input', value: '' },
    { key: 'f15', type: 'input', value: '' },
    { key: 'f16', type: 'input', value: '' },
    { key: 'f17', type: 'input', value: '' },
    { key: 'f18', type: 'input', value: '' },
    { key: 'f19', type: 'input', value: '' },
    { key: 'f20', type: 'input', value: '' },
    { key: 'f21', type: 'input', value: '' },
    { key: 'f22', type: 'input', value: '' },
    { key: 'f23', type: 'input', value: '' },
    { key: 'f24', type: 'input', value: '' },
    { key: 'f25', type: 'input', value: '' },
    { key: 'f26', type: 'input', value: '' },
    { key: 'f27', type: 'input', value: '' },
    { key: 'f28', type: 'input', value: '' },
    { key: 'f29', type: 'input', value: '' },
    { key: 'f30', type: 'input', value: '' },
    { key: 'f31', type: 'input', value: '' },
    { key: 'f32', type: 'input', value: '' },
    { key: 'f33', type: 'input', value: '' },
    { key: 'f34', type: 'input', value: '' },
    { key: 'f35', type: 'input', value: '' },
    { key: 'f36', type: 'input', value: '' },
    { key: 'f37', type: 'input', value: '' },
    { key: 'f38', type: 'input', value: '' },
    { key: 'f39', type: 'input', value: '' },
    { key: 'f40', type: 'input', value: '' },
    { key: 'f41', type: 'input', value: '' },
    { key: 'f42', type: 'input', value: '' },
    { key: 'f43', type: 'input', value: '' },
    { key: 'f44', type: 'input', value: '' },
    { key: 'f45', type: 'input', value: '' },
    { key: 'f46', type: 'input', value: '' },
    { key: 'f47', type: 'input', value: '' },
    { key: 'f48', type: 'input', value: '' },
    { key: 'f49', type: 'input', value: '' },
    { key: 'f50', type: 'input', value: '' },
    { key: 'n01', type: 'input', value: 0, props: { type: 'number' } },
    { key: 'n02', type: 'input', value: 0, props: { type: 'number' } },
    { key: 'n03', type: 'input', value: 0, props: { type: 'number' } },
    { key: 'n04', type: 'input', value: 0, props: { type: 'number' } },
    { key: 'n05', type: 'input', value: 0, props: { type: 'number' } },
    { key: 'n06', type: 'input', value: 0, props: { type: 'number' } },
    { key: 'n07', type: 'input', value: 0, props: { type: 'number' } },
    { key: 'n08', type: 'input', value: 0, props: { type: 'number' } },
    { key: 'n09', type: 'input', value: 0, props: { type: 'number' } },
    { key: 'n10', type: 'input', value: 0, props: { type: 'number' } },
    { key: 's01', type: 'slider', value: 0 },
    { key: 's02', type: 'slider', value: 0 },
    { key: 's03', type: 'slider', value: 0 },
    { key: 's04', type: 'slider', value: 0 },
    { key: 's05', type: 'slider', value: 0 },
    { key: 's06', type: 'slider', value: 0 },
    { key: 's07', type: 'slider', value: 0 },
    { key: 's08', type: 'slider', value: 0 },
    { key: 's09', type: 'slider', value: 0 },
    { key: 's10', type: 'slider', value: 0 },
    { key: 'c01', type: 'checkbox', value: false },
    { key: 'c02', type: 'checkbox', value: false },
    { key: 'c03', type: 'checkbox', value: false },
    { key: 'c04', type: 'checkbox', value: false },
    { key: 'c05', type: 'checkbox', value: false },
    { key: 'c06', type: 'checkbox', value: false },
    { key: 'c07', type: 'checkbox', value: false },
    { key: 'c08', type: 'checkbox', value: false },
    { key: 'c09', type: 'checkbox', value: false },
    { key: 'c10', type: 'checkbox', value: false },
    { key: 'sel01', type: 'select', value: '', options: [] },
    { key: 'sel02', type: 'select', value: '', options: [] },
    { key: 'sel03', type: 'select', value: '', options: [] },
    { key: 'sel04', type: 'select', value: '', options: [] },
    { key: 'sel05', type: 'select', value: '', options: [] },
    { key: 'sel06', type: 'select', value: '', options: [] },
    { key: 'sel07', type: 'select', value: '', options: [] },
    { key: 'sel08', type: 'select', value: '', options: [] },
    { key: 'sel09', type: 'select', value: '', options: [] },
    { key: 'sel10', type: 'select', value: '', options: [] },
    { key: 'ta01', type: 'textarea', value: '' },
    { key: 'ta02', type: 'textarea', value: '' },
    { key: 'ta03', type: 'textarea', value: '' },
    { key: 'ta04', type: 'textarea', value: '' },
    { key: 'ta05', type: 'textarea', value: '' },
    { key: 'ta06', type: 'textarea', value: '' },
    { key: 'ta07', type: 'textarea', value: '' },
    { key: 'ta08', type: 'textarea', value: '' },
    { key: 'ta09', type: 'textarea', value: '' },
    { key: 'ta10', type: 'textarea', value: '' },
  ],
} as const satisfies FormConfig;

type StressFormValue = InferFormValue<typeof stressForm>;

// Verify stress form inference
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Type-level test for compile-time verification
type _StressFormTests = [
  Expect<Equal<StressFormValue['f01'], string | undefined>>,
  Expect<Equal<StressFormValue['f50'], string | undefined>>,
  Expect<Equal<StressFormValue['n01'], number | undefined>>,
  Expect<Equal<StressFormValue['n10'], number | undefined>>,
  Expect<Equal<StressFormValue['s01'], number | undefined>>,
  Expect<Equal<StressFormValue['s10'], number | undefined>>,
  Expect<Equal<StressFormValue['c01'], boolean | undefined>>,
  Expect<Equal<StressFormValue['c10'], boolean | undefined>>,
];

// =============================================================================
// Huge nested form (~150 fields, 5 pages, deep nesting)
// =============================================================================

const hugeNestedForm = {
  fields: [
    // Page 1: Personal Information
    {
      key: 'page1',
      type: 'page',
      fields: [
        { key: 'page1-title', type: 'text', label: 'Personal Information' },
        {
          key: 'row1',
          type: 'row',
          fields: [
            { key: 'firstName', type: 'input', value: '', required: true, col: 6 },
            { key: 'lastName', type: 'input', value: '', required: true, col: 6 },
          ],
        },
        {
          key: 'row2',
          type: 'row',
          fields: [
            { key: 'email', type: 'input', value: '', required: true, col: 6 },
            { key: 'phone', type: 'input', value: '', col: 6 },
          ],
        },
        {
          key: 'demographics',
          type: 'group',
          fields: [
            { key: 'age', type: 'input', value: 0, props: { type: 'number' }, required: true },
            { key: 'birthDate', type: 'datepicker', value: null },
            { key: 'gender', type: 'select', value: '', options: [] },
            { key: 'nationality', type: 'select', value: '', options: [] },
            { key: 'ethnicity', type: 'select', value: '', options: [] },
            { key: 'language', type: 'select', value: '', options: [] },
            { key: 'maritalStatus', type: 'select', value: '', options: [] },
            { key: 'dependents', type: 'input', value: 0, props: { type: 'number' } },
          ],
        },
        {
          key: 'identification',
          type: 'group',
          fields: [
            { key: 'ssn', type: 'input', value: '' },
            { key: 'passportNumber', type: 'input', value: '' },
            { key: 'passportExpiry', type: 'datepicker', value: null },
            { key: 'driversLicense', type: 'input', value: '' },
            { key: 'dlState', type: 'select', value: '', options: [] },
            { key: 'dlExpiry', type: 'datepicker', value: null },
          ],
        },
      ],
    },
    // Page 2: Address Information
    {
      key: 'page2',
      type: 'page',
      fields: [
        { key: 'page2-title', type: 'text', label: 'Address Information' },
        {
          key: 'primaryAddress',
          type: 'group',
          fields: [
            { key: 'street1', type: 'input', value: '', required: true },
            { key: 'street2', type: 'input', value: '' },
            { key: 'city', type: 'input', value: '', required: true },
            { key: 'state', type: 'select', value: '', options: [], required: true },
            { key: 'zip', type: 'input', value: '', required: true },
            { key: 'country', type: 'select', value: 'US', options: [], required: true },
            { key: 'yearsAtAddress', type: 'input', value: 0, props: { type: 'number' } },
            { key: 'monthsAtAddress', type: 'input', value: 0, props: { type: 'number' } },
            { key: 'residenceType', type: 'select', value: '', options: [] },
            { key: 'monthlyRent', type: 'input', value: 0, props: { type: 'number' } },
          ],
        },
        {
          key: 'mailingAddress',
          type: 'group',
          fields: [
            { key: 'sameAsPrimary', type: 'checkbox', value: true },
            { key: 'street1', type: 'input', value: '' },
            { key: 'street2', type: 'input', value: '' },
            { key: 'city', type: 'input', value: '' },
            { key: 'state', type: 'select', value: '', options: [] },
            { key: 'zip', type: 'input', value: '' },
            { key: 'country', type: 'select', value: 'US', options: [] },
          ],
        },
        {
          key: 'previousAddress',
          type: 'group',
          fields: [
            { key: 'hasPrevious', type: 'checkbox', value: false },
            { key: 'street1', type: 'input', value: '' },
            { key: 'street2', type: 'input', value: '' },
            { key: 'city', type: 'input', value: '' },
            { key: 'state', type: 'select', value: '', options: [] },
            { key: 'zip', type: 'input', value: '' },
            { key: 'country', type: 'select', value: 'US', options: [] },
            { key: 'yearsAtAddress', type: 'input', value: 0, props: { type: 'number' } },
          ],
        },
      ],
    },
    // Page 3: Employment Information
    {
      key: 'page3',
      type: 'page',
      fields: [
        { key: 'page3-title', type: 'text', label: 'Employment Information' },
        {
          key: 'currentEmployment',
          type: 'group',
          fields: [
            { key: 'employmentStatus', type: 'select', value: '', options: [], required: true },
            { key: 'employerName', type: 'input', value: '' },
            { key: 'jobTitle', type: 'input', value: '' },
            { key: 'department', type: 'input', value: '' },
            { key: 'employerPhone', type: 'input', value: '' },
            { key: 'employerEmail', type: 'input', value: '' },
            { key: 'startDate', type: 'datepicker', value: null },
            { key: 'annualSalary', type: 'input', value: 0, props: { type: 'number' } },
            { key: 'bonusAmount', type: 'input', value: 0, props: { type: 'number' } },
            { key: 'payFrequency', type: 'select', value: '', options: [] },
            {
              key: 'employerAddress',
              type: 'group',
              fields: [
                { key: 'street1', type: 'input', value: '' },
                { key: 'city', type: 'input', value: '' },
                { key: 'state', type: 'select', value: '', options: [] },
                { key: 'zip', type: 'input', value: '' },
              ],
            },
          ],
        },
        {
          key: 'previousEmployment',
          type: 'group',
          fields: [
            { key: 'hasPrevious', type: 'checkbox', value: false },
            { key: 'employerName', type: 'input', value: '' },
            { key: 'jobTitle', type: 'input', value: '' },
            { key: 'startDate', type: 'datepicker', value: null },
            { key: 'endDate', type: 'datepicker', value: null },
            { key: 'annualSalary', type: 'input', value: 0, props: { type: 'number' } },
            { key: 'reasonForLeaving', type: 'textarea', value: '' },
          ],
        },
        {
          key: 'additionalIncome',
          type: 'group',
          fields: [
            { key: 'hasAdditional', type: 'checkbox', value: false },
            { key: 'source1Type', type: 'select', value: '', options: [] },
            { key: 'source1Amount', type: 'input', value: 0, props: { type: 'number' } },
            { key: 'source2Type', type: 'select', value: '', options: [] },
            { key: 'source2Amount', type: 'input', value: 0, props: { type: 'number' } },
            { key: 'source3Type', type: 'select', value: '', options: [] },
            { key: 'source3Amount', type: 'input', value: 0, props: { type: 'number' } },
          ],
        },
      ],
    },
    // Page 4: Financial Information
    {
      key: 'page4',
      type: 'page',
      fields: [
        { key: 'page4-title', type: 'text', label: 'Financial Information' },
        {
          key: 'assets',
          type: 'group',
          fields: [
            { key: 'checkingBalance', type: 'input', value: 0, props: { type: 'number' } },
            { key: 'savingsBalance', type: 'input', value: 0, props: { type: 'number' } },
            { key: 'investmentBalance', type: 'input', value: 0, props: { type: 'number' } },
            { key: 'retirementBalance', type: 'input', value: 0, props: { type: 'number' } },
            { key: 'realEstateValue', type: 'input', value: 0, props: { type: 'number' } },
            { key: 'vehicleValue', type: 'input', value: 0, props: { type: 'number' } },
            { key: 'otherAssets', type: 'input', value: 0, props: { type: 'number' } },
            { key: 'otherAssetsDescription', type: 'textarea', value: '' },
          ],
        },
        {
          key: 'liabilities',
          type: 'group',
          fields: [
            { key: 'mortgageBalance', type: 'input', value: 0, props: { type: 'number' } },
            { key: 'mortgagePayment', type: 'input', value: 0, props: { type: 'number' } },
            { key: 'autoLoanBalance', type: 'input', value: 0, props: { type: 'number' } },
            { key: 'autoLoanPayment', type: 'input', value: 0, props: { type: 'number' } },
            { key: 'studentLoanBalance', type: 'input', value: 0, props: { type: 'number' } },
            { key: 'studentLoanPayment', type: 'input', value: 0, props: { type: 'number' } },
            { key: 'creditCardBalance', type: 'input', value: 0, props: { type: 'number' } },
            { key: 'creditCardPayment', type: 'input', value: 0, props: { type: 'number' } },
            { key: 'otherDebtBalance', type: 'input', value: 0, props: { type: 'number' } },
            { key: 'otherDebtPayment', type: 'input', value: 0, props: { type: 'number' } },
            { key: 'otherDebtDescription', type: 'textarea', value: '' },
          ],
        },
        {
          key: 'bankAccounts',
          type: 'group',
          fields: [
            { key: 'bank1Name', type: 'input', value: '' },
            { key: 'bank1AccountType', type: 'select', value: '', options: [] },
            { key: 'bank1Balance', type: 'input', value: 0, props: { type: 'number' } },
            { key: 'bank2Name', type: 'input', value: '' },
            { key: 'bank2AccountType', type: 'select', value: '', options: [] },
            { key: 'bank2Balance', type: 'input', value: 0, props: { type: 'number' } },
          ],
        },
      ],
    },
    // Page 5: Preferences & Consent
    {
      key: 'page5',
      type: 'page',
      fields: [
        { key: 'page5-title', type: 'text', label: 'Preferences & Consent' },
        {
          key: 'preferences',
          type: 'group',
          fields: [
            { key: 'contactMethod', type: 'radio', value: 'email', options: [] },
            { key: 'contactTime', type: 'select', value: '', options: [] },
            { key: 'emailNotifications', type: 'checkbox', value: true },
            { key: 'smsNotifications', type: 'checkbox', value: false },
            { key: 'pushNotifications', type: 'checkbox', value: false },
            { key: 'marketingEmails', type: 'checkbox', value: false },
            { key: 'partnerOffers', type: 'checkbox', value: false },
            { key: 'newsletter', type: 'checkbox', value: false },
          ],
        },
        {
          key: 'ratings',
          type: 'group',
          fields: [
            { key: 'serviceRating', type: 'slider', value: 5 },
            { key: 'easeOfUse', type: 'slider', value: 5 },
            { key: 'likelihood', type: 'slider', value: 5 },
            { key: 'satisfaction', type: 'slider', value: 5 },
          ],
        },
        {
          key: 'consent',
          type: 'group',
          fields: [
            { key: 'termsAccepted', type: 'checkbox', value: false, required: true },
            { key: 'privacyAccepted', type: 'checkbox', value: false, required: true },
            { key: 'creditCheckConsent', type: 'checkbox', value: false, required: true },
            { key: 'electronicSignature', type: 'input', value: '', required: true },
            { key: 'signatureDate', type: 'datepicker', value: null, required: true },
          ],
        },
        { key: 'comments', type: 'textarea', value: '' },
        { type: 'submit', key: 'submit', label: 'Submit Application' },
      ],
    },
  ],
} as const satisfies FormConfig;

type HugeNestedFormValue = InferFormValue<typeof hugeNestedForm>;

// Verify huge nested form inference
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Type-level test for compile-time verification
type _HugeNestedFormTests = [
  // Top level (flattened from pages and rows)
  Expect<Equal<HugeNestedFormValue['firstName'], string>>,
  Expect<Equal<HugeNestedFormValue['lastName'], string>>,
  Expect<Equal<HugeNestedFormValue['email'], string>>,
  Expect<Equal<HugeNestedFormValue['phone'], string | undefined>>,
  // Demographics group
  Expect<Equal<HugeNestedFormValue['demographics']['age'], number>>,
  Expect<Equal<HugeNestedFormValue['demographics']['dependents'], number | undefined>>,
  // Identification group
  Expect<Equal<HugeNestedFormValue['identification']['ssn'], string | undefined>>,
  // Primary address group
  Expect<Equal<HugeNestedFormValue['primaryAddress']['street1'], string>>,
  Expect<Equal<HugeNestedFormValue['primaryAddress']['yearsAtAddress'], number | undefined>>,
  Expect<Equal<HugeNestedFormValue['primaryAddress']['monthlyRent'], number | undefined>>,
  // Mailing address group
  Expect<Equal<HugeNestedFormValue['mailingAddress']['sameAsPrimary'], boolean | undefined>>,
  // Current employment with nested group
  Expect<Equal<HugeNestedFormValue['currentEmployment']['annualSalary'], number | undefined>>,
  Expect<Equal<HugeNestedFormValue['currentEmployment']['employerAddress']['street1'], string | undefined>>,
  // Assets group - all numbers
  Expect<Equal<HugeNestedFormValue['assets']['checkingBalance'], number | undefined>>,
  Expect<Equal<HugeNestedFormValue['assets']['investmentBalance'], number | undefined>>,
  // Liabilities group - all numbers
  Expect<Equal<HugeNestedFormValue['liabilities']['mortgageBalance'], number | undefined>>,
  Expect<Equal<HugeNestedFormValue['liabilities']['creditCardPayment'], number | undefined>>,
  // Ratings group - sliders
  Expect<Equal<HugeNestedFormValue['ratings']['serviceRating'], number | undefined>>,
  Expect<Equal<HugeNestedFormValue['ratings']['satisfaction'], number | undefined>>,
  // Consent group - required checkboxes
  Expect<Equal<HugeNestedFormValue['consent']['termsAccepted'], boolean>>,
  Expect<Equal<HugeNestedFormValue['consent']['privacyAccepted'], boolean>>,
  Expect<Equal<HugeNestedFormValue['consent']['electronicSignature'], string>>,
];

// =============================================================================
// Runtime tests (verify types compile correctly)
// =============================================================================

describe('InferFormValue type inference', () => {
  it('should correctly infer small form value types', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Type-level test for compile-time verification
    type Result = SmallFormValue;
    // Type-level assertions are checked at compile time
    // Runtime check just ensures the config is valid
    expect(smallForm.fields.length).toBeGreaterThan(0);
  });

  it('should correctly infer medium form value types', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Type-level test for compile-time verification
    type Result = MediumFormValue;
    expect(mediumForm.fields.length).toBeGreaterThan(0);
  });

  it('should correctly infer large form value types with nesting', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Type-level test for compile-time verification
    type Result = LargeFormValue;
    expect(largeForm.fields.length).toBeGreaterThan(0);
  });

  it('should handle stress test with 100 fields', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Type-level test for compile-time verification
    type Result = StressFormValue;
    expect(stressForm.fields.length).toBe(100);
  });

  it('should handle huge nested form with 5 pages and deep nesting', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Type-level test for compile-time verification
    type Result = HugeNestedFormValue;
    // 5 pages
    expect(hugeNestedForm.fields.length).toBe(5);
    // Verify deep nesting works (group inside group)
    type NestedAddress = HugeNestedFormValue['currentEmployment']['employerAddress'];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Type-level test for compile-time verification
    type _NestedTest = Expect<Equal<NestedAddress['street1'], string | undefined>>;
  });

  it('should infer number type for input with props.type: number', () => {
    const config = {
      fields: [{ key: 'age', type: 'input', value: 0, props: { type: 'number' }, required: true }],
    } as const satisfies FormConfig;

    type Value = InferFormValue<typeof config>;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Type-level test for compile-time verification
    type _Test = Expect<Equal<Value['age'], number>>;

    expect(config.fields[0].props.type).toBe('number');
  });

  it('should infer number type for slider fields', () => {
    const config = {
      fields: [{ key: 'rating', type: 'slider', value: 5, required: true }],
    } as const satisfies FormConfig;

    type Value = InferFormValue<typeof config>;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Type-level test for compile-time verification
    type _Test = Expect<Equal<Value['rating'], number>>;

    expect(config.fields[0].type).toBe('slider');
  });

  it('should handle optional vs required fields', () => {
    const config = {
      fields: [
        { key: 'required', type: 'input', value: '', required: true },
        { key: 'optional', type: 'input', value: '' },
      ],
    } as const satisfies FormConfig;

    type Value = InferFormValue<typeof config>;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Type-level test for compile-time verification
    type _Tests = [Expect<Equal<Value['required'], string>>, Expect<Equal<Value['optional'], string | undefined>>];

    expect(config.fields[0].required).toBe(true);
    expect(config.fields[1].required).toBeUndefined();
  });
});
