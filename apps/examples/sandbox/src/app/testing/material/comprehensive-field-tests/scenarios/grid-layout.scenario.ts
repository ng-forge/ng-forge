import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'fullWidth',
      type: 'input',
      label: 'Full Width (col-12)',
      props: {
        placeholder: 'This takes full width',
      },
      col: 12,
    },
    {
      key: 'halfWidth1',
      type: 'input',
      label: 'Half Width 1 (col-6)',
      props: {
        placeholder: 'Half width field 1',
      },
      col: 6,
    },
    {
      key: 'halfWidth2',
      type: 'input',
      label: 'Half Width 2 (col-6)',
      props: {
        placeholder: 'Half width field 2',
      },
      col: 6,
    },
    {
      key: 'thirdWidth1',
      type: 'input',
      label: 'Third Width 1 (col-4)',
      props: {
        placeholder: 'Third width field 1',
      },
      col: 4,
    },
    {
      key: 'thirdWidth2',
      type: 'input',
      label: 'Third Width 2 (col-4)',
      props: {
        placeholder: 'Third width field 2',
      },
      col: 4,
    },
    {
      key: 'thirdWidth3',
      type: 'input',
      label: 'Third Width 3 (col-4)',
      props: {
        placeholder: 'Third width field 3',
      },
      col: 4,
    },
    {
      key: 'quarterWidth1',
      type: 'input',
      label: 'Quarter 1 (col-3)',
      props: {
        placeholder: 'Quarter 1',
      },
      col: 3,
    },
    {
      key: 'quarterWidth2',
      type: 'input',
      label: 'Quarter 2 (col-3)',
      props: {
        placeholder: 'Quarter 2',
      },
      col: 3,
    },
    {
      key: 'quarterWidth3',
      type: 'input',
      label: 'Quarter 3 (col-3)',
      props: {
        placeholder: 'Quarter 3',
      },
      col: 3,
    },
    {
      key: 'quarterWidth4',
      type: 'input',
      label: 'Quarter 4 (col-3)',
      props: {
        placeholder: 'Quarter 4',
      },
      col: 3,
    },
    {
      key: 'submitGrid',
      type: 'submit',
      label: 'Submit Grid Test',
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const gridLayoutScenario: TestScenario = {
  testId: 'grid-layout-test',
  title: 'Grid Layout Testing',
  description: 'Testing responsive grid system with various column configurations',
  config,
};
