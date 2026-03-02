import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'hasVehicle',
      type: 'checkbox',
      label: 'I own a vehicle',
      col: 12,
    },
    {
      key: 'vehicleType',
      type: 'input',
      label: 'Vehicle Type',
      logic: [
        {
          type: 'disabled',
          condition: {
            type: 'javascript',
            expression: '!formValue.hasVehicle',
          },
        },
      ],
      col: 12,
    },
    {
      key: 'submit',
      type: 'submit',
      label: 'Submit',
      props: {
        type: 'submit',
        color: 'primary',
      },
      col: 12,
    },
  ],
} as const satisfies FormConfig;

export const disabledLogicScenario: TestScenario = {
  testId: 'disabled-logic-test',
  title: 'Disable Fields Using JavaScript Expressions',
  description: 'Tests disabling fields based on JavaScript expression conditions',
  config,
};
