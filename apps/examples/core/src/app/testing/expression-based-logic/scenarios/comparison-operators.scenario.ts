import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Tests numeric comparison operators in conditions.
 * Covers: less, lessOrEqual, greater, greaterOrEqual, notEquals
 */
const config = {
  fields: [
    {
      key: 'age',
      type: 'input',
      label: 'Age',
      props: { type: 'number' },
      value: 25,
      col: 12,
    },
    {
      key: 'underageWarning',
      type: 'input',
      label: 'Underage Warning (shows when age < 18)',
      value: 'You must be 18 or older',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'age',
            operator: 'greaterOrEqual',
            value: 18,
          },
        },
      ],
      col: 12,
    },
    {
      key: 'seniorDiscount',
      type: 'input',
      label: 'Senior Discount (shows when age > 65)',
      value: 'You qualify for senior discount!',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'age',
            operator: 'lessOrEqual',
            value: 65,
          },
        },
      ],
      col: 12,
    },
    {
      key: 'quantity',
      type: 'input',
      label: 'Quantity',
      props: { type: 'number' },
      value: 5,
      col: 6,
    },
    {
      key: 'bulkOrderNote',
      type: 'input',
      label: 'Bulk Order Note (shows when quantity > 10)',
      value: 'Bulk pricing applied',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'quantity',
            operator: 'lessOrEqual',
            value: 10,
          },
        },
      ],
      col: 6,
    },
    {
      key: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Pending', value: 'pending' },
        { label: 'Inactive', value: 'inactive' },
      ],
      value: 'active',
      col: 6,
    },
    {
      key: 'reactivateButton',
      type: 'input',
      label: 'Reactivate Option (shows when status != active)',
      value: 'Click to reactivate',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'status',
            operator: 'equals',
            value: 'active',
          },
        },
      ],
      col: 6,
    },
    {
      key: 'score',
      type: 'input',
      label: 'Score (0-100)',
      props: { type: 'number' },
      value: 75,
      col: 6,
    },
    {
      key: 'passMessage',
      type: 'input',
      label: 'Pass Message (shows when score >= 60)',
      value: 'Congratulations! You passed.',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'score',
            operator: 'less',
            value: 60,
          },
        },
      ],
      col: 6,
    },
    {
      key: 'failMessage',
      type: 'input',
      label: 'Fail Message (shows when score < 60)',
      value: 'Sorry, you did not pass.',
      logic: [
        {
          type: 'hidden',
          condition: {
            type: 'fieldValue',
            fieldPath: 'score',
            operator: 'greaterOrEqual',
            value: 60,
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

export const comparisonOperatorsScenario: TestScenario = {
  testId: 'comparison-operators-test',
  title: 'Comparison Operators',
  description: 'Tests numeric comparison operators: less, lessOrEqual, greater, greaterOrEqual, notEquals',
  config,
};
