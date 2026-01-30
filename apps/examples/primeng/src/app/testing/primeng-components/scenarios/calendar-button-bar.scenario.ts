import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'dateWithButtons',
      type: 'datepicker',
      label: 'Date with Button Bar',
      props: {
        showButtonBar: true,
        showIcon: true,
      },
    },
  ],
} as const satisfies FormConfig;

export const calendarButtonBarScenario: TestScenario = {
  testId: 'calendar-button-bar',
  title: 'Calendar - Button Bar',
  description: 'Tests calendar with today/clear button bar',
  config,
};
