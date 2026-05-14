import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';

// Material exposes only three button colour variants (`primary` / `accent` /
// `warn`) — the addon shape's `color` field mirrors that union exactly.
const colors = ['primary', 'accent', 'warn'] as const;

const config = {
  fields: colors.map((color, idx) => ({
    key: `field_${color}`,
    type: 'input' as const,
    label: color,
    value: '',
    addons: [
      {
        slot: 'suffix' as const,
        kind: 'mat-button' as const,
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
  title: 'Addons — mat-button colour variants',
  description: 'Renders one input per Material colour variant (primary / accent / warn).',
  config,
};
