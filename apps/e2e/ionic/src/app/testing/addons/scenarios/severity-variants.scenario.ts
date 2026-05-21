import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

const colors = ['primary', 'secondary', 'tertiary', 'success', 'warning', 'danger', 'light', 'medium', 'dark'] as const;

const config = {
  fields: colors.map((color, idx) => ({
    key: `field_${color}`,
    type: 'input' as const,
    label: color,
    value: '',
    addons: [
      {
        slot: 'suffix' as const,
        kind: 'ion-button' as const,
        label: color,
        color,
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
  title: 'Addons — ion-button color variants',
  description: 'Renders one input per Ionic colour (primary / secondary / tertiary / success / warning / danger / light / medium / dark).',
  config,
};
