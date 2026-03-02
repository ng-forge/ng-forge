import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const config = {
  fields: [
    {
      key: 'formattedDate',
      type: 'datepicker',
      label: 'Date (Custom Format)',
      props: {
        dateFormat: 'dd/mm/yy',
        showIcon: true,
      },
    },
  ],
} as const satisfies FormConfig;

export const calendarFormatScenario: TestScenario = {
  testId: 'calendar-format',
  title: 'Calendar - Date Format',
  description: 'Tests calendar with custom date format',
  config,
};
