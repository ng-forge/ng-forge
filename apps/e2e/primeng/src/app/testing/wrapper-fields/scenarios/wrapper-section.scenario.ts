import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

/**
 * Verifies a custom wrapper (the demo `section` wrapper registered in each
 * sandbox/e2e app via DEMO_WRAPPERS) receives its config as component inputs
 * and renders a titled card around the field.
 */
const config = {
  fields: [
    {
      key: 'contact',
      type: 'input',
      label: 'Contact name',
      placeholder: 'Ada Lovelace',
      wrappers: [{ type: 'section', title: 'Primary contact' }],
    },
    {
      key: 'email',
      type: 'input',
      label: 'Email',
      placeholder: 'ada@example.com',
      props: { type: 'email' },
      wrappers: [{ type: 'section', title: 'Contact details' }],
    },
  ],
} as const satisfies FormConfig;

export const wrapperSectionScenario: TestScenario = {
  testId: 'wrapper-section',
  title: 'Custom Section Wrapper',
  description: 'Custom wrapper component receives config via inputs and renders titled card',
  config,
};
