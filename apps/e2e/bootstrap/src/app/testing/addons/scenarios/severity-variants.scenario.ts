import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const severities = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'] as const;

const config = {
  fields: severities.map((severity, idx) => ({
    key: `field_${severity}`,
    type: 'input' as const,
    label: severity,
    value: '',
    addons: [
      {
        slot: 'suffix' as const,
        type: 'bs-button' as const,
        label: severity,
        severity,
        action: () => {
          /* no-op; screenshot only */
          void idx;
        },
      },
    ],
  })),
} as const satisfies FormConfig;

export const severityVariantsScenario: TestScenario = {
  testId: 'severity-variants',
  title: 'Addons — bs-button severity variants',
  description: 'Renders one input per Bootstrap severity (primary / secondary / success / danger / warning / info / light / dark).',
  config,
};
