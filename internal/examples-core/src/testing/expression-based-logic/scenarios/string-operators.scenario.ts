import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Tests string-based operators in conditions.
 * Covers: contains, startsWith, endsWith, notEquals
 * Uses JavaScript expressions for negation since 'not' condition type is not available
 */
const config = {
  fields: [
    {
      key: 'email',
      type: 'input',
      label: 'Email Address',
      value: 'user@company.com',
      col: 12,
    },
    {
      key: 'corporateNote',
      type: 'input',
      label: 'Corporate Email Detected (shows when email contains "company")',
      value: 'Corporate email detected - enterprise features enabled',
      logic: [
        {
          type: 'hidden',
          // Hidden when email does NOT contain "company"
          condition: {
            type: 'javascript',
            expression: '!(formValue.email || "").includes("company")',
          },
        },
      ],
      col: 12,
    },
    {
      key: 'url',
      type: 'input',
      label: 'Website URL',
      value: 'https://example.com',
      col: 12,
    },
    {
      key: 'secureNote',
      type: 'input',
      label: 'Secure Connection (shows when URL starts with "https")',
      value: 'Secure HTTPS connection',
      logic: [
        {
          type: 'hidden',
          // Hidden when URL does NOT start with "https"
          condition: {
            type: 'javascript',
            expression: '!(formValue.url || "").startsWith("https")',
          },
        },
      ],
      col: 6,
    },
    {
      key: 'insecureWarning',
      type: 'input',
      label: 'Insecure Warning (shows when URL does not start with "https")',
      value: 'Warning: Connection is not secure',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'url',
            operator: 'startsWith',
            value: 'https',
          },
        },
      ],
      col: 6,
    },
    {
      key: 'filename',
      type: 'input',
      label: 'Filename',
      value: 'document.pdf',
      col: 12,
    },
    {
      key: 'pdfViewer',
      type: 'input',
      label: 'PDF Viewer (shows when filename ends with ".pdf")',
      value: 'PDF viewer will be used',
      logic: [
        {
          type: 'hidden',
          // Hidden when filename does NOT end with ".pdf"
          condition: {
            type: 'javascript',
            expression: '!(formValue.filename || "").endsWith(".pdf")',
          },
        },
      ],
      col: 6,
    },
    {
      key: 'imageViewer',
      type: 'input',
      label: 'Image Viewer (shows when filename ends with ".jpg" or ".png")',
      value: 'Image viewer will be used',
      logic: [
        {
          type: 'hidden',
          // Hidden when filename ends with neither ".jpg" nor ".png"
          condition: {
            type: 'javascript',
            expression: '!((formValue.filename || "").endsWith(".jpg") || (formValue.filename || "").endsWith(".png"))',
          },
        },
      ],
      col: 6,
    },
    {
      key: 'country',
      type: 'select',
      label: 'Country',
      options: [
        { label: 'United States', value: 'US' },
        { label: 'United Kingdom', value: 'UK' },
        { label: 'Canada', value: 'CA' },
        { label: 'Other', value: 'other' },
      ],
      value: 'US',
      col: 6,
    },
    {
      key: 'internationalShipping',
      type: 'input',
      label: 'International Shipping Note (shows when country != US)',
      value: 'International shipping rates apply',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'country',
            operator: 'equals',
            value: 'US',
          },
        },
      ],
      col: 6,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const stringOperatorsScenario: TestScenario = {
  testId: 'string-operators-test',
  title: 'String Operators',
  description: 'Tests string-based operators: contains, startsWith, endsWith with JavaScript expressions for negation',
  config,
};
